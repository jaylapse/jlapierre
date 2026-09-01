const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { google } = require("googleapis");
const crypto = require("crypto");

initializeApp();
const db = getFirestore();

const cloudinaryApiKey = defineSecret("CLOUDINARY_API_KEY");
const cloudinaryApiSecret = defineSecret("CLOUDINARY_API_SECRET");

// Real-world traffic here is a handful of family members occasionally
// clicking a button - this cooldown is what actually keeps costs at zero
// even if someone finds the URL and hammers it, since the Calendar API
// call and Firestore writes below only ever run once per window no
// matter how many requests come in.
const COOLDOWN_MS = 10 * 60 * 1000;
const SAGE_COLOR_ID = "2";
const SYNC_FIELDS = ["destination", "location", "startDate", "endDate", "details"];

exports.refreshItinerary = onRequest(
  {
    cors: ["https://jlapierre.ca"],
    maxInstances: 1,
    timeoutSeconds: 60,
    // 2nd-gen functions default to the Compute Engine default service
    // account, not the App Engine default one - but the calendar was
    // shared with the appspot SA, so the runtime identity has to be
    // pinned here or Calendar API calls 404 on that calendar.
    serviceAccount: "jlapierre-9ed45@appspot.gserviceaccount.com",
  },
  async (req, res) => {
    const metaRef = db.collection("_meta").doc("calendarSync");
    const now = Date.now();

    try {
      // Read-check-write as a transaction, not separate get()/set() calls -
      // otherwise concurrent requests can all read the same stale lastRunMs
      // before any of them writes and all slip past the cooldown at once.
      // Firestore retries a transaction on write conflict, so only one
      // concurrent caller per window ever observes claimed === true.
      const claim = await db.runTransaction(async (tx) => {
        const metaSnap = await tx.get(metaRef);
        const lastRunMs = metaSnap.exists ? metaSnap.data().lastRunMs || 0 : 0;

        if (now - lastRunMs < COOLDOWN_MS) {
          return { claimed: false, secondsRemaining: Math.ceil((COOLDOWN_MS - (now - lastRunMs)) / 1000) };
        }

        tx.set(metaRef, { lastRunMs: now }, { merge: true });
        return { claimed: true };
      });

      if (!claim.claimed) {
        res.json({ status: "cooldown", secondsRemaining: claim.secondsRemaining });
        return;
      }

      const auth = new google.auth.GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
      });
      const calendar = google.calendar({ version: "v3", auth });

      // No real lower bound - past trips need to stay "seen" every sync (as
      // long as they're still on the calendar) or the reconciliation below
      // deletes them as soon as they age out of a windowed query, even
      // though nothing about them actually changed. This fixed floor just
      // guards against Calendar API's unbounded-query edge cases, not a
      // real assumption about trip history.
      const timeMin = "2000-01-01T00:00:00Z";
      let events = [];
      let pageToken;
      do {
        const resp = await calendar.events.list({
          // "primary" means the service account's own (empty) calendar, not
          // the human calendar shared with it - has to be the actual owner.
          calendarId: "jaylapse@gmail.com",
          timeMin,
          singleEvents: true,
          orderBy: "startTime",
          maxResults: 250,
          pageToken,
        });
        events = events.concat(resp.data.items || []);
        pageToken = resp.data.nextPageToken;
      } while (pageToken);

      const parsed = events
        .filter((e) => e.colorId === SAGE_COLOR_ID)
        .map((e) => {
          let startDate, endDate;
          if (e.start.date) {
            startDate = e.start.date;
            const end = new Date(e.end.date + "T00:00:00Z");
            end.setUTCDate(end.getUTCDate() - 1);
            endDate = end.toISOString().slice(0, 10);
          } else {
            startDate = e.start.dateTime.slice(0, 10);
            endDate = e.end.dateTime.slice(0, 10);
          }
          const location = e.location || "";
          const description = e.description || "";
          const lines = [location, description].filter(Boolean);
          return {
            gcalEventId: e.id,
            destination: e.summary || "Untitled trip",
            location,
            startDate,
            endDate,
            details: lines.length ? lines.join("\n") : e.summary || "",
          };
        });

      const itinerariesRef = db.collection("itineraries");
      const existingSnap = await itinerariesRef.get();
      const existingByGcal = new Map();
      existingSnap.forEach((doc) => {
        const data = doc.data();
        if (data.gcalEventId) existingByGcal.set(data.gcalEventId, { id: doc.id, ...data });
      });

      const seen = new Set();
      let created = 0, updated = 0, deleted = 0;

      for (const ev of parsed) {
        seen.add(ev.gcalEventId);
        const cur = existingByGcal.get(ev.gcalEventId);
        const fields = Object.fromEntries(SYNC_FIELDS.map((k) => [k, ev[k]]));
        if (!cur) {
          await itinerariesRef.add({
            ...fields,
            galleryLink: "",
            gcalEventId: ev.gcalEventId,
            source: "google-calendar",
          });
          created++;
        } else if (SYNC_FIELDS.some((k) => cur[k] !== ev[k])) {
          await itinerariesRef.doc(cur.id).update(fields);
          updated++;
        }
      }

      for (const [gid, doc] of existingByGcal) {
        if (!seen.has(gid)) {
          await itinerariesRef.doc(doc.id).delete();
          deleted++;
        }
      }

      res.json({ status: "ok", created, updated, deleted });
    } catch (err) {
      console.error("refreshItinerary failed:", err);
      res.status(500).json({ status: "error" });
    }
  }
);

