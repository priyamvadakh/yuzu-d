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
document.getElementById('obSkipBtn').addEventListener('click', showHome);

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

let _emptyStateOn = false;

// ── MIDDLE PANEL NAV ──
function switchMiddleView(tab) {
  ['homeContent','homeEmpty','tasksFullView','dmContent','peopleContent','aigroupContent','meetingsContent'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  if (tab === 'tasks') {
    document.getElementById('tasksFullView').classList.remove('hidden');
    const hasTasks = document.querySelectorAll('#tasksFullList .task-item').length > 0;
    document.getElementById('tasksEmptyState').classList.toggle('hidden', hasTasks);
  }
  else if (tab === 'dms')      document.getElementById('dmContent').classList.remove('hidden');
  else if (tab === 'people')   document.getElementById('peopleContent').classList.remove('hidden');
  else if (tab === 'aigroup')  document.getElementById('aigroupContent').classList.remove('hidden');
  else if (tab === 'meetings') { document.getElementById('meetingsContent').classList.remove('hidden'); renderMeetings(); }
  else {
    if (_emptyStateOn) document.getElementById('homeEmpty').classList.remove('hidden');
    else               document.getElementById('homeContent').classList.remove('hidden');
  }

  // Right panel
  if (tab === 'dms') {
    renderDmList();
    showPanel('dmView');
    loadDmConversation(activeDm);
  } else if (tab === 'tasks') {
    loadTaskDetail(activeTaskId);
  } else if (tab === 'people') {
    renderPeopleList();
    showContactDetail(activePersonKey || peopleData[0].key);
  } else if (tab === 'aigroup') {
    const activeRoom = document.querySelector('.aigroup-room.active') || document.querySelector('.aigroup-room');
    const roomName = activeRoom?.querySelector('.aigroup-room-name')?.textContent;
    const roomMeta = activeRoom?.querySelector('.aigroup-room-meta')?.textContent || '';
    if (roomName) document.getElementById('aigroupChatTitle').textContent = roomName;
    const membersEl = document.getElementById('aigroupChatMembers');
    if (membersEl && roomMeta) membersEl.textContent = roomMeta.split('·')[0].trim();
    showPanel('aigroupChat');
  } else if (tab === 'meetings') {
    showPanel('meetingsCal');
    renderMeetings();
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
  'group-design': {
    name: 'Design Team',
    isGroup: true,
    members: [
      { key: 'sarah',   name: 'Sarah Jenkins', color: '#7c3aed', initials: 'SJ' },
      { key: 'alex',    name: 'Alex Kim',       color: '#059669', initials: 'AK' },
      { key: 'jessica', name: 'Jessica Park',   color: '#d97706', initials: 'JP' },
    ],
    color: '#7c3aed', initials: 'DT', online: true, unread: 2,
    messages: [
      { from: 'sarah',   senderName: 'Sarah Jenkins', senderColor: '#7c3aed', senderInitials: 'SJ', text: 'Hey team! Just uploaded the updated design system v2 🎨', time: '10:30 AM' },
      { from: 'alex',    senderName: 'Alex Kim',       senderColor: '#059669', senderInitials: 'AK', text: 'Looks great! The new component library is exactly what we needed', time: '10:32 AM' },
      { from: 'me',      text: 'Amazing work Sarah. Alex — can you review the button states before we ship?', time: '10:35 AM' },
      { from: 'jessica', senderName: 'Jessica Park',   senderColor: '#d97706', senderInitials: 'JP', text: 'The color tokens are perfect for the campaign launch 🙌', time: '10:38 AM' },
      { from: 'sarah',   senderName: 'Sarah Jenkins', senderColor: '#7c3aed', senderInitials: 'SJ', text: "Will schedule a walkthrough call for Thursday — I'll share the invite 📅", time: '10:45 AM' },
      { from: 'alex',    senderName: 'Alex Kim',       senderColor: '#059669', senderInitials: 'AK', text: 'Thursday works! Button review done btw — looks solid ✅', time: '10:47 AM' },
    ]
  },
  sarah: {
    name: 'Sarah Jenkins', color: '#7c3aed', initials: 'SJ', online: true, unread: 2,
    messages: [
      { from: 'them', text: 'Hey! Just shared the brand assets folder with you 📁', time: '11:32 AM' },
      { from: 'them', text: 'Let me know what you think of the new color palette', time: '11:33 AM' },
      { from: 'me',   text: 'Just saw them — looks great! The typography is clean 🔥', time: '11:45 AM' },
      { from: 'me',   text: 'Can we discuss the amber accent? Think we can go a bit darker', time: '11:46 AM' },
      { from: 'them', type: 'call', callType: 'missed', video: false, time: '11:58 AM' },
      { from: 'them', type: 'voice', dur: '0:18', bars: [3,5,8,6,9,7,4,8,6,10,7,5,9,6,4,7,5,8,6,3], translation: "Totally agree on the amber. I can darken it a shade or two. Are you free for a quick call at 3pm today to go over the final palette together?", time: '12:01 PM' },
      { from: 'them', type: 'call', callType: 'inbound', video: false, dur: '2:34', time: '12:03 PM' },
      { from: 'me',   text: 'That was helpful, thanks! See you at 3pm 👍', time: '12:05 PM' },
    ]
  },
  david: {
    name: 'David Chen', color: '#2563eb', initials: 'DC', online: false,
    messages: [
      { from: 'them', text: 'Sent the Q3 report document over 📎', time: '2h ago' },
      { from: 'me',   text: 'Got it, will review by EOD', time: '2h ago' },
      { from: 'them', type: 'voice', dur: '0:24', bars: [5,9,6,10,4,8,7,5,9,6,8,10,5,7,4,9,6,8,5,7], translation: "Hey, no rush on the report. I just wanted to flag that slide 14 has some placeholder numbers — make sure to replace those before you share it with the team. Let me know if you have questions.", time: '1h ago' },
      { from: 'me',   text: 'Thanks for the heads-up, will fix slide 14 🙏', time: '55m ago' },
      { from: 'me',   type: 'call', callType: 'outbound', video: false, dur: '5:12', time: '45m ago' },
    ]
  },
  alex: {
    name: 'Alex Kim', color: '#059669', initials: 'AK', online: true,
    messages: [
      { from: 'them', text: 'The new brand looks 🔥', time: 'Yesterday' },
      { from: 'me',   text: 'Thanks! Still a work in progress', time: 'Yesterday' },
      { from: 'them', text: 'What stack are you using for the desktop app?', time: 'Yesterday' },
      { from: 'me',   type: 'voice', dur: '0:11', bars: [4,7,5,9,6,8,5,7,4,6,8,5,7,4,9,6,5,8,4,6], translation: "Electron with vanilla JS, no frameworks. Just keeping it lean and fast.", time: 'Yesterday' },
      { from: 'me',   type: 'call', callType: 'outbound', video: true, dur: '12:05', time: 'Yesterday' },
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

let _dmSort = 'newest';
let _dmFilterMode = 'all';

function renderDmList() {
  const search = (document.getElementById('dmSearch')?.value || '').toLowerCase().trim();
  const qf = document.querySelector('.dm-qf-pill.active')?.dataset.qf || 'all';
  const list = document.getElementById('dmList');
  if (!list) return;

  let keys = Object.keys(dmData);
  const today = new Date().toDateString();

  // Quick filter OR filter mode (whichever is active)
  const activeMode = _dmFilterMode !== 'all' ? _dmFilterMode : qf;

  if (activeMode === 'unread') keys = keys.filter(k => dmData[k].unread > 0);
  else if (activeMode === 'online') keys = keys.filter(k => dmData[k].online);
  else if (activeMode === 'voice') keys = keys.filter(k => dmData[k].messages.some(m => m.type === 'voice'));
  else if (activeMode === 'recent') keys = keys.filter(k => {
    const last = dmData[k].messages[dmData[k].messages.length - 1];
    return last?.time && !['Yesterday', '2h ago', '1h ago'].includes(last.time);
  });

  // Search scoped by filter mode
  if (search) {
    if (_dmFilterMode === 'name') keys = keys.filter(k => dmData[k].name.toLowerCase().includes(search));
    else if (_dmFilterMode === 'message') keys = keys.filter(k => {
      const last = dmData[k].messages[dmData[k].messages.length - 1];
      return (last?.text || '').toLowerCase().includes(search);
    });
    else keys = keys.filter(k => {
      const dm = dmData[k];
      const last = dm.messages[dm.messages.length - 1];
      return dm.name.toLowerCase().includes(search) || (last?.text || '').toLowerCase().includes(search);
    });
  }

  if (_dmSort === 'az') keys.sort((a, b) => dmData[a].name.localeCompare(dmData[b].name));
  else if (_dmSort === 'oldest') keys = keys.reverse();

  const dmEmpty = document.getElementById('dmEmptyState');
  if (!keys.length) {
    if (Object.keys(dmData).length === 0) {
      list.innerHTML = '';
      dmEmpty?.classList.remove('hidden');
    } else {
      list.innerHTML = '<div class="dm-empty">No conversations found</div>';
      dmEmpty?.classList.add('hidden');
    }
    return;
  }
  dmEmpty?.classList.add('hidden');

  list.innerHTML = keys.map(k => {
    const dm = dmData[k];
    const last = dm.messages[dm.messages.length - 1];
    let preview = '', previewClass = '';
    if (last) {
      if (last.type === 'voice') { preview = '🎙 Voice message'; }
      else if (last.type === 'call') {
        if (last.callType === 'missed') { preview = '📞 Missed call'; previewClass = 'missed'; }
        else if (last.video) { preview = `📹 Video call${last.dur ? ' · ' + last.dur : ''}`; }
        else { preview = `📞 ${last.callType === 'inbound' ? 'Incoming' : 'Outgoing'} call${last.dur ? ' · ' + last.dur : ''}`; }
      } else {
        const senderPrefix = dm.isGroup && last.from !== 'me' && last.senderName
          ? last.senderName.split(' ')[0] + ': ' : '';
        preview = senderPrefix + (last.text || '');
      }
    }

    let avatarHTML;
    if (dm.isGroup) {
      const [m1, m2] = dm.members;
      avatarHTML = `<div class="dm-avatar-wrap"><div class="dm-group-av">
        <div class="dm-ga-circle" style="background:${m1.color}">${m1.initials.charAt(0)}</div>
        <div class="dm-ga-circle" style="background:${m2.color}">${m2.initials.charAt(0)}</div>
      </div></div>`;
    } else {
      avatarHTML = `<div class="dm-avatar-wrap">
        <div class="dm-letter-avatar" style="background:${dm.color}">${dm.initials.charAt(0)}</div>
        ${dm.online ? '<div class="online-dot"></div>' : ''}
      </div>`;
    }

    return `<div class="dm-item${k === activeDm ? ' selected' : ''}" data-dm="${k}">
      ${avatarHTML}
      <div class="dm-body">
        <div class="dm-row"><span class="dm-name">${dm.name}</span><span class="dm-time">${last?.time || ''}</span></div>
        <span class="dm-preview${previewClass ? ' ' + previewClass : ''}">${preview}</span>
      </div>
      ${dm.unread ? `<div class="unread-badge">${dm.unread}</div>` : ''}
    </div>`;
  }).join('');
}

function setDmFilterMode(mode, label) {
  _dmFilterMode = mode;
  const searchModeEl = document.getElementById('dmSearchMode');
  const activeFilterEl = document.getElementById('dmActiveFilter');
  const activeLabelEl = document.getElementById('dmActiveFilterLabel');
  const needsSearch = ['name', 'message'].includes(mode);
  const placeholderMap = { name: 'Search by name…', message: 'Search by message…' };

  if (mode === 'all') {
    searchModeEl?.classList.add('hidden');
    activeFilterEl?.classList.add('hidden');
    document.getElementById('dmSearch').placeholder = 'Search conversations…';
  } else {
    if (needsSearch) {
      searchModeEl.textContent = label;
      searchModeEl.classList.remove('hidden');
      document.getElementById('dmSearch').placeholder = placeholderMap[mode];
      document.getElementById('dmSearch').focus();
      activeFilterEl?.classList.add('hidden');
    } else {
      searchModeEl?.classList.add('hidden');
      activeLabelEl.textContent = `Filtered: ${label}`;
      activeFilterEl.classList.remove('hidden');
    }
  }

  // Sync filter button active state
  document.getElementById('dmFilterBtn')?.classList.toggle('active', mode !== 'all');
  // Reset quick filter pills if a direct filter is active
  if (['unread','online','voice','recent'].includes(mode)) {
    document.querySelectorAll('.dm-qf-pill').forEach(p => p.classList.toggle('active', p.dataset.qf === mode));
  }
  renderDmList();
}

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

function makeCallBubble(msg) {
  const isMe = msg.from === 'me';
  const isMissed = msg.callType === 'missed';
  const isVideo = msg.video;

  const label = isMissed ? 'Missed call'
    : isVideo ? (isMe ? 'Outgoing video call' : 'Incoming video call')
    : (isMe ? 'Outgoing call' : 'Incoming call');

  // Standard 24×24 phone / video icons
  const phoneIcon = isVideo
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="7" width="13" height="10" rx="2"/>
        <path d="M22 8.5l-5 3.5 5 3.5V8.5z"/>
      </svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.8 19.8 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/>
      </svg>`;

  // Small directional arrow badge (12×12)
  const arrowColor = isMissed ? '#ef4444' : '#b07d1a';
  const arrowIcon = isMe
    ? `<svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <path d="M2 9L9 2" stroke="${arrowColor}" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M3 2h6v6" stroke="${arrowColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    : `<svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <path d="M9 2L2 9" stroke="${arrowColor}" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M8 9H2V3" stroke="${arrowColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

  const iconColor = isMissed ? '#ef4444' : '#b07d1a';
  const cardClass = isMissed ? 'missed' : isMe ? 'outbound' : 'inbound';

  return `<div class="dm-call-event">
    <div class="dce-inner ${cardClass}">
      <div class="dce-icon-wrap" style="color:${iconColor}">
        ${phoneIcon}
        <div class="dce-arrow">${arrowIcon}</div>
      </div>
      <div class="dce-body">
        <span class="dce-label${isMissed ? ' missed' : ''}">${label}</span>
        ${msg.dur ? `<span class="dce-dur">${msg.dur}</span>` : ''}
      </div>
      <div class="dce-right">
        <span class="dce-time">${msg.time}</span>
        <button class="dce-cb-btn">Call back</button>
      </div>
    </div>
  </div>`;
}

function makeBubble(msg, dm, showAvatar) {
  const isMe = msg.from === 'me';
  const timeHTML = `<div class="dm-bubble-time">${msg.time}${isMe ? ' <span class="dm-tick">✓✓</span>' : ''}</div>`;

  // For group DMs, use per-message sender info; fall back to dm-level for 1:1
  const senderColor    = msg.senderColor    || dm.color;
  const senderInitials = msg.senderInitials || dm.initials.charAt(0);
  const senderName     = msg.senderName     || dm.name;

  if (msg.type === 'call') return makeCallBubble(msg);

  if (msg.type === 'voice') {
    const voiceHTML = makeVoiceBubble(msg, isMe);
    if (isMe) {
      return `<div class="dm-msg-row me"><div class="dm-msg-col-me">${voiceHTML}</div></div>`;
    } else {
      const avatarHTML = showAvatar
        ? `<div class="dm-msg-avatar" style="background:${senderColor}">${senderInitials}</div>`
        : `<div class="dm-msg-avatar-spacer"></div>`;
      const nameHTML = showAvatar && dm.isGroup ? `<div class="dm-msg-sender-grp" style="color:${senderColor}">${senderName}</div>` : '';
      const legacySender = showAvatar && !dm.isGroup ? `<div class="dm-msg-sender">${senderName}</div>` : '';
      return `<div class="dm-msg-row them ${showAvatar ? 'group-start' : ''}">
        ${avatarHTML}
        <div class="dm-msg-col">${nameHTML}${legacySender}${voiceHTML}</div>
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
      ? `<div class="dm-msg-avatar" style="background:${senderColor}">${senderInitials}</div>`
      : `<div class="dm-msg-avatar-spacer"></div>`;
    const nameHTML = showAvatar && dm.isGroup ? `<div class="dm-msg-sender-grp" style="color:${senderColor}">${senderName}</div>` : '';
    const legacySender = showAvatar && !dm.isGroup ? `<div class="dm-msg-sender">${senderName}</div>` : '';
    return `<div class="dm-msg-row them ${showAvatar ? 'group-start' : ''}">
      ${avatarHTML}
      <div class="dm-msg-col">${nameHTML}${legacySender}<div class="dm-bubble">${msg.text}</div>${timeHTML}</div>
    </div>`;
  }
}

function loadDmConversation(dmKey) {
  activeDm = dmKey;
  const dm = dmData[dmKey];
  if (!dm) return;
  if (dm.unread) { dm.unread = 0; renderDmList(); }

  // Header
  let hdrAvatarHTML, hdrStatusHTML;
  if (dm.isGroup) {
    const [m1, m2] = dm.members;
    hdrAvatarHTML = `<div class="dm-group-hdr-av">
      <div class="dm-gha-circle" style="background:${m1.color}">${m1.initials.charAt(0)}</div>
      <div class="dm-gha-circle" style="background:${m2.color}">${m2.initials.charAt(0)}</div>
    </div>`;
    hdrStatusHTML = dm.members.map(m => m.name.split(' ')[0]).join(', ');
  } else {
    hdrAvatarHTML = `<div class="dm-convo-avatar" style="background:${dm.color}">${dm.initials.charAt(0)}${dm.online ? '<div class="online-dot"></div>' : ''}</div>`;
    hdrStatusHTML = dm.online ? 'Online' : 'Offline';
  }
  document.getElementById('dmConvoHeader').innerHTML = `
    ${hdrAvatarHTML}
    <div class="dm-convo-info">
      <div class="dm-convo-name">${dm.name}</div>
      <div class="dm-convo-status ${dm.isGroup ? 'members' : (dm.online ? '' : 'offline')}">${hdrStatusHTML}</div>
    </div>
    <div class="dm-header-actions">
      <button class="dm-header-btn" title="Video call">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 10L20.553 6.724C21.224 6.566 22 7.05 22 7.764V16.236C22 16.95 21.224 17.434 20.553 17.276L15 14V10Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><rect x="2" y="6" width="13" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>
      </button>
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
    const isIncoming = msg.from !== 'me';
    const senderChanged = !prevMsg || prevMsg.from !== msg.from || prevMsg.type === 'call';
    const showAvatar = isIncoming && msg.type !== 'call' && senderChanged;
    msgs.insertAdjacentHTML('beforeend', makeBubble(msg, dm, showAvatar));
  });
  msgs.scrollTop = msgs.scrollHeight;

  document.getElementById('dmInput').placeholder = dm.isGroup ? `Message ${dm.name}…` : `Message ${dm.name.split(' ')[0]}…`;
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

// ── DM VOICE RECORDING ──
let _dmRec = {
  mediaRecorder: null, mediaStream: null, audioContext: null,
  analyser: null, chunks: [], seconds: 0, timerInterval: null,
  animFrame: null, barSamples: [], barEls: []
};

const DM_REC_BARS = 28;

function _dmRecFmt(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

function startDmRecording() {
  const recBar  = document.getElementById('dmRecBar');
  const inputRow = document.getElementById('dmInputRow');
  const wave    = document.getElementById('dmRecWave');
  const timerEl = document.getElementById('dmRecTimer');

  // Build bar elements
  wave.innerHTML = Array.from({ length: DM_REC_BARS }, () =>
    `<div class="dm-rec-bar-el" style="height:4px"></div>`
  ).join('');
  _dmRec.barEls = Array.from(wave.querySelectorAll('.dm-rec-bar-el'));
  _dmRec.barSamples = Array(DM_REC_BARS).fill(4);

  inputRow.classList.add('hidden');
  recBar.classList.remove('hidden');

  _dmRec.seconds = 0;
  timerEl.textContent = '0:00';
  _dmRec.timerInterval = setInterval(() => {
    _dmRec.seconds++;
    timerEl.textContent = _dmRecFmt(_dmRec.seconds);
  }, 1000);

  navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(stream => {
    _dmRec.mediaStream = stream;
    _dmRec.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    _dmRec.analyser = _dmRec.audioContext.createAnalyser();
    _dmRec.analyser.fftSize = 64;
    _dmRec.analyser.smoothingTimeConstant = 0.75;
    _dmRec.audioContext.createMediaStreamSource(stream).connect(_dmRec.analyser);

    _dmRec.mediaRecorder = new MediaRecorder(stream);
    _dmRec.chunks = [];
    _dmRec.mediaRecorder.ondataavailable = e => { if (e.data.size > 0) _dmRec.chunks.push(e.data); };
    _dmRec.mediaRecorder.start(100);

    const data = new Uint8Array(_dmRec.analyser.frequencyBinCount);
    function drawBars() {
      _dmRec.animFrame = requestAnimationFrame(drawBars);
      _dmRec.analyser.getByteFrequencyData(data);
      const bins = data.length;
      for (let i = 0; i < DM_REC_BARS; i++) {
        const bin = Math.floor((i / DM_REC_BARS) * bins);
        const h = 4 + (data[bin] / 255) * 26;
        _dmRec.barSamples[i] = h;
        if (_dmRec.barEls[i]) _dmRec.barEls[i].style.height = h + 'px';
      }
    }
    drawBars();
  }).catch(() => {
    // Mic denied — animate bars with fake data so UI still works
    function fakeBars() {
      _dmRec.animFrame = requestAnimationFrame(fakeBars);
      _dmRec.barEls.forEach((el, i) => {
        const h = 4 + Math.abs(Math.sin(Date.now() / 300 + i * 0.6)) * 20;
        el.style.height = h + 'px';
      });
    }
    fakeBars();
  });
}

function stopDmRecording(send) {
  clearInterval(_dmRec.timerInterval);
  cancelAnimationFrame(_dmRec.animFrame);
  _dmRec.animFrame = null;

  const dur = _dmRecFmt(_dmRec.seconds);
  const barSnapshot = _dmRec.barSamples.map(h => Math.max(1, Math.round(h / 2.4)));

  if (_dmRec.mediaRecorder && _dmRec.mediaRecorder.state !== 'inactive') _dmRec.mediaRecorder.stop();
  if (_dmRec.mediaStream) { _dmRec.mediaStream.getTracks().forEach(t => t.stop()); _dmRec.mediaStream = null; }
  if (_dmRec.audioContext) { _dmRec.audioContext.close(); _dmRec.audioContext = null; _dmRec.analyser = null; }

  document.getElementById('dmRecBar').classList.add('hidden');
  document.getElementById('dmInputRow').classList.remove('hidden');

  if (send && _dmRec.seconds > 0) {
    const dm = dmData[activeDm];
    const msg = { from: 'me', type: 'voice', dur, bars: barSnapshot, translation: '', time: 'Just now' };
    dm.messages.push(msg);
    const msgs = document.getElementById('dmMessages');
    msgs.insertAdjacentHTML('beforeend', makeBubble(msg, dm, false));
    msgs.scrollTop = msgs.scrollHeight;
    renderDmList();
  }

  _dmRec.seconds = 0;
  _dmRec.chunks = [];
  _dmRec.barSamples = Array(DM_REC_BARS).fill(4);
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

// ── MEETINGS DATA ──
const meetingsData = [
  { id: 'm1', title: 'Design Review',           date: '2026-07-11', time: '10:00', dur: 60,  type: 'video', participants: ['sarah','alex','priya'],            status: 'upcoming' },
  { id: 'm2', title: 'Sprint Planning',          date: '2026-07-11', time: '14:00', dur: 90,  type: 'video', participants: ['david','tom','marcus'],             status: 'upcoming' },
  { id: 'm3', title: 'Client Call – Acme Corp',  date: '2026-07-12', time: '09:00', dur: 30,  type: 'voice', participants: ['jessica','marcus'],                status: 'upcoming' },
  { id: 'm4', title: 'Product Roadmap Review',   date: '2026-07-14', time: '15:00', dur: 60,  type: 'video', participants: ['sarah','alex','david','marcus','jessica'], status: 'upcoming' },
  { id: 'm5', title: '1:1 with Sarah',           date: '2026-07-10', time: '11:00', dur: 30,  type: 'video', participants: ['sarah'],                           status: 'past' },
  { id: 'm6', title: 'Brand Assets Handoff',     date: '2026-07-09', time: '14:00', dur: 45,  type: 'video', participants: ['sarah','alex','jessica'],           status: 'past' },
  { id: 'm7', title: 'Engineering Sync',         date: '2026-07-08', time: '10:00', dur: 45,  type: 'voice', participants: ['david','tom'],                     status: 'past' },
  { id: 'm8', title: 'Q3 Goals Alignment',       date: '2026-07-07', time: '16:00', dur: 60,  type: 'video', participants: ['marcus','priya','jessica'],         status: 'past' },
  { id: 'm9', title: 'Marketing Review',         date: '2026-09-23', time: '15:00', dur: 60,  type: 'voice', participants: ['jessica','priya'],                  status: 'past' },
  { id: 'm10', title: 'Design Critique',         date: '2026-09-24', time: '10:00', dur: 45,  type: 'video', participants: ['sarah','alex','priya'],             status: 'past' },
  { id: 'm11', title: 'Product Sync',            date: '2026-09-24', time: '20:00', dur: 30,  type: 'video', participants: ['marcus','jessica','sarah'],         status: 'upcoming' },
  { id: 'm12', title: '1:1 with Alex',           date: '2026-09-25', time: '11:00', dur: 30,  type: 'video', participants: ['alex'],                             status: 'upcoming' },
];

const MV_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MV_DOW = ['S','M','T','W','T','F','S'];

function mvPad(n) { return String(n).padStart(2, '0'); }
function mvYmd(y, m, d) { return `${y}-${mvPad(m + 1)}-${mvPad(d)}`; }
function mvToday() {
  const n = new Date();
  return { y: n.getFullYear(), m: n.getMonth(), d: n.getDate(), ymd: mvYmd(n.getFullYear(), n.getMonth(), n.getDate()) };
}
function mvClock(hhmm) {
  const [h, min] = hhmm.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${mvPad(min)} ${ap}`;
}
function mvRange(m) {
  const [h, min] = m.time.split(':').map(Number);
  const end = new Date(2000, 0, 1, h, min + m.dur);
  return `${mvClock(m.time)} – ${mvClock(mvPad(end.getHours()) + ':' + mvPad(end.getMinutes()))}`;
}

const _mvOpen = mvToday();
let mvYear = _mvOpen.y;
let mvMonth = _mvOpen.m;
let mvSelected = _mvOpen.ymd;
let activeMeetingId = (meetingsData.find(m => m.date === mvSelected && m.status !== 'past')
  || meetingsData.find(m => m.date === mvSelected)
  || meetingsData[0]).id;

function renderMeetings() {
  const calEl = document.getElementById('mvCal');
  const agendaEl = document.getElementById('mvAgenda');
  const headEl = document.getElementById('mvAgendaHead');
  const labelEl = document.getElementById('mvMonthLabel');
  if (!calEl || !agendaEl) return;

  if (labelEl) labelEl.textContent = `${MV_MONTHS[mvMonth]} ${mvYear}`;

  const today = mvToday().ymd;
  const firstDow = new Date(mvYear, mvMonth, 1).getDay();
  const daysInMonth = new Date(mvYear, mvMonth + 1, 0).getDate();
  const prevDays = new Date(mvYear, mvMonth, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) {
    const day = prevDays - firstDow + 1 + i;
    const dt = new Date(mvYear, mvMonth - 1, day);
    cells.push({ ymd: mvYmd(dt.getFullYear(), dt.getMonth(), dt.getDate()), day, out: true });
  }
  for (let day = 1; day <= daysInMonth; day++) cells.push({ ymd: mvYmd(mvYear, mvMonth, day), day, out: false });
  while (cells.length % 7) {
    const day = cells.length - (firstDow + daysInMonth) + 1;
    const dt = new Date(mvYear, mvMonth + 1, day);
    cells.push({ ymd: mvYmd(dt.getFullYear(), dt.getMonth(), dt.getDate()), day, out: true });
  }
  const hasMeet = ymd => meetingsData.some(m => m.date === ymd);
  calEl.innerHTML = `<div class="mv-cal-grid">${MV_DOW.map(d => `<div class="mv-dow">${d}</div>`).join('')}${cells.map(c => {
    const cls = ['mv-day', c.out ? 'out' : '', c.ymd === today ? 'today' : '', c.ymd === mvSelected ? 'selected' : ''].filter(Boolean).join(' ');
    const dot = hasMeet(c.ymd) ? '<span class="mv-dot"></span>' : '';
    return `<button type="button" class="${cls}" data-date="${c.ymd}" aria-label="${c.ymd}">${c.day}${dot}</button>`;
  }).join('')}</div>`;
  calEl.querySelectorAll('.mv-day').forEach(btn => {
    btn.addEventListener('click', () => {
      mvSelected = btn.dataset.date;
      const [y, m] = mvSelected.split('-').map(Number);
      mvYear = y;
      mvMonth = m - 1;
      const onDay = meetingsData.filter(x => x.date === mvSelected).sort((a, b) => a.time.localeCompare(b.time));
      const pick = onDay.find(x => x.id === activeMeetingId) || onDay.find(x => x.status !== 'past') || onDay[0];
      renderMeetings();
      if (pick) showMeetingDetail(pick.id, false);
    });
  });

  const sel = new Date(mvSelected + 'T12:00:00');
  if (headEl) {
    headEl.textContent = sel.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }
  const dayMeetings = meetingsData.filter(m => m.date === mvSelected).sort((a, b) => a.time.localeCompare(b.time));
  if (!dayMeetings.length) {
    agendaEl.innerHTML = '<div class="mv-empty">No meetings</div><button type="button" class="mv-join-btn mv-empty-schedule" id="mvEmptySchedule">Schedule</button>';
    document.getElementById('mvEmptySchedule').onclick = () => document.getElementById('mvNewBtn').click();
    renderWeekCalendar();
    return;
  }
  const videoIcon = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="9" height="8" rx="1.4" stroke="currentColor" stroke-width="1.3"/><path d="M10 7l4-2v6l-4-2" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
  const voiceIcon = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 3.5A1.5 1.5 0 014.5 2h.2c.4 0 .8.2 1 .6l1 1.6c.2.3.2.7 0 1L6 6.2a7 7 0 003.8 3.8l1-1c.3-.2.7-.2 1 0l1.6 1c.4.2.6.6.6 1v.2A1.5 1.5 0 0112.5 13 8.5 8.5 0 013 3.5z" stroke="currentColor" stroke-width="1.2"/></svg>';
  agendaEl.innerHTML = dayMeetings.map(m => {
    const isPast = meetingIsPast(m);
    const ps = m.participants.map(k => peopleData.find(p => p.key === k)).filter(Boolean);
    const shown = ps.slice(0, 4);
    const extra = ps.length - shown.length;
    const avatars = shown.map(p => `<div class="mv-av" style="background:${p.color}">${p.initials.charAt(0)}</div>`).join('')
      + (extra > 0 ? `<div class="mv-av mv-av-more">+${extra}</div>` : '');
    const typeLabel = m.type === 'video' ? 'Video' : 'Voice';
    const icon = m.type === 'video' ? videoIcon : voiceIcon;
    const action = isPast
      ? '<span class="mv-ended">Ended</span>'
      : `<button class="mv-join-btn" type="button" onclick="joinMeeting('${m.id}')">Join</button>`;
    return `<div class="mv-card${isPast ? ' past' : ''}${m.id === activeMeetingId ? ' selected' : ''}" data-meeting="${m.id}">
      <div class="mv-card-main">
        <div class="mv-time">${mvRange(m)}</div>
        <div class="mv-name">${m.title}</div>
        <div class="mv-meta"><span class="mv-type-badge">${icon}${typeLabel}</span><div class="mv-avatars">${avatars}</div></div>
      </div>
      <div class="mv-actions">${action}</div>
    </div>`;
  }).join('');
  agendaEl.querySelectorAll('.mv-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.mv-join-btn')) return;
      showMeetingDetail(card.dataset.meeting);
    });
  });
  renderWeekCalendar();
}

