// ═══ MATES: invite a friend (Nov 13, Joe: "Add all the rewards. Optimise for referring and growth") ═══
// Two-sided: the friend who joins with your code gets a welcome pack straight away; you get a tier reward for every
// mate who finishes their first match. Codes ride on every challenge link and share. Asked at the high points
// (new best, a duel win, a promotion), never in the first two matches, at most once a day.
// Backend: Firebase (project flicky-cricket) over REST, anonymous sign-in + Firestore (rules in tools/referrals).
// Until MATES_CFG.apiKey is set the friend side still works (code checked for format only) and your count waits.
const MATES_CFG = {
  apiKey: '',                       // Firebase Web API key (Project settings → Your apps → Web app). Public by design.
  project: 'flicky-cricket',
  welcome: { gems: 150, coins: 1000, bag: 'gold', cos: ['mates_bat:bat'] },     // for the friend who joins with a code
  tiers: [                                                                      // for you, by mates who've played a match
    { n: 1,  gems: 150, cos: ['mates_bat:bat'], label: '150 GEMS + MATES BAT' },
    { n: 2,  bag: 'gold', label: 'GOLD BAG' },
    { n: 3,  gems: 200, cos: ['mates:shirt'], label: '200 GEMS + MATES GREEN KIT' },
    { n: 5,  bag: 'platinum', cos: ['mates_trail:trail'], label: 'PLATINUM BAG + MATES COMET' },
    { n: 10, gems: 500, cos: ['mates_fx:celeb'], label: '500 GEMS + CONFETTI SIXES' },
  ],
  every: { gems: 75, label: '75 GEMS' },          // each mate after the last tier
  redeemDays: 14, redeemMatches: 40,              // a code can be entered in your first 2 weeks / 40 matches
  askGapH: 20, askFromMatch: 3,                   // high-point prompt: not before match 3, at most once per 20 h
};
// exclusive cosmetics (looks only)
EVENT_BATS.mates_bat = { c: '#1f7a3a', a: '#f2b632', s: '#ffffff' };
TRAIL_STYLES.mates = { core: '#FFFFFF', mid: '#3FE08A', edge: '#F2B632', sparks: ['#FFFFFF', '#3FE08A', '#FFD54A'] };
GAME_CONFIG.trails.items.push({ id: 'mates_trail', kind: 'trail', name: 'MATES COMET', trail: 'mates', icon: 'assets/ui/events/trail_comet.webp' });
PLAYER_SHIRTS.push({ id: 'mates', name: 'MATES GREEN', c: '#0F8A5F', unlock: { mates: 3 } });
{ const _cf = celebFx; celebFx = function () { const L = curLook(); if (L.celeb === 'mates_fx' && ownedCos.includes('mates_fx:celeb')) { L.celeb = 'diwali_fx'; const had = ownedCos.includes('diwali_fx:celeb'); if (!had) ownedCos.push('diwali_fx:celeb'); try { _cf(); } finally { L.celeb = 'mates_fx'; if (!had) ownedCos.splice(ownedCos.indexOf('diwali_fx:celeb'), 1); } return; } return _cf.apply(this, arguments); }; }

