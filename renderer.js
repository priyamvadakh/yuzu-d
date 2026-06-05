// ── ONBOARDING ──
const obSlides = [
  { step: '01 / 04', title: 'Welcome to Yuzu', desc: 'One app for every conversation — DMs, channels, tasks, and scheduling all in one place.' },
  { step: '02 / 04', title: 'Stay Connected', desc: 'Real-time direct messages and team channels keep your whole team in sync, wherever they are.' },
  { step: '03 / 04', title: 'Get Things Done', desc: 'Create tasks, schedule meetings, and track progress without ever leaving the conversation.' },
  { step: '04 / 04', title: 'Just Say It', desc: 'Tap the mic and Yuzu intelligently schedules your calls, sends messages, or creates tasks.' },
];
let obCurrent = 0;

function obGoTo(idx) {
  document.querySelectorAll('.ob-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  document.querySelectorAll('.ob-slide-left').forEach((el, i) => el.classList.toggle('active', i === idx));
  const textArea = document.getElementById('obText');
  textArea.classList.add('fading');
  setTimeout(() => {
    document.getElementById('obStep').textContent = obSlides[idx].step;
    document.getElementById('obTitle').textContent = obSlides[idx].title;
    document.getElementById('obDesc').textContent = obSlides[idx].desc;
    document.getElementById('obNextBtn').textContent = idx === obSlides.length - 1 ? 'Get Started →' : 'Next';
    textArea.classList.remove('fading');
  }, 180);
  obCurrent = idx;
}

document.getElementById('obNextBtn').addEventListener('click', () => {
  if (obCurrent < obSlides.length - 1) obGoTo(obCurrent + 1);
  else goTo('screen-login');
});
document.getElementById('obSkipBtn').addEventListener('click', () => goTo('screen-login'));

// ── Screen navigation ──
let userEmail = '';
function goTo(id) {
  const cur = document.querySelector('.screen.active');
  if (cur) { cur.classList.add('exit'); setTimeout(() => cur.classList.remove('active','exit'), 350); }
  document.getElementById(id).classList.add('active');
}

// ── MOBILE SPLASH → LANDING flow ──
// Mobile uses the standard onboarding flow (screen-splash/landing are hidden)
document.getElementById('landingCreateBtn').addEventListener('click', () => goTo('screen-login'));
document.getElementById('landingSignInBtn').addEventListener('click', () => goTo('screen-login'));
document.getElementById('landingJoinBtn').addEventListener('click', () => goTo('screen-login'));

// ── LOGIN ──
document.getElementById('btnSignInEmail').addEventListener('click', () => goTo('screen-email'));
['btnGoogle','btnMicrosoft','btnUaePass'].forEach(id => {
  document.getElementById(id).addEventListener('click', () => {
    if (id === 'btnGoogle') userEmail = 'user@google.com';
    else if (id === 'btnMicrosoft') userEmail = 'user@microsoft.com';
    else userEmail = 'user@uaepass.ae';
    showHome();
  });
});

// ── EMAIL ──
document.getElementById('emailBack').addEventListener('click', () => goTo('screen-login'));
document.getElementById('emailNext').addEventListener('click', submitEmail);
document.getElementById('emailInput').addEventListener('keydown', e => { if (e.key === 'Enter') submitEmail(); });
function submitEmail() {
  const val = document.getElementById('emailInput').value.trim();
  const err = document.getElementById('emailError');
  if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { err.textContent = 'Please enter a valid email address.'; return; }
  err.textContent = '';
  userEmail = val;
  document.getElementById('otpEmailDisplay').textContent = val;
  goTo('screen-otp');
  setTimeout(() => document.querySelector('.otp-box').focus(), 380);
}

// ── OTP ──
document.getElementById('otpBack').addEventListener('click', () => { clearOtp(); goTo('screen-email'); });
const otpBoxes = document.querySelectorAll('.otp-box');
otpBoxes.forEach((box, i) => {
  box.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g,'');
    if (e.target.value) { box.classList.add('filled'); if (i < otpBoxes.length - 1) otpBoxes[i+1].focus(); }
    else box.classList.remove('filled');
    updateVerifyBtn();
  });
  box.addEventListener('keydown', e => {
    if (e.key === 'Backspace' && !box.value && i > 0) { otpBoxes[i-1].focus(); otpBoxes[i-1].value = ''; otpBoxes[i-1].classList.remove('filled'); }
    if (e.key === 'Enter') verifyOtp();
  });
  box.addEventListener('paste', e => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g,'').slice(0,6);
    [...paste].forEach((ch, j) => { if (otpBoxes[j]) { otpBoxes[j].value = ch; otpBoxes[j].classList.add('filled'); } });
    const next = [...otpBoxes].findIndex(b => !b.value);
    (next >= 0 ? otpBoxes[next] : otpBoxes[5]).focus();
    updateVerifyBtn();
  });
});
function updateVerifyBtn() {
  document.getElementById('otpNext').style.opacity = [...otpBoxes].every(b => b.value) ? '1' : '0.6';
}
updateVerifyBtn();
document.getElementById('otpNext').addEventListener('click', verifyOtp);
document.getElementById('resendBtn').addEventListener('click', () => {
  const span = document.querySelector('#resendBtn span');
  span.textContent = 'Sent!';
  setTimeout(() => { span.textContent = 'Resend'; }, 2500);
});
function verifyOtp() {
  const code = [...otpBoxes].map(b => b.value).join('');
  const err = document.getElementById('otpError');
  if (code.length < 6) { err.textContent = 'Please enter the full 6-digit code.'; return; }
  if (code !== '123456') { err.textContent = 'Incorrect code. Hint: 123456'; shakeOtp(); return; }
  err.textContent = '';
  showHome();
}
function shakeOtp() {
  const row = document.querySelector('.otp-row');
  let n = 0;
  const iv = setInterval(() => {
    row.style.transform = n++ % 2 === 0 ? 'translateX(7px)' : 'translateX(-7px)';
    if (n > 7) { clearInterval(iv); row.style.transform = ''; }
  }, 55);
}
function clearOtp() {
  otpBoxes.forEach(b => { b.value = ''; b.classList.remove('filled'); });
  document.getElementById('otpError').textContent = '';
  updateVerifyBtn();
}

// ── HOME ──
function showHome() {
  const h = new Date().getHours();
  const greetWord = h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : h < 21 ? 'Evening' : 'Hey';
  const greetSub = h < 12 ? "Let's add some zest to your day 🍋"
    : h < 17 ? "Let's keep the momentum going"
    : h < 21 ? "Let's finish strong"
    : "Winding things down?";
  const timeWord = greetWord;
  const name = 'Eric';
  document.getElementById('greetingMsg').textContent = `${greetWord} ${name},`;
  document.getElementById('greetingSub').textContent = greetSub;
  document.getElementById('chatGreeting').textContent = timeWord + ', ' + name;
  goTo('screen-home');
  showIdle();
  switchMiddleView('home');
  updateProfileDisplay();
  // Desktop: inactive on home. Mobile: always active so user can tap to open mic
  document.getElementById('navActionBtn').classList.toggle('inactive', !isMobile());
}

// ── MIDDLE PANEL NAV ──
function switchMiddleView(tab) {
  ['homeContent','tasksFullView','dmContent','peopleContent'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  if (tab === 'tasks')       document.getElementById('tasksFullView').classList.remove('hidden');
  else if (tab === 'dms')    document.getElementById('dmContent').classList.remove('hidden');
  else if (tab === 'people') document.getElementById('peopleContent').classList.remove('hidden');
  else                       document.getElementById('homeContent').classList.remove('hidden');

  // Right panel
  if (tab === 'dms') {
    showPanel('dmView');
    loadDmConversation(activeDm);
  } else if (tab === 'tasks') {
    loadTaskDetail(activeTaskId);
  } else if (tab === 'people') {
    renderPeopleList();
    showIdle();
  } else {
    showIdle();
  }
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('navActionBtn').classList.toggle('inactive', btn.dataset.tab === 'home' && !isMobile());
    switchMiddleView(btn.dataset.tab);
    if (isMobile()) mobOpenHome();
  });
});

document.getElementById('navActionBtn').addEventListener('click', () => {
  navigateTo('home');
});

// ── DM CONVERSATIONS DATA ──
let activeDm = 'sarah';

const dmData = {
  sarah: {
    name: 'Sarah Jenkins', color: '#7c3aed', initials: 'SJ', online: true,
    messages: [
      { from: 'them', text: 'Hey! Just shared the brand assets folder with you 📁', time: '11:32 AM' },
      { from: 'them', text: 'Let me know what you think of the new color palette', time: '11:33 AM' },
      { from: 'me',   text: 'Just saw them — looks great! The typography is clean 🔥', time: '11:45 AM' },
      { from: 'me',   text: 'Can we discuss the amber accent? Think we can go a bit darker', time: '11:46 AM' },
      { from: 'them', type: 'voice', dur: '0:18', bars: [3,5,8,6,9,7,4,8,6,10,7,5,9,6,4,7,5,8,6,3], translation: "Totally agree on the amber. I can darken it a shade or two. Are you free for a quick call at 3pm today to go over the final palette together?", time: '12:01 PM' },
      { from: 'me',   text: '3pm works perfectly! See you then 👍', time: '12:03 PM' },
    ]
  },
  david: {
    name: 'David Chen', color: '#2563eb', initials: 'DC', online: false,
    messages: [
      { from: 'them', text: 'Sent the Q3 report document over 📎', time: '2h ago' },
      { from: 'me',   text: 'Got it, will review by EOD', time: '2h ago' },
      { from: 'them', type: 'voice', dur: '0:24', bars: [5,9,6,10,4,8,7,5,9,6,8,10,5,7,4,9,6,8,5,7], translation: "Hey, no rush on the report. I just wanted to flag that slide 14 has some placeholder numbers — make sure to replace those before you share it with the team. Let me know if you have questions.", time: '1h ago' },
      { from: 'me',   text: 'Thanks for the heads-up, will fix slide 14 🙏', time: '1h ago' },
    ]
  },
  alex: {
    name: 'Alex Kim', color: '#059669', initials: 'AK', online: true,
    messages: [
      { from: 'them', text: 'The new brand looks 🔥', time: 'Yesterday' },
      { from: 'me',   text: 'Thanks! Still a work in progress', time: 'Yesterday' },
      { from: 'them', text: 'What stack are you using for the desktop app?', time: 'Yesterday' },
      { from: 'me',   type: 'voice', dur: '0:11', bars: [4,7,5,9,6,8,5,7,4,6,8,5,7,4,9,6,5,8,4,6], translation: "Electron with vanilla JS, no frameworks. Just keeping it lean and fast.", time: 'Yesterday' },
    ]
  },
  jessica: {
    name: 'Jessica Park', color: '#d97706', initials: 'JP', online: false,
    messages: [
      { from: 'them', text: "I'll share the campaign slides tomorrow morning", time: 'Yesterday' },
      { from: 'me',   text: "Sounds good, looking forward to it 👍", time: 'Yesterday' },
    ]
  }
};

let _vnId = 0;
function makeVoiceBubble(msg, isMe) {
  const id = 'vn' + (_vnId++);
  const bars = (msg.bars || [4,7,5,9,6,8,5,7,4,6,8,5,7,4,9]).map(h =>
    `<div class="dmvn-bar" style="height:${h * 2.4}px"></div>`
  ).join('');
  const tickHTML = isMe ? ' <span class="dm-tick">✓✓</span>' : '';
  return `<div class="dm-voice-bubble ${isMe ? 'me' : 'them'}" id="${id}">
    <div class="dmvn-player">
      <button class="dmvn-play" aria-label="Play">
        <svg width="11" height="13" viewBox="0 0 11 13" fill="none"><path d="M1 1.5L10 6.5L1 11.5V1.5Z" fill="currentColor"/></svg>
      </button>
      <div class="dmvn-wave">${bars}</div>
      <span class="dmvn-dur">${msg.dur || '0:10'}</span>
    </div>
    <div class="dmvn-footer">
      <span class="dmvn-time">${msg.time}${tickHTML}</span>
      <button class="dmvn-translate-btn" data-trans="${encodeURIComponent(msg.translation || '')}">✦ Translate</button>
    </div>
    <div class="dmvn-translation hidden">
      <div class="dmvn-trans-label">✦ AI Translation</div>
      <div class="dmvn-trans-text"></div>
    </div>
  </div>`;
}

