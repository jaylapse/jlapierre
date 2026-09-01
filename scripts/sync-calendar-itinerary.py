#!/usr/bin/env python3
"""Reconcile the itinerary Firestore collection with Sage-colored Google
Calendar events. This script only handles the Firestore side - the caller
is expected to fetch calendar events (e.g. via a Calendar API/connector),
filter to the desired tag color, and pass the resulting list as JSON.

Usage:
  ADMIN_EMAIL=... ADMIN_PASSWORD=... python3 sync-calendar-itinerary.py events.json

events.json is a list of objects:
  { "gcalEventId": str, "destination": str, "location": str, "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD", "details": str }
"location" is the calendar event's location, used for the itinerary's "View on
map" link; pass "" if the event has none (the site falls back to destination).

Entries this script creates are tagged with gcalEventId/source fields so
future runs can update or delete them. Itinerary entries added manually
through the website (no gcalEventId) are never touched.
"""
import json
import os
import sys
import urllib.error
import urllib.request

API_KEY = "AIzaSyCrXvaiwHdc5whQHuhk6SR7EutV_MY7HWE"
PROJECT_ID = "jlapierre-9ed45"
BASE = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"
SYNCED_FIELDS = ("destination", "location", "startDate", "endDate", "details")


def request(method, url, token=None, body=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=20) as resp:
            raw = resp.read().decode()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code} on {method} {url}: {e.read().decode()}", file=sys.stderr)
        raise


def sign_in(email, password):
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}"
    resp = request("POST", url, body={"email": email, "password": password, "returnSecureToken": True})
    return resp["idToken"]


def fv_encode(v):
    return {"stringValue": v}


def doc_encode(fields):
    return {"fields": {k: fv_encode(v) for k, v in fields.items()}}


def doc_decode(doc):
    out = {"_name": doc["name"]}
    for k, v in doc.get("fields", {}).items():
        out[k] = v.get("stringValue")
    return out


def list_itineraries(token):
    out = []
    page_token = None
    while True:
        url = f"{BASE}/itineraries?pageSize=300"
        if page_token:
            url += f"&pageToken={page_token}"
        resp = request("GET", url, token=token)
        for d in resp.get("documents", []):
            out.append(doc_decode(d))
        page_token = resp.get("nextPageToken")
        if not page_token:
            break
    return out


def create_itinerary(token, ev):
    fields = {k: ev[k] for k in SYNCED_FIELDS}
    fields["galleryLink"] = ""
    fields["gcalEventId"] = ev["gcalEventId"]
    fields["source"] = "google-calendar"
    request("POST", f"{BASE}/itineraries", token=token, body=doc_encode(fields))


def update_itinerary(token, doc_name, ev):
    fields = {k: ev[k] for k in SYNCED_FIELDS}
    mask = "&".join(f"updateMask.fieldPaths={k}" for k in SYNCED_FIELDS)
    url = f"https://firestore.googleapis.com/v1/{doc_name}?{mask}"
    request("PATCH", url, token=token, body=doc_encode(fields))


def delete_itinerary(token, doc_name):
    request("DELETE", f"https://firestore.googleapis.com/v1/{doc_name}", token=token)


def main():
    if len(sys.argv) != 2:
        print("usage: sync-calendar-itinerary.py events.json", file=sys.stderr)
        sys.exit(1)

    with open(sys.argv[1]) as f:
        events = json.load(f)

    token = sign_in(os.environ["ADMIN_EMAIL"], os.environ["ADMIN_PASSWORD"])

    existing = list_itineraries(token)
    existing_by_gcal = {e["gcalEventId"]: e for e in existing if e.get("gcalEventId")}

    seen_ids = set()
    created = updated = deleted = unchanged = 0

    for ev in events:
        gid = ev["gcalEventId"]
        seen_ids.add(gid)
        cur = existing_by_gcal.get(gid)
        if cur is None:
            create_itinerary(token, ev)
            created += 1
        elif any(cur.get(k) != ev[k] for k in SYNCED_FIELDS):
            update_itinerary(token, cur["_name"], ev)
            updated += 1
        else:
            unchanged += 1

    for gid, doc in existing_by_gcal.items():
        if gid not in seen_ids:
            delete_itinerary(token, doc["_name"])
            deleted += 1

    print(json.dumps({"created": created, "updated": updated, "deleted": deleted, "unchanged": unchanged}))


if __name__ == "__main__":
    main()