const MV_START_H = 0;
const MV_END_H = 24;
const MV_HOUR_H = 52;
const MV_DOW_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
let mvView = 'workweek';
let mvScrolledOnce = false;

function mvVisibleDays(ymd) {
  const d = new Date(ymd + 'T12:00:00');
  if (mvView === 'day') return [ymd];
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay() + (mvView === 'workweek' ? 1 : 0));
  return Array.from({ length: mvView === 'workweek' ? 5 : 7 }, (_, i) => {
    const dt = new Date(start);
    dt.setDate(start.getDate() + i);
    return mvYmd(dt.getFullYear(), dt.getMonth(), dt.getDate());
  });
}

function mvMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// Greedy column packing so overlapping meetings sit side by side, as in Teams.
function mvLayoutDay(events) {
  const sorted = events.slice().sort((a, b) => a.start - b.start || b.end - a.end);
  const out = [];
  let cluster = [], clusterEnd = -1;
  const flush = () => {
    const cols = [];
    cluster.forEach(e => {
      let c = cols.findIndex(end => end <= e.start);
      if (c === -1) { c = cols.length; cols.push(0); }
      cols[c] = e.end;
      e.col = c;
    });
    cluster.forEach(e => { e.cols = cols.length; out.push(e); });
    cluster = [];
  };
  sorted.forEach(e => {
    if (e.start >= clusterEnd && cluster.length) flush();
    cluster.push(e);
    clusterEnd = Math.max(clusterEnd, e.end);
  });
  if (cluster.length) flush();
  return out;
}

function mvIsLive(m) {
  const start = new Date(`${m.date}T${m.time}:00`).getTime();
  return !meetingIsPast(m) && start - Date.now() <= 5 * 60 * 1000;
}

function renderWeekCalendar() {
  const daysEl = document.getElementById('mvWeekDays');
  const gridEl = document.getElementById('mvWeekGrid');
  const labelEl = document.getElementById('mvWeekLabel');
  if (!daysEl || !gridEl) return;
  mvClosePop();
  const days = mvVisibleDays(mvSelected);
  const today = mvToday().ymd;
  const first = new Date(days[0] + 'T12:00:00');
  const last = new Date(days[days.length - 1] + 'T12:00:00');
  if (labelEl) {
    if (mvView === 'day') {
      labelEl.textContent = first.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    } else {
      labelEl.textContent = first.getMonth() === last.getMonth()
        ? `${MV_MONTHS[first.getMonth()]} ${first.getDate()} – ${last.getDate()}, ${last.getFullYear()}`
        : `${MV_MONTHS[first.getMonth()].slice(0, 3)} ${first.getDate()} – ${MV_MONTHS[last.getMonth()].slice(0, 3)} ${last.getDate()}, ${last.getFullYear()}`;
    }
  }
  document.querySelectorAll('#mvViewSwitch button').forEach(b => b.classList.toggle('active', b.dataset.view === mvView));

  const colTpl = `56px repeat(${days.length}, minmax(${mvView === 'day' ? 200 : 96}px, 1fr))`;
  daysEl.style.gridTemplateColumns = colTpl;
  gridEl.style.gridTemplateColumns = colTpl;

  daysEl.innerHTML = `<div class="mv-week-corner"></div>` + days.map(ymd => {
    const d = new Date(ymd + 'T12:00:00');
    const cls = ['mv-week-day', ymd === today ? 'today' : '', ymd === mvSelected ? 'selected' : ''].filter(Boolean).join(' ');
    return `<div role="button" tabindex="0" class="${cls}" data-date="${ymd}"><span class="num">${d.getDate()}</span><span class="dow">${d.toLocaleDateString('en-US', { weekday: 'long' })}</span><button type="button" class="mv-day-add" data-add="${ymd}" aria-label="New meeting on ${ymd}"><svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div>`;
  }).join('');
  daysEl.querySelectorAll('.mv-day-add').forEach(btn => btn.addEventListener('click', e => {
    e.stopPropagation();
    mvOpenNewMeeting({ date: btn.dataset.add, time: mvNextSlot(btn.dataset.add), dur: 30 });
  }));
  daysEl.querySelectorAll('.mv-week-day').forEach(btn => {
    btn.addEventListener('click', () => {
      mvSelected = btn.dataset.date;
      const [y, m] = mvSelected.split('-').map(Number);
      mvYear = y;
      mvMonth = m - 1;
      const onDay = meetingsData.filter(x => x.date === mvSelected).sort((a, b) => a.time.localeCompare(b.time));
      activeMeetingId = (onDay.find(x => !meetingIsPast(x)) || onDay[0] || { id: activeMeetingId }).id;
      renderMeetings();
    });
  });

  const hours = [];
  for (let h = MV_START_H; h < MV_END_H; h++) {
    hours.push(`<div class="mv-hour" style="height:${MV_HOUR_H}px">${h === MV_START_H ? '' : `${h % 12 || 12} ${h >= 12 ? 'PM' : 'AM'}`}</div>`);
  }
  const span = (MV_END_H - MV_START_H) * MV_HOUR_H;
  const now = new Date();
  const nowTop = ((now.getHours() - MV_START_H) * 60 + now.getMinutes()) / 60 * MV_HOUR_H;
  const workTop = (9 - MV_START_H) * MV_HOUR_H;
  const workBottom = (17 - MV_START_H) * MV_HOUR_H;

  const cols = days.map(ymd => {
    const d = new Date(ymd + 'T12:00:00');
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    const laid = mvLayoutDay(meetingsData.filter(m => m.date === ymd).map(m => {
      const start = mvMinutes(m.time);
      return { m, start, end: start + Math.max(15, m.dur) };
    }));
    const blocks = laid.map(({ m, start, end, col, cols }) => {
      const top = (start - MV_START_H * 60) / 60 * MV_HOUR_H;
      const height = Math.max(22, (end - start) / 60 * MV_HOUR_H - 2);
      const past = meetingIsPast(m);
      const live = mvIsLive(m);
      const ps = m.participants.map(k => peopleData.find(p => p.key === k)).filter(Boolean);
      const organizer = ps.length ? ps.map(p => p.name.split(' ')[0]).join(', ') : 'Just you';
      const compact = height < 40;
      const cls = ['mv-week-event', past ? 'past' : '', live ? 'live' : '', m.id === activeMeetingId ? 'selected' : '', compact ? 'compact' : ''].filter(Boolean).join(' ');
      const width = 100 / cols;
      return `<div class="${cls}" data-meeting="${m.id}" style="top:${top}px;height:${height}px;left:calc(${col * width}% + 2px);width:calc(${width}% - 6px)">
        <div class="ev-body">
          <div class="ev-name">${m.title}</div>
          ${compact ? '' : `<div class="ev-sub">${mvRange(m)}</div>`}
          ${height > 64 ? `<div class="ev-sub">${organizer}</div>` : ''}
        </div>
        ${live ? `<button type="button" class="ev-join" data-join="${m.id}">Join</button>` : ''}
      </div>`;
    }).join('');
    const nowLine = ymd === today && nowTop >= 0 && nowTop <= span ? `<div class="mv-now" style="top:${nowTop}px"></div>` : '';
    return `<div class="mv-week-col${ymd === mvSelected ? ' selected' : ''}${weekend ? ' weekend' : ''}" data-date="${ymd}" style="height:${span}px;--hour:${MV_HOUR_H}px">
      <div class="mv-work-hours" style="top:${workTop}px;height:${workBottom - workTop}px"></div>${blocks}${nowLine}</div>`;
  }).join('');
  gridEl.innerHTML = `<div class="mv-week-hours" style="height:${span}px">${hours.join('')}</div>${cols}`;

  gridEl.querySelectorAll('.mv-week-event').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      const join = e.target.closest('[data-join]');
      if (join) { joinMeeting(join.dataset.join); return; }
      showMeetingDetail(el.dataset.meeting);
    });
  });
  gridEl.querySelectorAll('.mv-week-col').forEach(col => {
    col.addEventListener('pointerdown', e => mvStartDraft(e, col));
  });

  const scroller = document.getElementById('mvWeekScroll');
  if (scroller && !mvScrolledOnce && scroller.clientHeight) {
    mvScrolledOnce = true;
    const focusH = days.includes(today) ? Math.max(MV_START_H, now.getHours() - 1) : 8;
    scroller.scrollTop = (focusH - MV_START_H) * MV_HOUR_H;
  }
}