// Per-source cooldown, not a single global lock like refreshItinerary above -
// different visitors legitimately want to post near each other in time (e.g.
// right after a game night), so this throttles each IP independently instead
// of serializing everyone behind one shared window.
const GUESTBOOK_COOLDOWN_MS = 30 * 1000;
const GUESTBOOK_NAME_MAX = 80;
const GUESTBOOK_MESSAGE_MAX = 1000;
const GUESTBOOK_EMAIL_MAX = 254;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Names/messages are visitor-supplied text; escape before interpolating
// into the HTML email body so a comment can't inject markup there.
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

exports.submitGuestbookEntry = onRequest(
  { cors: ["https://jlapierre.ca"], maxInstances: 1, timeoutSeconds: 30 },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ status: "error" });
      return;
    }

    const body = req.body || {};
    // Honeypot - a field real visitors never see or fill, but naive bots
    // that auto-fill every input do. Pretend success without writing
    // anything, so the bot doesn't learn it was caught.
    if (body.website) {
      res.json({ status: "ok" });
      return;
    }

    const name = (body.name || "").toString().trim().slice(0, GUESTBOOK_NAME_MAX);
    const message = (body.message || "").toString().trim().slice(0, GUESTBOOK_MESSAGE_MAX);
    const email = (body.email || "").toString().trim().slice(0, GUESTBOOK_EMAIL_MAX);
    if (!name || !message || !email) {
      res.status(400).json({ status: "error", reason: "missing_fields" });
      return;
    }
    if (!EMAIL_RE.test(email)) {
      res.status(400).json({ status: "error", reason: "invalid_email" });
      return;
    }

    try {
      // Hash rather than store the raw IP long-term - only need it to key
      // the rate limit, not to retain identifying info.
      const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip || "unknown";
      const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 24);
      const rateRef = db.collection("_meta").doc("guestbookRate_" + ipHash);
      const now = Date.now();

      const claim = await db.runTransaction(async (tx) => {
        const rateSnap = await tx.get(rateRef);
        const lastPostMs = rateSnap.exists ? rateSnap.data().lastPostMs || 0 : 0;

        if (now - lastPostMs < GUESTBOOK_COOLDOWN_MS) {
          return { claimed: false, secondsRemaining: Math.ceil((GUESTBOOK_COOLDOWN_MS - (now - lastPostMs)) / 1000) };
        }

        tx.set(rateRef, { lastPostMs: now }, { merge: true });
        return { claimed: true };
      });

      if (!claim.claimed) {
        res.status(429).json({ status: "cooldown", secondsRemaining: claim.secondsRemaining });
        return;
      }

      // Pre-generated so the public entry and its private email record
      // share an id - lets onGuestbookReply below look up the email by
      // entryId without the two collections needing a separate join field.
      const docRef = db.collection("guestbook").doc();
      const createdAt = FieldValue.serverTimestamp();
      await Promise.all([
        docRef.set({ name, message, createdAt }),
        db.collection("guestbook_private").doc(docRef.id).set({ email, createdAt }),
      ]);

      res.json({ status: "ok", entry: { id: docRef.id, name, message } });
    } catch (err) {
      console.error("submitGuestbookEntry failed:", err);
      res.status(500).json({ status: "error" });
    }
  }
);