function makeBubble(msg, dm, showAvatar) {
  const isMe = msg.from === 'me';
  const timeHTML = `<div class="dm-bubble-time">${msg.time}${isMe ? ' <span class="dm-tick">✓✓</span>' : ''}</div>`;

  if (msg.type === 'voice') {
    const voiceHTML = makeVoiceBubble(msg, isMe);
    if (isMe) {
      return `<div class="dm-msg-row me"><div class="dm-msg-col-me">${voiceHTML}</div></div>`;
    } else {
      const avatarHTML = showAvatar
        ? `<div class="dm-msg-avatar" style="background:${dm.color}">${dm.initials.charAt(0)}</div>`
        : `<div class="dm-msg-avatar-spacer"></div>`;
      const senderHTML = showAvatar ? `<div class="dm-msg-sender">${dm.name}</div>` : '';
      return `<div class="dm-msg-row them ${showAvatar ? 'group-start' : ''}">
        ${avatarHTML}
        <div class="dm-msg-col">${senderHTML}${voiceHTML}</div>
      </div>`;
    }
  }

  if (isMe) {
    return `<div class="dm-msg-row me">
      <div class="dm-msg-col-me">
        <div class="dm-bubble">${msg.text}</div>
        ${timeHTML}
      </div>
    </div>`;
  } else {
    const avatarHTML = showAvatar
      ? `<div class="dm-msg-avatar" style="background:${dm.color}">${dm.initials.charAt(0)}</div>`
      : `<div class="dm-msg-avatar-spacer"></div>`;
    const senderHTML = showAvatar ? `<div class="dm-msg-sender">${dm.name}</div>` : '';
    return `<div class="dm-msg-row them ${showAvatar ? 'group-start' : ''}">
      ${avatarHTML}
      <div class="dm-msg-col">${senderHTML}<div class="dm-bubble">${msg.text}</div>${timeHTML}</div>
    </div>`;
  }
}

function loadDmConversation(dmKey) {
  activeDm = dmKey;
  const dm = dmData[dmKey];
  if (!dm) return;

  // Header
  document.getElementById('dmConvoHeader').innerHTML = `
    <div class="dm-convo-avatar" style="background:${dm.color}">${dm.initials.charAt(0)}${dm.online ? '<div class="online-dot"></div>' : ''}</div>
    <div class="dm-convo-info">
      <div class="dm-convo-name">${dm.name}</div>
      <div class="dm-convo-status ${dm.online ? '' : 'offline'}">${dm.online ? 'Online' : 'Offline'}</div>
    </div>
    <div class="dm-header-actions">
      <button class="dm-header-btn" title="Call">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" transform="translate(1,1) scale(0.91)"/></svg>
      </button>
      <button class="dm-header-btn" title="Search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
      <button class="dm-header-btn" title="More">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>
      </button>
    </div>
  `;

  // Messages with WhatsApp-style bubbles
  const msgs = document.getElementById('dmMessages');
  msgs.innerHTML = '<div class="dm-date-sep">Today</div>';
  dm.messages.forEach((msg, i) => {
    const prevMsg = dm.messages[i - 1];
    const showAvatar = msg.from === 'them' && (!prevMsg || prevMsg.from !== 'them');
    msgs.insertAdjacentHTML('beforeend', makeBubble(msg, dm, showAvatar));
  });
  msgs.scrollTop = msgs.scrollHeight;

  document.getElementById('dmInput').placeholder = `Message ${dm.name.split(' ')[0]}…`;
  document.querySelectorAll('.dm-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.dm === dmKey);
  });
}

function sendDmMessage(text) {
  if (!text.trim()) return;
  const dm = dmData[activeDm];
  const msg = { from: 'me', text: text.trim(), time: 'Just now' };
  dm.messages.push(msg);
  const msgs = document.getElementById('dmMessages');
  msgs.insertAdjacentHTML('beforeend', makeBubble(msg, dm, false));
  msgs.scrollTop = msgs.scrollHeight;
}

// ── PEOPLE DATA ──
const peopleData = [
  { key: 'sarah',   name: 'Sarah Jenkins', role: 'Head of Design',    initials: 'SJ', color: '#7c3aed', online: true,  email: 'sarah.j@yuzu.team',   dept: 'Design' },
  { key: 'alex',    name: 'Alex Kim',       role: 'Senior Designer',   initials: 'AK', color: '#059669', online: true,  email: 'alex.k@yuzu.team',    dept: 'Design' },
  { key: 'david',   name: 'David Chen',     role: 'Lead Engineer',     initials: 'DC', color: '#2563eb', online: false, email: 'david.c@yuzu.team',   dept: 'Engineering' },
  { key: 'jessica', name: 'Jessica Park',   role: 'Marketing Manager', initials: 'JP', color: '#d97706', online: false, email: 'jessica.p@yuzu.team', dept: 'Marketing' },
  { key: 'marcus',  name: 'Marcus Lee',     role: 'Product Manager',   initials: 'ML', color: '#0891b2', online: true,  email: 'marcus.l@yuzu.team',  dept: 'Product' },
  { key: 'priya',   name: 'Priya Nair',     role: 'UX Researcher',     initials: 'PN', color: '#be185d', online: true,  email: 'priya.n@yuzu.team',   dept: 'Design' },
  { key: 'tom',     name: 'Tom Eriksson',   role: 'Backend Engineer',  initials: 'TE', color: '#64748b', online: false, email: 'tom.e@yuzu.team',     dept: 'Engineering' },
];

function renderPeopleList(filter) {
  const list = document.getElementById('peopleList');
  if (!list) return;
  const q = (filter || '').toLowerCase();
  const items = q ? peopleData.filter(p => p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q)) : peopleData;

  const online  = items.filter(p => p.online);
  const offline = items.filter(p => !p.online);

  list.innerHTML = '';
  if (online.length) {
    list.insertAdjacentHTML('beforeend', '<div class="people-group-label">Active Now</div>');
    online.forEach(p => list.insertAdjacentHTML('beforeend', personRow(p)));
  }
  if (offline.length) {
    list.insertAdjacentHTML('beforeend', '<div class="people-group-label">Offline</div>');
    offline.forEach(p => list.insertAdjacentHTML('beforeend', personRow(p)));
  }

  list.querySelectorAll('.people-item').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.closest('.people-hover-actions')) return;
      showContactDetail(el.dataset.personKey);
    });
    el.querySelector('.pha-msg')?.addEventListener('click', e => {
      e.stopPropagation();
      const key = el.dataset.personKey;
      if (dmData[key]) { activeDm = key; navigateTo('dms'); }
    });
    el.querySelector('.pha-call')?.addEventListener('click', e => {
      e.stopPropagation();
      startCall(el.dataset.personKey);
    });
  });
}

function showContactDetail(personKey) {
  const p = peopleData.find(x => x.key === personKey);
  if (!p) return;

  document.querySelectorAll('.people-item').forEach(el =>
    el.classList.toggle('people-item-selected', el.dataset.personKey === personKey)
  );

  const avatarEl = document.getElementById('contactAvatarXl');
  avatarEl.textContent = p.initials.charAt(0);
  avatarEl.style.background = p.color;
  document.getElementById('contactHeroName').textContent = p.name;
  document.getElementById('contactHeroRole').textContent = p.role;
  document.getElementById('contactStatusDot').style.background = p.online ? '#00ad5e' : '#9ca3af';
  document.getElementById('contactStatusText').textContent = p.online ? 'Online now' : 'Offline';

  document.getElementById('contactEmailRow').innerHTML = `
    <div class="ci-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M1 5L8 9L15 5" stroke="currentColor" stroke-width="1.3"/></svg></div>
    <span class="ci-value">${p.email}</span>
  `;
  document.getElementById('contactDeptRow').innerHTML = `
    <div class="ci-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="5" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M5 5V4C5 2.9 5.9 2 7 2H9C10.1 2 11 2.9 11 4V5" stroke="currentColor" stroke-width="1.3"/></svg></div>
    <span class="ci-value">${p.role} · ${p.dept}</span>
  `;

  const dm = dmData[personKey];
  const msgsSection = document.getElementById('contactMsgsSection');
  const msgsList = document.getElementById('contactMsgsList');
  if (dm && dm.messages.length) {
    msgsSection.classList.remove('hidden');
    msgsList.innerHTML = dm.messages.slice(-3).map(m => `
      <div class="cm-item ${m.from === 'me' ? 'cm-me' : 'cm-them'}">
        <div class="cm-bubble">${m.text}</div>
        <div class="cm-time">${m.time}</div>
      </div>
    `).join('');
  } else {
    msgsSection.classList.add('hidden');
  }

  document.getElementById('caMessageBtn').onclick = () => {
    if (dmData[personKey]) { activeDm = personKey; navigateTo('dms'); }
  };
  document.getElementById('caCallBtn').onclick = () => startCall(personKey);
  document.getElementById('caVideoBtn').onclick = () => {
    const pd = peopleData.find(x => x.key === personKey) || dmData[personKey];
    if (pd) startCallWith(pd.name, pd.role || '', pd.color, pd.initials, true);
  };
  document.getElementById('caScheduleBtn').onclick = () => {
    const pd = peopleData.find(x => x.key === personKey);
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('scTitle').value = pd ? `Call with ${pd.name}` : '';
    document.getElementById('scDate').value = today;
    document.getElementById('scTime').value = '10:00';
    document.querySelectorAll('#scDurRow .sd-dur-btn').forEach((b, i) => b.classList.toggle('sd-dur-active', i === 1));
    renderSchedulePeople('scPeopleRow', pd ? pd.key : null);
    openModal('scheduleCallModal');
  };

  document.querySelectorAll('.contact-tab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.contact-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.ctab;
      ['ctabInfo','ctabMessages','ctabFiles'].forEach(id => {
        document.getElementById(id).classList.toggle('hidden', id !== 'ctab' + tab.charAt(0).toUpperCase() + tab.slice(1));
      });
    };
  });
  document.querySelectorAll('.contact-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.contact-tab[data-ctab="info"]').classList.add('active');
  ['ctabInfo','ctabMessages','ctabFiles'].forEach(id => document.getElementById(id).classList.toggle('hidden', id !== 'ctabInfo'));

  showPanel('contactView');
}

function personRow(p) {
  return `<div class="people-item" data-person-key="${p.key}" data-name="${p.name}" data-role="${p.role}" data-color="${p.color}" data-initials="${p.initials}">
    <div class="people-avatar" style="background:${p.color}">
      ${p.initials.charAt(0)}
      ${p.online ? '<div class="online-dot" style="position:absolute;bottom:0;right:0;width:10px;height:10px;border:2px solid #fff;border-radius:50%;background:var(--online)"></div>' : ''}
    </div>
    <div class="people-info">
      <div class="people-name">${p.name}</div>
      <div class="people-role">${p.role}</div>
    </div>
    <div class="people-hover-actions">
      <button class="pha-btn pha-msg" title="Message">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 9C14 9.35 13.86 9.69 13.61 9.94C13.36 10.19 13.02 10.33 12.67 10.33H4.67L2 13V3.67C2 3.32 2.14 2.98 2.39 2.73C2.64 2.48 2.98 2.33 3.33 2.33H12.67C13.02 2.33 13.36 2.48 13.61 2.73C13.86 2.98 14 3.32 14 3.67V9Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
      </button>
      <button class="pha-btn pha-call" title="Call">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14.6 11.28v2a1.33 1.33 0 01-1.45 1.33 13.19 13.19 0 01-5.75-2.05 13 13 0 01-4-4 13.19 13.19 0 01-2.05-5.78A1.33 1.33 0 012.68 1.33H4.68a1.33 1.33 0 011.33 1.15c.085.64.24 1.27.467 1.87a1.33 1.33 0 01-.3 1.4L5.24 6.61a10.67 10.67 0 004 4l.86-.86a1.33 1.33 0 011.4-.3c.6.228 1.23.382 1.87.467a1.33 1.33 0 011.15 1.36z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
      </button>
    </div>
  </div>`;
}

// People search
document.getElementById('peopleSearch')?.addEventListener('input', e => renderPeopleList(e.target.value));

// People speak button → start recording flow
document.getElementById('peopleSpeakBtn')?.addEventListener('click', () => {
  showRecordingView();
  startRecording();
});