const MV_SNAP = 30;
let mvDraft = null;

function mvNextSlot(ymd) {
  const now = new Date();
  if (ymd !== mvToday().ymd) return '09:00';
  const mins = Math.min(23 * 60 + 30, Math.ceil((now.getHours() * 60 + now.getMinutes() + 1) / MV_SNAP) * MV_SNAP);
  return mvHHMM(mins);
}
function mvHHMM(mins) { return `${mvPad(Math.floor(mins / 60) % 24)}:${mvPad(mins % 60)}`; }

function mvYToMin(col, clientY) {
  const y = clientY - col.getBoundingClientRect().top;
  return Math.max(0, Math.min(24 * 60, y / MV_HOUR_H * 60 + MV_START_H * 60));
}

function mvPaintDraft() {
  if (!mvDraft) return;
  const { el, start, end, date } = mvDraft;
  el.style.top = ((start - MV_START_H * 60) / 60 * MV_HOUR_H) + 'px';
  el.style.height = Math.max(20, (end - start) / 60 * MV_HOUR_H - 2) + 'px';
  el.innerHTML = `<div class="ev-body"><div class="ev-name">${mvDraft.title || 'New meeting'}</div><div class="ev-sub">${mvRange({ date, time: mvHHMM(start), dur: end - start })}</div></div>`;
}

function mvClearDraft() {
  mvDraft?.el.remove();
  mvDraft = null;
}

function mvStartDraft(e, col) {
  if (e.button !== 0 || e.target.closest('.mv-week-event')) return;
  e.preventDefault();
  mvClosePop();
  const anchor = Math.floor(mvYToMin(col, e.clientY) / MV_SNAP) * MV_SNAP;
  const el = document.createElement('div');
  el.className = 'mv-week-event mv-draft';
  col.appendChild(el);
  mvDraft = { el, col, date: col.dataset.date, start: anchor, end: anchor + MV_SNAP, title: '' };
  mvPaintDraft();
  col.setPointerCapture(e.pointerId);
  const move = ev => {
    const m = mvYToMin(col, ev.clientY);
    if (m >= anchor) { mvDraft.start = anchor; mvDraft.end = Math.max(anchor + MV_SNAP, Math.ceil(m / MV_SNAP) * MV_SNAP); }
    else { mvDraft.start = Math.floor(m / MV_SNAP) * MV_SNAP; mvDraft.end = anchor + MV_SNAP; }
    mvDraft.end = Math.min(24 * 60, mvDraft.end);
    mvPaintDraft();
  };
  const up = () => {
    col.removeEventListener('pointermove', move);
    col.removeEventListener('pointerup', up);
    col.removeEventListener('pointercancel', up);
    mvOpenQuickCreate();
  };
  col.addEventListener('pointermove', move);
  col.addEventListener('pointerup', up);
  col.addEventListener('pointercancel', up);
}

function mvPeople(keys) { return keys.map(k => peopleData.find(p => p.key === k)).filter(Boolean); }

// Chips + type-ahead list; mutates `selected` in place.
function mvAttendeePicker(root, selected, onChange) {
  const paint = () => {
    root.innerHTML = `<div class="mv-att">${mvPeople(selected).map(p =>
      `<span class="mv-att-chip"><span class="mv-att-av" style="background:${p.color}">${p.initials}</span>${p.name.split(' ')[0]}<button type="button" data-rm="${p.key}" aria-label="Remove ${p.name}">×</button></span>`).join('')}
      <input class="mv-att-input" type="text" placeholder="${selected.length ? 'Add more' : 'Invite people'}" autocomplete="off" /></div>
      <div class="mv-att-list hidden"></div>`;
    const input = root.querySelector('.mv-att-input');
    const list = root.querySelector('.mv-att-list');
    const show = () => {
      const q = input.value.trim().toLowerCase();
      const hits = peopleData.filter(p => !selected.includes(p.key) && (!q || p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q)));
      list.innerHTML = hits.map((p, i) => `<button type="button" class="mv-att-opt${i === 0 ? ' active' : ''}" data-add="${p.key}"><span class="mv-att-av" style="background:${p.color}">${p.initials}</span><span>${p.name}<small>${p.role}</small></span><i class="${p.online ? 'on' : ''}"></i></button>`).join('') || '<div class="mv-att-none">No matches</div>';
      list.classList.remove('hidden');
    };
    input.addEventListener('focus', show);
    input.addEventListener('input', show);
    input.addEventListener('blur', () => setTimeout(() => list.classList.add('hidden'), 150));
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const first = list.querySelector('[data-add]');
        if (first) first.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      } else if (e.key === 'Backspace' && !input.value && selected.length) {
        selected.pop(); paint(); onChange?.(); root.querySelector('.mv-att-input').focus();
      }
    });
    list.addEventListener('mousedown', e => {
      const opt = e.target.closest('[data-add]');
      if (!opt) return;
      e.preventDefault();
      selected.push(opt.dataset.add);
      paint(); onChange?.();
      root.querySelector('.mv-att-input').focus();
    });
    root.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => {
      selected.splice(selected.indexOf(b.dataset.rm), 1);
      paint(); onChange?.();
    }));
  };
  paint();
}

function mvConflicts(date, start, end, ignoreId) {
  return meetingsData.filter(m => m.id !== ignoreId && m.date === date && mvMinutes(m.time) < end && mvMinutes(m.time) + m.dur > start);
}

function mvPlacePop(pop, anchorRect) {
  const host = document.getElementById('meetingsCal');
  const hr = host.getBoundingClientRect();
  const pw = pop.offsetWidth, ph = pop.offsetHeight;
  let left = anchorRect.right - hr.left + 8;
  if (left + pw > hr.width - 8) left = anchorRect.left - hr.left - pw - 8;
  if (left < 8) left = Math.max(8, Math.min(hr.width - pw - 8, anchorRect.left - hr.left));
  pop.style.left = left + 'px';
  pop.style.top = Math.max(8, Math.min(hr.height - ph - 8, anchorRect.top - hr.top)) + 'px';
}

function mvOpenQuickCreate() {
  const pop = document.getElementById('mvPop');
  if (!pop || !mvDraft) return;
  const d = mvDraft;
  const people = [];
  const type = { v: 'video' };
  const dateLabel = new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  pop.dataset.kind = 'create';
  pop.innerHTML = `
    <div class="mv-pop-head">
      <input class="mv-qc-title" id="mvQcTitle" type="text" placeholder="Add a title" autocomplete="off" />
      <button type="button" class="mv-pop-x" id="mvPopClose" aria-label="Close"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
    </div>
    <div class="mv-qc-row">
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.3" stroke="currentColor" stroke-width="1.3"/><path d="M8 4.5V8l2.3 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
      <span>${dateLabel}</span>
      <input type="time" step="900" id="mvQcStart" value="${mvHHMM(d.start)}" /><span>–</span><input type="time" step="900" id="mvQcEnd" value="${mvHHMM(d.end % (24 * 60))}" />
    </div>
    <div class="mv-qc-row mv-qc-att">
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5.5" r="2.5" stroke="currentColor" stroke-width="1.3"/><path d="M1.5 13.5c.5-2.3 2.3-3.5 4.5-3.5s4 1.2 4.5 3.5M11 3.5a2.3 2.3 0 010 4.4M12.5 10.3c1 .5 1.7 1.6 2 3.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
      <div id="mvQcPeople" class="mv-qc-picker"></div>
    </div>
    <div class="mv-qc-row">
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="9" height="8" rx="1.4" stroke="currentColor" stroke-width="1.3"/><path d="M10 7l4-2v6l-4-2" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
      <div class="mv-seg" id="mvQcType"><button type="button" data-type="video" class="active">Video</button><button type="button" data-type="voice">Voice</button></div>
    </div>
    <div class="mv-qc-warn hidden" id="mvQcWarn"></div>
    <div class="mv-qc-foot">
      <button type="button" class="mv-pop-btn" id="mvQcMore">More options</button>
      <button type="button" class="mv-pop-join" id="mvQcSave">Save</button>
    </div>`;
  pop.classList.remove('hidden');
  mvPlacePop(pop, d.el.getBoundingClientRect());

  const titleEl = document.getElementById('mvQcTitle');
  const startEl = document.getElementById('mvQcStart');
  const endEl = document.getElementById('mvQcEnd');
  const warn = () => {
    const c = mvConflicts(d.date, d.start, d.end);
    const w = document.getElementById('mvQcWarn');
    w.classList.toggle('hidden', !c.length);
    w.textContent = c.length ? `Overlaps with ${c.map(x => x.title).join(', ')}` : '';
  };
  const syncTimes = () => {
    const s0 = mvMinutes(startEl.value || mvHHMM(d.start));
    let e0 = mvMinutes(endEl.value || mvHHMM(d.end));
    if (e0 <= s0) e0 = s0 + (d.end - d.start);
    d.start = s0; d.end = Math.min(24 * 60, e0);
    endEl.value = mvHHMM(d.end % (24 * 60));
    mvPaintDraft(); warn();
  };
  titleEl.addEventListener('input', () => { d.title = titleEl.value.trim(); mvPaintDraft(); });
  startEl.addEventListener('change', () => {
    const len = d.end - d.start;
    endEl.value = mvHHMM(Math.min(24 * 60 - 1, mvMinutes(startEl.value) + len));
    syncTimes();
  });
  endEl.addEventListener('change', syncTimes);
  mvAttendeePicker(document.getElementById('mvQcPeople'), people);
  document.querySelectorAll('#mvQcType button').forEach(b => b.addEventListener('click', () => {
    type.v = b.dataset.type;
    document.querySelectorAll('#mvQcType button').forEach(x => x.classList.toggle('active', x === b));
  }));
  const save = () => {
    const title = titleEl.value.trim() || 'New meeting';
    const fields = { title, date: d.date, time: mvHHMM(d.start), dur: d.end - d.start, type: type.v, participants: people.slice() };
    mvClearDraft();
    mvClosePop();
    const m = placeMeeting(fields);
    renderMeetings();
    mvOpenPop(m.id);
  };
  titleEl.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
  document.getElementById('mvQcSave').onclick = save;
  document.getElementById('mvQcMore').onclick = () => {
    const seed = { date: d.date, time: mvHHMM(d.start), dur: d.end - d.start, title: titleEl.value.trim(), type: type.v, participants: people.slice() };
    mvClosePop();
    mvOpenNewMeeting(seed);
  };
  document.getElementById('mvPopClose').onclick = mvClosePop;
  warn();
  titleEl.focus();
}

// Full "New meeting" form, laid over the calendar like Teams' scheduling page.
function mvOpenNewMeeting(seed = {}) {
  const form = document.getElementById('mvForm');
  if (!form) return;
  mvClosePop();
  const editing = seed.id ? meetingsData.find(x => x.id === seed.id) : null;
  const st = {
    title: seed.title || '',
    date: seed.date || mvSelected,
    start: mvMinutes(seed.time || mvNextSlot(seed.date || mvSelected)),
    dur: seed.dur || 30,
    type: seed.type || 'video',
    repeat: 'none',
    notes: seed.notes || '',
    people: (seed.participants || []).slice(),
  };
  document.getElementById('mvFormHeading').textContent = editing ? 'Edit meeting' : 'New meeting';
  document.getElementById('mvFormSave').textContent = editing ? 'Save changes' : 'Save';
  document.getElementById('mvFormRepeatRow').classList.toggle('hidden', !!editing);
  const $ = id => document.getElementById(id);
  $('mvfTitle').value = st.title;
  $('mvfDate').value = st.date;
  $('mvfStart').value = mvHHMM(st.start);
  $('mvfEnd').value = mvHHMM(Math.min(24 * 60 - 1, st.start + st.dur));
  $('mvfRepeat').value = 'none';
  $('mvfNotes').value = st.notes;
  document.querySelectorAll('#mvfType button').forEach(b => b.classList.toggle('active', b.dataset.type === st.type));

  const refresh = () => {
    const s0 = mvMinutes($('mvfStart').value || '09:00');
    let e0 = mvMinutes($('mvfEnd').value || '09:30');
    if (e0 <= s0) { e0 = Math.min(24 * 60 - 1, s0 + st.dur); $('mvfEnd').value = mvHHMM(e0); }
    st.start = s0; st.dur = e0 - s0; st.date = $('mvfDate').value || st.date;
    const h = Math.floor(st.dur / 60), mm = st.dur % 60;
    $('mvfDur').textContent = [h ? `${h}h` : '', mm ? `${mm}m` : ''].filter(Boolean).join(' ');
    const c = mvConflicts(st.date, st.start, st.start + st.dur, editing?.id);
    $('mvfWarn').classList.toggle('hidden', !c.length);
    $('mvfWarn').textContent = c.length ? `Overlaps with ${c.map(x => `${x.title} (${mvRange(x)})`).join(', ')}` : '';
    const busy = new Set(c.flatMap(x => x.participants));
    $('mvfAvail').innerHTML = st.people.length
      ? mvPeople(st.people).map(p => `<span class="mv-avail-item"><i class="${busy.has(p.key) ? 'busy' : 'free'}"></i>${p.name.split(' ')[0]} · ${busy.has(p.key) ? 'Busy' : 'Free'}</span>`).join('')
      : '';
  };
  $('mvfStart').onchange = () => {
    $('mvfEnd').value = mvHHMM(Math.min(24 * 60 - 1, mvMinutes($('mvfStart').value) + st.dur));
    refresh();
  };
  $('mvfEnd').onchange = refresh;
  $('mvfDate').onchange = refresh;
  document.querySelectorAll('#mvfType button').forEach(b => b.onclick = () => {
    st.type = b.dataset.type;
    document.querySelectorAll('#mvfType button').forEach(x => x.classList.toggle('active', x === b));
  });
  mvAttendeePicker($('mvfPeople'), st.people, refresh);

  const close = () => { form.classList.add('hidden'); mvClearDraft(); };
  $('mvFormClose').onclick = close;
  $('mvFormSave').onclick = () => {
    refresh();
    const title = $('mvfTitle').value.trim();
    if (!title) { $('mvfTitle').focus(); $('mvfTitle').classList.add('invalid'); return; }
    const base = { title, time: mvHHMM(st.start), dur: st.dur, type: st.type, participants: st.people.slice(), notes: $('mvfNotes').value.trim() };
    const repeat = $('mvfRepeat').value;
    const dates = [st.date];
    if (!editing && repeat !== 'none') {
      const d0 = new Date(st.date + 'T12:00:00');
      for (let i = 1; dates.length < (repeat === 'daily' ? 5 : 4); i++) {
        const dt = new Date(d0);
        dt.setDate(d0.getDate() + (repeat === 'weekly' ? i * 7 : i));
        if (repeat === 'daily' && (dt.getDay() === 0 || dt.getDay() === 6)) continue;
        dates.push(mvYmd(dt.getFullYear(), dt.getMonth(), dt.getDate()));
      }
    }
    form.classList.add('hidden');
    mvClearDraft();
    dates.slice(1).reverse().forEach(date => placeMeeting({ ...base, date, repeat }));
    const m = placeMeeting({ ...base, id: editing?.id, date: st.date, repeat: dates.length > 1 ? repeat : undefined });
    renderMeetings();
    mvOpenPop(m.id);
  };
  $('mvfTitle').oninput = () => $('mvfTitle').classList.remove('invalid');
  form.classList.remove('hidden');
  refresh();
  setTimeout(() => $('mvfTitle').focus(), 30);
}

function mvClosePop() {
  const pop = document.getElementById('mvPop');
  if (pop && pop.dataset.kind === 'create') mvClearDraft();
  pop?.classList.add('hidden');
  if (pop) pop.dataset.kind = '';
}

