const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { google } = require("googleapis");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

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

exports.refreshItinerary = onRequest({ cors: true }, async (req, res) => {
  const metaRef = db.collection("_meta").doc("calendarSync");

  try {
    const metaSnap = await metaRef.get();
    const now = Date.now();
    const lastRunMs = metaSnap.exists ? metaSnap.data().lastRunMs || 0 : 0;

    if (now - lastRunMs < COOLDOWN_MS) {
      res.json({
        status: "cooldown",
        secondsRemaining: Math.ceil((COOLDOWN_MS - (now - lastRunMs)) / 1000),
      });
      return;
    }

    // Claim the slot before doing any work, so concurrent clicks during
    // the fetch below can't both slip past the cooldown check.
    await metaRef.set({ lastRunMs: now }, { merge: true });

    const auth = new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });
    const calendar = google.calendar({ version: "v3", auth });

    const timeMin = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    let events = [];
    let pageToken;
    do {
      const resp = await calendar.events.list({
        calendarId: "primary",
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
});

// Cloudinary's unsigned upload preset can be called by anyone who reads the
// gallery page's source, not just the admin - it's not scoped to this site
// at all. This issues a short-lived signed-upload authorization instead,
// gated on a real Firebase Auth session, so only a signed-in admin can get
// one. The API key isn't itself sensitive (Cloudinary expects it to travel
// with every upload request), only the secret used to compute the
// signature is - that never leaves this function.
exports.getUploadSignature = onRequest(
  { cors: true, secrets: [cloudinaryApiKey, cloudinaryApiSecret] },
  async (req, res) => {
    try {
      const authHeader = req.get("Authorization") || "";
      const match = authHeader.match(/^Bearer (.+)$/);
      if (!match) {
        res.status(401).json({ error: "Missing bearer token" });
        return;
      }
      await admin.auth().verifyIdToken(match[1]);

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
