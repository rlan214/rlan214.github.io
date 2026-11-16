/* "Text Mom & Dad" button for the Lessons apps (Lana Lessons, Rico Lessons).
   Include with: <script src="../shared/parent-text.js" defer></script>
   The app calls ParentText.ready("message") when a lesson finishes; a button appears on the
   #results screen that opens Messages with the parents filled in and the message written.
   iOS never lets a web page send a text by itself, so the kid still taps Send in Messages.
   Parent numbers / iMessage emails are saved on the device only (never in the GitHub code). */
(function () {
  const KEY = 'parent_contacts';
  const getC = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const setC = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} };
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const css = `
.pt-btn{display:block;margin:16px auto 0;border:3px solid var(--ink);border-radius:18px;padding:12px 22px;font:800 22px "Baloo 2",Nunito,sans-serif;background:#3dbb5f;color:#fff;box-shadow:0 5px 0 var(--ink);cursor:pointer}
.pt-btn:active{transform:translateY(4px);box-shadow:0 1px 0 var(--ink)}
.pt-btn.sent{background:#fff;color:var(--ink)}
.pt-gear{display:block;margin:8px auto 0;border:0;background:none;color:var(--soft);font:700 14px Nunito,system-ui,sans-serif;text-decoration:underline;cursor:pointer}
.pt-sheet{position:fixed;inset:0;background:rgba(20,30,50,.35);z-index:210;display:flex;align-items:flex-end;justify-content:center}
.pt-sheet .box{background:#fff;border:3px solid var(--ink);border-bottom:0;border-radius:24px 24px 0 0;padding:18px 18px max(22px,env(safe-area-inset-bottom));width:100%;max-width:560px;font-family:Nunito,system-ui,sans-serif}
.pt-sheet h3{margin:0 0 4px;font:800 24px "Baloo 2",Nunito,sans-serif}
.pt-sheet p{margin:0 0 12px;color:var(--soft);font-size:15px}
.pt-sheet label{display:block;font-weight:800;margin:10px 0 4px}
.pt-sheet input{width:100%;font:700 18px Nunito,system-ui,sans-serif;padding:10px 12px;border:2px solid var(--line);border-radius:12px;-webkit-user-select:text;user-select:text}
.pt-sheet .row2{display:flex;gap:10px;margin-top:16px}
.pt-sheet .row2 button{flex:1;border:3px solid var(--ink);border-radius:16px;padding:10px;font:800 18px Nunito,system-ui,sans-serif;background:#fff;color:var(--ink);box-shadow:0 4px 0 var(--ink)}
.pt-sheet .row2 .save{background:var(--teal);color:#fff}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function setup(after) {
    const c = getC();
    const sh = document.createElement('div'); sh.className = 'pt-sheet';
    sh.innerHTML = `<div class="box"><h3>👨‍👩‍👧 Parent setup</h3><p>Grown-ups only. Who gets the "lesson done" text? Use a phone number or iMessage email. Saved only on this iPad.</p>
      <label>Parent 1</label><input id="pt1" type="tel" inputmode="tel" autocomplete="off" placeholder="e.g. 248-555-1234" value="${c[0] || ''}">
      <label>Parent 2</label><input id="pt2" type="text" autocomplete="off" placeholder="optional" value="${c[1] || ''}">
      <div class="row2"><button class="cancel" type="button">Cancel</button><button class="save" type="button">Save</button></div></div>`;
    sh.addEventListener('click', e => {
      if (e.target === sh || e.target.classList.contains('cancel')) return sh.remove();
      if (e.target.classList.contains('save')) {
        const v = ['#pt1', '#pt2'].map(s => sh.querySelector(s).value.trim()).filter(Boolean)
          .map(x => x.includes('@') ? x : x.replace(/[^\d+]/g, ''));
        setC(v); sh.remove(); if (after && v.length) after();
      }
    });
    document.body.appendChild(sh);
    setTimeout(() => sh.querySelector('#pt1').focus(), 50);
  }

  function smsUrl(to, body) {
    const b = encodeURIComponent(body);
    if (isIOS) return to.length > 1 ? `sms:/open?addresses=${to.join(',')}&body=${b}` : `sms:${to[0]}&body=${b}`;
    return `sms:${to.join(',')}?body=${b}`;
  }

  let msg = '';
  function send(btn) {
    const to = getC();
    if (!to.length) return setup(() => send(btn));
    location.href = smsUrl(to, msg);
    btn.classList.add('sent'); btn.textContent = '✅ Text opened — tap Send';
  }

  function ready(message) {
    msg = message;
    const host = document.querySelector('#results .res, #results .qbox, #results') ;
    if (!host) return;
    let btn = host.querySelector('.pt-btn');
    if (!btn) {
      btn = document.createElement('button'); btn.type = 'button'; btn.className = 'pt-btn';
      btn.addEventListener('click', () => send(btn));
      const gear = document.createElement('button'); gear.type = 'button'; gear.className = 'pt-gear'; gear.textContent = 'Parent setup';
      gear.addEventListener('click', () => setup());
      host.appendChild(btn); host.appendChild(gear);
    }
    btn.classList.remove('sent'); btn.textContent = '💬 Text Mom & Dad';
  }

  window.ParentText = { ready, setup };
})();