function mvOpenPop(id) {
  const pop = document.getElementById('mvPop');
  const host = document.getElementById('meetingsCal');
  const ev = document.querySelector(`#mvWeekGrid .mv-week-event[data-meeting="${id}"]`);
  const m = meetingsData.find(x => x.id === id);
  if (!pop || !host || !ev || !m) return;
  pop.dataset.kind = 'detail';
  const scroller = document.getElementById('mvWeekScroll');
  const sr = scroller.getBoundingClientRect();
  let er = ev.getBoundingClientRect();
  if (er.top < sr.top + 60 || er.bottom > sr.bottom) {
    scroller.scrollTop += er.top - sr.top - 120;
    er = ev.getBoundingClientRect();
  }

  const past = meetingIsPast(m);
  const live = mvIsLive(m);
  const ps = m.participants.map(k => peopleData.find(p => p.key === k)).filter(Boolean);
  const dateLabel = new Date(m.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const people = ps.map(p => `<div class="mv-pop-person"><div class="mv-pop-av" style="background:${p.color}">${p.initials}</div><div class="mv-pop-pname">${p.name}<span>${p.role}</span></div></div>`).join('');
  pop.innerHTML = `
    <div class="mv-pop-head">
      <div class="mv-pop-title">${m.title}</div>
      <button type="button" class="mv-pop-x" id="mvPopClose" aria-label="Close"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
    </div>
    <div class="mv-pop-when">${dateLabel} · ${mvRange(m)}</div>
    <div class="mv-pop-row">
      ${past ? '<span class="mv-ended">Ended</span>' : `<button type="button" class="mv-pop-join${live ? ' live' : ''}" id="mvPopJoin">${m.type === 'video' ? 'Join' : 'Call'}</button>`}
      <button type="button" class="mv-pop-btn" id="mvPopChat">Chat</button>
      <button type="button" class="mv-pop-btn" id="mvPopEdit">Edit</button>
      <button type="button" class="mv-pop-btn danger" id="mvPopCancel">Cancel</button>
    </div>
    ${m.notes ? `<div class="mv-pop-notes">${m.notes.replace(/</g, '&lt;')}</div>` : ''}
    ${m.repeat && m.repeat !== 'none' ? `<div class="mv-pop-when">Repeats ${m.repeat}</div>` : ''}
    <div class="mv-pop-section">${ps.length} participant${ps.length === 1 ? '' : 's'}</div>
    <div class="mv-pop-people">${people || '<div class="mv-pop-empty">Just you</div>'}</div>`;

  pop.classList.remove('hidden');
  mvPlacePop(pop, er);

  document.getElementById('mvPopClose').onclick = mvClosePop;
  document.getElementById('mvPopJoin')?.addEventListener('click', () => { mvClosePop(); joinMeeting(m.id); });
  document.getElementById('mvPopChat').onclick = () => {
    mvClosePop();
    if (ps.length === 1 && dmData[ps[0].key]) activeDm = ps[0].key;
    navigateTo('dms');
  };
  document.getElementById('mvPopEdit').onclick = () => mvOpenNewMeeting(m);
  document.getElementById('mvPopCancel').onclick = () => {
    const idx = meetingsData.findIndex(x => x.id === m.id);
    if (idx >= 0) meetingsData.splice(idx, 1);
    const next = meetingsData.find(x => x.date === mvSelected);
    activeMeetingId = next ? next.id : null;
    renderMeetings();
  };
}

document.addEventListener('mousedown', e => {
  const pop = document.getElementById('mvPop');
  if (!pop || pop.classList.contains('hidden')) return;
  if (!e.target.isConnected || pop.contains(e.target) || e.target.closest('.mv-week-event, .mv-card, .mv-week-col')) return;
  mvClosePop();
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const form = document.getElementById('mvForm');
  if (form && !form.classList.contains('hidden')) { form.classList.add('hidden'); mvClearDraft(); }
  else mvClosePop();
});
document.getElementById('mvWeekScroll')?.addEventListener('scroll', () => {
  if (document.getElementById('mvPop')?.dataset.kind === 'detail') mvClosePop();
});

function showMeetingDetail(id, pop = true) {
  const m = meetingsData.find(x => x.id === id);
  if (!m) return;
  activeMeetingId = id;
  const [y, mo, d] = m.date.split('-').map(Number);
  mvYear = y;
  mvMonth = mo - 1;
  mvSelected = m.date;
  showPanel('meetingsCal');
  renderMeetings();
  if (pop) mvOpenPop(id);
}

window.joinMeeting = function(id) {
  const m = meetingsData.find(x => x.id === id);
  if (!m) return;
  startGroupCall(m.participants, m.type === 'video', m.participants.length > 1 ? m.title : null);
};

function mvShiftWeek(delta) {
  const d = new Date(mvSelected + 'T12:00:00');
  d.setDate(d.getDate() + delta * (mvView === 'day' ? 1 : 7));
  mvYear = d.getFullYear();
  mvMonth = d.getMonth();
  mvSelected = mvYmd(mvYear, mvMonth, d.getDate());
  const onDay = meetingsData.filter(x => x.date === mvSelected);
  if (!onDay.some(x => x.id === activeMeetingId)) {
    activeMeetingId = (onDay.find(x => !meetingIsPast(x)) || onDay[0] || { id: null }).id;
  }
  renderMeetings();
}
document.getElementById('mvWeekPrev')?.addEventListener('click', () => mvShiftWeek(-1));
document.getElementById('mvWeekNext')?.addEventListener('click', () => mvShiftWeek(1));
document.getElementById('mvWeekToday')?.addEventListener('click', () => {
  mvScrolledOnce = false;
  document.getElementById('mvToday').click();
});
document.querySelectorAll('#mvViewSwitch button').forEach(b => b.addEventListener('click', () => {
  mvView = b.dataset.view;
  renderWeekCalendar();
}));
document.getElementById('mvWeekNew')?.addEventListener('click', () => mvOpenNewMeeting({ date: mvSelected }));
document.getElementById('mvMeetNow')?.addEventListener('click', () => openCallPicker());

function mvShiftMonth(delta) {
  const dt = new Date(mvYear, mvMonth + delta, 1);
  mvYear = dt.getFullYear();
  mvMonth = dt.getMonth();
  const dim = new Date(mvYear, mvMonth + 1, 0).getDate();
  const day = Math.min(Number(mvSelected.slice(8)), dim);
  mvSelected = mvYmd(mvYear, mvMonth, day);
  renderMeetings();
}
document.getElementById('mvPrev')?.addEventListener('click', () => mvShiftMonth(-1));
document.getElementById('mvNext')?.addEventListener('click', () => mvShiftMonth(1));
document.getElementById('mvToday')?.addEventListener('click', () => {
  const t = mvToday();
  mvYear = t.y;
  mvMonth = t.m;
  mvSelected = t.ymd;
  renderMeetings();
  const onDay = meetingsData.filter(x => x.date === mvSelected).sort((a, b) => a.time.localeCompare(b.time));
  const pick = onDay.find(x => x.status !== 'past') || onDay[0];
  if (pick) showMeetingDetail(pick.id, false);
});
document.getElementById('mvNewBtn')?.addEventListener('click', () => {
  showPanel('meetingsCal');
  mvOpenNewMeeting({ date: mvSelected });
});

function renderPeopleList(filter) {
  const list = document.getElementById('peopleList');
  if (!list) return;
  const q = (filter || '').toLowerCase();
  const items = q ? peopleData.filter(p => p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q)) : peopleData;

  const online  = items.filter(p => p.online);
  const offline = items.filter(p => !p.online);

  list.innerHTML = '';
  const peopleEmpty = document.getElementById('peopleEmptyState');
  if (!items.length) {
    peopleEmpty?.classList.remove('hidden');
    return;
  }
  peopleEmpty?.classList.add('hidden');
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

let activePersonKey = 'sarah';

function showContactDetail(personKey) {
  const p = peopleData.find(x => x.key === personKey);
  if (!p) return;
  activePersonKey = personKey;

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
const channelMembers = {
  'product-launch-q3': ['sarah', 'alex', 'jessica', 'marcus'],
  'engineering-team': ['david', 'tom', 'marcus'],
  'design-system': ['sarah', 'alex', 'priya'],
};

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
      <button class="dm-header-btn" title="Video call">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 10L20.553 6.724C21.224 6.566 22 7.05 22 7.764V16.236C22 16.95 21.224 17.434 20.553 17.276L15 14V10Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><rect x="2" y="6" width="13" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>
      </button>
      <button class="dm-header-btn" title="Call">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" transform="translate(1,1) scale(0.91)"/></svg>
      </button>
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
  document.getElementById('tdStatusChip').addEventListener('click', e => { e.stopPropagation(); showTaskStatusDd(e.currentTarget, t); });

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

const STATUS_DOTS = { 'To Do': '#9ca3af', 'In Progress': '#2563eb', 'Done': '#16a34a' };

function showTaskStatusDd(chipEl, t) {
  const dd = document.getElementById('taskStatusDd');
  const rect = chipEl.getBoundingClientRect();
  dd.style.top = (rect.bottom + 4) + 'px';
  dd.style.left = rect.left + 'px';
  dd.querySelectorAll('.tsd-opt').forEach(opt => {
    const status = opt.dataset.status;
    opt.classList.toggle('active', status === t.status);
    opt.innerHTML = `<span class="tsd-dot" style="background:${STATUS_DOTS[status]}"></span>${status}`;
    opt.onclick = (e) => {
      e.stopPropagation();
      applyTaskStatus(t, status);
      dd.classList.add('hidden');
    };
  });
  dd.classList.remove('hidden');
  setTimeout(() => document.addEventListener('click', () => dd.classList.add('hidden'), { once: true }), 0);
}

function applyTaskStatus(t, newStatus) {
  t.status = newStatus;
  const chip = document.getElementById('tdStatusChip');
  if (chip) {
    chip.textContent = newStatus;
    chip.className = `td-chip ${statusClass(newStatus)}`;
  }
  document.querySelectorAll(`.task-item[data-task-id="${t.id}"] .task-status`).forEach(el => {
    el.textContent = newStatus;
    el.className = 'task-status ' + newStatus.toLowerCase().replace(/\s+/g, '-');
  });
}

// ── RIGHT PANEL STATES ──
const allPanels = ['meetingsCal','scheduleDetail','taskDetail','channelView','dmView','recIdle','recView','recIntent','recResult','kbView','contactView','aigroupChat'];
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
  const popup = document.getElementById('profilePopup');
  popup.style.left = navExpanded ? '218px' : '80px';
  const overlay = document.getElementById('settingsContent');
  overlay.style.left = navExpanded ? '218px' : '68px';
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

// ── SETTINGS ──
const SETTINGS_SECTION_MAP = {
  profile:   'settingsSectionProfile',
  sounds:    'settingsSectionSounds',
  shortcuts: 'settingsSectionShortcuts',
};

let _stgDirty = false;

function _stgMarkDirty() { _stgDirty = true; }

function openSettings(section = 'profile') {
  document.getElementById('profilePopup').classList.add('hidden');
  _stgDirty = false;

  const name = profileDisplayName || (userEmail ? userEmail.split('@')[0] : 'User');
  const parts = name.split(' ');
  document.getElementById('stgFirstName').value = parts[0] || '';
  document.getElementById('stgLastName').value  = parts.slice(1).join(' ') || '';
  const initials = name.slice(0, 2).toUpperCase();
  const avatarEl = document.getElementById('stgAvatar');
  avatarEl.textContent = initials;
  avatarEl.style.background = epAvatarColor;
  document.getElementById('stgFullname').textContent = name + ' | 1001';
  document.getElementById('stgPhone').value = '';
  document.querySelectorAll('#stgDisplayLang .stg-pill').forEach((p,i) => p.classList.toggle('active', i===0));
  document.querySelectorAll('#stgAppearance .stg-pill').forEach((p,i) => p.classList.toggle('active', i===0));

  switchSettingsSection(section);
  document.getElementById('settingsContent').classList.remove('hidden');
}

function _doCloseSettings() {
  _stgDirty = false;
  document.getElementById('settingsContent').classList.add('hidden');
  document.getElementById('stgUnsavedOverlay').classList.add('hidden');
}

function closeSettings() {
  if (_stgDirty) {
    document.getElementById('stgUnsavedOverlay').classList.remove('hidden');
  } else {
    _doCloseSettings();
  }
}

let _stgToastTimer = null;
function showSettingsToast(msg = 'Changes saved') {
  const toast = document.getElementById('stgToast');
  document.getElementById('stgToastMsg').textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(_stgToastTimer);
  _stgToastTimer = setTimeout(() => toast.classList.add('hidden'), 2800);
}

function _stgApplySave() {
  const first = document.getElementById('stgFirstName').value.trim();
  const last  = document.getElementById('stgLastName').value.trim();
  const name  = [first, last].filter(Boolean).join(' ') || profileDisplayName;
  profileDisplayName = name;
  const initials = name.slice(0, 2).toUpperCase();
  document.getElementById('navProfileInitials').textContent = initials;
  document.getElementById('navProfileName').textContent = name;
  document.getElementById('navProfileAvatar').style.background = epAvatarColor;
  document.getElementById('profilePopupAvatar').textContent = initials;
  document.getElementById('profilePopupAvatar').style.background = epAvatarColor;
  document.getElementById('profilePopupName').textContent = name;
  document.getElementById('stgAvatar').textContent = initials;
  document.getElementById('stgFullname').textContent = name + ' | 1001';
  _stgDirty = false;
}

function switchSettingsSection(section) {
  Object.values(SETTINGS_SECTION_MAP).forEach(id => {
    document.getElementById(id)?.classList.add('hidden');
  });
  document.getElementById(SETTINGS_SECTION_MAP[section])?.classList.remove('hidden');
  document.querySelectorAll('.sn-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === section);
  });
}

document.getElementById('navSettingsBtn').addEventListener('click', () => openSettings('profile'));
document.getElementById('navSearchBtn').addEventListener('click', () => openGlobalSearch());

// "New" button inside DM list header → opens the same DM dropdown as the quick action
document.getElementById('dmListNewBtn').addEventListener('click', e => {
  e.stopPropagation();
  window.openDmDropdown(e.currentTarget);
});
document.getElementById('settingsCloseBtn').addEventListener('click', closeSettings);

document.getElementById('editProfileBtn').removeEventListener('click', openEditProfile);
document.getElementById('editProfileBtn').addEventListener('click', () => openSettings('profile'));

document.querySelectorAll('.sn-item').forEach(btn => {
  btn.addEventListener('click', () => switchSettingsSection(btn.dataset.section));
});

// Pill group toggles (language + appearance)
document.querySelectorAll('.stg-pill-group').forEach(group => {
  group.addEventListener('click', e => {
    const pill = e.target.closest('.stg-pill');
    if (!pill) return;
    group.querySelectorAll('.stg-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    _stgMarkDirty();
  });
});

// Mark dirty on any input change inside settings
document.getElementById('settingsContent').addEventListener('input', _stgMarkDirty);
document.getElementById('settingsContent').addEventListener('change', _stgMarkDirty);

// Save Changes
document.getElementById('stgSaveBtn').addEventListener('click', () => {
  _stgApplySave();
  showSettingsToast('Profile updated');
});

// Cancel — discard and close
document.getElementById('stgCancelBtn').addEventListener('click', () => {
  _stgDirty = false;
  _doCloseSettings();
});

// Unsaved changes dialog
document.getElementById('stgSaveCloseBtn').addEventListener('click', () => {
  _stgApplySave();
  showSettingsToast('Profile updated');
  _doCloseSettings();
});
document.getElementById('stgDiscardBtn').addEventListener('click', () => {
  _stgDirty = false;
  _doCloseSettings();
});
document.getElementById('stgKeepEditingBtn').addEventListener('click', () => {
  document.getElementById('stgUnsavedOverlay').classList.add('hidden');
});

// ESC key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!document.getElementById('globalSearch').classList.contains('hidden')) {
      closeGlobalSearch();
    } else if (!document.getElementById('stgUnsavedOverlay').classList.contains('hidden')) {
      document.getElementById('stgUnsavedOverlay').classList.add('hidden');
    } else if (!document.getElementById('settingsContent').classList.contains('hidden')) {
      closeSettings();
    }
  }
  // Cmd+K / Ctrl+K → open global search
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('globalSearch').classList.contains('hidden')
      ? openGlobalSearch()
      : closeGlobalSearch();
  }
});

// ── GLOBAL SEARCH ────────────────────────────────────────────────────────────
(function() {
  const overlay   = document.getElementById('globalSearch');
  const backdrop  = document.getElementById('gsBackdrop');
  const input     = document.getElementById('gsInput');
  const results   = document.getElementById('gsResults');
  const emptyEl   = document.getElementById('gsEmpty');
  const recentsEl = document.getElementById('gsRecents');
  const recentsList = document.getElementById('gsRecentsList');

  let gsIndex = -1;   // keyboard-nav selected item index
  let gsItems = [];   // flat list of current result elements

  // ── open / close ──
  window.openGlobalSearch = function() {
    overlay.classList.remove('hidden');
    input.value = '';
    showRecents();
    input.focus();
  };
  window.closeGlobalSearch = function() {
    overlay.classList.add('hidden');
    gsIndex = -1;
    gsItems = [];
  };

  backdrop.addEventListener('click', closeGlobalSearch);

  // ── recent items (shown when input is empty) ──
  const RECENTS = [
    { type: 'dm',      key: 'sarah',              label: 'Sarah Jenkins',       meta: 'Direct message',        color: '#7c3aed', initials: 'SJ' },
    { type: 'channel', key: 'product-launch-q3',  label: '#product-launch-q3',  meta: '12 members',            color: '#0d8f82', initials: '#' },
    { type: 'dm',      key: 'david',              label: 'David Chen',          meta: 'Direct message',        color: '#2563eb', initials: 'DC' },
    { type: 'channel', key: 'engineering-team',   label: '#engineering-team',   meta: '8 members',             color: '#0d8f82', initials: '#' },
  ];

  function showRecents() {
    results.classList.add('hidden');
    emptyEl.classList.add('hidden');
    recentsEl.classList.remove('hidden');
    recentsList.innerHTML = '';
    RECENTS.forEach(r => {
      const el = makeItem(r.type, r.key, r.label, r.meta, r.color, r.initials);
      el.querySelector('.gs-item-tag').textContent = r.type === 'channel' ? 'Channel' : 'DM';
      recentsList.appendChild(el);
    });
    indexItems();
  }

  // ── search ──
  function highlight(text, q) {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return text;
    return text.slice(0, idx) + '<mark>' + text.slice(idx, idx + q.length) + '</mark>' + text.slice(idx + q.length);
  }

  function snippet(text, q) {
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return text.slice(0, 60);
    const start = Math.max(0, idx - 25);
    const raw = (start > 0 ? '…' : '') + text.slice(start, idx + q.length + 35);
    return highlight(raw, q);
  }

  function runSearch(q) {
    const qLow = q.toLowerCase().trim();
    results.innerHTML = '';
    recentsEl.classList.add('hidden');
    emptyEl.classList.add('hidden');

    if (!qLow) { showRecents(); return; }

    let totalHits = 0;

    // People
    const peopleHits = peopleData.filter(p =>
      p.name.toLowerCase().includes(qLow) ||
      p.role.toLowerCase().includes(qLow) ||
      p.dept.toLowerCase().includes(qLow)
    );
    if (peopleHits.length) {
      totalHits += peopleHits.length;
      const grp = document.createElement('div');
      grp.innerHTML = '<div class="gs-group-label">PEOPLE</div>';
      peopleHits.forEach(p => {
        const el = makeItem('person', p.key,
          highlight(p.name, q),
          highlight(p.role, q),
          p.color, p.initials);
        el.querySelector('.gs-item-tag').textContent = 'Person';
        grp.appendChild(el);
      });
      results.appendChild(grp);
    }

    // Channels
    const chHits = Object.values(channelData).filter(ch =>
      ch.name.toLowerCase().includes(qLow) ||
      (ch.displayName || '').toLowerCase().includes(qLow)
    );
    if (chHits.length) {
      totalHits += chHits.length;
      const grp = document.createElement('div');
      grp.innerHTML = '<div class="gs-group-label">CHANNELS</div>';
      chHits.forEach(ch => {
        const el = makeItem('channel', ch.name,
          highlight('#' + ch.name, q),
          ch.members + ' members',
          '#0d8f82', '#');
        el.querySelector('.gs-item-tag').textContent = 'Channel';
        grp.appendChild(el);
      });
      results.appendChild(grp);
    }

    // DM messages
    const msgHits = [];
    Object.entries(dmData).forEach(([key, dm]) => {
      dm.messages.forEach(msg => {
        if (msg.text && msg.text.toLowerCase().includes(qLow)) {
          msgHits.push({ key, name: dm.name, color: dm.color, initials: dm.initials, text: msg.text });
        }
      });
    });
    // Channel messages
    Object.entries(channelData).forEach(([key, ch]) => {
      (ch.messages || []).forEach(msg => {
        if (msg.text && msg.text.toLowerCase().includes(qLow)) {
          msgHits.push({ key, name: '#' + key, color: '#0d8f82', initials: '#', text: msg.text, isChannel: true });
        }
      });
    });

    if (msgHits.length) {
      totalHits += msgHits.length;
      const grp = document.createElement('div');
      grp.innerHTML = '<div class="gs-group-label">MESSAGES</div>';
      msgHits.slice(0, 6).forEach(m => {
        const el = makeItem(m.isChannel ? 'channel' : 'dm', m.key,
          m.name,
          snippet(m.text, q),
          m.color, m.initials);
        el.querySelector('.gs-item-tag').textContent = 'Message';
        el.querySelector('.gs-item-meta').innerHTML = snippet(m.text, q);
        grp.appendChild(el);
      });
      results.appendChild(grp);
    }

    if (totalHits === 0) {
      emptyEl.classList.remove('hidden');
      document.getElementById('gsEmptyQuery').textContent = q;
      results.classList.add('hidden');
    } else {
      results.classList.remove('hidden');
    }
    gsIndex = -1;
    indexItems();
  }

  // ── item factory ──
  function makeItem(type, key, nameHtml, metaHtml, color, initials) {
    const div = document.createElement('div');
    div.className = 'gs-item';
    div.dataset.type = type;
    div.dataset.key  = key;

    const isChannel = type === 'channel';
    div.innerHTML = `
      <div class="gs-item-av ${isChannel ? 'gs-av-channel' : ''}" style="${isChannel ? '' : 'background:' + color}">${initials}</div>
      <div class="gs-item-body">
        <span class="gs-item-name">${nameHtml}</span>
        <span class="gs-item-meta">${metaHtml}</span>
      </div>
      <span class="gs-item-tag"></span>`;

    div.addEventListener('click', () => activateItem(div));
    return div;
  }

  // ── activate (open the result) ──
  function activateItem(el) {
    const type = el.dataset.type;
    const key  = el.dataset.key;
    closeGlobalSearch();
    if (type === 'person') {
      switchMiddleView('people');
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      document.querySelector('[data-tab="people"]')?.classList.add('active');
    } else if (type === 'channel') {
      loadChannelConversation(key);
      if (typeof isMobile === 'function' && isMobile()) mobOpenDetail();
    } else if (type === 'dm' || type === 'message') {
      switchMiddleView('dms');
      loadDmConversation(key);
      if (typeof isMobile === 'function' && isMobile()) mobOpenDetail();
    }
  }

  // ── keyboard navigation ──
  function indexItems() {
    gsItems = Array.from(overlay.querySelectorAll('.gs-item'));
  }

  function setActive(idx) {
    gsItems.forEach(el => el.classList.remove('gs-active'));
    if (idx >= 0 && idx < gsItems.length) {
      gsItems[idx].classList.add('gs-active');
      gsItems[idx].scrollIntoView({ block: 'nearest' });
    }
    gsIndex = idx;
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(gsIndex + 1, gsItems.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(Math.max(gsIndex - 1, 0)); }
    if (e.key === 'Enter' && gsIndex >= 0) { activateItem(gsItems[gsIndex]); }
  });

  input.addEventListener('input', function() { runSearch(this.value); });
})();