// ── CHANNEL DATA ──
const channelData = {
  'product-launch-q3': {
    name: 'product-launch-q3', displayName: 'Product Launch Q3', members: 12,
    messages: [
      { from: 'alex',  name: 'Alex Kim',      initials: 'AK', color: '#059669', text: 'Just uploaded the new brand deck to the shared drive 🎉', time: '10:14 AM' },
      { from: 'sarah', name: 'Sarah Jenkins', initials: 'SJ', color: '#7c3aed', text: '@Alex the new brand assets look incredible! The color palette is exactly what we needed', time: '10:22 AM' },
      { from: 'alex',  name: 'Alex Kim',      initials: 'AK', color: '#059669', text: 'Thanks! Took a few iterations to get the amber right 😄', time: '10:23 AM' },
      { from: 'me',    name: 'Me',            initials: 'ME', color: '#4c1515', text: 'Agreed — really polished. Are we going live with this for Q3?', time: '10:31 AM' },
      { from: 'sarah', name: 'Sarah Jenkins', initials: 'SJ', color: '#7c3aed', text: 'Yes! Launch is set for next Monday. I\'ll share the timeline doc today.', time: '10:35 AM' },
      { from: 'david', name: 'David Chen',    initials: 'DC', color: '#2563eb', text: 'I\'ll handle the technical rollout. Staging is ready to test 🚀', time: '10:40 AM' },
    ]
  },
  'engineering-team': {
    name: 'engineering-team', displayName: 'Engineering Team', members: 8,
    messages: [
      { from: 'david', name: 'David Chen',    initials: 'DC', color: '#2563eb', text: 'Staging deployment was successful ✅ All smoke tests passing', time: '9:05 AM' },
      { from: 'alex',  name: 'Alex Kim',      initials: 'AK', color: '#059669', text: 'Nice work! I tested the new auth flow — looks solid', time: '9:18 AM' },
      { from: 'me',    name: 'Me',            initials: 'ME', color: '#4c1515', text: 'Good job everyone. Promoting to prod at 2pm today', time: '9:45 AM' },
      { from: 'david', name: 'David Chen',    initials: 'DC', color: '#2563eb', text: 'Roger that. I\'ll monitor the logs post-deploy', time: '9:47 AM' },
    ]
  },
  'design-system': {
    name: 'design-system', displayName: 'Design System', members: 5,
    messages: [
      { from: 'sarah', name: 'Sarah Jenkins', initials: 'SJ', color: '#7c3aed', text: 'New component library v2 is ready for review 🎨', time: 'Yesterday' },
      { from: 'alex',  name: 'Alex Kim',      initials: 'AK', color: '#059669', text: 'The button variants look great. One question — should the ghost variant have a border?', time: 'Yesterday' },
      { from: 'sarah', name: 'Sarah Jenkins', initials: 'SJ', color: '#7c3aed', text: 'Good catch! Yes, 1px border with opacity 40%. I\'ll update the spec.', time: 'Yesterday' },
      { from: 'me',    name: 'Me',            initials: 'ME', color: '#4c1515', text: 'Looks great! Approving for implementation 👍', time: 'Yesterday' },
    ]
  }
};

let activeChannel = null;

function loadChannelConversation(channelKey) {
  activeChannel = channelKey;
  const ch = channelData[channelKey];
  if (!ch) return;

  document.getElementById('channelHeader').innerHTML = `
    <div class="dm-convo-avatar" style="background:#0d8f82; font-size:16px; font-weight:700;">#</div>
    <div class="dm-convo-info">
      <div class="dm-convo-name">${ch.displayName}</div>
      <div class="dm-convo-status" style="color:var(--text-muted)">${ch.members} members</div>
    </div>
    <div class="dm-header-actions">
      <button class="dm-header-btn" title="Search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
      <button class="dm-header-btn" title="Members">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M21 17C21 15.7892 19.7659 14.7699 18 14.3453M3 17C3 15.7892 4.23413 14.7699 6 14.3453M12 14C10.067 14 8.5 12.433 8.5 10.5C8.5 8.567 10.067 7 12 7C13.933 7 15.5 8.567 15.5 10.5C15.5 12.433 13.933 14 12 14Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
      <button class="dm-header-btn" title="More">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>
      </button>
    </div>
  `;

  const msgs = document.getElementById('channelMessages');
  msgs.innerHTML = '<div class="dm-date-sep">Today</div>';
  ch.messages.forEach((msg, i) => {
    const prevMsg = ch.messages[i - 1];
    const showSender = !prevMsg || prevMsg.from !== msg.from;
    const isMe = msg.from === 'me';
    const timeHTML = `<div class="dm-bubble-time">${msg.time}${isMe ? ' <span class="dm-tick">✓✓</span>' : ''}</div>`;
    if (isMe) {
      msgs.insertAdjacentHTML('beforeend', `<div class="dm-msg-row me"><div class="dm-msg-col-me"><div class="dm-bubble">${msg.text}</div>${timeHTML}</div></div>`);
    } else {
      const avatarHTML = showSender ? `<div class="dm-msg-avatar" style="background:${msg.color}">${msg.initials.charAt(0)}</div>` : `<div class="dm-msg-avatar-spacer"></div>`;
      const senderHTML = showSender ? `<div class="dm-msg-sender">${msg.name}</div>` : '';
      msgs.insertAdjacentHTML('beforeend', `<div class="dm-msg-row them ${showSender ? 'group-start' : ''}">${avatarHTML}<div class="dm-msg-col">${senderHTML}<div class="dm-bubble">${msg.text}</div>${timeHTML}</div></div>`);
    }
  });
  msgs.scrollTop = msgs.scrollHeight;
  document.getElementById('channelInput').placeholder = `Message #${ch.name}…`;
  showPanel('channelView');
}

// ── TASK DATA ──
const taskData = [
  {
    id: 'task1',
    title: 'Review brand assets from Sarah',
    due: 'Today', status: 'In Progress', priority: 'High',
    assignee: { initials: 'ME', color: '#7c3aed', name: 'Me' },
    description: 'Go through the new brand assets Sarah shared and leave detailed feedback on typography, color palette, and logo usage.',
    subtasks: [
      { done: false, text: 'Open Figma file' },
      { done: false, text: 'Leave comments on color palette' },
      { done: true,  text: 'Share with the team' },
    ],
    activity: [
      { initials: 'SJ', color: '#7c3aed', name: 'Sarah Jenkins', text: 'Sent the assets over 👍', time: '11:33 AM' },
      { initials: 'ME', color: '#4c1515', name: 'You', text: 'Added this task and assigned to self', time: '11:45 AM' },
    ]
  },
  {
    id: 'task2',
    title: 'Deploy staging environment',
    due: 'Today', status: 'To Do', priority: 'Medium',
    assignee: { initials: 'ME', color: '#4c1515', name: 'Me' },
    description: 'Set up and deploy the updated staging environment with the latest build. Notify the team once it\'s live.',
    subtasks: [
      { done: false, text: 'Run build script' },
      { done: false, text: 'Smoke test all routes' },
      { done: false, text: 'Notify team in #engineering-team' },
    ],
    activity: [
      { initials: 'DC', color: '#2563eb', name: 'David Chen', text: 'Added a note: use the new CI pipeline config', time: '1h ago' },
    ]
  }
];

let activeTaskId = 'task1';

function statusClass(s) {
  return 'status-' + s.toLowerCase().replace(/\s+/g, '-');
}

function loadTaskDetail(taskId) {
  activeTaskId = taskId;
  const t = taskData.find(x => x.id === taskId);
  if (!t) return;

  // Highlight selected task in list
  document.querySelectorAll('.task-item[data-task-id]').forEach(el => {
    el.classList.toggle('task-selected', el.dataset.taskId === taskId);
  });

  // Title
  document.getElementById('taskDetailTitle').textContent = t.title;

  // Chips
  document.getElementById('taskDetailChips').innerHTML = `
    <button class="td-chip ${statusClass(t.status)}" id="tdStatusChip">${t.status}</button>
    <button class="td-chip priority-${t.priority.toLowerCase()}">${t.priority} Priority</button>
    <span class="td-chip due-chip">⏱ ${t.due}</span>
  `;
  document.getElementById('tdStatusChip').addEventListener('click', () => cycleTaskStatus(t));

  // Assignee
  document.getElementById('taskDetailAssignee').innerHTML = `
    <div class="td-assignee-avatar" style="background:${t.assignee.color}">${t.assignee.initials}</div>
    <span>${t.assignee.name}</span>
  `;

  // Description
  const descEl = document.getElementById('taskDetailDesc');
  descEl.textContent = t.description;

  // Subtasks
  const stEl = document.getElementById('taskSubtasks');
  stEl.innerHTML = t.subtasks.map((s, i) => `
    <div class="subtask-item ${s.done ? 'done' : ''}" data-subtask="${i}">
      <div class="subtask-check"></div>
      <span class="subtask-text">${s.text}</span>
    </div>
  `).join('');
  stEl.querySelectorAll('.subtask-item').forEach(el => {
    el.addEventListener('click', () => {
      const i = parseInt(el.dataset.subtask);
      t.subtasks[i].done = !t.subtasks[i].done;
      el.classList.toggle('done', t.subtasks[i].done);
    });
  });

  // Activity
  document.getElementById('taskActivity').innerHTML = t.activity.map(a => `
    <div class="activity-item">
      <div class="activity-avatar" style="background:${a.color}">${a.initials}</div>
      <div class="activity-bubble">
        <span class="activity-name">${a.name}</span><span class="activity-time">${a.time}</span>
        <div class="activity-text">${a.text}</div>
      </div>
    </div>
  `).join('');

  showPanel('taskDetail');
}

function cycleTaskStatus(t) {
  const cycle = ['To Do', 'In Progress', 'Done'];
  t.status = cycle[(cycle.indexOf(t.status) + 1) % cycle.length];
  const chip = document.getElementById('tdStatusChip');
  if (chip) {
    chip.textContent = t.status;
    chip.className = `td-chip ${statusClass(t.status)}`;
    chip.addEventListener('click', () => cycleTaskStatus(t));
  }
  // Sync task list items
  document.querySelectorAll(`.task-item[data-task-id="${t.id}"] .task-status`).forEach(el => {
    el.textContent = t.status;
    el.className = 'task-status ' + t.status.toLowerCase().replace(/\s+/g, '-');
  });
}

// ── RIGHT PANEL STATES ──
const allPanels = ['scheduleDetail','taskDetail','channelView','dmView','recIdle','recView','recIntent','recResult','kbView','contactView'];
function showPanel(id) {
  allPanels.forEach(p => {
    const el = document.getElementById(p);
    if (el) el.classList.toggle('hidden', p !== id);
  });
  if (typeof isMobile === 'function' && isMobile()) {
    if (id === 'recIdle') {
      mobCloseDetail();
    } else {
      mobOpenDetail();
      const backBtn = document.getElementById('mobBackBtn');
      if (backBtn) backBtn.style.display = 'flex';
    }
  }
}

function showIdle()          { teardownRecording(); showPanel('recIdle'); }
function showRecordingView() { showPanel('recView'); }
function showIntent()        { showPanel('recIntent'); resetIntent(); }

function showResult() {
  const selected = document.querySelector('.intent-card.selected');
  const intent = selected ? selected.dataset.intent : 'schedule';
  populateResult(intent);
  showPanel('recResult');
}

function resetIntent() {
  document.querySelectorAll('.intent-card').forEach(c => c.classList.remove('selected'));
  const btn = document.getElementById('intentConfirmBtn');
  btn.disabled = true;
  btn.classList.remove('active');
}

// ── IDLE MIC BUTTON ──
document.getElementById('micBtnIdle').addEventListener('click', () => {
  showRecordingView();
  startRecording();
});

document.querySelectorAll('.ai-sugg-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    showRecordingView();
    startRecording();
  });
});

// ── RECORDING ──
let mediaStream = null, mediaRecorder = null, audioContext = null;
let analyser = null, animFrameId = null, recordedChunks = [];
let recTimerInterval = null, recSeconds = 0;

function fmt(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

const waveContainers = document.querySelectorAll('.rec-view-wave');
const leftBars  = waveContainers[0] ? Array.from(waveContainers[0].querySelectorAll('.rv-bar')) : [];
const rightBars = waveContainers[1] ? Array.from(waveContainers[1].querySelectorAll('.rv-bar')) : [];

function resetBars() {
  [...leftBars, ...rightBars].forEach(b => { b.style.height = ''; b.style.animation = ''; });
}

function startWaveformDraw() {
  if (!analyser) return;
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.8;
  const data = new Uint8Array(analyser.frequencyBinCount);
  function draw() {
    animFrameId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(data);
    const bins = analyser.frequencyBinCount;
    const step = Math.max(1, Math.floor(bins / 10));
    const minH = 4, maxH = 54;
    for (let i = 0; i < 10; i++) {
      const h = minH + (data[Math.min(i * step, bins - 1)] / 255) * (maxH - minH);
      if (leftBars[9 - i]) leftBars[9 - i].style.height = h + 'px';
      if (rightBars[i]) rightBars[i].style.height = h + 'px';
    }
  }
  draw();
}

async function startRecording() {
  teardownRecording();
  recSeconds = 0;
  document.getElementById('recPillTimer').textContent = '0:00';
  recTimerInterval = setInterval(() => {
    recSeconds++;
    document.getElementById('recPillTimer').textContent = fmt(recSeconds);
  }, 1000);
  const tip = document.querySelector('.rec-view-tip');
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('getUserMedia not supported');
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') await audioContext.resume();
    analyser = audioContext.createAnalyser();
    audioContext.createMediaStreamSource(mediaStream).connect(analyser);
    mediaRecorder = new MediaRecorder(mediaStream);
    recordedChunks = [];
    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
    mediaRecorder.start(100);
    [...leftBars, ...rightBars].forEach(b => { b.style.animation = 'none'; });
    startWaveformDraw();
    if (tip) tip.textContent = 'Speak naturally — I\'ll extract the details.\nSay "stop" or tap the button when done.';
  } catch (err) {
    console.warn('Mic unavailable:', err.message);
    if (tip) tip.textContent = 'Microphone access denied. Check System Settings → Privacy → Microphone.';
  }
}

