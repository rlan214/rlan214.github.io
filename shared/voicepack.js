/* VoicePack — plays pre-recorded ElevenLabs clips for spoken lines.
   Clips live in <base>/<pack>/ with a manifest.json {phrases:{key:file}}.
   A line is split into sentences; the longest run of sentences that has a
   clip wins, otherwise the sentence is tried piece by piece (commas).
   If any part has no clip, play() returns false and the app falls back to
   the device voice for the whole line (so voices never mix mid-sentence). */
window.VoicePack = (() => {
  let ctx = null;
  const packs = {}, active = [];
  const norm = s => String(s).toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();

  function unlock(){
    try{
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      const b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0);
    }catch(e){}
    return ctx;
  }
  function trim(b){
    const d = b.getChannelData(0), th = 0.015, m = Math.round(b.sampleRate * 0.02);
    let a = 0, z = d.length - 1;
    while (a < z && Math.abs(d[a]) < th) a++;
    while (z > a && Math.abs(d[z]) < th) z--;
    a = Math.max(0, a - m); z = Math.min(d.length - 1, z + m);
    if (z - a < 100) return b;
    const nb = ctx.createBuffer(b.numberOfChannels, z - a + 1, b.sampleRate);
    for (let c = 0; c < b.numberOfChannels; c++) nb.copyToChannel(b.getChannelData(c).subarray(a, z + 1), c);
    return nb;
  }
  function load(base, id){
    const key = base + id;
    if (packs[key]) return packs[key].p;
    if (!unlock()) return Promise.resolve();
    const pk = packs[key] = {ready:false, buf:{}};
    pk.p = fetch(`${base}${id}/manifest.json`, {cache:'no-cache'}).then(r => r.ok ? r.json() : {phrases:{}})
      .then(m => Promise.all(Object.entries(m.phrases || {}).map(([k, f]) =>
        fetch(`${base}${id}/${f}`).then(r => r.arrayBuffer())
          .then(ab => new Promise((res, rej) => ctx.decodeAudioData(ab, res, rej)))
          .then(b => { pk.buf[k] = trim(b); }).catch(() => {}))))
      .then(() => { pk.ready = Object.keys(pk.buf).length > 0; }).catch(() => {});
    return pk.p;
  }
  function plan(text, pk){
    const sents = (String(text).match(/[^.!?]+[.!?]*/g) || []).map(s => s.trim()).filter(s => norm(s));
    const out = [];
    for (let i = 0; i < sents.length;){
      let hit = 0;
      for (let j = sents.length; j > i; j--){ const k = norm(sents.slice(i, j).join(' ')); if (pk.buf[k]){ out.push(pk.buf[k]); hit = j; break; } }
      if (hit){ i = hit; continue; }
      for (const piece of sents[i].split(',')){ const k = norm(piece); if (!k) continue; if (!pk.buf[k]) return null; out.push(pk.buf[k]); }
      i++;
    }
    return out.length ? out : null;
  }
  function stop(){ while (active.length){ try{ active.pop().stop(); }catch(e){} } }
  // returns seconds of audio scheduled, or false if this line can't be played from clips
  function play(text, base, id, {interrupt = true, gap = 0.08} = {}){
    const pk = packs[base + id];
    if (!pk){ load(base, id); return false; }
    const seq = pk.ready && plan(text, pk);
    if (!seq || !ctx) return false;
    if (ctx.state === 'suspended') ctx.resume();
    if (interrupt) stop();
    try{ speechSynthesis.cancel(); }catch(e){}
    let t = ctx.currentTime + 0.03;
    for (const b of seq){
      const s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(t);
      active.push(s); s.onended = () => { const i = active.indexOf(s); if (i >= 0) active.splice(i, 1); };
      t += b.duration + gap;
    }
    return t - ctx.currentTime;
  }
  return {unlock, load, play, stop, norm};
})();