// ── EMPTY STATE / NEW USER VIEW ──
document.getElementById('emptyStateToggle').addEventListener('click', () => {
  _emptyStateOn = !_emptyStateOn;
  document.getElementById('homeContent').classList.toggle('hidden', _emptyStateOn);
  document.getElementById('homeEmpty').classList.toggle('hidden', !_emptyStateOn);
  document.getElementById('emptyStateToggle').classList.toggle('active', _emptyStateOn);
  document.getElementById('emptyStateToggle').innerHTML = _emptyStateOn
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg> Back to normal view`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/></svg> New user view`;
});

document.getElementById('ewbDismiss').addEventListener('click', () => {
  document.getElementById('ewbDismiss').closest('.empty-welcome-banner').style.display = 'none';
});

// Getting started step actions
document.getElementById('ostProfile').addEventListener('click',  () => openSettings('profile'));
document.getElementById('ostMessage').addEventListener('click',  () => navigateTo('dms'));
document.getElementById('ostAI').addEventListener('click',       () => navigateTo('home'));
document.getElementById('ostSchedule').addEventListener('click', () => {
  document.getElementById('scheduleBtn').click();
});

// Mark a step done when its action is triggered
function markOstepDone(id) {
  const step = document.getElementById(id);
  if (!step || step.classList.contains('done')) return;
  step.classList.add('done');
  step.querySelector('.ost-check').innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" fill="#16a34a"/><path d="M5.5 9L7.5 11L12.5 6.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const doneCount = document.querySelectorAll('#homeEmpty .onboarding-step.done').length;
  const label = document.getElementById('ostProgressLabel');
  if (label) label.textContent = `${doneCount} of 4 done`;
}

document.getElementById('ostProfile').addEventListener('click',  () => markOstepDone('ostep1'));
document.getElementById('ostMessage').addEventListener('click',  () => markOstepDone('ostep2'));
document.getElementById('ostAI').addEventListener('click',       () => markOstepDone('ostep3'));
document.getElementById('ostSchedule').addEventListener('click', () => markOstepDone('ostep4'));

document.getElementById('esNewDmBtn').addEventListener('click', e => {
  e.stopPropagation();
  const dd = document.getElementById('dmDropdown');
  const search = document.getElementById('ddmSearch');
  dd.classList.contains('hidden')
    ? openQuickDd(dd, e.currentTarget, () => { search.value = ''; search.dispatchEvent(new Event('input')); search.focus(); })
    : closeAllQuickDds();
});
document.getElementById('esNewChannelBtn').addEventListener('click', e => {
  e.stopPropagation();
  const dd = document.getElementById('channelDropdown');
  const nameInput = document.getElementById('qdChannelName');
  const publicBtn = document.getElementById('qdPublicBtn');
  const privateBtn = document.getElementById('qdPrivateBtn');
  dd.classList.contains('hidden')
    ? openQuickDd(dd, e.currentTarget, () => { nameInput.value = ''; publicBtn.classList.add('active'); privateBtn.classList.remove('active'); nameInput.focus(); })
    : closeAllQuickDds();
});
document.getElementById('esNewTaskBtn').addEventListener('click', e => {
  e.stopPropagation();
  const dd = document.getElementById('taskDropdown');
  const titleIn = document.getElementById('qdTaskTitle');
  dd.classList.contains('hidden')
    ? openQuickDd(dd, e.currentTarget, () => {
        titleIn.value = '';
        document.getElementById('qdTaskDue').value = '';
        document.querySelectorAll('#qdPriRow .qd-pill').forEach((p, i) => p.classList.toggle('qd-pill-active', i === 1));
        titleIn.focus();
      })
    : closeAllQuickDds();
});

// ── PAGE EMPTY STATE CTAs ──
document.getElementById('pesDmBtn').addEventListener('click', e => {
  e.stopPropagation();
  const dd = document.getElementById('dmDropdown');
  const search = document.getElementById('ddmSearch');
  dd.classList.contains('hidden')
    ? openQuickDd(dd, e.currentTarget, () => { search.value = ''; search.dispatchEvent(new Event('input')); search.focus(); })
    : closeAllQuickDds();
});
document.getElementById('pesTaskBtn').addEventListener('click', e => {
  e.stopPropagation();
  const dd = document.getElementById('taskDropdown');
  const titleIn = document.getElementById('qdTaskTitle');
  dd.classList.contains('hidden')
    ? openQuickDd(dd, e.currentTarget, () => {
        titleIn.value = '';
        document.getElementById('qdTaskDue').value = '';
        document.querySelectorAll('#qdPriRow .qd-pill').forEach((p, i) => p.classList.toggle('qd-pill-active', i === 1));
        titleIn.focus();
      })
    : closeAllQuickDds();
});
document.getElementById('pesPeopleBtn').addEventListener('click', () => openSettings('profile'));

// ── TASK LIST CLICKS ──
document.getElementById('tasksFullList').addEventListener('click', e => {
  const item = e.target.closest('.task-item[data-task-id]');
  if (item) loadTaskDetail(item.dataset.taskId);
});
document.getElementById('myTasksCard').addEventListener('click', e => {
  const item = e.target.closest('.task-item[data-task-id]');
  if (item) { switchMiddleView('tasks'); loadTaskDetail(item.dataset.taskId); }
});

// ── ADD SUBTASK ──
document.getElementById('addSubtaskInput').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const text = e.target.value.trim();
  if (!text) return;
  e.target.value = '';
  const t = taskData.find(x => x.id === activeTaskId);
  if (!t) return;
  const idx = t.subtasks.length;
  t.subtasks.push({ done: false, text });
  const stEl = document.getElementById('taskSubtasks');
  const el = document.createElement('div');
  el.className = 'subtask-item';
  el.dataset.subtask = idx;
  el.innerHTML = `<div class="subtask-check"></div><span class="subtask-text">${text}</span>`;
  el.addEventListener('click', () => {
    t.subtasks[idx].done = !t.subtasks[idx].done;
    el.classList.toggle('done', t.subtasks[idx].done);
  });
  stEl.appendChild(el);
});

// ── DM LIST CLICKS ──
document.getElementById('dmList').addEventListener('click', e => {
  const item = e.target.closest('.dm-item');
  if (item) loadDmConversation(item.dataset.dm);
});

// ── DM SEARCH / FILTER / SORT ──
document.getElementById('dmSearch').addEventListener('input', renderDmList);

// Quick filter pills
document.getElementById('dmQuickFilters').addEventListener('click', e => {
  const pill = e.target.closest('.dm-qf-pill');
  if (!pill) return;
  document.querySelectorAll('.dm-qf-pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  _dmFilterMode = 'all';
  document.getElementById('dmSearchMode')?.classList.add('hidden');
  document.getElementById('dmActiveFilter')?.classList.add('hidden');
  document.getElementById('dmSearch').placeholder = 'Search conversations…';
  document.getElementById('dmFilterBtn')?.classList.remove('active');
  renderDmList();
});

// Clear active filter
document.getElementById('dmAfClear').addEventListener('click', () => {
  setDmFilterMode('all', '');
  document.querySelectorAll('.dm-qf-pill').forEach(p => p.classList.toggle('active', p.dataset.qf === 'all'));
});

// Filter button → open Image #8-style dropdown
document.getElementById('dmFilterBtn').addEventListener('click', e => {
  e.stopPropagation();
  const dd = document.getElementById('dmFilterDd');
  const rect = e.currentTarget.getBoundingClientRect();
  dd.style.top = (rect.bottom + 6) + 'px';
  dd.style.left = rect.left + 'px';
  // Sync active state
  dd.querySelectorAll('.dfd-opt').forEach(opt => opt.classList.toggle('active', opt.dataset.fmode === _dmFilterMode));
  dd.classList.remove('hidden');
  document.getElementById('dmFilterSearch').value = '';
  document.getElementById('dmFilterSearch').focus();
  setTimeout(() => document.addEventListener('click', () => dd.classList.add('hidden'), { once: true }), 0);
});

// Filter search (search within the filter options list)
document.getElementById('dmFilterSearch').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('.dfd-opt').forEach(opt => {
    opt.style.display = opt.querySelector('span').textContent.toLowerCase().includes(q) ? '' : 'none';
  });
});
document.getElementById('dmFilterSearch').addEventListener('click', e => e.stopPropagation());

// Filter option selection
document.getElementById('dmFilterDd').addEventListener('click', e => {
  const opt = e.target.closest('.dfd-opt');
  if (!opt) return;
  e.stopPropagation();
  const mode = opt.dataset.fmode;
  const label = opt.querySelector('span').textContent;
  document.getElementById('dmFilterDd').classList.add('hidden');
  document.querySelectorAll('.dfd-opt').forEach(o => o.classList.toggle('active', o.dataset.fmode === mode));
  setDmFilterMode(mode, label);
});

// Sort button
document.getElementById('dmSortBtn').addEventListener('click', e => {
  e.stopPropagation();
  const dd = document.getElementById('dmSortDd');
  const rect = e.currentTarget.getBoundingClientRect();
  dd.style.top = (rect.bottom + 6) + 'px';
  dd.style.left = rect.left + 'px';
  dd.querySelectorAll('.dsd-opt').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.sort === _dmSort);
    opt.onclick = ev => {
      ev.stopPropagation();
      _dmSort = opt.dataset.sort;
      document.getElementById('dmSortLabel').textContent = { newest: 'Newest', oldest: 'Oldest', az: 'A–Z' }[_dmSort];
      document.getElementById('dmSortBtn').classList.toggle('active', _dmSort !== 'newest');
      dd.classList.add('hidden');
      renderDmList();
    };
  });
  dd.classList.remove('hidden');
  setTimeout(() => document.addEventListener('click', () => dd.classList.add('hidden'), { once: true }), 0);
});

renderDmList();

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
  if (!input.value.trim()) {
    startDmRecording();
    return;
  }
  sendDmMessage(input.value);
  input.value = '';
  syncSendBtn(input, document.getElementById('dmSendBtn'));
});

document.getElementById('dmRecCancel').addEventListener('click', () => stopDmRecording(false));
document.getElementById('dmRecSend').addEventListener('click',   () => stopDmRecording(true));
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
  const keys = new Set(Array.isArray(preselectedKey) ? preselectedKey : (preselectedKey ? [preselectedKey] : []));
  container.innerHTML = peopleData.map(p => `
    <div class="sd-person${keys.has(p.key) ? ' selected' : ''}" data-person-key="${p.key}">
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

function getSelectedPeopleKeys(containerId) {
  return [...document.querySelectorAll(`#${containerId} .sd-person.selected`)]
    .map(el => el.dataset.personKey)
    .filter(k => peopleData.some(p => p.key === k));
}

function getSelectedPeopleNames(containerId) {
  const names = getSelectedPeopleKeys(containerId).map(k => peopleData.find(p => p.key === k).name);
  return names.join(', ') || null;
}

function meetingIsPast(m) {
  const [h, min] = (m.time || '00:00').split(':').map(Number);
  const end = new Date(`${m.date}T00:00:00`);
  end.setHours(h || 0, (min || 0) + (Number(m.dur) || 30), 0, 0);
  return end.getTime() < Date.now();
}

function parseDurMinutes(dur) {
  const n = parseInt(String(dur).replace(/[^0-9]/g, ''), 10);
  if (!n) return 30;
  if (String(dur).includes('hour')) return n * 60;
  return n;
}

function placeMeeting(fields) {
  let m = fields.id ? meetingsData.find(x => x.id === fields.id) : null;
  if (!m) {
    m = { id: 'm' + Date.now() + Math.random().toString(36).slice(2, 6) };
    meetingsData.push(m);
  }
  const date = /^\d{4}-\d{2}-\d{2}$/.test(fields.date) ? fields.date : mvSelected;
  const time = /^\d{2}:\d{2}/.test(fields.time || '') ? fields.time.slice(0, 5) : '10:00';
  Object.assign(m, {
    title: fields.title,
    date,
    time,
    dur: Number(fields.dur) || 30,
    type: fields.type || 'video',
    participants: fields.participants || [],
    notes: fields.notes || m.notes || '',
    repeat: fields.repeat || m.repeat,
  });
  m.status = meetingIsPast(m) ? 'past' : 'upcoming';
  mvYear = Number(date.slice(0, 4));
  mvMonth = Number(date.slice(5, 7)) - 1;
  mvSelected = date;
  activeMeetingId = m.id;
  navigateTo('meetings');
  return m;
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
  const badge = document.getElementById('scheduleDetailBadge');
  if (badge) badge.textContent = s.status || 'Scheduled';
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
let callHeld = false;
let callRecording = false;
let callSpeakerOn = true;
let _moreSurface = null;

function _fmtClock(n, padMin) {
  const m = Math.floor(n / 60);
  const s = String(n % 60).padStart(2, '0');
  return padMin ? String(m).padStart(2, '0') + ':' + s : m + ':' + s;
}
function _paintTimers() {
  const c = document.getElementById('csTimer');
  const m = document.getElementById('cmTimer');
  if (c) c.textContent = _fmtClock(callSeconds, true);
  if (m) m.textContent = _fmtClock(callSeconds, false);
}
function _stopCallTimer() {
  clearInterval(callTimerInterval);
  callTimerInterval = null;
  clearInterval(csTimerInterval);
  csTimerInterval = null;
}
function _startCallTimer() {
  if (callHeld || callTimerInterval) return;
  _stopCallTimer();
  callTimerInterval = setInterval(() => {
    callSeconds++;
    _paintTimers();
  }, 1000);
  _paintTimers();
}
function _resetCallFlags() {
  callMuted = false;
  vcMuted = false;
  callHeld = false;
  callRecording = false;
  callSpeakerOn = true;
  callSeconds = 0;
  _stopCallTimer();
}
function _paintCallStatus() {
  const ringing = callParticipants.length > 0 && callParticipants.some(p => !p.joined);
  const live = callParticipants.some(p => p.joined);
  const label = _shareNotice || (callHeld ? 'On hold' : (ringing ? 'Ringing…' : ''));
  const statusEl = document.getElementById('csStatus');
  const timerEl = document.getElementById('csTimer');
  const sub = document.getElementById('csCallerSub');
  if (statusEl) {
    statusEl.textContent = label;
    statusEl.classList.toggle('hidden', !label);
  }
  if (timerEl) timerEl.classList.toggle('hidden', !live && !callHeld && ringing);
  if (sub) sub.textContent = label;
  const cm = document.getElementById('cmStatus');
  if (cm) {
    cm.textContent = callHeld ? 'On hold' : (ringing ? 'Ringing…' : 'Connected');
    cm.style.color = callHeld ? '#f6c453' : (ringing ? 'rgba(255,255,255,.55)' : '#4ade80');
  }
  document.getElementById('callScreen').classList.toggle('on-hold', callHeld);
  document.getElementById('callMini').classList.toggle('on-hold', callHeld);
  document.getElementById('csRec').classList.toggle('hidden', !callRecording);
}
const CALL_SVG = {
  mic: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`,
  micOff: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`,
  video: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>`,
  videoOff: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196"/><path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/><path d="m2 2 20 20"/></svg>`,
  speaker: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>`,
  speakerOff: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 9a5 5 0 0 1 .95 2.293"/><path d="M19.364 5.636a9 9 0 0 1 1.889 9.96"/><path d="m2 2 20 20"/><path d="m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11"/><path d="M9.828 4.172A.686.686 0 0 1 11 4.657v.686"/></svg>`
};
function _putCallIcon(el, svg) {
  const old = el && el.querySelector('svg');
  if (old) old.outerHTML = svg;
}
function _syncCallChrome() {
  vcMuted = callMuted;
  document.getElementById('csMuteBtn').querySelector('.cs-ctl-icon').classList.toggle('cs-ctl-icon-active', callMuted);
  document.getElementById('cmMuteBtn').classList.toggle('muted', callMuted);
  _putCallIcon(document.getElementById('csMuteBtn'), callMuted ? CALL_SVG.micOff : CALL_SVG.mic);
  _putCallIcon(document.getElementById('cmMuteBtn'), callMuted ? CALL_SVG.micOff : CALL_SVG.mic);
  const camOn = !!vcCameraOn;
  document.getElementById('csCameraBtn').querySelector('.cs-ctl-icon').classList.toggle('cs-ctl-icon-blue', camOn);
  document.getElementById('cmVideoBtn').classList.toggle('cam-on', camOn);
  _putCallIcon(document.getElementById('csCameraBtn'), camOn ? CALL_SVG.video : CALL_SVG.videoOff);
  _putCallIcon(document.getElementById('cmVideoBtn'), camOn ? CALL_SVG.video : CALL_SVG.videoOff);
  const spkIcon = document.getElementById('csSpeakerBtn').querySelector('.cs-ctl-icon');
  spkIcon.classList.toggle('cs-ctl-icon-active', !callSpeakerOn);
  _putCallIcon(spkIcon, callSpeakerOn ? CALL_SVG.speaker : CALL_SVG.speakerOff);
  document.getElementById('csSpeakerLabel').textContent = callSpeakerOn ? 'Audio' : 'Off';
  const sharing = !!screenShareStream;
  const shareIcon = document.getElementById('csShareBtn').querySelector('.cs-ctl-icon');
  shareIcon.classList.toggle('cs-ctl-icon-blue', sharing);
  document.getElementById('csShareLabel').textContent = sharing ? 'Stop' : 'Share';
  document.getElementById('csShareBtn').title = sharing ? 'Stop sharing' : 'Share screen';
  const addOpen = !document.getElementById('csAddPanel').classList.contains('hidden');
  document.getElementById('csAddBtn').classList.toggle('is-open', addOpen);
  document.getElementById('csAddCallerBtn').classList.toggle('is-open', addOpen);
  const moreOpen = !!_moreSurface && !document.getElementById('callMoreMenu').classList.contains('hidden');
  document.getElementById('csMoreBtn').classList.toggle('is-open', moreOpen && _moreSurface === 'screen');
  _syncSelfTile();
  _paintCallStatus();
  if (moreOpen) _renderMoreMenu();
}

// Direct calls open in the compact call card (same pattern as a minimized call).
function startCall(personKey) {
  endCall();
  const p = peopleData.find(x => x.key === personKey) || dmData[personKey];
  if (!p) return;
  startCallWith(p.name, '', p.color || '#7c3aed', p.initials || '??', false);
  minimizeCallScreen();
}

function endCall() {
  _stopCallTimer();
  stopScreenShare(true);
  stopVideoStream();
  _shareNotice = '';
  clearTimeout(_shareNoticeTimer);
  _resetCallFlags();
  csCallState = null;
  _closeMore();
  _resetCallParticipants();
  _hideCallScreen();
  document.getElementById('callMini').classList.add('hidden');
  document.getElementById('callMini').classList.remove('on-hold');
  document.getElementById('csAddPanel').classList.add('hidden');
  if (typeof hideDialPad === 'function') hideDialPad();
  _paintTimers();
  callMuted = false;
  vcMuted = false;
  callHeld = false;
  callRecording = false;
  callSpeakerOn = true;
  _syncCallChrome();
}



function toggleMute() {
  callMuted = !callMuted;
  vcMuted = callMuted;
  if (vcStream) vcStream.getAudioTracks().forEach(t => { t.enabled = !callMuted; });
  _syncCallChrome();
}
function toggleHold() {
  callHeld = !callHeld;
  if (callHeld) {
    _stopCallTimer();
    document.querySelectorAll('.cs-gtile.speaking').forEach(t => t.classList.remove('speaking'));
  } else if (callParticipants.some(p => p.joined)) {
    _startCallTimer();
  }
  _syncCallChrome();
  _closeMore();
}
function toggleRecord() {
  callRecording = !callRecording;
  _syncCallChrome();
  _closeMore();
}
function toggleKeypad() {
  const pad = document.getElementById('dialPad');
  if (pad.classList.contains('hidden')) {
    if (typeof showDialPad === 'function') showDialPad();
  } else   if (typeof hideDialPad === 'function') hideDialPad();
  _syncCallChrome();
}
function toggleSpeaker() {
  callSpeakerOn = !callSpeakerOn;
  _syncCallChrome();
  _closeMore();
}
function toggleCamera() {
  const screen = document.getElementById('callScreen');
  const isVideo = screen.classList.contains('video-mode');
  if (!isVideo) {
    const p = callParticipants[0];
    const av = document.getElementById('csAvatar');
    setVideoMode(true, p?.color || av.style.background, p?.initials || av.textContent, p?.name || document.getElementById('csName').textContent);
    return;
  }
  if (vcStream) {
    const vTrack = vcStream.getVideoTracks()[0];
    if (vTrack) {
      vTrack.enabled = !vTrack.enabled;
      vcCameraOn = vTrack.enabled;
      document.getElementById('csSelfFallback').classList.toggle('hidden', vcCameraOn);
      _syncCallChrome();
      return;
    }
  }
  setVideoMode(false);
}
function _closeMore() {
  _moreSurface = null;
  const menu = document.getElementById('callMoreMenu');
  if (menu) menu.classList.add('hidden');
  document.getElementById('csMoreBtn')?.classList.remove('is-open');
}
function _renderMoreMenu() {
  const menu = document.getElementById('callMoreMenu');
  const padOpen = !document.getElementById('dialPad').classList.contains('hidden');
  const items = [
    { id: 'hold', label: callHeld ? 'Resume' : 'Hold', on: callHeld },
    { id: 'record', label: callRecording ? 'Stop recording' : 'Record', on: callRecording },
    { id: 'keypad', label: 'Keypad', on: padOpen },
  ];
  menu.innerHTML = items.map(it =>
    `<button type="button" class="call-more-item${it.on ? ' active' : ''}" data-act="${it.id}">${it.label}</button>`
  ).join('');
}
function openCallMore(e, surface) {
  e.stopPropagation();
  const menu = document.getElementById('callMoreMenu');
  if (_moreSurface === surface && !menu.classList.contains('hidden')) { _closeMore(); return; }
  _moreSurface = surface;
  _renderMoreMenu();
  const r = e.currentTarget.getBoundingClientRect();
  menu.classList.remove('hidden');
  menu.style.left = Math.max(8, r.left + r.width / 2 - 84) + 'px';
  menu.style.top = Math.max(8, r.top - menu.offsetHeight - 8) + 'px';
  document.getElementById('csMoreBtn').classList.toggle('is-open', surface === 'screen');
}
document.getElementById('callMoreMenu').addEventListener('click', e => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  e.stopPropagation();
  if (btn.dataset.act === 'hold') toggleHold();
  else if (btn.dataset.act === 'record') toggleRecord();
  else if (btn.dataset.act === 'keypad') toggleKeypad();
});
document.addEventListener('click', e => {
  if (e.target.closest('#callMoreMenu') || e.target.closest('#csMoreBtn')) return;
  _closeMore();
});