// Fires when the admin posts a reply under a guestbook entry (see
// firestore.rules: only a signed-in admin can create one). Looks up the
// commenter's email from guestbook_private and drops a doc into the `mail`
// collection, which the Firestore "Trigger Email" extension watches and
// actually sends - this function never talks to an SMTP server itself.
exports.onGuestbookReply = onDocumentCreated(
  "guestbook/{entryId}/replies/{replyId}",
  async (event) => {
    const { entryId } = event.params;
    const reply = event.data.data();

    const [entrySnap, privateSnap] = await Promise.all([
      db.collection("guestbook").doc(entryId).get(),
      db.collection("guestbook_private").doc(entryId).get(),
    ]);
    // Entries created before this feature shipped have no private email
    // record - nothing to notify, so just leave the reply as a page-only
    // reply for those.
    if (!privateSnap.exists || !entrySnap.exists) return;

    const email = privateSnap.data().email;
    const commenterName = entrySnap.data().name;
    if (!email) return;

    await db.collection("mail").add({
      to: [email],
      message: {
        subject: "James replied to your guestbook comment",
        text:
          `Hi ${commenterName},\n\n` +
          `James replied to your comment on jlapierre.ca:\n\n"${reply.message}"\n\n` +
          `View it at https://jlapierre.ca/#guestbookList`,
        html:
          `<p>Hi ${escapeHtml(commenterName)},</p>` +
          `<p>James replied to your comment on jlapierre.ca:</p>` +
          `<blockquote>${escapeHtml(reply.message)}</blockquote>` +
          `<p><a href="https://jlapierre.ca/#guestbookList">View it on the site</a></p>`,
      },
    });
  }
);

// Cloudinary's unsigned upload preset can be called by anyone who reads the
// gallery page's source, not just the admin - it's not scoped to this site
// at all. This issues a short-lived signed-upload authorization instead,
// gated on a real Firebase Auth session, so only a signed-in admin can get
// one. The API key isn't itself sensitive (Cloudinary expects it to travel
// with every upload request), only the secret used to compute the
// signature is - that never leaves this function.
exports.getUploadSignature = onRequest(
  { cors: ["https://jlapierre.ca"], secrets: [cloudinaryApiKey, cloudinaryApiSecret] },
  async (req, res) => {
    try {
      const authHeader = req.get("Authorization") || "";
      const match = authHeader.match(/^Bearer (.+)$/);
      if (!match) {
        res.status(401).json({ error: "Missing bearer token" });
        return;
      }
      await getAuth().verifyIdToken(match[1]);

      const timestamp = Math.floor(Date.now() / 1000);
      const signature = crypto
        .createHash("sha1")
        .update(`timestamp=${timestamp}${cloudinaryApiSecret.value()}`)
        .digest("hex");

      res.json({ timestamp, signature, apiKey: cloudinaryApiKey.value() });
    } catch (err) {
      console.error("getUploadSignature failed:", err);
      res.status(401).json({ error: "Invalid or expired session" });
    }
  }
);