function teardownRecording() {
  clearInterval(recTimerInterval);
  cancelAnimationFrame(animFrameId);
  animFrameId = null;
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }
  if (audioContext) { audioContext.close(); audioContext = null; analyser = null; }
  resetBars();
}

function stopRecording() { teardownRecording(); showIntent(); }

document.getElementById('recViewStopBtn').addEventListener('click', stopRecording);
document.getElementById('recViewStopFull').addEventListener('click', stopRecording);
document.getElementById('recViewRestart').addEventListener('click', () => { teardownRecording(); startRecording(); });

// ── INTENT PICKER ──
document.querySelectorAll('.intent-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.intent-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    const btn = document.getElementById('intentConfirmBtn');
    btn.disabled = false;
    btn.classList.add('active');
  });
});

document.getElementById('intentConfirmBtn').addEventListener('click', () => {
  if (!document.getElementById('intentConfirmBtn').disabled) showResult();
});

document.getElementById('micBtnReRecord').addEventListener('click', () => {
  showRecordingView();
  startRecording();
});

// ── RESULT SCREEN — dynamic fields ──
function field(label, value, badge, editable) {
  const cls = editable ? 'rf-value rf-editable" contenteditable="true' : 'rf-value';
  return `<div class="result-field"><span class="rf-label">${label}</span><div class="rf-row"><span class="${cls}">${value}</span><span class="rf-badge ${badge.cls}">${badge.text}</span></div></div>`;
}
function fieldPair(f1, f2) {
  return `<div class="result-field-pair">${f1}${f2}</div>`;
}
function avatarField(label, initials, name, badge) {
  return `<div class="result-field"><span class="rf-label">${label}</span><div class="rf-row"><div class="rf-avatar">${initials}</div><span class="rf-value">${name}</span><span class="rf-badge ${badge.cls}">${badge.text}</span></div></div>`;
}

const AI = { cls: 'ai', text: 'AI' };
const MATCHED = { cls: 'matched', text: 'Matched' };

const resultData = {
  task: {
    confirmText: 'Confirm & Create Task',
    fields: () => [
      field('ACTION', 'Create Task', AI, false),
      field('TITLE', 'Review the new brand assets', AI, true),
      field('DUE DATE', 'Today', AI, true),
      field('STATUS', 'To Do', AI, true),
      avatarField('ASSIGNED TO', 'ME', 'Me', MATCHED),
    ].join('')
  },
  schedule: {
    confirmText: 'Confirm & Schedule Call',
    fields: () => [
      field('ACTION', 'Schedule Call', AI, false),
      field('TITLE', 'Design Sync — Sara & Priya', AI, true),
      fieldPair(field('DATE', 'Tomorrow', AI, true), field('TIME', '3:00 PM', AI, true)),
      field('DURATION', '30 minutes', AI, true),
      avatarField('WITH', 'SR', 'Sara Rahimi', MATCHED),
    ].join('')
  },
  ask: {
    confirmText: 'Ask Now',
    fields: () => [
      field('QUERY', 'Summarize last week\'s discussions', AI, true),
      field('SCOPE', 'All channels', AI, true),
      field('TIME RANGE', 'Last 7 days', AI, true),
    ].join('')
  },
  message: {
    confirmText: 'Send Draft',
    fields: () => [
      field('ACTION', 'Draft Message', AI, false),
      avatarField('TO', 'SJ', 'Sarah Jenkins', MATCHED),
      field('SUBJECT', 'Q3 Brand Assets Review', AI, true),
      field('PREVIEW', 'Hi Sarah, following up on the brand assets...', AI, true),
    ].join('')
  }
};

function populateResult(intent) {
  const data = resultData[intent] || resultData.schedule;
  document.getElementById('resultFields').innerHTML = data.fields();
  const btn = document.getElementById('resultConfirmBtn');
  btn.textContent = data.confirmText;
  btn.dataset.intent = intent;
}

function navigateTo(tab) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.nav-item[data-tab="${tab}"]`);
  if (btn) btn.classList.add('active');
  document.getElementById('navActionBtn').classList.toggle('inactive', tab === 'home' && !isMobile());
  switchMiddleView(tab);
  if (isMobile()) {
    if (tab === 'home') { mobCloseDetail(); mobCloseHome(); }
    else mobOpenHome();
  }
}

document.getElementById('resultConfirmBtn').addEventListener('click', () => {
  const intent = document.getElementById('resultConfirmBtn').dataset.intent;
  const editables = document.querySelectorAll('#resultFields .rf-editable');

  if (intent === 'task') {
    const title   = editables[0] ? editables[0].textContent.trim() : 'New Task';
    const dueDate = editables[1] ? editables[1].textContent.trim() : 'Today';
    const status  = editables[2] ? editables[2].textContent.trim() : 'To Do';
    createAndShowTask(title, dueDate, status);

  } else if (intent === 'message') {
    // Get recipient and message preview from result fields
    const recipientEl = document.querySelector('#resultFields .rf-avatar');
    const recipientName = recipientEl ? recipientEl.nextElementSibling.textContent.trim() : 'Sarah Jenkins';
    const preview = editables[1] ? editables[1].textContent.trim() : '';
    createAndShowDraft(recipientName, preview);

  } else if (intent === 'schedule') {
    const title    = editables[0] ? editables[0].textContent.trim() : 'Meeting';
    const date     = editables[1] ? editables[1].textContent.trim() : 'Tomorrow';
    const time     = editables[2] ? editables[2].textContent.trim() : '3:00 PM';
    const duration = editables[3] ? editables[3].textContent.trim() : '30 minutes';
    const withEl   = document.querySelector('#resultFields .rf-avatar');
    const withName = withEl ? withEl.nextElementSibling.textContent.trim() : '';
    createAndShowSchedule(title, date, time, duration, withName);

  } else if (intent === 'ask') {
    const query = editables[0] ? editables[0].textContent.trim() : 'Summarize last week\'s discussions';
    showKbView(query);
  } else {
    navigateTo('home');
    showIdle();
  }
});

document.getElementById('tryAgainBtn').addEventListener('click', () => showIdle());

// ── HOME PAGE CONVO / CHANNEL CLICKS ──
document.getElementById('homeContent').addEventListener('click', e => {
  const convo = e.target.closest('.convo-item[data-dm], .convo-item[data-channel]');
  const ch    = e.target.closest('.channel-item[data-channel]');
  if (convo) {
    if (convo.dataset.dm) {
      activeDm = convo.dataset.dm;
      navigateTo('dms');
    } else {
      loadChannelConversation(convo.dataset.channel);
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    }
  } else if (ch) {
    loadChannelConversation(ch.dataset.channel);
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  }
});

// ── CHANNEL SEND ──
document.getElementById('channelSendBtn').addEventListener('click', () => {
  const input = document.getElementById('channelInput');
  const text = input.value.trim();
  if (!text || !activeChannel) return;
  channelData[activeChannel].messages.push({ from: 'me', name: 'Me', initials: 'ME', color: '#4c1515', text, time: 'Just now' });
  const msgs = document.getElementById('channelMessages');
  const timeHTML = `<div class="dm-bubble-time">Just now <span class="dm-tick">✓✓</span></div>`;
  msgs.insertAdjacentHTML('beforeend', `<div class="dm-msg-row me"><div class="dm-msg-col-me"><div class="dm-bubble">${text}</div>${timeHTML}</div></div>`);
  msgs.scrollTop = msgs.scrollHeight;
  input.value = '';
  syncSendBtn(input, document.getElementById('channelSendBtn'));
});
document.getElementById('channelInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('channelSendBtn').click();
});

// ── PROFILE POPUP ──
let currentStatus = 'active';
const statusDotColors = { active: '#00ad5e', away: '#f59e0b', dnd: '#ef4444', meeting: '#8b5cf6', offline: '#9ca3af' };

// ── NAV EXPAND / COLLAPSE ──
let navExpanded = false;
document.getElementById('navCollapseBtn').addEventListener('click', () => {
  navExpanded = !navExpanded;
  const nav = document.querySelector('.left-nav');
  nav.classList.toggle('expanded', navExpanded);
  // shift profile popup when nav expands
  const popup = document.getElementById('profilePopup');
  popup.style.left = navExpanded ? '218px' : '80px';
});

function updateProfileDisplay() {
  const name = userEmail ? userEmail.split('@')[0] : 'User';
  const initials = name.slice(0,2).toUpperCase();
  document.getElementById('navProfileInitials').textContent = initials;
  document.getElementById('navProfileName').textContent = name.charAt(0).toUpperCase() + name.slice(1);
  document.getElementById('homeGreetingAvatar').textContent = name.charAt(0).toUpperCase();
  document.getElementById('profilePopupAvatar').textContent = initials;
  document.getElementById('profilePopupName').textContent = name.charAt(0).toUpperCase() + name.slice(1);
  document.getElementById('profilePopupEmail').textContent = userEmail || '';
  const dot = document.getElementById('navProfileDot');
  dot.style.background = statusDotColors[currentStatus];
  dot.className = 'nav-profile-status-dot' + (currentStatus !== 'active' ? ' ' + currentStatus : '');
}

document.getElementById('navProfileBtn').addEventListener('click', e => {
  e.stopPropagation();
  updateProfileDisplay();
  document.getElementById('profilePopup').classList.toggle('hidden');
});

document.addEventListener('click', e => {
  if (!e.target.closest('#profilePopup') && !e.target.closest('#navProfileBtn')) {
    document.getElementById('profilePopup').classList.add('hidden');
  }
});

document.querySelectorAll('.profile-status-option').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.profile-status-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentStatus = btn.dataset.status;
    const dot = document.getElementById('navProfileDot');
    dot.style.background = statusDotColors[currentStatus];
    dot.className = 'nav-profile-status-dot' + (currentStatus !== 'active' ? ' ' + currentStatus : '');
  });
});

document.getElementById('profileSignOut').addEventListener('click', () => {
  document.getElementById('profilePopup').classList.add('hidden');
  goTo('screen-login');
});

// ── EDIT PROFILE ──
let epAvatarColor = '#4c1515';
let profileDisplayName = '';
let profileRole = '';

function openEditProfile() {
  document.getElementById('profilePopup').classList.add('hidden');
  const name = userEmail ? userEmail.split('@')[0] : 'User';
  profileDisplayName = profileDisplayName || (name.charAt(0).toUpperCase() + name.slice(1));
  document.getElementById('epNameInput').value = profileDisplayName;
  document.getElementById('epRoleInput').value = profileRole;
  document.getElementById('epEmailInput').value = userEmail || '';
  document.getElementById('epAvatarPreview').textContent = profileDisplayName.slice(0,2).toUpperCase();
  document.getElementById('epAvatarPreview').style.background = epAvatarColor;
  document.getElementById('editProfileModal').classList.remove('hidden');
}

document.getElementById('editProfileBtn').addEventListener('click', openEditProfile);

document.getElementById('editProfileClose').addEventListener('click', () => {
  document.getElementById('editProfileModal').classList.add('hidden');
});
document.getElementById('epCancelBtn').addEventListener('click', () => {
  document.getElementById('editProfileModal').classList.add('hidden');
});

document.getElementById('epNameInput').addEventListener('input', e => {
  const val = e.target.value.trim();
  document.getElementById('epAvatarPreview').textContent = val.slice(0,2).toUpperCase() || 'YZ';
});

document.querySelectorAll('.ep-swatch').forEach(sw => {
  sw.addEventListener('click', () => {
    document.querySelectorAll('.ep-swatch').forEach(s => s.classList.remove('active'));
    sw.classList.add('active');
    epAvatarColor = sw.dataset.color;
    document.getElementById('epAvatarPreview').style.background = epAvatarColor;
  });
});

document.getElementById('epSaveBtn').addEventListener('click', () => {
  const name = document.getElementById('epNameInput').value.trim() || profileDisplayName;
  profileDisplayName = name;
  profileRole = document.getElementById('epRoleInput').value.trim();
  const initials = name.slice(0,2).toUpperCase();
  document.getElementById('navProfileInitials').textContent = initials;
  document.getElementById('navProfileName').textContent = name;
  document.getElementById('navProfileAvatar') && (document.getElementById('navProfileAvatar').style.background = epAvatarColor);
  document.getElementById('profilePopupAvatar').textContent = initials;
  document.getElementById('profilePopupAvatar').style.background = epAvatarColor;
  document.getElementById('profilePopupName').textContent = name;
  document.getElementById('editProfileModal').classList.add('hidden');
});

document.getElementById('editProfileModal').addEventListener('click', e => {
  if (e.target === document.getElementById('editProfileModal')) {
    document.getElementById('editProfileModal').classList.add('hidden');
  }
});

// ── TASK LIST CLICKS ──
document.getElementById('tasksFullList').addEventListener('click', e => {
  const item = e.target.closest('.task-item[data-task-id]');
  if (item) loadTaskDetail(item.dataset.taskId);
});
document.getElementById('myTasksCard').addEventListener('click', e => {
  const item = e.target.closest('.task-item[data-task-id]');
  if (item) { switchMiddleView('tasks'); loadTaskDetail(item.dataset.taskId); }
});

// ── DM LIST CLICKS ──
document.getElementById('dmList').addEventListener('click', e => {
  const item = e.target.closest('.dm-item');
  if (item) loadDmConversation(item.dataset.dm);
});

// ── MIC ↔ SEND TOGGLE ──
const MIC_SVG  = `<svg class="icon-mic" width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="12" rx="3" fill="white"/><path d="M5 11C5 15.42 8.686 19 12 19C15.314 19 19 15.42 19 11" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M12 19V22M9 22H15" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`;
const SEND_SVG = `<svg class="icon-send" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" fill="white"/></svg>`;