// Call from DM header (event delegation)
document.getElementById('dmView').addEventListener('click', e => {
  const dm = dmData[activeDm];
  const video = !!e.target.closest('.dm-header-btn[title="Video call"]');
  if (!video && !e.target.closest('.dm-header-btn[title="Call"]')) return;
  if (dm && dm.isGroup) startGroupCall(dm.members, video, dm.name);
  else if (video) startGroupCall([activeDm], true);
  else startCall(activeDm);
});

// Call from channel header
document.getElementById('channelView').addEventListener('click', e => {
  const video = !!e.target.closest('.dm-header-btn[title="Video call"]');
  if (!video && !e.target.closest('.dm-header-btn[title="Call"]')) return;
  const ch = channelData[activeChannel];
  const members = channelMembers[activeChannel] || [];
  if (members.length) startGroupCall(members, video, ch ? ch.displayName : null);
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
  const btns = ['quickNewDmBtn','quickChannelBtn','scheduleBtn','taskBtn','quickCallBtn','esNewDmBtn','esNewChannelBtn','esNewTaskBtn','pesDmBtn','pesTaskBtn','dmListNewBtn'];
  const clickedOutside = dds.every(id => !document.getElementById(id).contains(e.target));
  const clickedTrigger = btns.some(id => { const el = document.getElementById(id); return el && el.contains(e.target); });
  if (clickedOutside && !clickedTrigger) closeAllQuickDds();
});

// ── DM DROPDOWN ──
(function() {
  const btn    = document.getElementById('quickNewDmBtn');
  const dd     = document.getElementById('dmDropdown');
  const search = document.getElementById('ddmSearch');
  const tabDirect  = document.getElementById('ddmTabDirect');
  const tabGroup   = document.getElementById('ddmTabGroup');
  const directSec  = document.getElementById('ddmDirectSection');
  const groupSec   = document.getElementById('ddmGroupSection');
  const groupNameIn = document.getElementById('ddmGroupName');
  const createBtn  = document.getElementById('ddmGroupCreate');
  const chipsRow   = document.getElementById('ddmSelectedChips');

  let selectedKeys = new Set();

  function switchTab(tab) {
    const isDirect = tab === 'direct';
    tabDirect.classList.toggle('active', isDirect);
    tabGroup.classList.toggle('active', !isDirect);
    directSec.classList.toggle('hidden', !isDirect);
    groupSec.classList.toggle('hidden', isDirect);
    if (!isDirect) {
      selectedKeys.clear();
      updateGroupUI();
      groupNameIn.value = '';
    } else {
      search.focus();
    }
  }

  tabDirect.addEventListener('click', e => { e.stopPropagation(); switchTab('direct'); });
  tabGroup.addEventListener('click',  e => { e.stopPropagation(); switchTab('group'); });

  window.openDmDropdown = function(triggerEl) {
    if (!dd.classList.contains('hidden')) { closeAllQuickDds(); return; }
    openQuickDd(dd, triggerEl || btn, () => { switchTab('direct'); search.value = ''; filterDdm(''); search.focus(); });
  };

  btn.addEventListener('click', e => {
    e.stopPropagation();
    window.openDmDropdown(btn);
  });

  // Direct tab — search filter
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

  // Group tab — multi-select
  function updateGroupUI() {
    // checkmarks
    document.querySelectorAll('.qd-grp-item').forEach(item => {
      item.classList.toggle('selected', selectedKeys.has(item.dataset.key));
    });
    // chips
    if (selectedKeys.size > 0) {
      chipsRow.classList.remove('hidden');
      chipsRow.innerHTML = [...selectedKeys].map(k => {
        const el = document.querySelector(`.qd-grp-item[data-key="${k}"]`);
        const color = el?.dataset.color || '#999';
        const initials = el?.dataset.initials || k[0].toUpperCase();
        const name = el?.dataset.name || k;
        return `<div class="qd-grp-chip">
          <div class="qd-grp-chip-av" style="background:${color}">${initials.charAt(0)}</div>
          ${name.split(' ')[0]}
        </div>`;
      }).join('');
    } else {
      chipsRow.classList.add('hidden');
    }
    createBtn.disabled = selectedKeys.size < 2;
  }

  document.querySelectorAll('.qd-grp-item').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      const key = item.dataset.key;
      selectedKeys.has(key) ? selectedKeys.delete(key) : selectedKeys.add(key);
      updateGroupUI();
    });
  });

  createBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (selectedKeys.size < 2) return;

    const members = [...selectedKeys].map(k => {
      const el = document.querySelector(`.qd-grp-item[data-key="${k}"]`);
      return { key: k, name: el.dataset.name, color: el.dataset.color, initials: el.dataset.initials };
    });

    const autoName = members.map(m => m.name.split(' ')[0]).join(', ');
    const groupName = groupNameIn.value.trim() || autoName;
    const groupKey  = 'group-' + Date.now();

    dmData[groupKey] = {
      name: groupName,
      isGroup: true,
      members,
      color: members[0].color,
      initials: groupName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      online: false, unread: 0,
      messages: []
    };

    closeAllQuickDds();
    switchMiddleView('dms');
    renderDmList();
    loadDmConversation(groupKey);
    if (isMobile()) mobOpenDetail();
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
let screenShareStream = null;
let _shareNotice = '';
let _shareNoticeTimer = null;

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

async function startVideoStream() {
  vcCameraOn = true;
  try {
    vcStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const localEl = document.getElementById('localVideo');
    localEl.srcObject = vcStream;
    document.getElementById('csSelfFallback').classList.add('hidden');
    vcCameraOn = true;
    if (callMuted) vcStream.getAudioTracks().forEach(t => { t.enabled = false; });
    _syncCallChrome();

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
    _syncCallChrome();
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
}

function _showShareNotice(text) {
  _shareNotice = text;
  clearTimeout(_shareNoticeTimer);
  _paintCallStatus();
  _shareNoticeTimer = setTimeout(() => {
    _shareNotice = '';
    _paintCallStatus();
  }, 3500);
}

function _syncShareTile() {
  const screen = document.getElementById('callScreen');
  const group = screen.classList.contains('group-call');
  const stage = document.getElementById('csShareStage');
  const stageVideo = document.getElementById('csShareVideo');
  if (screenShareStream && !group) {
    stage.classList.remove('hidden');
    if (stageVideo.srcObject !== screenShareStream) stageVideo.srcObject = screenShareStream;
  } else {
    stage.classList.add('hidden');
    stageVideo.srcObject = null;
  }
  const grid = document.getElementById('csGroupGrid');
  let tile = document.getElementById('csShareTile');
  if (screenShareStream && group && grid) {
    if (!tile) {
      tile = document.createElement('div');
      tile.id = 'csShareTile';
      tile.className = 'cs-gtile cs-gtile-share';
      tile.innerHTML = '<video id="csShareTileVideo" autoplay playsinline></video><span class="cs-share-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>Presenting</span><div class="cs-gtile-name">Your screen</div>';
      grid.appendChild(tile);
    }
    const v = tile.querySelector('video');
    if (v && v.srcObject !== screenShareStream) v.srcObject = screenShareStream;
    _sizeCallGrid();
  } else if (tile) {
    tile.remove();
    _sizeCallGrid();
  }
  _paintPresenting();
}

function _paintPresenting() {
  const on = !!screenShareStream;
  document.getElementById('csPresentBar').classList.toggle('hidden', !on);
  document.getElementById('cmPresentTag').classList.toggle('hidden', !on);
  document.getElementById('callMini').classList.toggle('presenting', on);
  document.querySelector('#csGroupGrid .cs-gtile.self')?.classList.toggle('presenting', on);
}
document.getElementById('csStopPresent').addEventListener('click', e => {
  e.stopPropagation();
  stopScreenShare();
});

function stopScreenShare(silent) {
  const stream = screenShareStream;
  screenShareStream = null;
  if (stream) stream.getTracks().forEach(t => t.stop());
  _syncShareTile();
  if (!silent) _syncCallChrome();
}

async function toggleScreenShare() {
  _closeMore();
  if (screenShareStream) {
    stopScreenShare();
    return;
  }
  let stream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
  } catch (_) {
    _showShareNotice('Screen share unavailable');
    return;
  }
  screenShareStream = stream;
  const track = stream.getVideoTracks()[0];
  if (track) {
    track.addEventListener('ended', () => {
      if (!screenShareStream || !screenShareStream.getTracks().includes(track)) return;
      screenShareStream = null;
      _syncShareTile();
      _syncCallChrome();
    });
  }
  const screen = document.getElementById('callScreen');
  if (screen.classList.contains('hidden')) {
    expandMiniCall();
  }
  _syncShareTile();
  _syncCallChrome();
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

function startCallWith(name, role, color, initials, video = false, startSecs = null) {
  _stopCallTimer();
  _closeMore();
  if (startSecs == null) {
    callMuted = false;
    vcMuted = false;
    callHeld = false;
    callRecording = false;
    callSpeakerOn = true;
    callSeconds = 0;
  }
  _resetCallParticipants();
  // Find person key for participant tracking
  const pd = peopleData.find(p => p.name === name);
  const already = startSecs != null;
  callParticipants = [{ key: pd ? pd.key : name, name, color, initials, joined: already }];
  callSeconds = startSecs || 0;
  const nameBar = document.getElementById('csTileNameBar');
  if (nameBar) nameBar.textContent = name;

  // Set dynamic accent colour (gradient + avatar glow)
  const screen = document.getElementById('callScreen');
  try { screen.style.setProperty('--call-rgb', hexToRgb(color)); } catch (_) {}

  const av = document.getElementById('csAvatar');
  av.textContent = initials;
  av.style.background = color;
  document.getElementById('csName').textContent = name;
  document.getElementById('csCallerName').textContent = name;
  screen.classList.remove('hidden');
  document.getElementById('callMini').classList.add('hidden');
  setVideoMode(video, color, initials, name);
  renderCallLayout();
  if (already) _startCallTimer();
  else _joinAfter(callParticipants[0], 2000);
  _paintTimers();
  _syncCallChrome();
}

function setVideoMode(on, color, initials, name) {
  const screen = document.getElementById('callScreen');
  const grid   = document.getElementById('csVideoGrid');
  const camIcon = document.getElementById('csCameraBtn').querySelector('.cs-ctl-icon');

  screen.classList.toggle('video-mode', on);
  grid.classList.toggle('hidden', !on);
  camIcon.classList.remove('cs-ctl-icon-blue');

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
  _syncSelfTile();
  _syncCallChrome();
}

// ── MULTI-PARTICIPANT CALLS ──
let callParticipants = [];
let callTitle = null;           // explicit group/meeting name; null = derived from participants
let _speakerInterval = null;
let callView = 'gallery';       // 'gallery' | 'speaker'
let callPinnedKey = null;
let callStageKey = null;        // last active speaker shown on the main stage
let myHandRaised = false;

const MIC_OFF_ICON = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`;

function _callLabel() {
  if (callTitle) return callTitle;
  const names = callParticipants.map(p => p.name.split(' ')[0]);
  if (names.length <= 1) return callParticipants[0]?.name || '';
  if (names.length <= 3) return names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1];
  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
}

function startGroupCall(people, video = false, title = null) {
  const list = people
    .map(x => typeof x === 'string' ? (peopleData.find(p => p.key === x) || dmData[x]) : x)
    .filter(Boolean)
    .map(p => ({ key: p.key, name: p.name, color: p.color, initials: p.initials }));
  if (!list.length) return;
  if (list.length === 1 && !title) {
    const p = list[0];
    return startCallWith(p.name, '', p.color, p.initials, video);
  }
  startCallWith(list[0].name, '', list[0].color, list[0].initials, video);
  callTitle = title;
  callParticipants = list.map(p => ({ ...p, joined: false }));
  callParticipants.forEach((p, i) => _joinAfter(p, 1400 + i * 700));
  renderCallLayout();
}

function _joinAfter(person, ms) {
  setTimeout(() => {
    if (!callParticipants.includes(person)) return;
    person.joined = true;
    const tile = document.querySelector(`.cs-gtile[data-key="${person.key}"]`);
    if (tile) tile.classList.remove('ringing');
    if (!callHeld) _startCallTimer();
    _paintCallStatus();
  }, ms);
}

function _applyOneToOne(p) {
  const screen = document.getElementById('callScreen');
  try { screen.style.setProperty('--call-rgb', hexToRgb(p.color)); } catch (_) {}
  const av = document.getElementById('csAvatar');
  av.textContent = p.initials;
  av.style.background = p.color;
  document.getElementById('csCallerName').textContent = p.name;
  const va = document.getElementById('csVideoAvatar');
  va.textContent = p.initials;
  va.style.background = p.color;
  document.getElementById('csVideoName').textContent = p.name;
  document.getElementById('csTileNameBar').textContent = p.name;
}

function renderCallLayout() {
  const screen = document.getElementById('callScreen');
  const grid = document.getElementById('csGroupGrid');
  const countEl = document.getElementById('csCount');
  const isGroup = callParticipants.length > 1 || (callTitle && callParticipants.length > 0);

  screen.classList.toggle('group-call', !!isGroup);
  grid.classList.toggle('hidden', !isGroup);
  document.getElementById('csName').textContent = _callLabel();
  countEl.classList.toggle('hidden', !isGroup);
  countEl.textContent = `· ${callParticipants.length + 1} people`;
  document.getElementById('csViewBtn').classList.toggle('hidden', !isGroup);

  if (!isGroup) {
    clearInterval(_speakerInterval);
    grid.innerHTML = '';
    _applyCallView();
    if (callParticipants[0]) _applyOneToOne(callParticipants[0]);
    _syncShareTile();
    _paintCallStatus();
    return;
  }

  const first = callParticipants[0];
  const av = document.getElementById('csAvatar');
  av.textContent = first.initials;
  av.style.background = first.color;

  const myName = userEmail ? userEmail.split('@')[0] : 'You';
  const myInitials = userEmail ? myName.slice(0, 2).toUpperCase() : 'ME';
  const isVideo = screen.classList.contains('video-mode');
  grid.innerHTML = callParticipants.map(p => `
    <div class="cs-gtile${p.joined ? '' : ' ringing'}" data-key="${p.key}" title="Pin to main screen" style="--tile-rgb:${hexToRgb(p.color)}">
      <div class="cs-gtile-av" style="background:${p.color}">${p.initials}</div>
      <span class="cs-gtile-status">Ringing…</span>
      <div class="cs-gtile-name">${p.name}</div>
      <button class="cs-gtile-remove" title="Remove from call" data-remove="${p.key}">
        <svg width="10" height="10" viewBox="0 0 8 8" fill="none"><path d="M1 1L7 7M7 1L1 7" stroke="white" stroke-width="1.4" stroke-linecap="round"/></svg>
      </button>
    </div>`).join('') + `
    <div class="cs-gtile self${screenShareStream ? ' presenting' : ''}${vcMuted ? ' muted' : ''}${isVideo && vcCameraOn ? '' : ' cam-off'}${myHandRaised ? ' hand' : ''}" data-key="self" title="Pin to main screen" style="--tile-rgb:246, 196, 83">
      <span class="cs-gtile-hand">✋</span>
      <video id="csGroupSelfVideo" autoplay muted playsinline></video>
      <div class="cs-gtile-av cs-gtile-av-self">${myInitials}</div>
      <div class="cs-gtile-name"><span class="cs-gtile-mic">${MIC_OFF_ICON}</span><span class="cs-gtile-presenting" title="Presenting"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg></span>You</div>
    </div>`;
  _attachGroupSelfVideo();
  _syncShareTile();
  _paintCallStatus();
  _applyCallView();
  _sizeCallGrid();
  requestAnimationFrame(_sizeCallGrid);

  clearInterval(_speakerInterval);
  _speakerInterval = setInterval(() => {
    const tiles = [...grid.querySelectorAll('.cs-gtile:not(.self):not(.ringing)')];
    grid.querySelectorAll('.cs-gtile.speaking').forEach(t => t.classList.remove('speaking'));
    let speaker = null;
    if (!callHeld && tiles.length && Math.random() > 0.2) {
      speaker = tiles[Math.floor(Math.random() * tiles.length)];
      speaker.classList.add('speaking');
      callStageKey = speaker.dataset.key;
      if (Math.random() < 0.12) _showReaction(['👍', '👏', '😂', '❤️'][Math.floor(Math.random() * 4)], callStageKey);
    }
    _renderStage();
    _paintMini();
  }, 1800);
}

// ── SPEAKER VIEW ──
function _stagePerson() {
  const key = callPinnedKey || callStageKey || (callParticipants.find(p => p.joined) || callParticipants[0])?.key;
  if (key === 'self') return { key: 'self', self: true, name: 'You', initials: (userEmail ? userEmail.split('@')[0].slice(0, 2).toUpperCase() : 'ME') };
  return callParticipants.find(p => p.key === key) || callParticipants[0];
}

function _applyCallView() {
  const screen = document.getElementById('callScreen');
  const isGroup = screen.classList.contains('group-call');
  const speaker = isGroup && callView === 'speaker';
  screen.classList.toggle('speaker-view', speaker);
  document.getElementById('csStage').classList.toggle('hidden', !speaker);
  const btn = document.getElementById('csViewBtn');
  btn.classList.toggle('is-speaker', speaker);
  btn.title = speaker ? 'Switch to gallery view' : 'Switch to speaker view';
  btn.querySelector('.cs-view-label').textContent = speaker ? 'Gallery' : 'Speaker';
  const grid = document.getElementById('csGroupGrid');
  if (speaker) grid.style.gridTemplateColumns = '';
  _renderStage();
  if (!speaker) _sizeCallGrid();
}

function _renderStage() {
  const stage = document.getElementById('csStage');
  const grid = document.getElementById('csGroupGrid');
  if (!document.getElementById('callScreen').classList.contains('speaker-view')) {
    grid.querySelectorAll('.on-stage').forEach(t => t.classList.remove('on-stage'));
    return;
  }
  const p = _stagePerson();
  if (!p) return;
  grid.querySelectorAll('.cs-gtile').forEach(t => t.classList.toggle('on-stage', t.dataset.key === p.key));
  const src = grid.querySelector(`.cs-gtile[data-key="${p.key}"]`);
  const speaking = !!src?.classList.contains('speaking');
  if (stage.dataset.key !== p.key || stage.dataset.pinned !== String(!!callPinnedKey)) {
    stage.dataset.key = p.key;
    stage.dataset.pinned = String(!!callPinnedKey);
    const showVideo = p.self && document.getElementById('callScreen').classList.contains('video-mode') && vcCameraOn && vcStream;
    stage.innerHTML = `
      ${showVideo ? '<video id="csStageVideo" autoplay muted playsinline></video>' : ''}
      <div class="cs-stage-av" style="${p.self ? 'background:var(--amber);color:var(--maroon-dark)' : `background:${p.color}`}">${p.initials}</div>
      <div class="cs-gtile-name">${callPinnedKey ? '<span class="cs-pin">📌</span>' : ''}${p.self ? 'You' : p.name}</div>
      <span class="cs-gtile-hand">✋</span>
      ${callPinnedKey ? '<button type="button" class="cs-stage-unpin" id="csUnpin">Unpin</button>' : ''}`;
    if (showVideo) document.getElementById('csStageVideo').srcObject = vcStream;
  }
  stage.classList.toggle('speaking', speaking);
  stage.classList.toggle('ringing', !!src?.classList.contains('ringing'));
  stage.classList.toggle('hand', !!p.self && myHandRaised);
  stage.classList.toggle('has-video', !!stage.querySelector('video'));
}

function setCallView(view) {
  callView = view;
  if (view === 'gallery') callPinnedKey = null;
  document.getElementById('csStage').dataset.key = '';
  _applyCallView();
}
document.getElementById('csViewBtn').addEventListener('click', e => {
  e.stopPropagation();
  setCallView(callView === 'speaker' ? 'gallery' : 'speaker');
});
document.getElementById('csStage').addEventListener('click', e => {
  if (!e.target.closest('#csUnpin')) return;
  e.stopPropagation();
  callPinnedKey = null;
  _renderStage();
});

// ── REACTIONS ──
function _showReaction(emoji, key) {
  const layer = document.getElementById('csReactLayer');
  const el = document.createElement('div');
  el.className = 'cs-react-float';
  const who = key === 'self' ? 'You' : (callParticipants.find(p => p.key === key)?.name.split(' ')[0] || '');
  el.innerHTML = `<span class="cs-react-emoji">${emoji}</span>${who ? `<span class="cs-react-who">${who}</span>` : ''}`;
  el.style.left = (8 + Math.random() * 14) + '%';
  el.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
  layer.appendChild(el);
  setTimeout(() => el.remove(), 3200);
  const targets = [document.querySelector(`#csGroupGrid .cs-gtile[data-key="${key}"]`)];
  const stage = document.getElementById('csStage');
  if (stage.dataset.key === key && !stage.classList.contains('hidden')) targets.push(stage);
  targets.filter(Boolean).forEach(t => {
    t.querySelector('.cs-tile-react')?.remove();
    const badge = document.createElement('span');
    badge.className = 'cs-tile-react';
    badge.textContent = emoji;
    t.appendChild(badge);
    setTimeout(() => badge.remove(), 2600);
  });
}

