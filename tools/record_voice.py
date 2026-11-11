#!/usr/bin/env python3
"""Record ElevenLabs voice clips for an app on this site.

    python3 tools/record_voice.py <app-folder> [--dry]

Reads <app>/audio/phrases.json  {"key the app says": "text to record"}
  and <app>/audio/voices.json   {"pack-id": {"voice_id": "...", "name": "..."}}
Writes <app>/audio/<pack>/<clip>.mp3 + manifest.json (read by shared/voicepack.js).
Clips that already exist are skipped, so a re-run only records what's new.
--dry prints what would be recorded (no key needed).
The API key comes from ELEVENLABS_API_KEY and is never saved anywhere.
"""
import hashlib, json, os, re, sys, time, urllib.request, urllib.error

args = [a for a in sys.argv[1:] if not a.startswith("--")]
DRY = "--dry" in sys.argv
if not args:
    sys.exit("Usage: python3 tools/record_voice.py <app-folder> [--dry]")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.path.join(ROOT, args[0].strip("/"))
AUD = os.path.join(APP, "audio")
PHRASES = json.load(open(os.path.join(AUD, "phrases.json")))
VOICES = json.load(open(os.path.join(AUD, "voices.json")))
MODEL = "eleven_multilingual_v2"
SETTINGS = {"stability": 0.45, "similarity_boost": 0.8, "style": 0.35}
KEY = os.environ.get("ELEVENLABS_API_KEY", "").strip()
if not DRY and not KEY:
    sys.exit("Set ELEVENLABS_API_KEY first.")


def norm(s):  # must match VoicePack.norm in shared/voicepack.js
    s = s.lower().replace("’", "'").replace("‘", "'")
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9' ]+", " ", s)).strip()


def fname(k):
    n = norm(k)
    return re.sub(r"[^a-z0-9]+", "-", n.replace("'", ""))[:40].strip("-") + "-" + hashlib.md5(n.encode()).hexdigest()[:6] + ".mp3"


def api(path, data=None):
    r = urllib.request.Request("https://api.elevenlabs.io" + path, method="POST" if data else "GET",
                               data=json.dumps(data).encode() if data else None,
                               headers={"xi-api-key": KEY, "Content-Type": "application/json"})
    with urllib.request.urlopen(r, timeout=90) as resp:
        return resp.read()


todo, need = [], 0
for pack in VOICES:
    for k, t in PHRASES.items():
        if not os.path.exists(os.path.join(AUD, pack, fname(k))):
            todo.append((pack, k, t)); need += len(t)
print(f"{args[0]}: {len(todo)} clips to record, about {need} characters")
if DRY:
    sys.exit(0)

if need:
    try:
        sub = json.loads(api("/v1/user/subscription"))
        left = sub.get("character_limit", 0) - sub.get("character_count", 0)
        print(f"ElevenLabs credits left: {left}")
        if left < need:
            sys.exit(f"Not enough credits ({left} left, {need} needed). Nothing recorded.")
    except urllib.error.HTTPError as e:
        print(f"(couldn't read credit balance: HTTP {e.code}; continuing)")

used = 0
for pack, cfg in VOICES.items():
    out = os.path.join(AUD, pack)
    os.makedirs(out, exist_ok=True)
    for k, t in PHRASES.items():
        path = os.path.join(out, fname(k))
        if os.path.exists(path):
            continue
        for attempt in range(3):
            try:
                open(path, "wb").write(api(f"/v1/text-to-speech/{cfg['voice_id']}?output_format=mp3_44100_64",
                                           {"text": t, "model_id": MODEL, "voice_settings": SETTINGS}))
                used += len(t)
                print(f"  ✓ {cfg['name']}: {t}")
                break
            except urllib.error.HTTPError as e:
                if e.code == 429 and attempt < 2:
                    time.sleep(3); continue
                sys.exit(f"  ✗ {t}: HTTP {e.code} {e.read().decode(errors='ignore')[:200]}\nRe-run to continue; finished clips are kept.")
        time.sleep(0.15)
    manifest = {norm(k): fname(k) for k in PHRASES if os.path.exists(os.path.join(out, fname(k)))}
    json.dump({"name": cfg["name"], "phrases": manifest}, open(os.path.join(out, "manifest.json"), "w"), indent=1)

print(f"\nDone. Used about {used} characters. Packs: {', '.join(c['name'] for c in VOICES.values())}")