function syncSendBtn(inputEl, btnEl) {
  btnEl.innerHTML = inputEl.value.trim() ? SEND_SVG : MIC_SVG;
}

document.getElementById('dmInput').addEventListener('input', e =>
  syncSendBtn(e.target, document.getElementById('dmSendBtn'))
);
document.getElementById('channelInput').addEventListener('input', e =>
  syncSendBtn(e.target, document.getElementById('channelSendBtn'))
);

// ── ATTACH POPUP ──
function toggleAttachPopup(popupId, e) {
  e.stopPropagation();
  const popup = document.getElementById(popupId);
  const wasHidden = popup.classList.contains('hidden');
  document.querySelectorAll('.composer-attach-popup').forEach(p => p.classList.add('hidden'));
  if (wasHidden) popup.classList.remove('hidden');
}
document.getElementById('dmPlusBtn').addEventListener('click', e => toggleAttachPopup('dmAttachPopup', e));
document.getElementById('channelPlusBtn').addEventListener('click', e => toggleAttachPopup('channelAttachPopup', e));
document.addEventListener('click', () =>
  document.querySelectorAll('.composer-attach-popup').forEach(p => p.classList.add('hidden'))
);

// ── VOICE NOTE TRANSLATE ──
document.addEventListener('click', e => {
  const btn = e.target.closest('.dmvn-translate-btn');
  if (!btn) return;
  const bubble = btn.closest('.dm-voice-bubble');
  const transDiv = bubble.querySelector('.dmvn-translation');
  if (!transDiv.classList.contains('hidden')) {
    transDiv.classList.add('hidden');
    btn.textContent = '✦ Translate';
    return;
  }
  const text = decodeURIComponent(btn.dataset.trans || '');
  bubble.querySelector('.dmvn-trans-text').textContent = text ? `"${text}"` : '"Voice note transcription not available."';
  transDiv.classList.remove('hidden');
  btn.textContent = '✦ Hide';
});

// ── DM COMPOSER ──
document.getElementById('dmSendBtn').addEventListener('click', () => {
  const input = document.getElementById('dmInput');
  if (!input.value.trim()) return;
  sendDmMessage(input.value);
  input.value = '';
  syncSendBtn(input, document.getElementById('dmSendBtn'));
});
document.getElementById('dmInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    sendDmMessage(e.target.value);
    e.target.value = '';
    syncSendBtn(e.target, document.getElementById('dmSendBtn'));
  }
});

// ── DRAFT MESSAGE → DMs ──
function createAndShowDraft(recipientName, messageText) {
  // Find matching DM key by first name
  const firstName = recipientName.split(' ')[0].toLowerCase();
  const dmKey = Object.keys(dmData).find(k => dmData[k].name.toLowerCase().startsWith(firstName)) || 'sarah';

  // Push the drafted message into the conversation
  if (messageText) {
    dmData[dmKey].messages.push({ from: 'me', text: messageText, time: 'Just now' });
  }

  // Navigate to DMs and open that conversation
  activeDm = dmKey;
  navigateTo('dms');
}

// ── SCHEDULE PEOPLE PICKER ──
function renderSchedulePeople(containerId, preselectedKey) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = peopleData.map(p => `
    <div class="sd-person${p.key === preselectedKey ? ' selected' : ''}" data-person-key="${p.key}">
      <div class="sd-person-av-wrap">
        <div class="sd-person-av" style="background:${p.color}">${p.initials.charAt(0)}</div>
        <div class="sd-person-check">✓</div>
      </div>
      <span class="sd-person-name">${p.name.split(' ')[0]}</span>
    </div>
  `).join('');
  container.querySelectorAll('.sd-person').forEach(el => {
    el.addEventListener('click', () => el.classList.toggle('selected'));
  });
}

function getSelectedPeopleNames(containerId) {
  const names = [];
  document.querySelectorAll(`#${containerId} .sd-person.selected`).forEach(el => {
    const p = peopleData.find(x => x.key === el.dataset.personKey);
    if (p) names.push(p.name);
  });
  return names.join(', ') || null;
}

// ── SCHEDULE EVENT → Home Upcoming ──
function createAndShowSchedule(title, date, time, duration, withName) {
  const section = document.getElementById('upcomingSection');
  const list    = document.getElementById('upcomingList');

  const scheduleObj = { title, date, time, duration: duration || '30 minutes', withName };

  const item = document.createElement('div');
  item.className = 'upcoming-item event-new';
  item.style.cursor = 'pointer';
  item.dataset.scheduleTitle = title;
  item.innerHTML = `
    <div class="upcoming-icon">📅</div>
    <div class="upcoming-body">
      <span class="upcoming-name">${title}</span>
      <span class="upcoming-meta">${date} · ${time}${duration ? ' · ' + duration : ''}${withName ? ' · with ' + withName : ''}</span>
    </div>
    <span class="upcoming-badge">Scheduled</span>
  `;
  item.addEventListener('click', () => showScheduleDetail(scheduleObj));

  const last = list.querySelector('.upcoming-item:last-child');
  if (last) last.classList.remove('no-border');
  list.appendChild(item);
  section.classList.remove('hidden');

  navigateTo('home');
  showIdle();
  setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
  setTimeout(() => item.classList.remove('event-new'), 2200);
}

function showScheduleDetail(s) {
  window._currentSchedule = s;

  document.getElementById('scheduleDetailTitle').textContent = s.title;
  document.getElementById('scheduleDetailDateText').textContent = `${s.date} at ${s.time}`;
  document.getElementById('scheduleDetailDuration').textContent = s.duration || '30 minutes';

  const attendees = document.getElementById('scheduleAttendees');
  const withPerson = s.withName ? peopleData.find(p => p.name.toLowerCase().includes(s.withName.toLowerCase().split(' ')[0])) : null;
  const meAvatar = `<div class="ci-icon"><div style="width:28px;height:28px;border-radius:50%;background:var(--maroon);color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;">M</div></div>`;
  const meRow = `<div class="contact-info-item">${meAvatar}<span class="ci-value">You <span style="font-size:11px;color:#9096b0">(organiser)</span></span></div>`;
  const guestRow = withPerson ? `<div class="contact-info-item"><div class="ci-icon"><div style="width:28px;height:28px;border-radius:50%;background:${withPerson.color};color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;">${withPerson.initials.charAt(0)}</div></div><span class="ci-value">${withPerson.name}</span></div>` : '';
  attendees.innerHTML = meRow + guestRow;

  const joinBtn = document.querySelector('#scheduleDetail .ca-action-btn:nth-child(1)');
  const editBtn = document.querySelector('#scheduleDetail .ca-action-btn:nth-child(2)');
  const cancelBtn = document.querySelector('#scheduleDetail .ca-action-btn:nth-child(3)');

  joinBtn.onclick = () => {
    if (withPerson) {
      startCallWith(withPerson.name, withPerson.role || '', withPerson.color, withPerson.initials, true);
    } else {
      startCallWith(s.title, 'Meeting', '#3d5af1', '📅', true);
    }
  };

  editBtn.onclick = () => {
    window._sdEditMode = true;
    document.getElementById('scTitle').value = s.title;
    document.getElementById('scDate').value = s.date;
    document.getElementById('scTime').value = s.time;
    const durMap = { '15': 0, '30': 1, '45': 2, '60': 3 };
    const durKey = s.duration ? s.duration.replace(/[^0-9]/g, '') : '30';
    document.querySelectorAll('#scDurRow .sd-dur-btn').forEach((b, i) => b.classList.toggle('sd-dur-active', i === (durMap[durKey] ?? 1)));
    const preKey = s.withName ? (peopleData.find(p => p.name.toLowerCase().includes(s.withName.toLowerCase().split(' ')[0]))?.key || null) : null;
    renderSchedulePeople('scPeopleRow', preKey);
    openModal('scheduleCallModal');
  };

  cancelBtn.onclick = () => {
    const list = document.getElementById('upcomingList');
    const items = list.querySelectorAll('.upcoming-item');
    items.forEach(el => {
      if (el.dataset.scheduleTitle === s.title) el.remove();
    });
    const remaining = list.querySelectorAll('.upcoming-item');
    if (!remaining.length) document.getElementById('upcomingSection').classList.add('hidden');
    navigateTo('home');
    showIdle();
  };

  showPanel('scheduleDetail');
}

// ── TASK CREATION ──
function taskItemHTML(title, dueDate, status, taskId) {
  const statusCls = status.toLowerCase().replace(/\s+/g, '-');
  return `<div class="task-item task-new no-border" data-task-id="${taskId}">
    <div class="task-check"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#d1d5db" stroke-width="1.5"/></svg></div>
    <div class="task-body">
      <span class="task-name">${title}</span>
      <div class="task-meta"><span class="task-due">⏱ ${dueDate}</span><span class="task-dot">•</span><span class="task-status ${statusCls}">${status}</span></div>
    </div>
  </div>`;
}

// ── KNOWLEDGE BASE VIEW ──
const kbArticles = [
  { icon: '📋', title: 'Q3 Brand Launch Discussion', channel: '#product-launch-q3', snippet: 'Alex shared the new brand deck. Sarah confirmed the amber color palette and launch date is set for next Monday.', relevance: 98 },
  { icon: '🚀', title: 'Staging Deployment Update',  channel: '#engineering-team',   snippet: 'David confirmed staging is ready with all smoke tests passing. Production deployment was scheduled for 2pm.', relevance: 91 },
  { icon: '🎨', title: 'Design System v2 Review',    channel: '#design-system',       snippet: 'Sarah published component library v2. Ghost button border spec was clarified (1px, 40% opacity). Approved for implementation.', relevance: 84 },
];

function showKbView(query) {
  document.getElementById('kbQueryText').textContent = query || 'Summarize last week\'s discussions';
  const list = document.getElementById('kbResults');
  list.innerHTML = kbArticles.map(a => `
    <div class="kb-result-card">
      <div class="kb-result-top">
        <span class="kb-result-icon">${a.icon}</span>
        <div class="kb-result-meta">
          <div class="kb-result-title">${a.title}</div>
          <div class="kb-result-channel">${a.channel}</div>
        </div>
        <div class="kb-relevance-badge">${a.relevance}%</div>
      </div>
      <div class="kb-result-snippet">${a.snippet}</div>
    </div>
  `).join('');
  showPanel('kbView');
}

document.getElementById('kbNewBtn').addEventListener('click', () => showIdle());

// ── EMOJI PICKER ──
const emojiSets = {
  smileys:  ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','😉','😍','🥰','😘','😗','😋','😛','😜','🤪','😝','🤑','🤗','🤭','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤧','🥵','🥶','😷'],
  gestures: ['👋','🤚','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','☝️','👇','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏'],
  hearts:   ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️','❤️‍🔥','❤️‍🩹','💌','💋'],
  nature:   ['🌸','🌺','🌻','🌹','🌷','🌿','🍀','🌱','🌲','🌳','🌴','🌵','🌾','🍃','🍂','🍁','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸'],
  food:     ['🍕','🍔','🌮','🌯','🥗','🍜','🍣','🍱','🍩','🍪','🎂','🍰','🧁','🍫','🍬','🍭','🍦','🍧','🍨','🥤','☕','🍵','🧃','🍷','🍸','🍹','🍺','🥂','🧊','🫖'],
  objects:  ['🎉','🎊','🎈','🎁','🎀','🎗️','🏆','🥇','⭐','🌟','✨','💫','🔥','💥','❄️','🌈','⚡','🎵','🎶','🎸','🎹','🎤','📱','💻','📷','🔔','💡','🔑','💎','🚀'],
};

let activeEmojiTarget = null;