function _closeReactPanel() {
  document.getElementById('csReactPanel').classList.add('hidden');
  document.getElementById('csReactBtn').classList.remove('is-open');
}

function _paintHand() {
  document.querySelector('#csGroupGrid .cs-gtile.self')?.classList.toggle('hand', myHandRaised);
  document.getElementById('csHandChip').classList.toggle('hidden', !myHandRaised);
  document.getElementById('csRaiseHand').classList.toggle('active', myHandRaised);
  document.getElementById('csRaiseHandLabel').textContent = myHandRaised ? 'Lower hand' : 'Raise hand';
  _renderStage();
}

document.getElementById('csReactBtn').addEventListener('click', e => {
  e.stopPropagation();
  const panel = document.getElementById('csReactPanel');
  const opening = panel.classList.contains('hidden');
  panel.classList.toggle('hidden', !opening);
  document.getElementById('csReactBtn').classList.toggle('is-open', opening);
  if (!opening) return;
  const screenR = document.getElementById('callScreen').getBoundingClientRect();
  const r = e.currentTarget.getBoundingClientRect();
  panel.style.left = Math.max(8, Math.min(screenR.width - panel.offsetWidth - 8, r.left - screenR.left + r.width / 2 - panel.offsetWidth / 2)) + 'px';
  panel.style.bottom = (screenR.bottom - r.top + 18) + 'px';
});
document.getElementById('csReactPanel').addEventListener('click', e => {
  e.stopPropagation();
  const r = e.target.closest('[data-react]');
  if (r) { _showReaction(r.dataset.react, 'self'); _closeReactPanel(); return; }
  if (e.target.closest('#csRaiseHand')) {
    myHandRaised = !myHandRaised;
    _paintHand();
    _closeReactPanel();
  }
});
document.addEventListener('click', e => {
  if (!e.target.closest('#csReactPanel, #csReactBtn')) _closeReactPanel();
});

// ── MINIMIZE TO THE LEFT WHEN LEAVING THE CALL SCREEN ──
function _callNavInset() {
  const screen = document.getElementById('callScreen');
  const nav = document.querySelector('.left-nav');
  const w = nav && !(typeof isMobile === 'function' && isMobile()) ? nav.offsetWidth : 0;
  screen.style.left = w + 'px';
  document.documentElement.style.setProperty('--call-nav-w', w + 'px');
}
new MutationObserver(() => {
  if (!document.getElementById('callScreen').classList.contains('hidden')) _callNavInset();
}).observe(document.getElementById('callScreen'), { attributes: true, attributeFilter: ['class'] });
new ResizeObserver(_callNavInset).observe(document.querySelector('.left-nav'));

document.querySelector('.left-nav').addEventListener('click', e => {
  if (e.target.closest('#navCollapseBtn')) return;
  const screen = document.getElementById('callScreen');
  if (screen.classList.contains('hidden') || screen.classList.contains('fullscreen')) return;
  if (!callParticipants.length && !csCallState) return;
  minimizeCallScreen();
}, true);

function _paintMini() {
  const mini = document.getElementById('callMini');
  if (!mini || mini.classList.contains('hidden')) return;
  const isGroup = document.getElementById('callScreen').classList.contains('group-call');
  document.getElementById('cmTitle').textContent = _callLabel() || csCallState?.name || '';
  if (!isGroup) return;
  const p = _stagePerson();
  if (!p) return;
  const av = document.getElementById('cmAvatar');
  av.textContent = p.initials;
  av.style.background = p.self ? 'var(--amber)' : p.color;
  av.style.color = p.self ? 'var(--maroon-dark)' : '';
  document.getElementById('cmName').textContent = p.self ? 'You' : p.name;
  const speaking = !!document.querySelector(`#csGroupGrid .cs-gtile.speaking[data-key="${p.key}"]`);
  mini.classList.toggle('speaking', speaking);
  document.getElementById('cmStatus').textContent = `${callParticipants.filter(x => x.joined).length + 1} in call`;
}

function _attachGroupSelfVideo() {
  const el = document.getElementById('csGroupSelfVideo');
  if (el && vcStream && el.srcObject !== vcStream) el.srcObject = vcStream;
}

function _syncSelfTile() {
  const tile = document.querySelector('.cs-gtile.self');
  if (!tile) return;
  const isVideo = document.getElementById('callScreen').classList.contains('video-mode');
  tile.classList.toggle('muted', vcMuted);
  tile.classList.toggle('cam-off', !(isVideo && vcCameraOn));
  _attachGroupSelfVideo();
  const stage = document.getElementById('csStage');
  if (stage.dataset.key === 'self') { stage.dataset.key = ''; _renderStage(); }
}

// Fit n tiles (16:10) into the available area, choosing the column count that maximises tile size
function _sizeCallGrid() {
  const grid = document.getElementById('csGroupGrid');
  if (grid.classList.contains('hidden') || document.getElementById('callScreen').classList.contains('speaker-view')) return;
  const n = grid.children.length;
  const W = grid.clientWidth, H = grid.clientHeight, GAP = 12, RATIO = 1.6;
  if (!n || !W || !H) return;
  let best = { w: 0, cols: 1 };
  const maxCols = window.innerWidth <= 520 ? 1 : window.innerWidth <= 768 ? 2 : n;
  for (let cols = 1; cols <= Math.min(n, maxCols); cols++) {
    const rows = Math.ceil(n / cols);
    const w = Math.min((W - GAP * (cols - 1)) / cols, ((H - GAP * (rows - 1)) / rows) * RATIO);
    if (w > best.w) best = { w, cols };
  }
  grid.style.gridTemplateColumns = `repeat(${best.cols}, ${Math.floor(best.w)}px)`;
}
new ResizeObserver(_sizeCallGrid).observe(document.getElementById('csGroupGrid'));

function refreshAddPanel(filter) {
  const q = (filter || '').toLowerCase();
  const list = document.getElementById('csApList');
  list.innerHTML = '';
  peopleData
    .filter(p => !q || p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q))
    .forEach(p => {
      const inCall = callParticipants.some(c => c.key === p.key);
      const row = document.createElement('div');
      row.className = 'cs-ap-item' + (inCall ? ' in-call' : '');
      row.innerHTML = `
        <div class="cs-ap-av" style="background:${p.color}">${p.initials}</div>
        <div class="cs-ap-info">
          <div class="cs-ap-name">${p.name}</div>
          <div class="cs-ap-role">${p.role}</div>
        </div>
        <span class="cs-ap-add-icon">${inCall ? '✓' : '+'}</span>`;
      if (!inCall) {
        row.addEventListener('click', e => { e.stopPropagation(); addCallParticipant(p); });
      }
      list.appendChild(row);
    });
}

function addCallParticipant(person) {
  if (callParticipants.some(p => p.key === person.key)) return;
  const entry = { key: person.key, name: person.name, color: person.color, initials: person.initials, joined: false };
  callParticipants.push(entry);
  _joinAfter(entry, 2000);
  renderCallLayout();
  refreshAddPanel(document.getElementById('csApSearch').value);
}

function removeCallParticipant(key) {
  callParticipants = callParticipants.filter(p => p.key !== key);
  if (!callParticipants.length) return endCallScreen();
  if (callParticipants.length === 1) callTitle = null;
  renderCallLayout();
  refreshAddPanel(document.getElementById('csApSearch').value);
}

document.getElementById('csGroupGrid').addEventListener('click', e => {
  const btn = e.target.closest('[data-remove]');
  if (btn) { e.stopPropagation(); removeCallParticipant(btn.dataset.remove); return; }
  const tile = e.target.closest('.cs-gtile[data-key]');
  if (!tile || tile.classList.contains('cs-gtile-share')) return;
  e.stopPropagation();
  callPinnedKey = tile.dataset.key;
  callView = 'speaker';
  document.getElementById('csStage').dataset.key = '';
  _applyCallView();
});

function toggleAddPanel(e) {
  e.stopPropagation();
  const panel = document.getElementById('csAddPanel');
  const isHidden = panel.classList.contains('hidden');
  panel.classList.toggle('hidden', !isHidden);
  if (isHidden) {
    refreshAddPanel();
    document.getElementById('csApSearch').value = '';
    document.getElementById('csApSearch').focus();
  }
  _syncCallChrome();
}
document.getElementById('csAddBtn').addEventListener('click', toggleAddPanel);
document.getElementById('csAddCallerBtn').addEventListener('click', toggleAddPanel);

document.getElementById('csApSearch').addEventListener('input', function() {
  refreshAddPanel(this.value);
});

document.addEventListener('click', e => {
  const panel = document.getElementById('csAddPanel');
  if (!panel.contains(e.target) &&
      !document.getElementById('csAddBtn').contains(e.target) &&
      !document.getElementById('csAddCallerBtn').contains(e.target)) {
    if (!panel.classList.contains('hidden')) {
      panel.classList.add('hidden');
      _syncCallChrome();
    }
  }
});

function _resetCallParticipants() {
  callParticipants = [];
  callTitle = null;
  clearInterval(_speakerInterval);
  callView = 'gallery';
  callPinnedKey = null;
  callStageKey = null;
  myHandRaised = false;
  _paintHand();
  _closeReactPanel();
  document.getElementById('csReactLayer').innerHTML = '';
  document.getElementById('csStage').classList.add('hidden');
  document.getElementById('csStage').dataset.key = '';
  document.getElementById('callScreen').classList.remove('speaker-view');
  document.getElementById('csViewBtn').classList.add('hidden');
  document.getElementById('csGroupGrid').innerHTML = '';
  document.getElementById('csGroupGrid').classList.add('hidden');
  document.getElementById('csCount').classList.add('hidden');
  document.getElementById('callScreen').classList.remove('group-call');
  document.getElementById('csAddPanel').classList.add('hidden');
}
// ────────────────────────────────────────────────────────────────────────────

// Stored state so expand can restore the full-screen call
let csCallState = null;
let cmMuted = false;
let callIsFullscreen = false;

const _callScreenAnchor = document.getElementById('callScreen').parentElement;

function _placeCallScreen(fullscreen) {
  const screen = document.getElementById('callScreen');
  if (fullscreen) {
    if (screen.parentElement !== document.body) document.body.appendChild(screen);
  } else if (_callScreenAnchor && screen.parentElement !== _callScreenAnchor) {
    _callScreenAnchor.appendChild(screen);
  }
}

function _hideCallScreen() {
  const screen = document.getElementById('callScreen');
  screen.classList.add('hidden');
  screen.classList.remove('video-mode');
  screen.classList.remove('fullscreen');
  screen.classList.remove('controls-hidden');
  callIsFullscreen = false;
  _placeCallScreen(false);
  _paintZoomBtn(false);
  document.getElementById('csVideoGrid').classList.add('hidden');
  document.getElementById('csCameraBtn').querySelector('.cs-ctl-icon').classList.remove('cs-ctl-icon-blue');
  document.getElementById('csMuteBtn').querySelector('.cs-ctl-icon').classList.remove('cs-ctl-icon-active');
  document.getElementById('csSpeakerBtn').querySelector('.cs-ctl-icon').classList.remove('cs-ctl-icon-active');
}

function endCallScreen() { endCall(); }

function minimizeCallScreen() {
  const screen = document.getElementById('callScreen');
  const avEl = document.getElementById('csAvatar');
  csCallState = {
    name: document.getElementById('csName').textContent,
    initials: avEl.textContent,
    color: avEl.style.background,
    video: screen.classList.contains('video-mode'),
  };
  _closeMore();
  document.getElementById('csAddPanel').classList.add('hidden');
  if (callIsFullscreen) {
    callIsFullscreen = false;
    screen.classList.remove('fullscreen');
    _placeCallScreen(false);
    _paintZoomBtn(false);
  }
  screen.classList.add('hidden');
  const cmAv = document.getElementById('cmAvatar');
  cmAv.textContent = csCallState.initials;
  cmAv.style.background = csCallState.color;
  document.getElementById('cmName').textContent = csCallState.name;
  const mini = document.getElementById('callMini');
  mini.style.left = mini.style.top = mini.style.right = mini.style.bottom = '';
  mini.classList.remove('hidden');
  _closeReactPanel();
  _paintTimers();
  _paintMini();
  _syncCallChrome();
}

function expandMiniCall() {
  if (!csCallState && !callParticipants.length) return;
  document.getElementById('callMini').classList.add('hidden');
  document.getElementById('callScreen').classList.remove('hidden');
  renderCallLayout();
  _paintTimers();
  _syncCallChrome();
}

// Mini card buttons
document.getElementById('cmExpand').addEventListener('click', expandMiniCall);
document.getElementById('cmBody').addEventListener('click', expandMiniCall);
document.getElementById('cmAddBtn').addEventListener('click', e => {
  e.stopPropagation();
  expandMiniCall();
  const panel = document.getElementById('csAddPanel');
  panel.classList.remove('hidden');
  document.getElementById('csApSearch').value = '';
  refreshAddPanel();
  document.getElementById('csApSearch').focus();
  _syncCallChrome();
});
document.getElementById('cmEndBtn').addEventListener('click', endCall);
document.getElementById('cmMuteBtn').addEventListener('click', toggleMute);
document.getElementById('cmVideoBtn').addEventListener('click', toggleCamera);

// Mini card drag
(function() {
  const mini = document.getElementById('callMini');
  const handle = document.getElementById('cmHandle');
  let dragging = false, ox = 0, oy = 0;
  handle.addEventListener('mousedown', e => {
    if (e.button !== 0 || e.target.closest('button')) return;
    dragging = true;
    const r = mini.getBoundingClientRect();
    const cr = mini.offsetParent.getBoundingClientRect();
    ox = e.clientX - r.left; oy = e.clientY - r.top;
    mini.style.bottom = 'auto'; mini.style.right = 'auto';
    mini.style.left = (r.left - cr.left) + 'px'; mini.style.top = (r.top - cr.top) + 'px';
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const cr = mini.offsetParent.getBoundingClientRect();
    const pr = mini.getBoundingClientRect();
    mini.style.left = Math.max(0, Math.min(e.clientX - cr.left - ox, cr.width  - pr.width))  + 'px';
    mini.style.top  = Math.max(0, Math.min(e.clientY - cr.top  - oy, cr.height - pr.height)) + 'px';
  });
  document.addEventListener('mouseup', () => { dragging = false; });
})();

document.getElementById('csHangup').addEventListener('click', endCallScreen);

