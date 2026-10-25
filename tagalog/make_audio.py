#!/usr/bin/env python3
"""Generate Tagalog audio clips with ElevenLabs. Standard library only.

Reads words.json (next to this script) and writes audio/<file>.mp3 for each word.
Clips that already exist are skipped, so adding new words later only generates
the new ones. Use --force to redo clips, --only to pick specific ones.

Setup (once per Terminal window):
    read -s "ELEVENLABS_API_KEY?ElevenLabs API key: "; export ELEVENLABS_API_KEY

Usage:
    python3 make_audio.py --only salamat      # test one clip first
    python3 make_audio.py                     # generate everything missing
    python3 make_audio.py --force --only salamat kumusta
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

# ---- settings you may want to change -------------------------------------
VOICE_NAME = "Roger"            # voice name as shown in ElevenLabs
MODEL_ID = "eleven_v4"          # per ElevenLabs docs; eleven_v3 and eleven_multilingual_v2 also list Filipino
LANGUAGE_CODE = "fil"           # Filipino
OUTPUT_FORMAT = "mp3_44100_128"
WORKERS = 2                     # free plan allows 2 concurrent requests; raise only on a higher plan
# Optional: set ELEVEN_VOICE_ID to skip the name lookup,
# and ELEVEN_STABILITY (for example 1.0) to send a stability value.
# --------------------------------------------------------------------------

API = "https://api.elevenlabs.io"
HERE = os.path.dirname(os.path.abspath(__file__))


def request(method, path, key, body=None, retries=3):
    data = json.dumps(body).encode() if body is not None else None
    headers = {"xi-api-key": key, "Accept": "*/*"}
    if data is not None:
        headers["Content-Type"] = "application/json"
    for attempt in range(retries):
        req = urllib.request.Request(API + path, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                return resp.read()
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")[:400]
            if e.code in (429, 500, 502, 503) and attempt < retries - 1:
                time.sleep(2 * (attempt + 1))
                continue
            raise RuntimeError("HTTP %s from ElevenLabs: %s" % (e.code, detail))
        except urllib.error.URLError as e:
            if attempt < retries - 1:
                time.sleep(2)
                continue
            raise RuntimeError("Network error: %s" % e.reason)


def find_voice_id(key):
    env_id = os.environ.get("ELEVEN_VOICE_ID", "").strip()
    if env_id:
        return env_id
    voices = json.loads(request("GET", "/v1/voices", key))["voices"]
    for v in voices:
        if v.get("name", "").lower().startswith(VOICE_NAME.lower()):
            return v["voice_id"]
    names = ", ".join(sorted(v.get("name", "?") for v in voices))
    sys.exit("Voice '%s' not found. Voices on this account: %s\n"
             "Set ELEVEN_VOICE_ID to the voice's ID, or change VOICE_NAME." % (VOICE_NAME, names))


def make_clip(key, voice_id, word, out_dir):
    text = word.get("say") or (word["tag"] + ".")
    body = {"text": text, "model_id": MODEL_ID, "language_code": LANGUAGE_CODE}
    stab = os.environ.get("ELEVEN_STABILITY")
    if stab:
        body["voice_settings"] = {"stability": float(stab)}
    audio = request("POST", "/v1/text-to-speech/%s?output_format=%s" % (voice_id, OUTPUT_FORMAT), key, body)
    path = os.path.join(out_dir, word["file"] + ".mp3")
    with open(path, "wb") as f:
        f.write(audio)
    return word["file"], len(text), len(audio)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", nargs="*", help="only these file names (e.g. salamat kumusta)")
    ap.add_argument("--force", action="store_true", help="overwrite clips that already exist")
    ap.add_argument("--workers", type=int, default=WORKERS)
    args = ap.parse_args()

    key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not key:
        sys.exit("ELEVENLABS_API_KEY is not set. See the setup line at the top of this file.")

    with open(os.path.join(HERE, "words.json"), encoding="utf-8") as f:
        units = json.load(f)["units"]
    words = [w for u in units for w in u["words"]]

    if args.only:
        wanted = set(args.only)
        unknown = wanted - {w["file"] for w in words}
        if unknown:
            sys.exit("Not in words.json: " + ", ".join(sorted(unknown)))
        words = [w for w in words if w["file"] in wanted]

    out_dir = os.path.join(HERE, "audio")
    os.makedirs(out_dir, exist_ok=True)

    todo = [w for w in words
            if args.force or not os.path.exists(os.path.join(out_dir, w["file"] + ".mp3"))]
    skipped = len(words) - len(todo)
    if not todo:
        print("Nothing to do: all %d clips already exist (use --force to redo)." % len(words))
        return

    voice_id = find_voice_id(key)
    print("Voice %s | model %s | language %s | %d clips to make, %d skipped"
          % (VOICE_NAME, MODEL_ID, LANGUAGE_CODE, len(todo), skipped))

    done, failed, chars = 0, [], 0
    started = time.time()
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        futures = {pool.submit(make_clip, key, voice_id, w, out_dir): w for w in todo}
        for fut in as_completed(futures):
            w = futures[fut]
            try:
                name, n_chars, n_bytes = fut.result()
                done += 1
                chars += n_chars
                print("  ok  %-18s %5.1f KB  (%d/%d)" % (name, n_bytes / 1024, done, len(todo)))
            except Exception as e:
                failed.append(w["file"])
                print("  FAIL %-17s %s" % (w["file"], e))

    print("\nDone in %.0fs: %d made, %d failed, about %d characters sent."
          % (time.time() - started, done, len(failed), chars))
    if failed:
        print("Retry the failures with: python3 make_audio.py --only " + " ".join(failed))
        sys.exit(1)


if __name__ == "__main__":
    main()