function renderEmojiCat(cat) {
  const grid = document.getElementById('epGrid');
  grid.innerHTML = emojiSets[cat].map(e =>
    `<button class="ep-emoji" data-emoji="${e}">${e}</button>`
  ).join('');
  grid.querySelectorAll('.ep-emoji').forEach(btn => {
    btn.addEventListener('click', () => {
      if (activeEmojiTarget) {
        const pos = activeEmojiTarget.selectionStart;
        const val = activeEmojiTarget.value;
        activeEmojiTarget.value = val.slice(0, pos) + btn.dataset.emoji + val.slice(pos);
        activeEmojiTarget.selectionStart = activeEmojiTarget.selectionEnd = pos + btn.dataset.emoji.length;
        activeEmojiTarget.focus();
        syncSendBtn(activeEmojiTarget, document.getElementById(
          activeEmojiTarget.id === 'dmInput' ? 'dmSendBtn' : 'channelSendBtn'
        ));
      }
      document.getElementById('emojiPicker').classList.add('hidden');
    });
  });
}

document.querySelectorAll('.ep-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ep-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderEmojiCat(tab.dataset.cat);
  });
});

function toggleEmojiPicker(inputEl, btnEl, e) {
  e.stopPropagation();
  const picker = document.getElementById('emojiPicker');
  const wasHidden = picker.classList.contains('hidden');
  document.querySelectorAll('.composer-attach-popup').forEach(p => p.classList.add('hidden'));
  if (wasHidden) {
    activeEmojiTarget = inputEl;
    const rect = btnEl.getBoundingClientRect();
    const appRect = document.querySelector('.app-window').getBoundingClientRect();
    picker.style.bottom = (appRect.bottom - rect.top + 8) + 'px';
    picker.style.left = Math.max(8, rect.left - appRect.left - 140) + 'px';
    picker.classList.remove('hidden');
    renderEmojiCat('smileys');
  } else {
    picker.classList.add('hidden');
    activeEmojiTarget = null;
  }
}

document.getElementById('dmEmojiBtn').addEventListener('click', e =>
  toggleEmojiPicker(document.getElementById('dmInput'), document.getElementById('dmEmojiBtn'), e)
);
document.getElementById('channelEmojiBtn').addEventListener('click', e =>
  toggleEmojiPicker(document.getElementById('channelInput'), document.getElementById('channelEmojiBtn'), e)
);
document.addEventListener('click', e => {
  if (!e.target.closest('#emojiPicker') && !e.target.closest('#dmEmojiBtn') && !e.target.closest('#channelEmojiBtn')) {
    document.getElementById('emojiPicker').classList.add('hidden');
    activeEmojiTarget = null;
  }
});

// ── CALL WIDGET ──
let callTimerInterval = null;
let callSeconds = 0;
let callMuted = false;

function startCall(personKey) {
  const p = peopleData.find(x => x.key === personKey);
  const name = p ? p.name : (dmData[personKey] ? dmData[personKey].name : personKey);
  const initials = p ? p.initials : (dmData[personKey] ? dmData[personKey].initials : '??');
  const color = p ? p.color : (dmData[personKey] ? dmData[personKey].color : '#7c3aed');

  // Populate widget
  const avEl = document.getElementById('cwPersonAv');
  avEl.textContent = initials;
  avEl.style.background = color;
  document.getElementById('cwPersonName').textContent = name;
  document.getElementById('cwPersonStatus').textContent = 'Calling…';
  document.getElementById('cwPersonStatus').style.color = 'rgba(255,255,255,.5)';

  // Set "You" info from logged-in user
  const myName = userEmail ? userEmail.split('@')[0] : 'You';
  const myInitials = myName.slice(0,2).toUpperCase();
  document.getElementById('cwYouAv').textContent = myInitials;
  document.getElementById('cwYouName').textContent = myName.charAt(0).toUpperCase() + myName.slice(1);

  document.getElementById('cwTimer').textContent = '0:00';
  callSeconds = 0;
  callMuted = false;
  document.getElementById('cwMuteBtn').classList.add('cw-muted');

  // Show widget
  document.getElementById('callWidget').classList.remove('hidden');

  // Simulate answer after 2.5s
  clearInterval(callTimerInterval);
  setTimeout(() => {
    const statusEl = document.getElementById('cwPersonStatus');
    if (statusEl) { statusEl.textContent = 'Connected'; statusEl.style.color = '#4ade80'; }
    callTimerInterval = setInterval(() => {
      callSeconds++;
      const m = Math.floor(callSeconds / 60);
      const s = String(callSeconds % 60).padStart(2, '0');
      const el = document.getElementById('cwTimer');
      if (el) el.textContent = `${m}:${s}`;
    }, 1000);
  }, 2500);
}

function endCall() {
  clearInterval(callTimerInterval);
  document.getElementById('callWidget').classList.add('hidden');
  if (typeof hideDialPad === 'function') hideDialPad();
  document.getElementById('cwKeypadBtn').classList.remove('cw-btn-active');
}

document.getElementById('cwEndBtn').addEventListener('click', endCall);

document.getElementById('cwMuteBtn').addEventListener('click', () => {
  callMuted = !callMuted;
  document.getElementById('cwMuteBtn').classList.toggle('cw-muted', !callMuted);
  document.getElementById('cwMuteBtn').classList.toggle('cw-btn-muted-off', callMuted);
});

// Call from DM header (event delegation)
document.getElementById('dmView').addEventListener('click', e => {
  if (e.target.closest('.dm-header-btn[title="Call"]')) startCall(activeDm);
});

// Call from channel header
document.getElementById('channelView').addEventListener('click', e => {
  if (e.target.closest('.dm-header-btn[title="Call"]')) startCall(activeChannel || 'sarah');
});

function createAndShowTask(title, dueDate, status, priority) {
  const newId = 'task' + (taskData.length + 1);
  taskData.push({
    id: newId, title, due: dueDate, status: status || 'To Do', priority: priority || 'Medium',
    assignee: { initials: 'ME', color: '#4c1515', name: 'Me' },
    description: '',
    subtasks: [],
    activity: [{ initials: 'ME', color: '#4c1515', name: 'You', text: 'Created this task', time: 'Just now' }]
  });
  activeTaskId = newId;
  const html = taskItemHTML(title, dueDate, status, newId);

  // Add to home MY TASKS card
  const myTasksCard = document.getElementById('myTasksCard');
  if (myTasksCard) {
    const last = myTasksCard.querySelector('.task-item.no-border');
    if (last) last.classList.remove('no-border');
    myTasksCard.insertAdjacentHTML('beforeend', html);
  }

  // Add to tasks full view list
  const tasksFullList = document.getElementById('tasksFullList');
  if (tasksFullList) {
    const last = tasksFullList.querySelector('.task-item.no-border');
    if (last) last.classList.remove('no-border');
    tasksFullList.insertAdjacentHTML('beforeend', html);
  }

  // Switch nav to Tasks
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const tasksBtn = document.querySelector('.nav-item[data-tab="tasks"]');
  if (tasksBtn) tasksBtn.classList.add('active');
  switchMiddleView('tasks');

  // Remove highlight class after animation completes
  setTimeout(() => {
    document.querySelectorAll('.task-new').forEach(t => t.classList.remove('task-new'));
  }, 2200);
}

// ── MOBILE: push-navigation ──
const isMobile = () => window.innerWidth <= 768;
const appEl = document.querySelector('.app');

function mobOpenHome() {
  if (!isMobile()) return;
  appEl.classList.add('home-open');
}

function mobCloseHome() {
  appEl.classList.remove('home-open');
}