// ── FULL SCREEN (ZOOM IN) ──
function setCallFullscreen(on) {
  const screen = document.getElementById('callScreen');
  if (screen.classList.contains('hidden')) return;
  callIsFullscreen = on;
  screen.classList.toggle('fullscreen', on);
  _placeCallScreen(on);
  _paintZoomBtn(on);
  _sizeCallGrid();
}
function _paintZoomBtn(on) {
  const btn = document.getElementById('csZoomBtn');
  btn.classList.toggle('is-zoomed', on);
  btn.title = on ? 'Exit full screen (Esc)' : 'Full screen (F)';
}
document.getElementById('csZoomBtn').addEventListener('click', e => {
  e.stopPropagation();
  setCallFullscreen(!callIsFullscreen);
});
document.getElementById('callScreen').addEventListener('dblclick', e => {
  if (e.target.closest('button, .cs-controls, .cs-react-panel, .cs-add-panel')) return;
  setCallFullscreen(!callIsFullscreen);
});
document.addEventListener('keydown', e => {
  if (document.getElementById('callScreen').classList.contains('hidden')) return;
  if (e.target.closest('input, textarea, [contenteditable]')) return;
  if (e.key === 'Escape') {
    const react = document.getElementById('csReactPanel');
    const add = document.getElementById('csAddPanel');
    const more = document.getElementById('callMoreMenu');
    if (!react.classList.contains('hidden')) _closeReactPanel();
    else if (!add.classList.contains('hidden')) { add.classList.add('hidden'); _syncCallChrome(); }
    else if (more && !more.classList.contains('hidden')) _closeMore();
    else if (callIsFullscreen) setCallFullscreen(false);
  }
  else if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey && !e.altKey) setCallFullscreen(!callIsFullscreen);
});

// ── AUTO-HIDE CONTROLS IN VIDEO MODE ──
let _csHideTimer = null;
function _showCallControls() {
  const screen = document.getElementById('callScreen');
  screen.classList.remove('controls-hidden');
  clearTimeout(_csHideTimer);
  if (screen.classList.contains('video-mode')) {
    _csHideTimer = setTimeout(() => screen.classList.add('controls-hidden'), 3500);
  }
}
document.getElementById('callScreen').addEventListener('mousemove', _showCallControls);
document.getElementById('callScreen').addEventListener('click', _showCallControls);

// Camera toggle — enable/disable video track on the fly
document.getElementById('csCameraBtn').addEventListener('click', toggleCamera);
document.getElementById('csMuteBtn').addEventListener('click', toggleMute);
document.getElementById('csSpeakerBtn').addEventListener('click', toggleSpeaker);
document.getElementById('csMoreBtn').addEventListener('click', e => openCallMore(e, 'screen'));
document.getElementById('csShareBtn').addEventListener('click', toggleScreenShare);

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
    if (typeof _syncCallChrome === 'function') _syncCallChrome();
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
function _cpmPeople() {
  return [...cpmSelected].map(key => {
    const el = document.querySelector(`.cpm-person[data-key="${key}"]`);
    return { key, name: el.dataset.name, color: el.dataset.color, initials: el.dataset.initials };
  });
}

document.getElementById('cpmVoiceBtn').addEventListener('click', () => {
  if (cpmSelected.size === 0) return;
  closeModal('callPeopleModal');
  startGroupCall(_cpmPeople(), false);
});

document.getElementById('cpmVideoBtn').addEventListener('click', () => {
  if (cpmSelected.size === 0) return;
  closeModal('callPeopleModal');
  startGroupCall(_cpmPeople(), true);
});

// ── CALL DROPDOWN ──
(function() {
  const btn = document.getElementById('quickCallBtn');
  const dd  = document.getElementById('callDropdown');
  const search = document.getElementById('cdSearch');
  const list = document.getElementById('cdList');
  const footer = document.getElementById('cdFooter');
  const countEl = document.getElementById('cdCount');
  const selected = new Set();

  const PHONE = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
  const VIDEO = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>`;
  const CHECK = `<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function renderList(filter) {
    const q = (filter || '').toLowerCase();
    list.innerHTML = peopleData
      .filter(p => !q || p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q))
      .map(p => `
        <div class="cd-item${selected.has(p.key) ? ' selected' : ''}" data-key="${p.key}">
          <button type="button" class="cd-select" aria-label="Select ${p.name}"><div class="cd-check">${selected.has(p.key) ? CHECK : ''}</div></button>
          <div class="cd-av" style="background:${p.color}">${p.initials}${p.online ? '<span class="cd-online"></span>' : ''}</div>
          <div class="cd-info"><span>${p.name}</span><small>${p.role}</small></div>
          <button class="cd-act cd-voice" title="Voice call">${PHONE}</button>
          <button class="cd-act cd-video" title="Video call">${VIDEO}</button>
        </div>`).join('');
  }

  function syncFooter() {
    const n = selected.size;
    footer.classList.toggle('hidden', n === 0);
    countEl.textContent = n === 1 ? '1 person selected' : `${n} people selected`;
    const ps = selectedPeople();
    document.getElementById('cdStack').innerHTML = ps.slice(0, 3).map(p => `<span class="cd-stack-av" style="background:${p.color}">${p.initials}</span>`).join('')
      + (ps.length > 3 ? `<span class="cd-stack-av cd-stack-more">+${ps.length - 3}</span>` : '');
  }

  function selectedPeople() {
    return [...selected].map(key => peopleData.find(p => p.key === key)).filter(Boolean);
  }

  function openDropdown() {
    closeAllQuickDds();
    search.value = '';
    selected.clear();
    renderList();
    syncFooter();
    positionDropdown(dd, btn);
    dd.classList.remove('hidden');
    search.focus();
  }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    dd.classList.contains('hidden') ? openDropdown() : closeAllQuickDds();
  });

  search.addEventListener('input', function() { renderList(this.value); });

  list.addEventListener('click', e => {
    const item = e.target.closest('.cd-item');
    if (!item) return;
    const person = peopleData.find(p => p.key === item.dataset.key);
    if (!person) return;
    if (e.target.closest('.cd-voice') || e.target.closest('.cd-video')) {
      e.stopPropagation();
      closeAllQuickDds();
      startGroupCall([person], !!e.target.closest('.cd-video'));
      return;
    }
    e.stopPropagation();
    selected.has(person.key) ? selected.delete(person.key) : selected.add(person.key);
    item.classList.toggle('selected', selected.has(person.key));
    const check = item.querySelector('.cd-check');
    if (check) check.innerHTML = selected.has(person.key) ? CHECK : '';
    syncFooter();
  });

  function startSelected(video) {
    const people = selectedPeople();
    if (!people.length) return;
    closeAllQuickDds();
    startGroupCall(people, video);
  }
  document.getElementById('cdClear').addEventListener('click', e => {
    e.stopPropagation();
    selected.clear();
    renderList(search.value);
    syncFooter();
  });
  document.getElementById('cdStartVoice').addEventListener('click', e => { e.stopPropagation(); startSelected(false); });
  document.getElementById('cdStartVideo').addEventListener('click', e => { e.stopPropagation(); startSelected(true); });
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

  const people = getSelectedPeopleKeys('scPeopleRow');
  if (window._editingMeetingId || /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const editing = window._editingMeetingId;
    window._editingMeetingId = null;
    window._sdEditMode = false;
    placeMeeting({
      id: editing || undefined,
      title,
      date,
      time,
      dur: parseDurMinutes(dur),
      participants: people,
      type: 'video',
    });
    return;
  }

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
    closeAllQuickDds();
    titleIn.value = '';
    placeMeeting({
      title,
      date,
      time,
      dur: parseDurMinutes(dur),
      participants: getSelectedPeopleKeys('qdPeopleRow'),
      type: 'video',
    });
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

// ══════════ SHARE AI PROMPT ══════════
(function initSharePrompt() {
  const modal = document.getElementById('sharePromptModal');
  const closeBtn = document.getElementById('sharePromptClose');
  const shareBtn = document.getElementById('spmShareBtn');
  const previewEl = document.getElementById('spmPreviewContent');
  const peopleList = document.getElementById('spmPeopleList');
  const openBtn = document.getElementById('resultShareBtn');
  if (!modal || !openBtn) return;

  const sharePeople = [
    { key:'sarah', name:'Sarah Jenkins', role:'Head of Design', color:'#7c3aed', initials:'SJ' },
    { key:'alex', name:'Alex Kim', role:'Senior Designer', color:'#059669', initials:'AK' },
    { key:'david', name:'David Chen', role:'Lead Engineer', color:'#2563eb', initials:'DC' },
    { key:'jessica', name:'Jessica Park', role:'Marketing Manager', color:'#d97706', initials:'JP' },
    { key:'marcus', name:'Marcus Lee', role:'Product Manager', color:'#0891b2', initials:'ML' },
  ];

  function renderPeople() {
    peopleList.innerHTML = sharePeople.map(p => `
      <div class="spm-person" data-key="${p.key}">
        <div class="spm-person-av" style="background:${p.color}">${p.initials}</div>
        <div class="spm-person-info"><span>${p.name}</span><small>${p.role}</small></div>
        <div class="spm-person-check"></div>
      </div>
    `).join('');
    peopleList.querySelectorAll('.spm-person').forEach(el => {
      el.addEventListener('click', () => el.classList.toggle('selected'));
    });
  }

  openBtn.addEventListener('click', () => {
    const fields = document.getElementById('resultFields');
    if (fields) {
      const items = [];
      fields.querySelectorAll('.rf-value').forEach(v => items.push(v.textContent));
      previewEl.textContent = items.join(' · ') || 'AI-generated result';
    }
    renderPeople();
    document.getElementById('spmNote').value = '';
    modal.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

  shareBtn.addEventListener('click', () => {
    const selected = peopleList.querySelectorAll('.spm-person.selected');
    if (!selected.length) return;
    modal.classList.add('hidden');
    const toast = document.getElementById('stgToast');
    const msg = document.getElementById('stgToastMsg');
    if (toast && msg) {
      msg.textContent = `Shared with ${selected.length} teammate${selected.length > 1 ? 's' : ''}`;
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 2500);
    }
  });
})();

// ══════════ AI GROUP CHAT ══════════
(function initAiGroupChat() {
  const input = document.getElementById('aigroupInput');
  const sendBtn = document.getElementById('aigroupSendBtn');
  const messagesEl = document.getElementById('aigroupMessages');
  const roomList = document.getElementById('aigroupList');
  if (!input || !sendBtn || !messagesEl) return;

  const roomColors = ['rgba(246,196,83,.12)','rgba(124,58,237,.1)','rgba(13,143,130,.1)','rgba(37,99,235,.1)','rgba(217,119,6,.1)','rgba(190,24,93,.1)'];
  const roomIconColors = ['#b07d1a','#7c3aed','#0d8f82','#2563eb','#d97706','#be185d'];
  let roomCount = 3;

  const allPeople = [
    { key:'sarah', name:'Sarah Jenkins', role:'Head of Design', color:'#7c3aed', initials:'SJ' },
    { key:'alex', name:'Alex Kim', role:'Senior Designer', color:'#059669', initials:'AK' },
    { key:'david', name:'David Chen', role:'Lead Engineer', color:'#2563eb', initials:'DC' },
    { key:'jessica', name:'Jessica Park', role:'Marketing Manager', color:'#d97706', initials:'JP' },
    { key:'marcus', name:'Marcus Lee', role:'Product Manager', color:'#0891b2', initials:'ML' },
    { key:'noor', name:'Noor Al-Rashid', role:'QA Lead', color:'#be185d', initials:'NA' },
  ];

  function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'aigroup-msg aigroup-msg-user aigroup-msg-me';
    const time = new Date().toLocaleTimeString([], { hour:'numeric', minute:'2-digit' });
    div.innerHTML = `
      <div class="aigroup-msg-avatar" style="background:#4c1515">PM</div>
      <div class="aigroup-msg-content">
        <div class="aigroup-msg-meta"><span class="aigroup-msg-name">You</span><span class="aigroup-msg-time">${time}</span></div>
        <div class="aigroup-msg-bubble">${text.replace(/</g,'&lt;')}</div>
      </div>
    `;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addAiResponse(text) {
    const div = document.createElement('div');
    div.className = 'aigroup-msg aigroup-msg-ai';
    const time = new Date().toLocaleTimeString([], { hour:'numeric', minute:'2-digit' });
    div.innerHTML = `
      <div class="aigroup-msg-avatar aigroup-ai-avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5Z" fill="#f6c453"/></svg>
      </div>
      <div class="aigroup-msg-content">
        <div class="aigroup-msg-meta"><span class="aigroup-msg-name">Yuzu AI</span><span class="aigroup-msg-time">${time}</span></div>
        <div class="aigroup-msg-bubble aigroup-ai-bubble">${text}</div>
        <div class="aigroup-msg-actions">
          <button class="aigroup-action-chip" data-action="copy"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="1.6"/></svg> Copy</button>
          <button class="aigroup-action-chip" data-action="share"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="1.6"/><circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/><circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke="currentColor" stroke-width="1.6"/></svg> Share</button>
          <button class="aigroup-action-chip" data-action="save"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="currentColor" stroke-width="1.6"/></svg> Save</button>
        </div>
      </div>
    `;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  const aiResponses = [
    "That's a great idea! Here are a few directions we could explore:\n\n<strong>1.</strong> Focus on simplicity — keep the core interaction to one tap\n<strong>2.</strong> Add collaborative editing — let multiple people refine the prompt\n<strong>3.</strong> Create prompt templates for common workflows\n\nWould you like me to elaborate on any of these?",
    "I've drafted a quick outline based on your input:\n\n<strong>Overview:</strong> A shared AI workspace where teams can iterate on ideas together in real-time.\n\n<strong>Key differentiators:</strong>\n• AI context carries across the conversation\n• Anyone can fork a prompt into a new thread\n• Results auto-save to the team knowledge base\n\nShall I refine this further?",
    "Based on what the team has discussed, here's a summary:\n\n✅ <strong>Agreed:</strong> Keep the UX simple and conversational\n🔄 <strong>In progress:</strong> Naming and positioning\n❓ <strong>Open question:</strong> Should AI responses be editable by all members?\n\nLet me know how you'd like to proceed!",
  ];
  let aiIdx = 0;

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addUserMessage(text);
    if (text.toLowerCase().includes('@yuzuai') || text.includes('?')) {
      setTimeout(() => {
        addAiResponse(aiResponses[aiIdx % aiResponses.length]);
        aiIdx++;
      }, 800);
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

  function activateRoom(room) {
    document.querySelectorAll('.aigroup-room').forEach(r => r.classList.remove('active'));
    room.classList.add('active');
    const badge = room.querySelector('.unread-badge');
    if (badge) badge.remove();
    const name = room.querySelector('.aigroup-room-name').textContent;
    const meta = room.querySelector('.aigroup-room-meta').textContent;
    document.getElementById('aigroupChatTitle').textContent = name;
    document.getElementById('aigroupChatMembers').textContent = meta.split('·')[0].trim();

    messagesEl.innerHTML = '';
    const sysMsg = document.createElement('div');
    sysMsg.className = 'aigroup-msg aigroup-msg-system';
    sysMsg.innerHTML = `<span>Room created · ${new Date().toLocaleDateString([], { month:'short', day:'numeric' })}</span>`;
    messagesEl.appendChild(sysMsg);

    const topic = room.dataset.topic;
    if (topic) {
      setTimeout(() => {
        addAiResponse(`Welcome to <strong>${name}</strong>! I'm here to help the team with: <em>${topic}</em>\n\nType <strong>@yuzuai</strong> followed by your question, or just ask anything.`);
      }, 400);
    }

    showPanel('aigroupChat');
  }

  // Room switching — delegate to roomList so dynamically added rooms work
  roomList.addEventListener('click', e => {
    const room = e.target.closest('.aigroup-room');
    if (room) activateRoom(room);
  });

  // ── NEW ROOM MODAL ──
  const newRoomModal = document.getElementById('newAiRoomModal');
  const newRoomBtn = document.getElementById('aigroupNewBtn');
  const newRoomClose = document.getElementById('newAiRoomClose');
  const newRoomCreate = document.getElementById('nairCreateBtn');
  const nairPeopleList = document.getElementById('nairPeopleList');

  function renderInviteList() {
    nairPeopleList.innerHTML = allPeople.map(p => `
      <div class="nair-person" data-key="${p.key}">
        <div class="nair-person-av" style="background:${p.color}">${p.initials}</div>
        <div class="nair-person-info"><span>${p.name}</span><small>${p.role}</small></div>
        <div class="nair-person-check"></div>
      </div>
    `).join('');
    nairPeopleList.querySelectorAll('.nair-person').forEach(el => {
      el.addEventListener('click', () => el.classList.toggle('selected'));
    });
  }

  newRoomBtn.addEventListener('click', () => {
    document.getElementById('newAiRoomName').value = '';
    document.getElementById('newAiRoomTopic').value = '';
    renderInviteList();
    newRoomModal.classList.remove('hidden');
  });

  newRoomClose.addEventListener('click', () => newRoomModal.classList.add('hidden'));
  newRoomModal.addEventListener('click', e => { if (e.target === newRoomModal) newRoomModal.classList.add('hidden'); });

  newRoomCreate.addEventListener('click', () => {
    const name = document.getElementById('newAiRoomName').value.trim();
    if (!name) {
      document.getElementById('newAiRoomName').focus();
      return;
    }
    const topic = document.getElementById('newAiRoomTopic').value.trim();
    const selected = nairPeopleList.querySelectorAll('.nair-person.selected');
    const memberNames = Array.from(selected).map(el => el.querySelector('.nair-person-info span').textContent.split(' ')[0]);
    memberNames.push('You');
    const memberStr = memberNames.join(', ');

    const ci = roomCount % roomColors.length;
    roomCount++;

    const room = document.createElement('div');
    room.className = 'aigroup-room';
    room.dataset.room = 'custom-' + roomCount;
    room.dataset.topic = topic;
    room.innerHTML = `
      <div class="aigroup-room-icon" style="background:${roomColors[ci]}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5Z" fill="${roomIconColors[ci]}"/></svg>
      </div>
      <div class="aigroup-room-body">
        <span class="aigroup-room-name">${name}</span>
        <span class="aigroup-room-meta">${memberStr} · 0 messages</span>
      </div>
    `;

    roomList.prepend(room);
    newRoomModal.classList.add('hidden');

    activateRoom(room);

    const toast = document.getElementById('stgToast');
    const msg = document.getElementById('stgToastMsg');
    if (toast && msg) {
      msg.textContent = `"${name}" created`;
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 2500);
    }
  });

  // Copy / Share action chips
  messagesEl.addEventListener('click', e => {
    const chip = e.target.closest('.aigroup-action-chip');
    if (!chip) return;
    const action = chip.dataset.action;
    const bubble = chip.closest('.aigroup-msg-content')?.querySelector('.aigroup-msg-bubble');
    if (action === 'copy' && bubble) {
      navigator.clipboard?.writeText(bubble.textContent);
      chip.innerHTML = chip.innerHTML.replace('Copy', 'Copied!');
      setTimeout(() => { chip.innerHTML = chip.innerHTML.replace('Copied!', 'Copy'); }, 1500);
    }
    if (action === 'share') {
      const shareModal = document.getElementById('sharePromptModal');
      const previewEl = document.getElementById('spmPreviewContent');
      if (shareModal && previewEl && bubble) {
        previewEl.textContent = bubble.textContent.slice(0, 120) + (bubble.textContent.length > 120 ? '…' : '');
        document.getElementById('spmNote').value = '';
        const peopleList = document.getElementById('spmPeopleList');
        if (peopleList) {
          peopleList.innerHTML = allPeople.slice(0, 3).map(p => `
            <div class="spm-person" data-key="${p.key}">
              <div class="spm-person-av" style="background:${p.color}">${p.initials}</div>
              <div class="spm-person-info"><span>${p.name}</span><small>${p.role}</small></div>
              <div class="spm-person-check"></div>
            </div>
          `).join('');
          peopleList.querySelectorAll('.spm-person').forEach(el => {
            el.addEventListener('click', () => el.classList.toggle('selected'));
          });
        }
        shareModal.classList.remove('hidden');
      }
    }
  });
})();
