const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { google } = require("googleapis");

initializeApp();
const db = getFirestore();

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
            details: lines.length ? lines.join("<br>") : e.summary || "",
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