function mobOpenDetail() {
  if (!isMobile()) return;
  appEl.classList.add('detail-open');
  if (!document.getElementById('mobBackBtn')) {
    const btn = document.createElement('button');
    btn.id = 'mobBackBtn';
    btn.className = 'mob-back-btn';
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Back`;
    btn.addEventListener('click', mobCloseDetail);
    document.querySelector('.right-panel').prepend(btn);
  }
}

function mobCloseDetail() {
  appEl.classList.remove('detail-open');
}

// Activities button — show the home list (middle panel)
document.getElementById('mobActivitiesBtn').addEventListener('click', () => {
  mobCloseDetail();
  mobOpenHome();
});

// On mobile: any nav tab tap opens the list (middle panel)
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    if (isMobile()) mobOpenHome();
  }, true);
});

// ── QUICK ACTION BUTTONS ──
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

// ── QUICK ACTION DROPDOWNS ──────────────────────────────────────────────────

function positionDropdown(ddEl, triggerBtn) {
  const appEl = triggerBtn.closest('.app');
  const bRect = triggerBtn.getBoundingClientRect();
  const aRect = appEl.getBoundingClientRect();
  ddEl.style.left = (bRect.left - aRect.left) + 'px';
  ddEl.style.top  = (bRect.bottom - aRect.top + 8) + 'px';
}

function openQuickDd(ddEl, triggerBtn, onOpen) {
  closeAllQuickDds();
  positionDropdown(ddEl, triggerBtn);
  ddEl.classList.remove('hidden');
  if (onOpen) onOpen();
}

function closeAllQuickDds() {
  ['dmDropdown','channelDropdown','scheduleDropdown','taskDropdown','callDropdown'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
}

document.addEventListener('click', e => {
  const dds = ['dmDropdown','channelDropdown','scheduleDropdown','taskDropdown','callDropdown'];
  const btns = ['quickNewDmBtn','quickChannelBtn','scheduleBtn','taskBtn','quickCallBtn'];
  const clickedOutside = dds.every(id => !document.getElementById(id).contains(e.target));
  const clickedTrigger = btns.some(id => document.getElementById(id).contains(e.target));
  if (clickedOutside && !clickedTrigger) closeAllQuickDds();
});

// ── DM DROPDOWN ──
(function() {
  const btn = document.getElementById('quickNewDmBtn');
  const dd  = document.getElementById('dmDropdown');
  const search = document.getElementById('ddmSearch');

  btn.addEventListener('click', e => {
    e.stopPropagation();
    dd.classList.contains('hidden')
      ? openQuickDd(dd, btn, () => { search.value = ''; filterDdm(''); search.focus(); })
      : closeAllQuickDds();
  });

  function filterDdm(q) {
    document.querySelectorAll('.qd-dm-item').forEach(item => {
      item.style.display = item.querySelector('span').textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  }

  search.addEventListener('input', function() { filterDdm(this.value.toLowerCase()); });

  document.querySelectorAll('.qd-dm-item').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      closeAllQuickDds();
      switchMiddleView('dms');
      loadDmConversation(item.dataset.dm);
      if (isMobile()) mobOpenDetail();
    });
  });
})();

// ── CHANNEL DROPDOWN ──
(function() {
  const btn = document.getElementById('quickChannelBtn');
  const dd  = document.getElementById('channelDropdown');
  const nameInput  = document.getElementById('qdChannelName');
  const createBtn  = document.getElementById('qdChannelCreate');
  const publicBtn  = document.getElementById('qdPublicBtn');
  const privateBtn = document.getElementById('qdPrivateBtn');

  btn.addEventListener('click', e => {
    e.stopPropagation();
    dd.classList.contains('hidden')
      ? openQuickDd(dd, btn, () => { nameInput.value = ''; publicBtn.classList.add('active'); privateBtn.classList.remove('active'); nameInput.focus(); })
      : closeAllQuickDds();
  });

  publicBtn.addEventListener('click',  e => { e.stopPropagation(); publicBtn.classList.add('active'); privateBtn.classList.remove('active'); });
  privateBtn.addEventListener('click', e => { e.stopPropagation(); privateBtn.classList.add('active'); publicBtn.classList.remove('active'); });

  createBtn.addEventListener('click', e => {
    e.stopPropagation();
    const name = nameInput.value.trim().replace(/\s+/g, '-').toLowerCase();
    if (!name) return;
    closeAllQuickDds();
    nameInput.value = '';
    if (!channelData[name]) {
      channelData[name] = { name, displayName: name, members: 1, messages: [] };
    }
    loadChannelConversation(name);
    if (isMobile()) mobOpenDetail();
  });
})();

// Keep old modal handlers wired (modal still exists in DOM, just not opened via btn)
document.getElementById('createChannelClose').addEventListener('click', () => closeModal('createChannelModal'));
document.getElementById('createChannelModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal('createChannelModal'); });
document.getElementById('newDmClose').addEventListener('click', () => closeModal('newDmModal'));
document.getElementById('newDmModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal('newDmModal'); });

// ── CALL SCREEN ──
let csTimerInterval = null;

// ── VIDEO CALL — WebRTC ──────────────────────────────────────────────────
let vcStream = null;       // local MediaStream (camera + mic)
let vcPc1 = null;          // local peer  (sends our tracks)
let vcPc2 = null;          // remote peer (receives tracks, simulates far-end)
let vcCameraOn = false;
let vcMuted = false;

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

async function startVideoStream() {
  try {
    vcStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const localEl = document.getElementById('localVideo');
    localEl.srcObject = vcStream;
    document.getElementById('csSelfFallback').classList.add('hidden');
    vcCameraOn = true;

    // Build loopback RTCPeerConnection to demonstrate the remote tile
    vcPc1 = new RTCPeerConnection(RTC_CONFIG);
    vcPc2 = new RTCPeerConnection(RTC_CONFIG);

    // Forward ICE candidates between the two ends
    vcPc1.onicecandidate = e => { if (e.candidate) vcPc2.addIceCandidate(e.candidate).catch(() => {}); };
    vcPc2.onicecandidate = e => { if (e.candidate) vcPc1.addIceCandidate(e.candidate).catch(() => {}); };

    // When remote side gets tracks → display in remote tile & hide overlay
    vcPc2.ontrack = e => {
      const remoteEl = document.getElementById('remoteVideo');
      if (!remoteEl.srcObject) remoteEl.srcObject = e.streams[0];
      document.getElementById('csVideoOverlay').classList.add('connected');
    };

    // Add local tracks to pc1 (the "sending" side)
    vcStream.getTracks().forEach(t => vcPc1.addTrack(t, vcStream));

    // Offer → Answer exchange (all local, no network needed)
    const offer = await vcPc1.createOffer();
    await vcPc1.setLocalDescription(offer);
    await vcPc2.setRemoteDescription(offer);
    const answer = await vcPc2.createAnswer();
    await vcPc2.setLocalDescription(answer);
    await vcPc1.setRemoteDescription(answer);
  } catch (err) {
    console.warn('Camera unavailable:', err.message);
    document.getElementById('csSelfFallback').classList.remove('hidden');
    vcCameraOn = false;
  }
}

function stopVideoStream() {
  if (vcStream) { vcStream.getTracks().forEach(t => t.stop()); vcStream = null; }
  if (vcPc1) { vcPc1.close(); vcPc1 = null; }
  if (vcPc2) { vcPc2.close(); vcPc2 = null; }
  const localEl = document.getElementById('localVideo');
  const remoteEl = document.getElementById('remoteVideo');
  localEl.srcObject = null;
  remoteEl.srcObject = null;
  document.getElementById('csVideoOverlay').classList.remove('connected');
  document.getElementById('csSelfFallback').classList.remove('hidden');
  vcCameraOn = false;
  vcMuted = false;
}
// ────────────────────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map(x => x + x).join('') : c;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ].join(', ');
}

function startCallWith(name, role, color, initials, video = false) {
  // Set dynamic accent colour (gradient + avatar glow)
  const screen = document.getElementById('callScreen');
  try { screen.style.setProperty('--call-rgb', hexToRgb(color)); } catch (_) {}

  const av = document.getElementById('csAvatar');
  av.textContent = initials;
  av.style.background = color;
  document.getElementById('csName').textContent = name;
  document.getElementById('csStatus').textContent = 'Ringing…';
  document.getElementById('csStatus').classList.remove('hidden');
  document.getElementById('csTimer').classList.add('hidden');
  clearInterval(csTimerInterval);
  let secs = 0;
  setTimeout(() => {
    document.getElementById('csStatus').classList.add('hidden');
    const timerEl = document.getElementById('csTimer');
    timerEl.textContent = '00:00';
    timerEl.classList.remove('hidden');
    csTimerInterval = setInterval(() => {
      secs++;
      timerEl.textContent =
        String(Math.floor(secs / 60)).padStart(2, '0') + ':' +
        String(secs % 60).padStart(2, '0');
    }, 1000);
  }, 2000);
  screen.classList.remove('hidden');
  setVideoMode(video, color, initials, name);
}

function setVideoMode(on, color, initials, name) {
  const screen = document.getElementById('callScreen');
  const grid   = document.getElementById('csVideoGrid');
  const camIcon = document.getElementById('csCameraBtn').querySelector('.cs-btn-icon');

  screen.classList.toggle('video-mode', on);
  grid.classList.toggle('hidden', !on);
  camIcon.classList.toggle('cs-btn-icon-blue', on);

  if (on) {
    // Populate avatar overlay (shown while WebRTC connects)
    if (color) {
      const va = document.getElementById('csVideoAvatar');
      va.textContent = initials || '';
      va.style.background = color;
      document.getElementById('csVideoName').textContent = name || '';
    }
    startVideoStream();
  } else {
    stopVideoStream();
  }
}

// Stored state so expand can restore the full-screen call
let csCallState = null;
let cmMuted = false;

function _hideCallScreen() {
  const screen = document.getElementById('callScreen');
  screen.classList.add('hidden');
  screen.classList.remove('video-mode');
  document.getElementById('csVideoGrid').classList.add('hidden');
  document.getElementById('csCameraBtn').querySelector('.cs-btn-icon').classList.remove('cs-btn-icon-blue');
  document.getElementById('csMuteBtn').querySelector('.cs-btn-icon').classList.remove('cs-btn-icon-white');
  document.getElementById('csSpeakerBtn').querySelector('.cs-btn-icon').classList.remove('cs-btn-icon-white');
}

function endCallScreen() {
  clearInterval(csTimerInterval);
  stopVideoStream();
  csCallState = null;
  _hideCallScreen();
  document.getElementById('callMini').classList.add('hidden');
  if (typeof hideDialPad === 'function') hideDialPad();
}

function minimizeCallScreen() {
  clearInterval(csTimerInterval);
  stopVideoStream();

  // Snapshot call state
  const avEl = document.getElementById('csAvatar');
  const timerText = document.getElementById('csTimer').textContent || '00:00';
  const [mm, ss] = timerText.split(':').map(Number);
  callSeconds = (mm || 0) * 60 + (ss || 0);
  csCallState = {
    name:     document.getElementById('csName').textContent,
    initials: avEl.textContent,
    color:    avEl.style.background,
  };

  _hideCallScreen();

  // Populate mini card
  const cmAv = document.getElementById('cmAvatar');
  cmAv.textContent = csCallState.initials;
  cmAv.style.background = csCallState.color;
  document.getElementById('cmName').textContent = csCallState.name;
  cmMuted = false;
  document.getElementById('cmMuteBtn').classList.remove('muted');

  // Sync timer and keep ticking
  const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  document.getElementById('cmTimer').textContent = fmt(callSeconds);
  clearInterval(callTimerInterval);
  callTimerInterval = setInterval(() => {
    callSeconds++;
    const el = document.getElementById('cmTimer');
    if (el) el.textContent = fmt(callSeconds);
  }, 1000);

  document.getElementById('callMini').classList.remove('hidden');
}

function expandMiniCall() {
  if (!csCallState) return;
  clearInterval(callTimerInterval);
  document.getElementById('callMini').classList.add('hidden');

  // Restore full-screen call at the current elapsed time
  const avEl = document.getElementById('csAvatar');
  avEl.textContent = csCallState.initials;
  avEl.style.background = csCallState.color;
  document.getElementById('csName').textContent = csCallState.name;
  document.getElementById('csStatus').classList.add('hidden');

  const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  const timerEl = document.getElementById('csTimer');
  timerEl.textContent = fmt(callSeconds);
  timerEl.classList.remove('hidden');
  document.getElementById('callScreen').classList.remove('hidden');

  clearInterval(csTimerInterval);
  let secs = callSeconds;
  csTimerInterval = setInterval(() => {
    secs++;
    timerEl.textContent = fmt(secs);
  }, 1000);
}

// Mini card buttons
document.getElementById('cmExpand').addEventListener('click', expandMiniCall);
document.getElementById('cmEndBtn').addEventListener('click', () => {
  clearInterval(callTimerInterval);
  csCallState = null;
  document.getElementById('callMini').classList.add('hidden');
  if (typeof hideDialPad === 'function') hideDialPad();
});
document.getElementById('cmMuteBtn').addEventListener('click', function() {
  cmMuted = !cmMuted;
  this.classList.toggle('muted', cmMuted);
});
document.getElementById('cmVideoBtn').addEventListener('click', () => {
  if (!csCallState) return;
  expandMiniCall();
  setTimeout(() => setVideoMode(true, csCallState.color, csCallState.initials, csCallState.name), 50);
});

// Mini card drag
(function() {
  const mini = document.getElementById('callMini');
  const handle = document.getElementById('cmHandle');
  let dragging = false, ox = 0, oy = 0;
  handle.addEventListener('mousedown', e => {
    dragging = true;
    const r = mini.getBoundingClientRect();
    ox = e.clientX - r.left; oy = e.clientY - r.top;
    mini.style.bottom = ''; mini.style.right = '';
    mini.style.left = r.left + 'px'; mini.style.top = r.top + 'px';
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const cr = (mini.closest('.app') || document.body).getBoundingClientRect();
    const pr = mini.getBoundingClientRect();
    mini.style.left = Math.max(0, Math.min(e.clientX - cr.left - ox, cr.width  - pr.width))  + 'px';
    mini.style.top  = Math.max(0, Math.min(e.clientY - cr.top  - oy, cr.height - pr.height)) + 'px';
  });
  document.addEventListener('mouseup', () => { dragging = false; });
})();

document.getElementById('csHangup').addEventListener('click', endCallScreen);
document.getElementById('csMinimize').addEventListener('click', minimizeCallScreen);
document.getElementById('cwExpandBtn').addEventListener('click', expandMiniCall);

// Camera toggle — enable/disable video track on the fly
document.getElementById('csCameraBtn').addEventListener('click', function() {
  const screen = document.getElementById('callScreen');
  const isVideo = screen.classList.contains('video-mode');

  if (!isVideo) {
    // Switch to video mode mid-call
    const av = document.getElementById('csAvatar');
    setVideoMode(true, av.style.background, av.textContent, document.getElementById('csName').textContent);
    return;
  }

  // Toggle camera track enabled state
  if (vcStream) {
    const vTrack = vcStream.getVideoTracks()[0];
    if (vTrack) {
      vTrack.enabled = !vTrack.enabled;
      vcCameraOn = vTrack.enabled;
      const fallback = document.getElementById('csSelfFallback');
      fallback.classList.toggle('hidden', vcCameraOn);
      this.querySelector('.cs-btn-icon').classList.toggle('cs-btn-icon-blue', vcCameraOn);
    }
  }
});

// Mute — disable audio track
document.getElementById('csMuteBtn').addEventListener('click', function() {
  vcMuted = !vcMuted;
  if (vcStream) {
    vcStream.getAudioTracks().forEach(t => { t.enabled = !vcMuted; });
  }
  this.querySelector('.cs-btn-icon').classList.toggle('cs-btn-icon-white', vcMuted);
});

// Speaker button — visual toggle only (actual output device API requires Electron permissions)
document.getElementById('csSpeakerBtn').addEventListener('click', function() {
  this.querySelector('.cs-btn-icon').classList.toggle('cs-btn-icon-white');
});

// ── FLOATING DIALPAD ──
(function() {
  const pad = document.getElementById('dialPad');
  const display = document.getElementById('dpDisplay');
  const handle = document.getElementById('dpHandle');
  let digits = '';

  // Show / hide
  function showDialPad() {
    digits = '';
    display.textContent = '';
    pad.classList.remove('hidden');
    // Default bottom-left inside .app; reset to default position
    if (!pad.style.left && !pad.style.bottom) {
      pad.style.left = '24px';
      pad.style.bottom = '100px';
      pad.style.top = '';
      pad.style.right = '';
    }
  }
  function hideDialPad() {
    pad.classList.add('hidden');
    digits = '';
    display.textContent = '';
  }
  window.showDialPad = showDialPad;
  window.hideDialPad = hideDialPad;

  // Digit buttons
  pad.querySelectorAll('.dp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      digits += btn.dataset.digit;
      display.textContent = digits;
    });
  });

  // Backspace
  document.getElementById('dpBackspace').addEventListener('click', () => {
    digits = digits.slice(0, -1);
    display.textContent = digits;
  });

  // Close button
  document.getElementById('dpClose').addEventListener('click', hideDialPad);

  // ── Drag to move ──
  let dragging = false, ox = 0, oy = 0;

  handle.addEventListener('mousedown', e => {
    dragging = true;
    const rect = pad.getBoundingClientRect();
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
    pad.style.bottom = '';
    pad.style.right = '';
    pad.style.left = rect.left + 'px';
    pad.style.top = rect.top + 'px';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const container = pad.closest('.app') || document.body;
    const cr = container.getBoundingClientRect();
    const pr = pad.getBoundingClientRect();
    let x = e.clientX - cr.left - ox;
    let y = e.clientY - cr.top - oy;
    // Clamp within container
    x = Math.max(0, Math.min(x, cr.width - pr.width));
    y = Math.max(0, Math.min(y, cr.height - pr.height));
    pad.style.left = x + 'px';
    pad.style.top = y + 'px';
  });

  document.addEventListener('mouseup', () => { dragging = false; });

  // Touch drag support
  handle.addEventListener('touchstart', e => {
    dragging = true;
    const t = e.touches[0];
    const rect = pad.getBoundingClientRect();
    ox = t.clientX - rect.left;
    oy = t.clientY - rect.top;
    pad.style.bottom = '';
    pad.style.right = '';
    pad.style.left = rect.left + 'px';
    pad.style.top = rect.top + 'px';
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    const t = e.touches[0];
    const container = pad.closest('.app') || document.body;
    const cr = container.getBoundingClientRect();
    const pr = pad.getBoundingClientRect();
    let x = t.clientX - cr.left - ox;
    let y = t.clientY - cr.top - oy;
    x = Math.max(0, Math.min(x, cr.width - pr.width));
    y = Math.max(0, Math.min(y, cr.height - pr.height));
    pad.style.left = x + 'px';
    pad.style.top = y + 'px';
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchend', () => { dragging = false; });
})();

// Keypad button on call widget
document.getElementById('cwKeypadBtn').addEventListener('click', function() {
  const pad = document.getElementById('dialPad');
  if (pad.classList.contains('hidden')) {
    showDialPad();
    this.classList.add('cw-btn-active');
  } else {
    hideDialPad();
    this.classList.remove('cw-btn-active');
  }
});

// ── CALL PEOPLE PICKER (redesigned) ──
const cpmSelected = new Set();

function cpmRefreshChips() {
  const chips = document.getElementById('cpmChips');
  chips.innerHTML = '';
  if (cpmSelected.size === 0) { chips.classList.add('hidden'); return; }
  chips.classList.remove('hidden');
  cpmSelected.forEach(key => {
    const p = document.querySelector(`.cpm-person[data-key="${key}"]`);
    if (!p) return;
    const chip = document.createElement('div');
    chip.className = 'cpm-chip';
    chip.innerHTML = `<div class="cpm-chip-av" style="background:${p.dataset.color}">${p.dataset.initials}<div class="cpm-chip-x"><svg viewBox="0 0 8 8" fill="none"><path d="M1 1L7 7M7 1L1 7" stroke="white" stroke-width="1.4" stroke-linecap="round"/></svg></div></div><span>${p.dataset.name.split(' ')[0]}</span>`;
    chip.addEventListener('click', () => { cpmSelected.delete(key); cpmRefresh(); });
    chips.appendChild(chip);
  });
}

function cpmRefresh() {
  cpmRefreshChips();
  document.querySelectorAll('.cpm-person').forEach(p => {
    const sel = cpmSelected.has(p.dataset.key);
    p.classList.toggle('cpm-selected', sel);
    p.querySelector('.cpm-check').classList.toggle('hidden', !sel);
  });
  document.getElementById('cpmVoiceBtn').disabled = cpmSelected.size === 0;
  document.getElementById('cpmVideoBtn').disabled = cpmSelected.size === 0;
}

function openCallPicker() {
  cpmSelected.clear();
  cpmRefresh();
  document.getElementById('callPeopleSearch').value = '';
  document.querySelectorAll('.cpm-person').forEach(p => p.style.display = '');
  openModal('callPeopleModal');
}

document.getElementById('callPeopleClose').addEventListener('click', () => closeModal('callPeopleModal'));
document.getElementById('callPeopleModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal('callPeopleModal');
});
document.getElementById('callPeopleSearch').addEventListener('input', function() {
  const q = this.value.toLowerCase();
  document.querySelectorAll('.cpm-person').forEach(p => {
    p.style.display = p.dataset.name.toLowerCase().includes(q) ? '' : 'none';
  });
});
document.querySelectorAll('.cpm-person').forEach(p => {
  p.addEventListener('click', () => {
    const key = p.dataset.key;
    if (cpmSelected.has(key)) cpmSelected.delete(key);
    else cpmSelected.add(key);
    cpmRefresh();
  });
});
document.getElementById('cpmVoiceBtn').addEventListener('click', () => {
  if (cpmSelected.size === 0) return;
  const first = document.querySelector(`.cpm-person[data-key="${[...cpmSelected][0]}"]`);
  closeModal('callPeopleModal');
  startCallWith(first.dataset.name, first.dataset.role, first.dataset.color, first.dataset.initials, false);
});

document.getElementById('cpmVideoBtn').addEventListener('click', () => {
  if (cpmSelected.size === 0) return;
  const first = document.querySelector(`.cpm-person[data-key="${[...cpmSelected][0]}"]`);
  closeModal('callPeopleModal');
  startCallWith(first.dataset.name, first.dataset.role, first.dataset.color, first.dataset.initials, true);
});

// ── CALL DROPDOWN ──
(function() {
  const btn = document.getElementById('quickCallBtn');
  const dd  = document.getElementById('callDropdown');
  const search = document.getElementById('cdSearch');

  function openDropdown() {
    closeAllQuickDds();
    search.value = '';
    document.querySelectorAll('.cd-item').forEach(el => el.style.display = '');
    positionDropdown(dd, btn);
    dd.classList.remove('hidden');
    search.focus();
  }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    dd.classList.contains('hidden') ? openDropdown() : closeAllQuickDds();
  });

  // Search filter
  search.addEventListener('input', function() {
    const q = this.value.toLowerCase();
    document.querySelectorAll('.cd-item').forEach(el => {
      el.style.display = el.dataset.name.toLowerCase().includes(q) ? '' : 'none';
    });
  });

  // Per-person call buttons
  dd.querySelectorAll('.cd-item').forEach(item => {
    item.querySelector('.cd-voice').addEventListener('click', e => {
      e.stopPropagation();
      closeDropdown();
      startCallWith(item.dataset.name, item.dataset.role, item.dataset.color, item.dataset.initials, false);
    });
    item.querySelector('.cd-video').addEventListener('click', e => {
      e.stopPropagation();
      closeDropdown();
      startCallWith(item.dataset.name, item.dataset.role, item.dataset.color, item.dataset.initials, true);
    });
  });
})();

document.getElementById('scDurRow').addEventListener('click', e => {
  const btn = e.target.closest('.sd-dur-btn');
  if (!btn) return;
  document.querySelectorAll('#scDurRow .sd-dur-btn').forEach(b => b.classList.remove('sd-dur-active'));
  btn.classList.add('sd-dur-active');
});
document.getElementById('scClose').addEventListener('click', () => closeModal('scheduleCallModal'));
document.getElementById('scheduleCallModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal('scheduleCallModal');
});
document.getElementById('scSubmit').addEventListener('click', () => {
  const title = document.getElementById('scTitle').value.trim();
  if (!title) return;
  const date = document.getElementById('scDate').value;
  const time = document.getElementById('scTime').value;
  const dur  = document.querySelector('#scDurRow .sd-dur-btn.sd-dur-active')?.dataset.min || '30';
  const withName = getSelectedPeopleNames('scPeopleRow');
  const durLabel = dur === '60' ? '1 hour' : `${dur} minutes`;
  closeModal('scheduleCallModal');

  if (window._sdEditMode && window._currentSchedule) {
    const old = window._currentSchedule;
    window._sdEditMode = false;
    const list = document.getElementById('upcomingList');
    const domItem = list.querySelector(`[data-schedule-title="${old.title}"]`);
    const updated = { title, date, time, duration: durLabel, withName };
    if (domItem) {
      domItem.dataset.scheduleTitle = title;
      domItem.querySelector('.upcoming-name').textContent = title;
      domItem.querySelector('.upcoming-meta').textContent = `${date} · ${time} · ${durLabel}${withName ? ' · with ' + withName : ''}`;
      domItem.onclick = null;
      domItem.addEventListener('click', () => showScheduleDetail(updated));
    }
    showScheduleDetail(updated);
    return;
  }

  const upcomingList = document.getElementById('upcomingList');
  const upcomingSection = document.getElementById('upcomingSection');
  if (upcomingList && upcomingSection) {
    upcomingSection.classList.remove('hidden');
    const item = document.createElement('div');
    item.className = 'upcoming-item';
    item.style.cursor = 'pointer';
    item.dataset.scheduleTitle = title;
    const scheduleObj = { title, date, time, duration: durLabel, withName };
    item.innerHTML = `<div class="upcoming-icon">📞</div><div class="upcoming-body"><span class="upcoming-name">${title}</span><span class="upcoming-meta">${date} · ${time} · ${durLabel}${withName ? ' · with ' + withName : ''}</span></div><span class="upcoming-badge">Scheduled</span>`;
    item.addEventListener('click', () => showScheduleDetail(scheduleObj));
    upcomingList.prepend(item);
  }
});

// ── SCHEDULE DROPDOWN ──
(function() {
  const btn     = document.getElementById('scheduleBtn');
  const dd      = document.getElementById('scheduleDropdown');
  const titleIn = document.getElementById('qdScTitle');
  const scheduleBtn = document.getElementById('qdScSchedule');

  btn.addEventListener('click', e => {
    e.stopPropagation();
    dd.classList.contains('hidden')
      ? openQuickDd(dd, btn, () => {
          titleIn.value = '';
          const today = new Date().toISOString().split('T')[0];
          document.getElementById('qdScDate').value = today;
          document.getElementById('qdScTime').value = '10:00';
          document.querySelectorAll('#qdDurRow .sd-dur-btn').forEach((b, i) => b.classList.toggle('sd-dur-active', i === 1));
          renderSchedulePeople('qdPeopleRow', null);
          titleIn.focus();
        })
      : closeAllQuickDds();
  });

  document.getElementById('qdDurRow').addEventListener('click', e => {
    const btn = e.target.closest('.sd-dur-btn');
    if (!btn) return;
    e.stopPropagation();
    document.querySelectorAll('#qdDurRow .sd-dur-btn').forEach(b => b.classList.remove('sd-dur-active'));
    btn.classList.add('sd-dur-active');
  });

  scheduleBtn.addEventListener('click', e => {
    e.stopPropagation();
    const title = titleIn.value.trim();
    if (!title) return;
    const date = document.getElementById('qdScDate').value;
    const time = document.getElementById('qdScTime').value;
    const dur  = document.querySelector('#qdDurRow .sd-dur-btn.sd-dur-active')?.dataset.min || '30';
    const withName = getSelectedPeopleNames('qdPeopleRow');
    const durLabel = dur === '60' ? '1 hour' : `${dur} minutes`;
    closeAllQuickDds();
    titleIn.value = '';
    const upcomingList = document.getElementById('upcomingList');
    const upcomingSection = document.getElementById('upcomingSection');
    if (upcomingList && upcomingSection) {
      upcomingSection.classList.remove('hidden');
      const item = document.createElement('div');
      item.className = 'upcoming-item';
      item.style.cursor = 'pointer';
      item.dataset.scheduleTitle = title;
      const scheduleObj = { title, date, time, duration: durLabel, withName };
      item.innerHTML = `<div class="upcoming-icon">📅</div><div class="upcoming-body"><span class="upcoming-name">${title}</span><span class="upcoming-meta">${date} · ${time} · ${durLabel}${withName ? ' · with ' + withName : ''}</span></div><span class="upcoming-badge">Scheduled</span>`;
      item.addEventListener('click', () => showScheduleDetail(scheduleObj));
      upcomingList.appendChild(item);
    }
  });
})();

// ── TASK DROPDOWN ──
(function() {
  const btn       = document.getElementById('taskBtn');
  const dd        = document.getElementById('taskDropdown');
  const titleIn   = document.getElementById('qdTaskTitle');
  const createBtn = document.getElementById('qdTaskCreate');

  btn.addEventListener('click', e => {
    e.stopPropagation();
    dd.classList.contains('hidden')
      ? openQuickDd(dd, btn, () => {
          titleIn.value = '';
          document.getElementById('qdTaskDue').value = '';
          document.querySelectorAll('#qdPriRow .qd-pill').forEach((p, i) => p.classList.toggle('qd-pill-active', i === 1));
          titleIn.focus();
        })
      : closeAllQuickDds();
  });

  document.getElementById('qdPriRow').addEventListener('click', e => {
    const pill = e.target.closest('.qd-pill');
    if (!pill) return;
    e.stopPropagation();
    document.querySelectorAll('#qdPriRow .qd-pill').forEach(p => p.classList.remove('qd-pill-active'));
    pill.classList.add('qd-pill-active');
  });

  createBtn.addEventListener('click', e => {
    e.stopPropagation();
    const title = titleIn.value.trim();
    if (!title) return;
    const due = document.getElementById('qdTaskDue').value;
    const pri = document.querySelector('#qdPriRow .qd-pill-active')?.dataset.pri || 'medium';
    const priLabel = pri === 'high' ? 'High' : pri === 'low' ? 'Low' : 'Medium';
    closeAllQuickDds();
    titleIn.value = '';
    createAndShowTask(title, due || 'No due date', 'To Do', priLabel);
  });
})();