const Mates = window.Mates = {
  st() { const s = SAVE.section('mates'); if (!s.first) s.first = Date.now(); s.claimed = s.claimed || 0; s.friends = s.friends || 0; return s; },
  on() { return !!MATES_CFG.apiKey; },
  // ---- codes: 6 letters/digits, no look-alikes
  newCode() { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let c = ''; for (let i = 0; i < 6; i++) c += A[Math.floor(Math.random() * A.length)]; return c; },
  clean(c) { return String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); },
  valid(c) { return /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/.test(c); },
  code() { const s = this.st(); if (!s.code) { s.code = this.newCode(); SAVE.save(); } return s.code; },
  // ---- Firebase REST
  async auth() {
    const s = this.st(), K = MATES_CFG.apiKey; if (!K) throw new Error('off');
    if (s.tok && s.tokExp > Date.now() + 60000) return s.tok;
    let r;
    if (s.rt) r = await fetch('https://securetoken.googleapis.com/v1/token?key=' + K, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(s.rt) }).then(x => x.json());
    if (!r || !r.id_token) { const n = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + K, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) }).then(x => x.json());
      if (!n.idToken) throw new Error('auth'); s.uid = n.localId; s.rt = n.refreshToken; s.tok = n.idToken; s.tokExp = Date.now() + (+n.expiresIn || 3600) * 1000; }
    else { s.uid = r.user_id; s.rt = r.refresh_token; s.tok = r.id_token; s.tokExp = Date.now() + (+r.expires_in || 3600) * 1000; }
    SAVE.save(); return s.tok;
  },
  doc(p) { return `https://firestore.googleapis.com/v1/projects/${MATES_CFG.project}/databases/(default)/documents/${p}`; },
  async req(method, p, body, q) { const t = await this.auth(); const r = await fetch(this.doc(p) + (q || ''), { method, headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); return { ok: r.ok, status: r.status, j: await r.json().catch(() => ({})) }; },
  async register() {   // claim this player's code on the server (a clash picks a new code)
    const s = this.st(); if (!this.on() || s.reg) return;
    for (let i = 0; i < 4; i++) { await this.auth(); const r = await this.req('PATCH', 'refs/' + this.code(), { fields: { owner: { stringValue: s.uid }, at: { timestampValue: new Date().toISOString() } } }, '?currentDocument.exists=false');
      if (r.ok) { s.reg = true; SAVE.save(); return; } if (r.status === 400 || r.status === 409 || r.status === 412) { s.code = this.newCode(); SAVE.save(); continue; } return; }
  },
  async codeExists(c) { if (!this.on()) return true; const r = await this.req('GET', 'refs/' + c); if (!r.ok) return false; const o = r.j.fields && r.j.fields.owner && r.j.fields.owner.stringValue; return o && o !== this.st().uid; },
  async postMate() {   // the friend's side: counted for the inviter once they've played a match
    const s = this.st(); if (!this.on() || !s.used || s.posted || (career.matchesPlayed || 0) < 1) return;
    await this.auth(); const L = curLook();
    const r = await this.req('PATCH', `refs/${s.used}/mates/${s.uid}`, { fields: { at: { timestampValue: new Date().toISOString() }, n: { stringValue: String(L.name || 'PLAYER').slice(0, 14) } } }, '?currentDocument.exists=false');
    if (r.ok || r.status === 409 || r.status === 412 || r.status === 400) { s.posted = true; SAVE.save(); track('mates_qualified', { code: s.used }); }
  },
  async refresh() {    // your side: how many mates have played
    if (!this.on()) return; const s = this.st(); await this.register();
    let n = 0, names = [], tok = '';
    for (let i = 0; i < 10; i++) { const r = await this.req('GET', `refs/${this.code()}/mates`, null, '?pageSize=300' + (tok ? '&pageToken=' + tok : '')); if (!r.ok) return;
      (r.j.documents || []).forEach(d => { n++; const nm = d.fields && d.fields.n && d.fields.n.stringValue; if (nm) names.push(nm); }); tok = r.j.nextPageToken; if (!tok) break; }
    const was = s.friends; s.friends = n; s.names = names.slice(-30); SAVE.save();
    if (n > was) { track('mates_count', { n }); this.badge(); if (was != null && this.claimable()) setTimeout(() => showMessage(n - was === 1 ? `${names[names.length - 1] || 'A MATE'} JOINED! CLAIM YOUR REWARD` : `${n - was} MATES JOINED! CLAIM YOUR REWARDS`, '#FFC93A', 2600), 1500); }
  },
  // ---- rewards
  give(r) { const out = []; const g = Object.assign({}, r); delete g.cos; delete g.label; delete g.n;
    if (g.gems || g.coins || g.bag) out.push(grantReward(g));
    (r.cos || []).forEach(k => { if (!ownedCos.includes(k)) { ownedCos.push(k); SAVE.setItem('flickyCosmetics', JSON.stringify(ownedCos)); } });
    if ((r.cos || []).includes('mates_bat:bat')) { const L = playerLook || (playerLook = curLook()); if (!L.batWrap) { L.batWrap = 'mates_bat'; savePlayerLook(); } }
    try { hapticBig(); } catch (e) {} try { updateMenuHUD(); } catch (e) {} SAVE.save(); return r.label || out.join(' + '); },
  rewardFor(i) { const T = MATES_CFG.tiers; return i < T.length ? T[i] : Object.assign({ n: T[T.length - 1].n + (i - T.length + 1) }, MATES_CFG.every); },
  claimable() { const s = this.st(); return s.claimed < this.unlockedCount(); },
  unlockedCount() { const s = this.st(), T = MATES_CFG.tiers; let k = 0; while (this.rewardFor(k).n <= s.friends && k < 999) k++; return k; },
  claim() { const s = this.st(), got = []; while (s.claimed < this.unlockedCount()) { got.push(this.give(this.rewardFor(s.claimed))); s.claimed++; }
    SAVE.save(); if (got.length) { track('mates_claim', { tiers: s.claimed, friends: s.friends }); showMessage('+ ' + got.join(' · '), '#FFC93A', 2800); } this.badge(); this.render(); },
  canRedeem() { const s = this.st(); return !s.used && (Date.now() - s.first < MATES_CFG.redeemDays * 864e5 || (career.matchesPlayed || 0) < MATES_CFG.redeemMatches); },
  async redeem(raw) {
    const c = this.clean(raw); if (!this.valid(c)) { showMessage('THAT CODE ISN\'T RIGHT · 6 LETTERS/NUMBERS', '#ff6b6b', 2000); return false; }
    if (c === this.code()) { showMessage('THAT\'S YOUR OWN CODE!', '#ff6b6b', 1800); return false; }
    if (!this.canRedeem()) { showMessage('CODES ARE FOR NEW PLAYERS', '#ff6b6b', 1800); return false; }
    try { if (!(await this.codeExists(c))) { showMessage('CODE NOT FOUND · CHECK WITH YOUR MATE', '#ff6b6b', 2000); return false; } } catch (e) { /* offline: accept, counted later */ }
    const s = this.st(); s.used = c; SAVE.save();
    const l = this.give(Object.assign({ label: `${MATES_CFG.welcome.gems} GEMS + ${MATES_CFG.welcome.coins.toLocaleString()} COINS + GOLD BAG + MATES BAT` }, MATES_CFG.welcome));
    track('mates_redeem', { code: c }); showMessage(`WELCOME! +${MATES_CFG.welcome.gems} GEMS & MATES BAT`, '#FFC93A', 3200); this.postMate().catch(() => {}); this.render(); return true;
  },
  // ---- sharing (WhatsApp first: that's where cricket mates talk)
  pitch() { const w = MATES_CFG.welcome; return `Use my code ${this.code()} for ${w.gems} free gems + the MATES BAT`; },
  link(extra) { return 'https://flickycricket.com/i/?r=' + this.code() + (extra || ''); },
  text(trigger) { const L = curLook(); return trigger && trigger.line ? `${trigger.line} ${this.pitch()}: ${this.link()}` : `I'm playing Flicky Cricket, come and have a hit! ${this.pitch()}: ${this.link()}`; },
  async share(via, trigger) {
    const t = this.text(trigger); track('mates_share', { via, trigger: (trigger && trigger.why) || 'panel', friends: this.st().friends });
    if (via === 'wa') { const u = 'https://wa.me/?text=' + encodeURIComponent(t); try { window.open(u, '_blank'); } catch (e) { location.href = u; } return; }
    if (via !== 'copy' && navigator.share) { try { await navigator.share({ title: 'Flicky Cricket', text: t }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(t); showMessage('INVITE COPIED · PASTE IT TO YOUR MATES', '#22c55e', 2000); } catch (e) { showMessage('YOUR CODE: ' + this.code(), '#FFC93A', 3000); }
  },
  // ---- UI
  badge() { const b = document.getElementById('matesBadge'); if (!b) return; const n = Math.max(0, this.unlockedCount() - this.st().claimed); b.textContent = n ? n : '!'; b.style.display = n || (!this.st().opened) ? '' : 'none'; },
  render() {
    let el = document.getElementById('matesPanel');
    if (!el) { el = document.createElement('div'); el.id = 'matesPanel'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Invite mates'); document.body.appendChild(el);
      el.addEventListener('click', e => { if (e.target === el || e.target.closest('.mtClose')) { el.classList.remove('show'); this.badge(); return; }
        const sh = e.target.closest('[data-mtshare]'); if (sh) { try { playUiTap(); } catch (err) {} this.share(sh.dataset.mtshare); return; }
        if (e.target.closest('.mtClaim')) { this.claim(); return; }
        if (e.target.closest('.mtRedeemGo')) { const i = el.querySelector('.mtIn'); this.redeem(i && i.value); return; } }); }
    const s = this.st(); s.opened = true; SAVE.save();
    const n = s.friends || 0, T = MATES_CFG.tiers, top = T[T.length - 1].n, next = T.find(t => t.n > n);
    const ladder = T.map((t, i) => { const got = i < s.claimed, ready = !got && n >= t.n; return `<div class="mtTier${got ? ' got' : ready ? ' ready' : ''}"><i>${t.n}</i><span>${t.label}</span><b>${got ? '✓' : ready ? 'READY' : ''}</b></div>`; }).join('');
    el.innerHTML = `<div class="mtCard"><div class="mtTop"><b>INVITE MATES</b><button class="mtClose" aria-label="Close">✕</button></div>
      <div class="mtHero">YOU BOTH WIN<small>Your mate gets <b>${MATES_CFG.welcome.gems} gems, ${MATES_CFG.welcome.coins.toLocaleString()} coins, a gold bag and the MATES BAT</b>. You get a reward for every mate who plays a match.</small></div>
      <div class="mtCode"><small>YOUR CODE</small><b>${this.code()}</b></div>
      <div class="mtBtns"><button class="mtWa" data-mtshare="wa">WHATSAPP</button><button class="mtSh" data-mtshare="share">SHARE</button><button class="mtCp" data-mtshare="copy">COPY</button></div>
      <div class="mtProg"><span>${n} MATE${n === 1 ? '' : 'S'} JOINED</span><span>${next ? `${next.n - n} TO NEXT REWARD` : `+${MATES_CFG.every.gems} GEMS EVERY MATE`}</span></div>
      <div class="mtBar"><i style="width:${Math.min(100, n / top * 100)}%"></i></div>
      <div class="mtLadder">${ladder}<div class="mtTier${n > top ? ' ready' : ''}"><i>${top}+</i><span>${MATES_CFG.every.label} FOR EVERY MATE</span><b></b></div></div>
      ${this.claimable() ? '<button class="mtClaim gcBuy">CLAIM REWARDS</button>' : ''}
      ${s.used ? `<div class="mtUsed">JOINED WITH ${s.used} ✓</div>` : this.canRedeem() ? `<div class="mtRedeem"><small>GOT A MATE'S CODE?</small><div><input class="mtIn" maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABC123" aria-label="Mate's code"><button class="mtRedeemGo gcBuy">GO</button></div></div>` : ''}
      ${this.on() ? '' : '<div class="mtNote">Mates are counted once the game is online.</div>'}</div>`;
    el.classList.add('show'); track('mates_open', { friends: n });
    this.refresh().then(() => { if (el.classList.contains('show') && (this.st().friends || 0) !== n) this.render(); }).catch(() => {});
  },
  // the high-point ask: a slim card over the result, one tap to WhatsApp
  ask(why, line) {
    const s = this.st(); if ((career.matchesPlayed || 0) < MATES_CFG.askFromMatch) return; if (Date.now() - (s.askAt || 0) < MATES_CFG.askGapH * 3600e3) return;
    s.askAt = Date.now(); SAVE.save(); track('mates_ask', { why });
    let el = document.getElementById('matesAsk'); if (el) el.remove(); el = document.createElement('div'); el.id = 'matesAsk';
    el.innerHTML = `<b>${why === 'best' ? 'NEW BEST!' : why === 'duel' ? 'WHAT A WIN!' : 'PROMOTED!'}</b><span>Challenge your mates. You BOTH get ${MATES_CFG.welcome.gems} gems.</span><div><button class="maWa">WHATSAPP</button><button class="maX" aria-label="Not now">✕</button></div>`;
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('show'));
    el.querySelector('.maWa').onclick = () => { this.share('wa', { why, line }); el.remove(); };
    el.querySelector('.maX').onclick = () => { track('mates_ask_skip', { why }); el.remove(); };
    setTimeout(() => { try { el.classList.remove('show'); setTimeout(() => el.remove(), 400); } catch (e) {} }, 12000);
  },
};
// styles + the home button (under the inbox)
(function () {
  const css = document.createElement('style');
  css.textContent = `
  #matesBtn{position:absolute;z-index:3;width:46px;height:46px;border-radius:50%;border:3px solid #050A14;background:linear-gradient(#2fbf6a,#12804a);box-shadow:0 3px 0 #050A14;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;color:#fff;font:12px 'Lilita One','Arial Black',Arial,sans-serif;letter-spacing:.02em}
  #matesBtn svg{width:28px;height:28px}
  #matesBadge{position:absolute;top:-6px;right:-6px;min-width:20px;height:20px;border-radius:10px;background:#e8463a;border:2px solid #050A14;color:#fff;font:12px 'Lilita One','Arial Black',Arial,sans-serif;display:flex;align-items:center;justify-content:center;padding:0 3px;box-sizing:border-box}
  #matesPanel{position:fixed;inset:0;z-index:330;display:none;background:rgba(5,10,20,.7);align-items:center;justify-content:center;font-family:'Lilita One','Arial Black',Arial,sans-serif;color:#fff}
  #matesPanel.show{display:flex}
  .mtCard{width:min(380px,calc(100% - 32px));max-height:86%;overflow:auto;border-radius:20px;border:3px solid #050A14;background:linear-gradient(#17603e,#0b2e22);padding:14px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px}
  .mtTop{display:flex;justify-content:space-between;align-items:center;font-size:22px;letter-spacing:.08em}
  .mtClose{width:36px;height:36px;border-radius:50%;border:2px solid #050A14;background:#0e3a29;color:#fff;font-size:16px;cursor:pointer}
  .mtHero{font-size:26px;color:#FFC93A;text-align:center;line-height:1.1}.mtHero small{display:block;margin-top:6px;font:14px/1.4 system-ui,Arial,sans-serif;color:#dff5e8}.mtHero small b{color:#fff}
  .mtCode{text-align:center;background:#0b2219;border:2px dashed #FFC93A;border-radius:14px;padding:8px}.mtCode small{display:block;font-size:12px;letter-spacing:.15em;color:#9fd8b8}.mtCode b{font-size:36px;font-weight:400;letter-spacing:.18em}
  .mtBtns{display:flex;gap:8px}.mtBtns button{flex:1;height:44px;border-radius:12px;border:3px solid #050A14;box-shadow:0 3px 0 #050A14;color:#fff;font:16px 'Lilita One','Arial Black',Arial,sans-serif;cursor:pointer}
  .mtWa{background:linear-gradient(#3ee07a,#1aa34f)}.mtSh{background:linear-gradient(#3b82f6,#1f4fb8)}.mtCp{background:linear-gradient(#55657f,#2e3a50)}
  .mtProg{display:flex;justify-content:space-between;font-size:13px;color:#cfeedd}.mtBar{height:12px;border-radius:6px;background:#0b2219;border:2px solid #050A14;overflow:hidden}.mtBar i{display:block;height:100%;background:linear-gradient(90deg,#FFC93A,#ffe27a)}
  .mtLadder{display:flex;flex-direction:column;gap:6px}.mtTier{display:flex;align-items:center;gap:10px;background:#0e3a29;border:2px solid #050A14;border-radius:12px;padding:6px 10px;font-size:14px}
  .mtTier i{font-style:normal;min-width:30px;height:30px;border-radius:50%;background:#0b2219;display:flex;align-items:center;justify-content:center;color:#FFC93A}.mtTier span{flex:1}.mtTier b{font-weight:400;color:#4fd46a}
  .mtTier.ready{box-shadow:0 0 0 2px #FFC93A inset}.mtTier.ready b{color:#FFC93A}.mtTier.got{opacity:.6}
  .mtClaim{height:44px}.mtRedeem small{font-size:13px;color:#cfeedd;letter-spacing:.08em}.mtRedeem div{display:flex;gap:8px;margin-top:4px}
  .mtIn{flex:1;height:42px;border-radius:12px;border:3px solid #050A14;background:#fff;color:#0b2219;font:22px 'Lilita One','Arial Black',Arial,sans-serif;letter-spacing:.2em;text-align:center;text-transform:uppercase;min-width:0}
  .mtRedeem .gcBuy{height:42px;padding:0 18px}.mtUsed{font-size:13px;color:#4fd46a;text-align:center}.mtNote{font:12px system-ui;color:#9fd8b8;text-align:center}
  #matesAsk{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom));transform:translate(-50%,140%);z-index:9400;width:min(360px,calc(100% - 24px));border-radius:18px;border:3px solid #050A14;background:linear-gradient(#17603e,#0b2e22);box-shadow:0 6px 0 #050A14;padding:10px 12px;box-sizing:border-box;color:#fff;font-family:'Lilita One','Arial Black',Arial,sans-serif;display:flex;flex-direction:column;gap:4px;transition:transform .35s cubic-bezier(.3,1.4,.5,1)}
  #matesAsk.show{transform:translate(-50%,0)}#matesAsk b{font-weight:400;font-size:20px;color:#FFC93A}#matesAsk span{font:14px/1.35 system-ui,Arial,sans-serif;color:#dff5e8}
  #matesAsk div{display:flex;gap:8px;margin-top:4px}#matesAsk .maWa{flex:1;height:40px;border-radius:12px;border:3px solid #050A14;background:linear-gradient(#3ee07a,#1aa34f);color:#fff;font:16px 'Lilita One','Arial Black',Arial,sans-serif;cursor:pointer}
  #matesAsk .maX{width:40px;height:40px;border-radius:12px;border:3px solid #050A14;background:#0e3a29;color:#fff;cursor:pointer}`;
  document.head.appendChild(css);
  const home = document.getElementById('overlay'); if (!home) return;
  const b = document.createElement('button'); b.id = 'matesBtn'; b.setAttribute('aria-label', 'Invite mates');
  b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="3.4" fill="#fff"/><circle cx="16.5" cy="9" r="2.8" fill="#fff" opacity=".85"/><path d="M2 19c0-3.4 2.7-5.6 6-5.6s6 2.2 6 5.6z" fill="#fff"/><path d="M13.6 14.2c.9-.5 1.9-.8 2.9-.8 2.9 0 5.2 1.9 5.2 4.8h-6.4" fill="#fff" opacity=".85"/></svg><span id="matesBadge"></span>';
  home.appendChild(b); b.addEventListener('click', () => { try { playUiTap(); hapticTap(); } catch (e) {} Mates.render(); });
  const place = () => { const ref = document.getElementById('inboxBtn'); if (!ref || !ref.style.top) return; b.style.left = ref.style.left; b.style.top = (parseFloat(ref.style.top) - 58) + 'px'; };
  setTimeout(() => { place(); Mates.badge(); }, 1000); window.addEventListener('resize', () => setTimeout(place, 0));
  const _uh = window.updateMenuHUD; if (typeof _uh === 'function') window.updateMenuHUD = function () { const r = _uh.apply(this, arguments); try { Mates.badge(); place(); } catch (e) {} return r; };
})();
// every challenge link carries your code, and its text the offer
{ const _url = FlickyChallenge.url.bind(FlickyChallenge); FlickyChallenge.url = ch => _url(ch) + '&r=' + Mates.code();
  const _sh = FlickyChallenge.share.bind(FlickyChallenge); FlickyChallenge.share = async function () {
    const ch = window._lastChallenge; if (!ch) return; const lg = THEMED_LEAGUES[ch.li], u = this.url(ch);
    const text = `I scored ${ch.r} in a Flicky Cricket duel at the ${lg ? lg.name : 'ground'}. Same balls, your turn: can you beat me? ${Mates.pitch()}.`;
    track('friend_challenge_share', { runs: ch.r, li: ch.li, mates: 1 });
    try { if (navigator.share) { await navigator.share({ title: 'Flicky Cricket challenge', text, url: u }); return; } } catch (e) { return; }
    try { await navigator.clipboard.writeText(text + ' ' + u); showMessage('CHALLENGE LINK COPIED', '#22c55e', 1800); } catch (e) {} }; }
// a link with ?r=CODE (web build / app links) offers the code straight away
(function () { const q = new URLSearchParams(location.search).get('r'); if (!q) return; const c = Mates.clean(q); if (!Mates.valid(c)) return;
  const s = Mates.st(); if (!s.used && c !== s.code) { s.pending = c; SAVE.save(); } })();
// high points: new best innings, a duel win, a promotion; the friend's first match counts them for their inviter
{ const _eg = window.endGame; if (typeof _eg === 'function') window.endGame = function () {
    const best0 = career.bestScore || 0, li0 = typeof highestLeagueIdx === 'function' ? highestLeagueIdx() : 0, r0 = runs;
    const r = _eg.apply(this, arguments);
    setTimeout(() => { try { Mates.postMate().catch(() => {}); const li1 = typeof highestLeagueIdx === 'function' ? highestLeagueIdx() : 0;
      if (li1 > li0) Mates.ask('promo', `I've just been promoted to ${THEMED_LEAGUES[li1] ? THEMED_LEAGUES[li1].name : 'a new league'} in Flicky Cricket!`);
      else if (r0 > best0 && r0 >= 20) Mates.ask('best', `New best: ${r0} runs in Flicky Cricket. Bet you can't beat it.`);
      else Mates.maybeOfferCode(); } catch (e) {} }, 2600);
    return r; }; }
{ const _sdr = window.showDuelResult; if (typeof _sdr === 'function') window.showDuelResult = function (u) { const r = _sdr.apply(this, arguments);
    try { const won = u && (u.res === 'win' || u === 'win'); setTimeout(() => { try { Mates.postMate().catch(() => {}); if (won) Mates.ask('duel', `Just won a duel in Flicky Cricket. Fancy a go?`); } catch (e) {} }, 2200); } catch (e) {}
    return r; }; }
// new players: "got a mate's code?" once after the first match (or straight away if they came from a link)
Mates.maybeOfferCode = function () { const s = this.st(); if (s.used || s.offered || !this.canRedeem()) return; if ((career.matchesPlayed || 0) < 1 && !s.pending) return;
  s.offered = true; SAVE.save();
  const pre = s.pending ? `<b style="color:#FFC93A">${s.pending}</b>` : '';
  bagConfirm(0, s.pending ? `Your mate's code ${pre} is ready. Claim ${MATES_CFG.welcome.gems} gems, ${MATES_CFG.welcome.coins.toLocaleString()} coins, a gold bag and the MATES BAT?` : `Did a mate invite you? Enter their code for ${MATES_CFG.welcome.gems} free gems, ${MATES_CFG.welcome.coins.toLocaleString()} coins, a gold bag and the MATES BAT.`,
    () => { if (s.pending) Mates.redeem(s.pending); else Mates.render(); }, { yes: s.pending ? 'CLAIM' : 'ENTER CODE', no: 'NO THANKS', noCost: true }); };
setTimeout(() => { try { const s = Mates.st(); if (s.pending && typeof state !== 'undefined' && state === 'menu') Mates.maybeOfferCode(); Mates.register().catch(() => {}); Mates.postMate().catch(() => {}); Mates.refresh().catch(() => {}); } catch (e) {} }, 6500);
document.addEventListener('visibilitychange', () => { if (!document.hidden) try { Mates.refresh().catch(() => {}); } catch (e) {} });
