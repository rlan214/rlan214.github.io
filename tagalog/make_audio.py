#!/usr/bin/env python3
"""Generate audio clips with ElevenLabs. Standard library only.

Reads words.json (next to this script) and writes MP3s into audio/.
  Tagalog clips:  audio/<file>.mp3      (default)
  English clips:  audio/en_<file>.mp3   (with --english)
Clips that already exist are skipped, so adding new words later only generates
the new ones. Use --force to redo clips and --only to pick specific ones.

Setup (once per Terminal window):
    read -s "ELEVENLABS_API_KEY?ElevenLabs API key: "; export ELEVENLABS_API_KEY

Examples:
    ELEVEN_VOICE_ID="your-tagalog-voice-id" python3 make_audio.py
    python3 make_audio.py --english
    python3 make_audio.py --dry-run --english
    ELEVEN_VOICE_ID="..." python3 make_audio.py --force --only salamat oo

Environment overrides (all optional):
    ELEVEN_VOICE_ID     voice ID for Tagalog clips (skips the name lookup)
    ELEVEN_VOICE        voice name for Tagalog clips (default Roger)
    ELEVEN_EN_VOICE_ID  voice ID for English clips
    ELEVEN_EN_VOICE     voice name for English clips (default Roger)
    ELEVEN_MODEL        model id (default eleven_v4)
    ELEVEN_OUT          output folder name (default audio)
    ELEVEN_STABILITY    stability value to send, for example 1.0
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

MODEL_ID = os.environ.get("ELEVEN_MODEL", "eleven_v4")
OUTPUT_FORMAT = "mp3_44100_128"
WORKERS = 2  # the free plan allows 2 concurrent requests; raise only on a higher plan

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


def find_voice_id(key, env_id, env_name):
    voice_id = os.environ.get(env_id, "").strip()
    if voice_id:
        return voice_id, voice_id
    name = os.environ.get(env_name, "Roger")
    voices = json.loads(request("GET", "/v1/voices", key))["voices"]
    for v in voices:
        if v.get("name", "").lower().startswith(name.lower()):
            return v["voice_id"], v["name"]
    names = ", ".join(sorted(v.get("name", "?") for v in voices))
    sys.exit("Voice '%s' not found. Voices on this account: %s\n"
             "Set %s to a voice ID, or %s to a voice name." % (name, names, env_id, env_name))


def make_clip(key, voice_id, text, language, out_path):
    body = {"text": text, "model_id": MODEL_ID, "language_code": language}
    stab = os.environ.get("ELEVEN_STABILITY")
    if stab:
        body["voice_settings"] = {"stability": float(stab)}
    audio = request("POST", "/v1/text-to-speech/%s?output_format=%s" % (voice_id, OUTPUT_FORMAT), key, body)
    with open(out_path, "wb") as f:
        f.write(audio)
    return len(text), len(audio)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--english", action="store_true", help="make English clips (en_<file>.mp3)")
    ap.add_argument("--only", nargs="*", help="only these file names (e.g. salamat oo)")
    ap.add_argument("--force", action="store_true", help="overwrite clips that already exist")
    ap.add_argument("--dry-run", action="store_true", help="show what would be made, call nothing")
    ap.add_argument("--workers", type=int, default=WORKERS)
    args = ap.parse_args()

    with open(os.path.join(HERE, "words.json"), encoding="utf-8") as f:
        units = json.load(f)["units"]
    words = [w for u in units for w in u["words"]]

    if args.only:
        wanted = set(args.only)
        unknown = wanted - {w["file"] for w in words}
        if unknown:
            sys.exit("Not in words.json: " + ", ".join(sorted(unknown)))
        words = [w for w in words if w["file"] in wanted]

    out_dir = os.path.join(HERE, os.environ.get("ELEVEN_OUT", "audio"))

    jobs = []  # (display name, text, output path)
    for w in words:
        if args.english:
            name = "en_" + w["file"]
            text = w.get("en_say") or (w["en"] + ".")
        else:
            name = w["file"]
            text = w.get("say") or (w["tag"] + ".")
        path = os.path.join(out_dir, name + ".mp3")
        if args.force or not os.path.exists(path):
            jobs.append((name, text, path))
    skipped = len(words) - len(jobs)
    language = "en" if args.english else "fil"

    if args.dry_run:
        print("Would make %d clips (%d already exist), language %s, model %s:" % (len(jobs), skipped, language, MODEL_ID))
        for name, text, _ in jobs:
            print("  %-22s %r" % (name + ".mp3", text))
        return

    if not jobs:
        print("Nothing to do: all %d clips already exist (use --force to redo)." % len(words))
        return

    key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not key:
        sys.exit("ELEVENLABS_API_KEY is not set. See the setup line at the top of this file.")

    os.makedirs(out_dir, exist_ok=True)
    if args.english:
        voice_id, voice_label = find_voice_id(key, "ELEVEN_EN_VOICE_ID", "ELEVEN_EN_VOICE")
    else:
        voice_id, voice_label = find_voice_id(key, "ELEVEN_VOICE_ID", "ELEVEN_VOICE")
    print("Voice %s | model %s | language %s | %d clips to make, %d skipped"
          % (voice_label, MODEL_ID, language, len(jobs), skipped))

    done, failed, chars = 0, [], 0
    started = time.time()
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        futures = {pool.submit(make_clip, key, voice_id, text, language, path): name
                   for name, text, path in jobs}
        for fut in as_completed(futures):
            name = futures[fut]
            try:
                n_chars, n_bytes = fut.result()
                done += 1
                chars += n_chars
                print("  ok  %-22s %5.1f KB  (%d/%d)" % (name, n_bytes / 1024, done, len(jobs)))
            except Exception as e:
                failed.append(name)
                print("  FAIL %-21s %s" % (name, e))

    print("\nDone in %.0fs: %d made, %d failed, about %d characters sent."
          % (time.time() - started, done, len(failed), chars))
    if failed:
        base = [n[3:] if n.startswith("en_") else n for n in failed]
        print("Retry the failures with: python3 make_audio.py %s--only %s"
              % ("--english " if args.english else "", " ".join(base)))
        sys.exit(1)


if __name__ == "__main__":
    main()
