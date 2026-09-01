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
});
