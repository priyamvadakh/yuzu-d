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
document.getElementById('obV2Btn').addEventListener('click', () => { enableCallsV2(); showHome(); });

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
    color: '#7c3aed', initials: 'DT', online: true, unread: 2, lastActive: Date.now() - 15 * 60e3,
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
  },
  'group-campaign': {
    name: 'Campaign Launch',
    isGroup: true,
    members: [
      { key: 'sarah',   name: 'Sarah Jenkins', color: '#7c3aed', initials: 'SJ' },
      { key: 'alex',    name: 'Alex Kim',       color: '#059669', initials: 'AK' },
      { key: 'jessica', name: 'Jessica Park',   color: '#d97706', initials: 'JP' },
    ],
    color: '#d97706', initials: 'CL', online: true, unread: 0, lastActive: Date.now() - 26 * 3600e3,
    messages: [
      { from: 'jessica', senderName: 'Jessica Park', senderColor: '#d97706', senderInitials: 'JP', text: 'Kicking off the Q3 campaign thread here 🚀', time: 'Yesterday' },
      { from: 'me', text: 'Perfect, let’s keep launch comms in this group', time: 'Yesterday' },
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
  const tickHTML = isMe ? ' <svg class="dm-tick" width="16" height="10" viewBox="0 0 16 10" fill="none" aria-label="Read"><path d="M1 5.2 3.8 8 9.6 1.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.4 7.2 7.2 8 13 1.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '';
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
  const timeHTML = `<div class="dm-bubble-time">${msg.time}${isMe ? ' <svg class="dm-tick" width="16" height="10" viewBox="0 0 16 10" fill="none" aria-label="Read"><path d="M1 5.2 3.8 8 9.6 1.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.4 7.2 7.2 8 13 1.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}</div>`;

  // For group DMs, use per-message sender info; fall back to dm-level for 1:1
  const senderColor    = msg.senderColor    || dm.color;
  const senderInitials = msg.senderInitials || dm.initials.charAt(0);
  const senderName     = msg.senderName     || dm.name;

  if (msg.type === 'call') return makeCallBubble(msg);
  if (msg.type === 'system') return `<div class="dm-system-note">${msg.text}</div>`;

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
    <div class="dm-convo-info${dm.isGroup ? ' is-group' : ''}"${dm.isGroup ? ' role="button" tabindex="0" title="View and add members"' : ''}>
      <div class="dm-convo-name">${dm.name}</div>
      <div class="dm-convo-status ${dm.isGroup ? 'members' : (dm.online ? '' : 'offline')}">${hdrStatusHTML}</div>
    </div>
    <div class="dm-header-actions">
      ${dm.isGroup ? `<button class="dm-header-btn dm-members-btn" title="Members">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span>${dm.members.length + 1}</span>
      </button>` : ''}
      <div class="dm-call-group" role="group" aria-label="Start a call">
      <button class="dm-header-btn" title="Video call">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 10L20.553 6.724C21.224 6.566 22 7.05 22 7.764V16.236C22 16.95 21.224 17.434 20.553 17.276L15 14V10Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><rect x="2" y="6" width="13" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>
      </button>
      <button class="dm-header-btn" title="Call">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>
      </button>
      </div>
      <button class="dm-header-btn" title="Search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
      <button class="dm-header-btn" title="More">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>
      </button>
    </div>
  `;

  closeDmFind();
  closeDmMembers();

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

  document.getElementById('dmInput').placeholder = dm.isGroup ? `Message ${dm.name}… or type add @name` : `Message ${dm.name.split(' ')[0]}…`;
  closeMention();
  document.querySelectorAll('.dm-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.dm === dmKey);
  });
}

function sendDmMessage(text) {
  if (!text.trim()) return;
  if (_runAddCommand(text)) return;
  const dm = dmData[activeDm];
  const msg = { from: 'me', text: text.trim(), time: 'Just now' };
  dm.messages.push(msg);
  dm.lastActive = Date.now();
  const msgs = document.getElementById('dmMessages');
  msgs.insertAdjacentHTML('beforeend', makeBubble(msg, dm, false));
  msgs.scrollTop = msgs.scrollHeight;
  if (!document.getElementById('dmFind').classList.contains('hidden')) runDmFind(false);
  renderCallChat();
}

// ── GROUP MEMBERS (view + add) ──
function _memberRow(m, isYou) {
  const p = peopleData.find(x => x.key === m.key) || {};
  return `<div class="dmm-row">
    <div class="cd-av" style="background:${m.color}">${m.initials}${p.online || isYou ? '<span class="cd-online"></span>' : ''}</div>
    <div class="cd-info"><span>${isYou ? 'You' : m.name}</span><small>${isYou ? 'Group member' : (p.role || '')}</small></div>
    ${isYou ? '' : `<button type="button" class="dmm-remove" data-remove="${m.key}" title="Remove from group">Remove</button>`}
  </div>`;
}
function renderDmMembers() {
  const dm = dmData[activeDm];
  const panel = document.getElementById('dmMembers');
  if (!dm || !dm.isGroup) return;
  const me = { key: 'me', name: 'You', color: 'var(--maroon)', initials: userEmail ? userEmail.slice(0, 2).toUpperCase() : 'ME' };
  const adding = panel.classList.contains('adding');
  const q = (document.getElementById('dmmSearch')?.value || '').toLowerCase();
  const others = peopleData.filter(p => !dm.members.some(m => m.key === p.key) && (!q || p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q)));
  panel.innerHTML = `
    <div class="dmm-head">
      <span>${adding ? 'Add people' : `Members · ${dm.members.length + 1}`}</span>
      <button type="button" class="dmm-close" id="dmmClose" aria-label="Close">×</button>
    </div>
    ${adding ? `
      <div class="cd-search-row"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input class="cd-search" id="dmmSearch" placeholder="Search people…" value="${q.replace(/"/g, '&quot;')}" autocomplete="off" /></div>
      <div class="dmm-list">${others.map(p => `<div class="dmm-row">
        <div class="cd-av" style="background:${p.color}">${p.initials}${p.online ? '<span class="cd-online"></span>' : ''}</div>
        <div class="cd-info"><span>${p.name}</span><small>${p.role}</small></div>
        <button type="button" class="dmm-add" data-add="${p.key}">Add</button></div>`).join('') || '<div class="nd-empty">Everyone is already in this group</div>'}</div>
      <button type="button" class="dmm-back" id="dmmBack">← Back to members</button>`
    : `
      <button type="button" class="dmm-add-row" id="dmmAddPeople">
        <span class="dmm-add-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg></span>
        Add people
      </button>
      <div class="dmm-list">${_memberRow(me, true)}${dm.members.map(m => _memberRow(m, false)).join('')}</div>`}`;
  if (adding) {
    const input = document.getElementById('dmmSearch');
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}
function openDmMembers(adding = false) {
  const panel = document.getElementById('dmMembers');
  panel.classList.toggle('adding', adding);
  panel.classList.remove('hidden');
  renderDmMembers();
}
function closeDmMembers() {
  const panel = document.getElementById('dmMembers');
  panel?.classList.add('hidden');
  panel?.classList.remove('adding');
}
function _refreshGroupHeader(note) {
  const dm = dmData[activeDm];
  dm.messages.push({ type: 'system', text: note });
  const keepOpen = !document.getElementById('dmMembers').classList.contains('hidden');
  const adding = document.getElementById('dmMembers').classList.contains('adding');
  loadDmConversation(activeDm);
  renderDmList();
  if (keepOpen) openDmMembers(adding);
}
document.getElementById('dmMembers').addEventListener('click', e => {
  e.stopPropagation();
  const dm = dmData[activeDm];
  if (e.target.closest('#dmmClose')) return closeDmMembers();
  if (e.target.closest('#dmmAddPeople')) return openDmMembers(true);
  if (e.target.closest('#dmmBack')) return openDmMembers(false);
  const add = e.target.closest('[data-add]');
  if (add) {
    const p = peopleData.find(x => x.key === add.dataset.add);
    dm.members.push({ key: p.key, name: p.name, color: p.color, initials: p.initials });
    return _refreshGroupHeader(`You added <strong>${p.name}</strong> to the group`);
  }
  const rm = e.target.closest('[data-remove]');
  if (rm) {
    if (dm.members.length <= 2) return;
    const m = dm.members.find(x => x.key === rm.dataset.remove);
    dm.members = dm.members.filter(x => x.key !== m.key);
    return _refreshGroupHeader(`You removed <strong>${m.name}</strong> from the group`);
  }
});
document.getElementById('dmMembers').addEventListener('input', e => {
  if (e.target.id === 'dmmSearch') renderDmMembers();
});
document.getElementById('dmConvoHeader').addEventListener('click', e => {
  if (!e.target.closest('.dm-members-btn, .dm-convo-info.is-group')) return;
  e.stopPropagation();
  document.getElementById('dmMembers').classList.contains('hidden') ? openDmMembers(false) : closeDmMembers();
});
document.addEventListener('click', e => {
  if (!e.target.closest('#dmMembers, .dm-members-btn, .dm-convo-info.is-group')) closeDmMembers();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDmMembers(); });

// ── "add @name" IN THE COMPOSER ──
// Matches the longest name first so "@Priya Nair" wins over "@Priya".
function _mentionedPeople(text) {
  const found = [];
  const names = peopleData.flatMap(p => [[p.name, p], [p.name.split(' ')[0], p]]).sort((a, b) => b[0].length - a[0].length);
  text.replace(/@([^@]+)/g, (_, rest) => {
    const hit = names.find(([n]) => rest.toLowerCase().startsWith(n.toLowerCase()) && !/\w/.test(rest[n.length] || ''));
    if (hit && !found.includes(hit[1])) found.push(hit[1]);
  });
  return found;
}
const _asMember = p => ({ key: p.key, name: p.name, color: p.color, initials: p.initials });
function _addToGroup(people) {
  const dm = dmData[activeDm];
  const fresh = people.filter(p => !dm.members.some(m => m.key === p.key));
  if (!fresh.length) {
    const msgs = document.getElementById('dmMessages');
    msgs.insertAdjacentHTML('beforeend', `<div class="dm-system-note">${people.map(p => `<strong>${p.name}</strong>`).join(', ')} ${people.length > 1 ? 'are' : 'is'} already in this group</div>`);
    msgs.scrollTop = msgs.scrollHeight;
    return;
  }
  dm.members.push(...fresh.map(_asMember));
  dm.lastActive = Date.now();
  _refreshGroupHeader(`You added ${fresh.map(p => `<strong>${p.name}</strong>`).join(', ')} to the group`);
}
function _startGroupWith(people) {
  if (people.length === 1) return openDmWith(people[0].key);
  const members = people.map(_asMember);
  const name = members.map(m => m.name.split(' ')[0]).join(', ');
  const key = 'group-' + Date.now();
  dmData[key] = {
    name, isGroup: true, members, color: members[0].color,
    initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    online: false, unread: 0, lastActive: Date.now(),
    messages: [{ type: 'system', text: `You started a group with ${members.map(m => `<strong>${m.name}</strong>`).join(', ')}` }],
  };
  activeDm = key;
  renderDmList();
  loadDmConversation(key);
  setTimeout(() => document.getElementById('dmInput')?.focus(), 50);
}
function _runAddCommand(text) {
  if (!/^\s*add\s+@/i.test(text)) return false;
  const people = _mentionedPeople(text);
  if (!people.length) return false;
  if (dmData[activeDm].isGroup) _addToGroup(people);
  else _startGroupWith([peopleData.find(p => p.key === activeDm), ...people.filter(p => p.key !== activeDm)].filter(Boolean));
  return true;
}

// "@" opens a people picker: tick several people, then start a group (or add them to this one).
const _MENTION_TOKEN = /(?:^|\s)@([A-Za-z]*(?: [A-Za-z]*)?)$/;
let _mentionHits = [], _mentionIdx = 0, _mentionPicked = [], _mentionOpen = false;
function _mentionQuery(input) {
  const m = input.value.slice(0, input.selectionStart).match(_MENTION_TOKEN);
  return m ? m[1] : null;
}
function renderMention() {
  const input = document.getElementById('dmInput');
  const box = document.getElementById('dmMention');
  const dm = dmData[activeDm];
  const q = _mentionQuery(input);
  if (q === null || !dm) return closeMention();
  if (!_mentionOpen) {
    _mentionOpen = true;
    _mentionPicked = dm.isGroup || !peopleData.some(p => p.key === activeDm) ? [] : [activeDm];
  }
  const ql = q.toLowerCase();
  const inGroup = p => dm.isGroup && dm.members.some(m => m.key === p.key);
  _mentionHits = peopleData.filter(p => !inGroup(p) && (!ql || p.name.toLowerCase().split(' ').some(w => w.startsWith(ql)) || p.name.toLowerCase().startsWith(ql)));
  _mentionIdx = Math.max(0, Math.min(_mentionIdx, _mentionHits.length - 1));
  const picked = _mentionPicked.map(k => peopleData.find(p => p.key === k));
  const n = picked.length;
  const goLabel = dm.isGroup ? `Add ${n || ''} to group` : (n === 1 ? `Chat with ${picked[0].name.split(' ')[0]}` : `Start group chat${n ? ` · ${n}` : ''}`);
  const check = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  box.innerHTML = `
    <div class="dmn-head">${dm.isGroup ? 'Add people to this group' : 'Pick people for a group chat'}</div>
    ${n ? `<div class="dmn-chips">${picked.map(p => `<span class="nd-chip"><span class="nd-chip-av" style="background:${p.color}">${p.initials}</span>${p.name.split(' ')[0]}<button type="button" data-pick="${p.key}" aria-label="Remove ${p.name}">×</button></span>`).join('')}</div>` : ''}
    <div class="dmn-list">${_mentionHits.map((p, i) => {
      const on = _mentionPicked.includes(p.key);
      return `<button type="button" class="dmn-row${i === _mentionIdx ? ' active' : ''}${on ? ' picked' : ''}" data-pick="${p.key}" role="option" aria-selected="${on}">
        <div class="cd-av" style="background:${p.color}">${p.initials}${p.online ? '<span class="cd-online"></span>' : ''}</div>
        <div class="cd-info"><span>${p.name}</span><small>${p.role}</small></div>
        <span class="dmn-check">${on ? check : ''}</span>
      </button>`;
    }).join('') || '<div class="nd-empty">No one matches that name</div>'}</div>
    <div class="dmn-foot">
      <span class="dmn-hint">↵ select · ⌘↵ ${dm.isGroup ? 'add' : 'start'}</span>
      <button type="button" class="dmn-go" id="dmnGo"${n ? '' : ' disabled'}>${goLabel}</button>
    </div>`;
  box.classList.remove('hidden');
  box.querySelector('.dmn-row.active')?.scrollIntoView({ block: 'nearest' });
}
function _stripMentionToken() {
  const input = document.getElementById('dmInput');
  const before = input.value.slice(0, input.selectionStart).replace(/(^|\s)@[A-Za-z]*(?: [A-Za-z]*)?$/, '$1');
  input.value = (before + input.value.slice(input.selectionStart)).replace(/^\s+$/, '');
  input.setSelectionRange(before.length, before.length);
  syncSendBtn(input, document.getElementById('dmSendBtn'));
}
function closeMention(strip = false) {
  if (strip && _mentionOpen) _stripMentionToken();
  document.getElementById('dmMention').classList.add('hidden');
  _mentionHits = []; _mentionIdx = 0; _mentionPicked = []; _mentionOpen = false;
}
function toggleMention(key) {
  const i = _mentionPicked.indexOf(key);
  i < 0 ? _mentionPicked.push(key) : _mentionPicked.splice(i, 1);
  // Clear what was typed after "@" so the full list comes back for the next pick.
  const input = document.getElementById('dmInput');
  const before = input.value.slice(0, input.selectionStart).replace(/@[A-Za-z]*(?: [A-Za-z]*)?$/, '@');
  input.value = before + input.value.slice(input.selectionStart);
  input.focus();
  input.setSelectionRange(before.length, before.length);
  renderMention();
}
function confirmMention() {
  const people = _mentionPicked.map(k => peopleData.find(p => p.key === k));
  if (!people.length) return;
  const isGroup = dmData[activeDm].isGroup;
  closeMention(true);
  isGroup ? _addToGroup(people) : _startGroupWith(people);
}
function _mentionKeydown(e) {
  if (!_mentionOpen) return false;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (!_mentionHits.length) return true;
    _mentionIdx = (_mentionIdx + (e.key === 'ArrowDown' ? 1 : -1) + _mentionHits.length) % _mentionHits.length;
    renderMention();
    return true;
  }
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); confirmMention(); return true; }
  if (e.key === 'Enter' || e.key === 'Tab') {
    e.preventDefault();
    if (_mentionHits[_mentionIdx]) toggleMention(_mentionHits[_mentionIdx].key);
    else confirmMention();
    return true;
  }
  if (e.key === 'Escape') { closeMention(true); return true; }
  return false;
}
document.getElementById('dmInput').addEventListener('input', () => { _mentionIdx = 0; renderMention(); });
document.getElementById('dmInput').addEventListener('blur', () => setTimeout(() => {
  if (document.activeElement !== document.getElementById('dmInput')) closeMention(true);
}, 150));
document.getElementById('dmMention').addEventListener('mousedown', e => {
  e.preventDefault();
  if (e.target.closest('#dmnGo')) return confirmMention();
  const row = e.target.closest('[data-pick]');
  if (row) toggleMention(row.dataset.pick);
});

// ── SEARCH INSIDE A DM ──
let _dmHits = [], _dmHitIdx = -1;
function _clearDmHits() {
  document.querySelectorAll('#dmMessages mark.dm-hit').forEach(m => {
    const parent = m.parentNode;
    parent.replaceChild(document.createTextNode(m.textContent), m);
    parent.normalize();
  });
  _dmHits = []; _dmHitIdx = -1;
}
function _focusDmHit() {
  _dmHits.forEach((h, i) => h.classList.toggle('current', i === _dmHitIdx));
  const count = document.getElementById('dmFindCount');
  const q = document.getElementById('dmFindInput').value.trim();
  count.textContent = !q ? '' : _dmHits.length ? `${_dmHitIdx + 1} of ${_dmHits.length}` : 'No results';
  count.classList.toggle('none', !!q && !_dmHits.length);
  _dmHits[_dmHitIdx]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}
// Highlights every match in message text; starts on the most recent match, like Slack/Teams.
function runDmFind(jumpToLatest = true) {
  _clearDmHits();
  const q = document.getElementById('dmFindInput').value.trim().toLowerCase();
  if (q) {
    document.querySelectorAll('#dmMessages .dm-bubble').forEach(bubble => {
      const walker = document.createTreeWalker(bubble, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => {
        const text = node.nodeValue, lower = text.toLowerCase();
        let i = lower.indexOf(q);
        if (i === -1) return;
        const frag = document.createDocumentFragment();
        let last = 0;
        while (i !== -1) {
          frag.append(text.slice(last, i));
          const mark = document.createElement('mark');
          mark.className = 'dm-hit';
          mark.textContent = text.slice(i, i + q.length);
          frag.append(mark);
          last = i + q.length;
          i = lower.indexOf(q, last);
        }
        frag.append(text.slice(last));
        node.parentNode.replaceChild(frag, node);
      });
    });
    _dmHits = [...document.querySelectorAll('#dmMessages mark.dm-hit')];
    _dmHitIdx = _dmHits.length ? (jumpToLatest ? _dmHits.length - 1 : Math.min(_dmHitIdx, _dmHits.length - 1)) : -1;
    if (!jumpToLatest && _dmHits.length && _dmHitIdx < 0) _dmHitIdx = _dmHits.length - 1;
  }
  _focusDmHit();
}
function stepDmFind(dir) {
  if (!_dmHits.length) return;
  _dmHitIdx = (_dmHitIdx + dir + _dmHits.length) % _dmHits.length;
  _focusDmHit();
}
function openDmFind() {
  const bar = document.getElementById('dmFind');
  bar.classList.remove('hidden');
  document.querySelector('#dmConvoHeader .dm-header-btn[title="Search"]')?.classList.add('active');
  const input = document.getElementById('dmFindInput');
  input.focus();
  input.select();
}
function closeDmFind() {
  _clearDmHits();
  document.getElementById('dmFind').classList.add('hidden');
  document.getElementById('dmFindInput').value = '';
  document.getElementById('dmFindCount').textContent = '';
  document.querySelector('#dmConvoHeader .dm-header-btn[title="Search"]')?.classList.remove('active');
}
document.getElementById('dmFindInput').addEventListener('input', () => runDmFind(true));
document.getElementById('dmFindInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); stepDmFind(e.shiftKey ? 1 : -1); }
  else if (e.key === 'Escape') { e.preventDefault(); closeDmFind(); }
});
document.getElementById('dmFindPrev').addEventListener('click', () => stepDmFind(-1));
document.getElementById('dmFindNext').addEventListener('click', () => stepDmFind(1));
document.getElementById('dmFindClose').addEventListener('click', closeDmFind);
document.getElementById('dmConvoHeader').addEventListener('click', e => {
  if (!e.target.closest('.dm-header-btn[title="Search"]')) return;
  document.getElementById('dmFind').classList.contains('hidden') ? openDmFind() : closeDmFind();
});

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
  { key: 'sarah',   name: 'Sarah Jenkins', role: 'Head of Design',    initials: 'SJ', color: '#7c3aed', online: true,  email: 'sarah.j@yuzu.team',   dept: 'Design', photo: 'assets/avatars/sarah.jpg' },
  { key: 'alex',    name: 'Alex Kim',       role: 'Senior Designer',   initials: 'AK', color: '#059669', online: true,  email: 'alex.k@yuzu.team',    dept: 'Design', photo: 'assets/avatars/alex.jpg' },
  { key: 'david',   name: 'David Chen',     role: 'Lead Engineer',     initials: 'DC', color: '#2563eb', online: false, email: 'david.c@yuzu.team',   dept: 'Engineering' },
  { key: 'jessica', name: 'Jessica Park',   role: 'Marketing Manager', initials: 'JP', color: '#d97706', online: false, email: 'jessica.p@yuzu.team', dept: 'Marketing' },
  { key: 'marcus',  name: 'Marcus Lee',     role: 'Product Manager',   initials: 'ML', color: '#0891b2', online: true,  email: 'marcus.l@yuzu.team',  dept: 'Product', photo: 'assets/avatars/marcus.jpg' },
  { key: 'priya',   name: 'Priya Nair',     role: 'UX Researcher',     initials: 'PN', color: '#be185d', online: true,  email: 'priya.n@yuzu.team',   dept: 'Design', photo: 'assets/avatars/priya.jpg' },
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
  _joiningMeeting = true;
  try { startGroupCall(m.participants, m.type === 'video', m.participants.length > 1 ? m.title : null); } finally { _joiningMeeting = false; }
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
      openDmWith(key);
    });
    el.querySelector('.pha-call')?.addEventListener('click', e => {
      e.stopPropagation();
      startCall(el.dataset.personKey);
    });
  });
}

let activePersonKey = 'sarah';

// Opens the 1:1 chat with a person, creating an empty one if you haven't messaged them yet.
function openDmWith(key) {
  const p = peopleData.find(x => x.key === key);
  if (!dmData[key]) {
    if (!p) return;
    dmData[key] = { name: p.name, color: p.color, initials: p.initials, online: p.online, unread: 0, messages: [] };
  }
  activeDm = key;
  navigateTo('dms');
  renderDmList();
  loadDmConversation(key);
  if (typeof isMobile === 'function' && isMobile()) mobOpenDetail();
  setTimeout(() => document.getElementById('dmInput')?.focus(), 50);
}

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
    openDmWith(personKey);
  };
  document.getElementById('caCallBtn').onclick = () => startCall(personKey);
  document.getElementById('caVideoBtn').onclick = () => {
    const pd = peopleData.find(x => x.key === personKey);
    if (pd) startGroupCall([pd], true);
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
    <div class="dm-convo-avatar" style="background:#0d8f82; font-size:16px; font-weight:700;">${ch.isPrivate ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-label="Private"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>' : '#'}</div>
    <div class="dm-convo-info">
      <div class="dm-convo-name">${ch.displayName}</div>
      <div class="dm-convo-status" style="color:var(--text-muted)">${ch.isPrivate ? 'Private · ' : ''}${ch.members} members</div>
    </div>
    <div class="dm-header-actions">
      <div class="dm-call-group" role="group" aria-label="Start a call">
      <button class="dm-header-btn" title="Video call">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 10L20.553 6.724C21.224 6.566 22 7.05 22 7.764V16.236C22 16.95 21.224 17.434 20.553 17.276L15 14V10Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><rect x="2" y="6" width="13" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>
      </button>
      <button class="dm-header-btn" title="Call">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>
      </button>
      </div>
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
    if (msg.type === 'system') { msgs.insertAdjacentHTML('beforeend', `<div class="dm-system-note">${msg.text}</div>`); return; }
    const prevMsg = ch.messages[i - 1];
    const showSender = !prevMsg || prevMsg.from !== msg.from || prevMsg.type === 'system';
    const isMe = msg.from === 'me';
    const timeHTML = `<div class="dm-bubble-time">${msg.time}${isMe ? ' <svg class="dm-tick" width="16" height="10" viewBox="0 0 16 10" fill="none" aria-label="Read"><path d="M1 5.2 3.8 8 9.6 1.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.4 7.2 7.2 8 13 1.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}</div>`;
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
  const timeHTML = `<div class="dm-bubble-time">Just now <svg class="dm-tick" width="16" height="10" viewBox="0 0 16 10" fill="none" aria-label="Read"><path d="M1 5.2 3.8 8 9.6 1.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.4 7.2 7.2 8 13 1.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
  msgs.insertAdjacentHTML('beforeend', `<div class="dm-msg-row me"><div class="dm-msg-col-me"><div class="dm-bubble">${text}</div>${timeHTML}</div></div>`);
  msgs.scrollTop = msgs.scrollHeight;
  renderCallChat();
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
document.getElementById('esNewChannelBtn').addEventListener('click', e => { e.stopPropagation(); window.openChannelDropdown(e.currentTarget); });
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
  if (_mentionKeydown(e)) return;
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
      startGroupCall([withPerson], true);
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
let callSpeakerOn = true;

function _fmtClock(n, padMin) {
  const m = Math.floor(n / 60);
  const s = String(n % 60).padStart(2, '0');
  return padMin ? String(m).padStart(2, '0') + ':' + s : m + ':' + s;
}
function _paintTimers() {
  const c = document.getElementById('csTimer');
  if (c) c.textContent = _fmtClock(callSeconds, true);
  if (!document.getElementById('navCallBtn').classList.contains('hidden')) _paintNavCall();
  if (callsV2) _paintMeetInfo();
  if (callsV2 && _pipOpen()) document.getElementById('pipTime').textContent = _fmtClock(callSeconds, true);
  _paintCallerSub();
  _paintCwStatus();
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
  callSpeakerOn = true;
  callSeconds = 0;
  _stopCallTimer();
}
// Line under the name on the 1:1 call screen: status while ringing or held, then the call timer.
function _paintCallerSub() {
  const ringing = !callParticipants.some(p => p.joined);
  document.getElementById('csCallerSub').textContent =
    _shareNotice || (callHeld ? 'On hold' : (ringing ? 'Ringing…' : _fmtClock(callSeconds, true)));
}
function _paintCwStatus() {
  const joined = callParticipants.filter(p => p.joined).length;
  const live = joined ? _fmtClock(callSeconds, true) + (_isGroupCall() ? ` · ${joined + 1} in call` : '') : 'Ringing…';
  document.getElementById('cwPersonStatus').textContent = callHeld ? 'On hold' : (screenShareStream ? 'Presenting · ' : '') + live;
}
function _paintCallStatus() {
  const ringing = callParticipants.length > 0 && callParticipants.some(p => !p.joined);
  const live = callParticipants.some(p => p.joined);
  const label = _shareNotice || (callHeld ? 'On hold' : (ringing ? 'Ringing…' : ''));
  const statusEl = document.getElementById('csStatus');
  const timerEl = document.getElementById('csTimer');
  if (statusEl) {
    statusEl.textContent = label;
    statusEl.classList.toggle('hidden', !label);
  }
  if (timerEl) timerEl.classList.toggle('hidden', !live && !callHeld && ringing);
  _paintCallerSub();
  document.getElementById('callScreen').classList.toggle('on-hold', callHeld);
  _paintWidget();
  document.getElementById('callWidget').classList.toggle('on-hold', callHeld);
  if (callsV2) _syncMeetChrome();
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
  _putCallIcon(document.getElementById('csMuteBtn'), callMuted ? CALL_SVG.micOff : CALL_SVG.mic);
  const cwMute = document.getElementById('cwMuteBtn');
  cwMute.classList.toggle('on', callMuted);
  _putCallIcon(cwMute, callMuted ? CALL_SVG.micOff : CALL_SVG.mic);
  cwMute.querySelector('span').textContent = callMuted ? 'Unmute' : 'Mute';
  const cwSpk = document.getElementById('cwSpeakerBtn');
  cwSpk.classList.toggle('dim', !callSpeakerOn);
  _putCallIcon(cwSpk, CALL_SVG.speaker);
  const cwHold = document.getElementById('cwHoldBtn');
  cwHold.classList.toggle('on', callHeld);
  cwHold.querySelector('span').textContent = callHeld ? 'Resume' : 'Hold';
  const camOn = !!vcCameraOn;
  document.getElementById('csCameraBtn').querySelector('.cs-ctl-icon').classList.toggle('cs-ctl-icon-blue', camOn);
  const cwVideo = document.getElementById('cwVideoBtn');
  const camLive = camOn && document.getElementById('callScreen').classList.contains('video-mode');
  cwVideo.classList.toggle('on', camLive);
  _putCallIcon(cwVideo, camLive ? CALL_SVG.video : CALL_SVG.videoOff);
  _putCallIcon(document.getElementById('csCameraBtn'), camOn ? CALL_SVG.video : CALL_SVG.videoOff);
  const spkIcon = document.getElementById('csSpeakerBtn').querySelector('.cs-ctl-icon');
  spkIcon.classList.toggle('cs-ctl-icon-active', !callSpeakerOn);
  _putCallIcon(spkIcon, callSpeakerOn ? CALL_SVG.speaker : CALL_SVG.speakerOff);
  document.getElementById('csSpeakerLabel').textContent = 'Speaker';
  document.getElementById('csMuteLabel').textContent = callMuted ? 'Unmute' : 'Mute';
  document.getElementById('csHoldBtn').querySelector('.cs-ctl-icon').classList.toggle('cs-ctl-icon-active', callHeld);
  document.getElementById('csHoldLabel').textContent = callHeld ? 'Resume' : 'Hold';
  const sharing = !!screenShareStream;
  const shareIcon = document.getElementById('csShareBtn').querySelector('.cs-ctl-icon');
  shareIcon.classList.toggle('cs-ctl-icon-blue', sharing);
  document.getElementById('csShareLabel').textContent = sharing ? 'Stop' : 'Share';
  document.getElementById('csShareBtn').title = sharing ? 'Stop sharing' : 'Share screen';
  const addOpen = !document.getElementById('csAddPanel').classList.contains('hidden');
  document.getElementById('csAddCallerBtn').classList.toggle('is-open', addOpen);
  _syncSelfTile();
  _paintCallStatus();
}

// 1:1 voice calls open in the phone-style call widget.
function startCall(personKey) {
  if (callsV2) return startGroupCall([personKey], false);
  endCall();
  const p = peopleData.find(x => x.key === personKey) || dmData[personKey];
  if (!p) return;
  startCallWith(p.name, '', p.color || '#7c3aed', p.initials || '??', false);
  _linkCall(_adHocConvo([personKey]));
  showCallWidget();
}

function _isGroupCall() {
  return callParticipants.length > 1 || !!callTitle;
}
function showCallWidget() {
  if (!callParticipants.length) return;
  if (callsV2) return _showPip();
  const w = document.getElementById('callWidget');
  document.getElementById('csAddPanel').classList.add('hidden');
  _closeReactPanel();
  _stashCallScreen();
  w.classList.remove('hidden');
  _paintWidget();
  _paintTimers();
  _paintCallStatus();
  _syncCallChrome();
}
function _paintWidget() {
  const w = document.getElementById('callWidget');
  if (w.classList.contains('hidden') || !callParticipants.length) return;
  const group = _isGroupCall();
  w.classList.toggle('group', group);
  const shown = callParticipants.slice(0, group ? 3 : 1);
  const extra = callParticipants.length - shown.length;
  document.getElementById('cwAvatars').innerHTML =
    shown.map(p => `<div class="cw-av" style="${_avStyle(p)}">${p.initials}</div>`).join('') +
    (extra > 0 ? `<div class="cw-av cw-av-more">+${extra}</div>` : '');
  document.getElementById('cwPersonName').textContent = _callLabel();

  const link = group ? (callConvo ? 'Open chat' : '') : (peopleData.some(x => x.key === callParticipants[0].key) ? 'View profile' : '');
  document.getElementById('cwContextLabel').textContent = group ? 'Group call' : 'Yuzu Internal';
  document.getElementById('cwContextLinkText').textContent = link;
  document.getElementById('cwContextLink').classList.toggle('hidden', !link);
  document.getElementById('cwContextSep').classList.toggle('hidden', !link);

  const people = document.getElementById('cwPeople');
  people.classList.toggle('hidden', !group);
  people.innerHTML = group ? callParticipants.map(x => {
    const state = !x.joined ? 'Ringing…' : (x.muted ? 'Muted' : 'In call');
    return `<div class="cw-person">
      <div class="cw-person-av" style="${_avStyle(x)}">${x.initials}</div>
      <span class="cw-person-name">${x.name}</span>
      <span class="cw-person-state${x.joined && !x.muted ? ' live' : ''}">${state}</span>
      <button class="cw-person-x" data-remove="${x.key}" title="Remove from call">×</button>
    </div>`;
  }).join('') : '';
  _paintCwStatus();
}
function _renderCwAdd() {
  const q = document.getElementById('cwAddSearch').value.trim().toLowerCase();
  const list = peopleData.filter(p => !q || p.name.toLowerCase().includes(q) || (p.role || '').toLowerCase().includes(q));
  document.getElementById('cwAddList').innerHTML = list.length ? list.map(p => {
    const inCall = callParticipants.some(c => c.key === p.key);
    return `<button type="button" class="cw-add-item${inCall ? ' in-call' : ''}" data-key="${p.key}">
      <div class="cw-add-av" style="${_avStyle(p)}">${p.initials}</div>
      <span>${p.name}<small>${inCall ? 'In call' : (p.role || '')}</small></span>
    </button>`;
  }).join('') : '<div class="cw-add-empty">No people found</div>';
}
function _openCwAdd() {
  const add = document.getElementById('cwAdd');
  if (!add.classList.contains('hidden')) return _closeCwAdd();
  document.getElementById('cwAddSearch').value = '';
  _renderCwAdd();
  add.classList.remove('hidden');
  document.getElementById('cwAddSearch').focus();
}
function _closeCwAdd() {
  document.getElementById('cwAdd').classList.add('hidden');
}

function endCall() {
  if (callsV2) _resetMeet();
  document.getElementById('navCallBtn').classList.add('hidden');
  _closeCallConvo();
  _stopCallTimer();
  stopScreenShare(true);
  stopVideoStream();
  _shareNotice = '';
  clearTimeout(_shareNoticeTimer);
  _resetCallFlags();
  _resetCallParticipants();
  _hideCallScreen();
  const cw = document.getElementById('callWidget');
  cw.classList.add('hidden');
  cw.style.left = cw.style.top = cw.style.right = cw.style.bottom = '';
  _closeCwAdd();
  document.getElementById('csAddPanel').classList.add('hidden');
  _paintTimers();
  callMuted = false;
  vcMuted = false;
  callHeld = false;
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
}
function toggleSpeaker() {
  callSpeakerOn = !callSpeakerOn;
  _syncCallChrome();
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
// Call from DM header (event delegation)
document.getElementById('dmView').addEventListener('click', e => {
  const dm = dmData[activeDm];
  const video = !!e.target.closest('.dm-header-btn[title="Video call"]');
  if (!video && !e.target.closest('.dm-header-btn[title="Call"]')) return;
  const convo = { kind: 'dm', key: activeDm };
  if (dm && dm.isGroup) startGroupCall(dm.members, video, dm.name, convo);
  else if (video) startGroupCall([activeDm], true, null, convo);
  else startCall(activeDm);
});

// Call from channel header
document.getElementById('channelView').addEventListener('click', e => {
  const video = !!e.target.closest('.dm-header-btn[title="Video call"]');
  if (!video && !e.target.closest('.dm-header-btn[title="Call"]')) return;
  const ch = channelData[activeChannel];
  const members = channelMembers[activeChannel] || [];
  if (members.length) startGroupCall(members, video, ch ? ch.displayName : null, { kind: 'channel', key: activeChannel });
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

// ── NEW MESSAGE (one person = DM, several = group) ──
(function() {
  const btn = document.getElementById('quickNewDmBtn');
  const dd = document.getElementById('dmDropdown');
  const search = document.getElementById('ddmSearch');
  const list = document.getElementById('ddmList');
  const chips = document.getElementById('ddmSelectedChips');
  const footer = document.getElementById('ddmFooter');
  const nameIn = document.getElementById('ddmGroupName');
  const go = document.getElementById('ddmGo');
  const CHECK = `<svg width="16" height="16" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const picked = [];

  const person = k => peopleData.find(p => p.key === k);

  function render() {
    const q = search.value.trim().toLowerCase();
    list.innerHTML = peopleData
      .filter(p => !q || p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q))
      .map(p => `
        <div class="cd-item${picked.includes(p.key) ? ' selected' : ''}" data-key="${p.key}">
          <button type="button" class="cd-pick" aria-pressed="${picked.includes(p.key)}" aria-label="${picked.includes(p.key) ? 'Remove' : 'Add'} ${p.name}">
            <span class="cd-av" style="background:${p.color}">${p.initials}<span class="cd-av-check" aria-hidden="true">${CHECK}</span>${p.online ? '<span class="cd-online"></span>' : ''}</span>
            <span class="cd-info"><span>${p.name}</span><small>${p.role}</small></span>
          </button>
        </div>`).join('') || '<div class="nd-empty">No one matches that search</div>';
    chips.classList.toggle('hidden', !picked.length);
    chips.innerHTML = picked.map(k => { const p = person(k); return `<span class="nd-chip"><span class="nd-chip-av" style="background:${p.color}">${p.initials}</span>${p.name.split(' ')[0]}<button type="button" data-rm="${k}" aria-label="Remove ${p.name}">×</button></span>`; }).join('');
    footer.classList.toggle('hidden', !picked.length);
    nameIn.classList.toggle('hidden', picked.length < 2);
    go.innerHTML = picked.length === 1
      ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Message ${person(picked[0]).name.split(' ')[0]}`
      : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>Start group · ${picked.length} people`;
  }

  function toggle(key) {
    const i = picked.indexOf(key);
    i === -1 ? picked.push(key) : picked.splice(i, 1);
    render();
  }

  function openChat() {
    if (!picked.length) return;
    let key;
    if (picked.length === 1) {
      closeAllQuickDds();
      openDmWith(picked[0]);
      return;
    } else {
      const members = picked.map(k => { const p = person(k); return { key: p.key, name: p.name, color: p.color, initials: p.initials }; });
      const name = nameIn.value.trim() || members.map(m => m.name.split(' ')[0]).join(', ');
      key = 'group-' + Date.now();
      dmData[key] = {
        name, isGroup: true, members, color: members[0].color,
        initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        online: false, unread: 0, lastActive: Date.now(), messages: [],
      };
    }
    closeAllQuickDds();
    activeDm = key;
    navigateTo('dms');
    renderDmList();
    loadDmConversation(key);
    if (isMobile()) mobOpenDetail();
  }

  window.openDmDropdown = function(triggerEl) {
    if (!dd.classList.contains('hidden')) { closeAllQuickDds(); return; }
    openQuickDd(dd, triggerEl || btn, () => {
      picked.length = 0;
      search.value = '';
      nameIn.value = '';
      render();
      search.focus();
    });
  };
  btn.addEventListener('click', e => { e.stopPropagation(); window.openDmDropdown(btn); });

  search.addEventListener('input', render);
  search.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const rows = list.querySelectorAll('.cd-item');
    if (rows.length === 1 && !picked.includes(rows[0].dataset.key)) { toggle(rows[0].dataset.key); search.value = ''; render(); }
    else openChat();
  });
  list.addEventListener('click', e => {
    const row = e.target.closest('.cd-item');
    if (!row) return;
    e.stopPropagation();
    toggle(row.dataset.key);
  });
  chips.addEventListener('click', e => {
    const rm = e.target.closest('[data-rm]');
    if (!rm) return;
    e.stopPropagation();
    toggle(rm.dataset.rm);
  });
  nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') openChat(); });
  go.addEventListener('click', e => { e.stopPropagation(); openChat(); });
  dd.addEventListener('click', e => e.stopPropagation());
})();

// ── NEW CHANNEL (private only for now: name + the people you add) ──
(function() {
  const btn = document.getElementById('quickChannelBtn');
  const dd = document.getElementById('channelDropdown');
  const nameIn = document.getElementById('qdChannelName');
  const err = document.getElementById('qdChannelErr');
  const search = document.getElementById('qdChannelSearch');
  const list = document.getElementById('qdChannelList');
  const chips = document.getElementById('qdChannelChips');
  const go = document.getElementById('qdChannelCreate');
  const CHECK = `<svg width="16" height="16" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const LOCK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;
  const picked = [];
  const person = k => peopleData.find(p => p.key === k);
  const slug = v => v.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '').replace(/-{2,}/g, '-');

  function paintGo() {
    const name = slug(nameIn.value);
    const taken = name && channelData[name];
    err.textContent = taken ? `#${name} already exists` : '';
    err.classList.toggle('hidden', !taken);
    go.disabled = !name || !!taken;
    go.innerHTML = !name ? 'Name the channel'
      : `${LOCK}Create #${name}${picked.length ? ` · ${picked.length + 1} people` : ''}`;
  }

  function render() {
    const q = search.value.trim().toLowerCase();
    list.innerHTML = peopleData
      .filter(p => !q || p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q))
      .map(p => `
        <div class="cd-item${picked.includes(p.key) ? ' selected' : ''}" data-key="${p.key}">
          <button type="button" class="cd-pick" aria-pressed="${picked.includes(p.key)}" aria-label="${picked.includes(p.key) ? 'Remove' : 'Add'} ${p.name}">
            <span class="cd-av" style="background:${p.color}">${p.initials}<span class="cd-av-check" aria-hidden="true">${CHECK}</span>${p.online ? '<span class="cd-online"></span>' : ''}</span>
            <span class="cd-info"><span>${p.name}</span><small>${p.role}</small></span>
          </button>
        </div>`).join('') || '<div class="nd-empty">No one matches that search</div>';
    chips.classList.toggle('hidden', !picked.length);
    chips.innerHTML = picked.map(k => { const p = person(k); return `<span class="nd-chip"><span class="nd-chip-av" style="background:${p.color}">${p.initials}</span>${p.name.split(' ')[0]}<button type="button" data-rm="${k}" aria-label="Remove ${p.name}">×</button></span>`; }).join('');
    paintGo();
  }

  function toggle(key) {
    const i = picked.indexOf(key);
    i === -1 ? picked.push(key) : picked.splice(i, 1);
    render();
  }

  function create() {
    const name = slug(nameIn.value);
    if (!name || channelData[name]) { nameIn.focus(); return; }
    const memberList = picked.map(k => { const p = person(k); return { key: p.key, name: p.name, color: p.color, initials: p.initials }; });
    const added = memberList.map(m => m.name.split(' ')[0]);
    channelData[name] = {
      name, displayName: name, isPrivate: true, members: memberList.length + 1, memberList,
      messages: [{ type: 'system', text: `You created this private channel${added.length ? ` and added ${added.length > 1 ? added.slice(0, -1).join(', ') + ' and ' + added.at(-1) : added[0]}` : ''}` }],
    };
    const recent = document.querySelector('.channel-item[data-channel]')?.parentElement;
    recent?.insertAdjacentHTML('afterbegin', `<div class="channel-item" data-channel="${name}"><div class="channel-icon teal" style="color:#0d8f82">${LOCK}</div><div class="channel-body"><span class="channel-name">${name}</span><span class="channel-members">Private · ${memberList.length + 1} members</span></div></div>`);
    closeAllQuickDds();
    loadChannelConversation(name);
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    if (isMobile()) mobOpenDetail();
  }

  window.openChannelDropdown = function(triggerEl) {
    if (!dd.classList.contains('hidden')) { closeAllQuickDds(); return; }
    openQuickDd(dd, triggerEl || btn, () => {
      picked.length = 0;
      nameIn.value = '';
      search.value = '';
      render();
      nameIn.focus();
    });
  };
  btn.addEventListener('click', e => { e.stopPropagation(); window.openChannelDropdown(btn); });

  nameIn.addEventListener('input', paintGo);
  nameIn.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    slug(nameIn.value) && search.focus();
  });
  search.addEventListener('input', render);
  search.addEventListener('keydown', e => {
    if (e.key === 'Backspace' && !search.value && picked.length) { picked.pop(); render(); return; }
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const first = list.querySelector('.cd-item:not(.selected)');
    if (search.value.trim() && first) { toggle(first.dataset.key); search.value = ''; render(); }
    else create();
  });
  list.addEventListener('click', e => {
    const row = e.target.closest('.cd-item');
    if (!row) return;
    e.stopPropagation();
    toggle(row.dataset.key);
  });
  chips.addEventListener('click', e => {
    const rm = e.target.closest('[data-rm]');
    if (!rm) return;
    e.stopPropagation();
    toggle(rm.dataset.rm);
  });
  go.addEventListener('click', e => { e.stopPropagation(); create(); });
  dd.addEventListener('click', e => e.stopPropagation());
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
    vcStream = await navigator.mediaDevices.getUserMedia(_mediaConstraints(true, true));
    const localEl = document.getElementById('localVideo');
    localEl.srcObject = vcStream;
    document.getElementById('csSelfFallback').classList.add('hidden');
    vcCameraOn = true;
    if (_joinCamOff) {
      _joinCamOff = false;
      vcStream.getVideoTracks().forEach(t => { t.enabled = false; });
      vcCameraOn = false;
      document.getElementById('csSelfFallback').classList.remove('hidden');
    }
    if (bgEffect !== 'none') _applyBg();
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
  _stopBg();
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
      tile.dataset.key = 'share';
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

let _viewBeforeShare = null;
const SHARE_TAG_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>';
function _paintPresenting() {
  const on = !!screenShareStream;
  const group = document.getElementById('callScreen').classList.contains('group-call');
  if (on && group && _viewBeforeShare === null) { _viewBeforeShare = callView; callPinnedKey = null; setCallView('speaker'); }
  else if (!on && _viewBeforeShare !== null) { const v = _viewBeforeShare; _viewBeforeShare = null; setCallView(v); }
  else if (group) { document.getElementById('csStage').dataset.key = ''; _renderStage(); }
  document.getElementById('csPresentBar').classList.toggle('hidden', !on);
  _paintCwStatus();
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
  // v2 keeps presenting inside the minimized window, like Meet's picture-in-picture.
  if (screen.classList.contains('hidden') && !_pipOpen()) {
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
  _hideRejoin();
  _closeCallConvo();
  _stopCallTimer();
  if (startSecs == null) {
    callMuted = false;
    vcMuted = false;
    callHeld = false;
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

function _photoOf(key) { return peopleData.find(p => p.key === key)?.photo || ''; }
// Avatar markup: photo when the person has one, initials on their colour otherwise.
function _avStyle(p) {
  const photo = _photoOf(p.key);
  return photo ? `background:${p.color} url('${photo}') center/cover no-repeat;color:transparent` : `background:${p.color}`;
}

function _callLabel() {
  if (callTitle) return callTitle;
  const names = callParticipants.map(p => p.name.split(' ')[0]);
  if (names.length <= 1) return callParticipants[0]?.name || '';
  if (names.length <= 3) return names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1];
  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
}

// convo: the chat this call belongs to ({ kind: 'dm' | 'channel', key }). Omitted for ad-hoc calls,
// which reuse the most recently active chat with exactly these people, or open a new group lazily.
function startGroupCall(people, video = false, title = null, convo = null) {
  const list = people
    .map(x => typeof x === 'string' ? (peopleData.find(p => p.key === x) || dmData[x]) : x)
    .filter(Boolean)
    .map(p => ({ key: p.key, name: p.name, color: p.color, initials: p.initials }));
  if (!list.length) return;
  // Direct calls ring right away; only joining a scheduled meeting gets the pre-join check.
  if (callsV2 && _joiningMeeting && !_pjBypass) return _openPreJoin(list, video, title, convo);
  if (list.length === 1 && !title) {
    const p = list[0];
    startCallWith(p.name, '', p.color, p.initials, video);
    _linkCall(convo || _adHocConvo([p.key]));
    if (!video && !callsV2) showCallWidget();
    return;
  }
  startCallWith(list[0].name, '', list[0].color, list[0].initials, video);
  callTitle = title;
  callParticipants = list.map((p, i) => ({ ...p, joined: false, muted: i % 2 === 1 }));
  callParticipants.forEach((p, i) => _joinAfter(p, 1400 + i * 700));
  _linkCall(convo || _adHocConvo(list.map(p => p.key)));
  renderCallLayout();
  if (callsV2) _simulateKnock();
}

let _toastTimer = null;
let _toastHasAction = false;
function callToast(text, action = null) {
  const toast = document.getElementById('csToast');
  // Don't let passing notices (e.g. "joined") bury a prompt that needs a decision.
  if (!action && _toastHasAction && !toast.classList.contains('hidden')) return;
  _toastHasAction = !!action;
  document.getElementById('csToastText').textContent = text;
  document.getElementById('csLive').textContent = text;
  const act = document.getElementById('csToastAction');
  act.classList.toggle('hidden', !action);
  act.textContent = action ? action.label : '';
  act.onclick = action ? e => { e.stopPropagation(); toast.classList.add('hidden'); action.run(); } : null;
  toast.classList.remove('hidden');
  toast.classList.remove('show'); void toast.offsetWidth; toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.add('hidden'), action ? 8000 : 4500);
}
document.getElementById('csToastClose').addEventListener('click', e => {
  e.stopPropagation();
  document.getElementById('csToast').classList.add('hidden');
});

function _joinAfter(person, ms) {
  setTimeout(() => {
    if (!callParticipants.includes(person)) return;
    person.joined = true;
    const tile = document.querySelector(`.cs-gtile[data-key="${person.key}"]`);
    if (tile) tile.classList.remove('ringing');
    if (document.getElementById('callScreen').classList.contains('group-call')) callToast(`${person.name} joined`);
    if (!callHeld) _startCallTimer();
    _paintCallStatus();
  }, ms);
}

function _applyOneToOne(p) {
  const screen = document.getElementById('callScreen');
  try { screen.style.setProperty('--call-rgb', hexToRgb(p.color)); } catch (_) {}
  const av = document.getElementById('csAvatar');
  av.textContent = p.initials;
  av.style.cssText = _avStyle(p);
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
  const isGroup = callParticipants.length > 1 || (callTitle && callParticipants.length > 0) || (callsV2 && callParticipants.length > 0);

  screen.classList.toggle('group-call', !!isGroup);
  grid.classList.toggle('hidden', !isGroup);
  document.getElementById('csName').textContent = _callLabel();
  countEl.classList.toggle('hidden', !isGroup);
  countEl.textContent = `· ${callParticipants.length + 1} people`;
  document.getElementById('csPeopleCount').textContent = callParticipants.length + 1;
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
    <div class="cs-gtile${p.joined ? '' : ' ringing'}${p.muted ? ' muted' : ''}${p.hand ? ' hand' : ''}${_photoOf(p.key) ? ' has-bg' : ''}" data-key="${p.key}" title="Pin to main screen" style="--tile-rgb:${hexToRgb(p.color)}">
      ${_photoOf(p.key) ? `<div class="cs-gtile-bg" style="background-image:url('${_photoOf(p.key)}')"></div>` : ''}
      <div class="cs-gtile-av${_photoOf(p.key) ? ' has-photo' : ''}" style="${_avStyle(p)}">${p.initials}</div>
      <span class="cs-gtile-hand">✋</span>
      <span class="cs-gtile-status">Ringing…</span>
      <div class="cs-gtile-name">${p.name}<span class="cs-gtile-mic">${MIC_OFF_ICON}</span></div>
      <button class="cs-gtile-remove" title="Remove from call" data-remove="${p.key}">
        <svg width="10" height="10" viewBox="0 0 8 8" fill="none"><path d="M1 1L7 7M7 1L1 7" stroke="white" stroke-width="1.4" stroke-linecap="round"/></svg>
      </button>
    </div>`).join('') + `
    <div class="cs-gtile self${screenShareStream ? ' presenting' : ''}${vcMuted ? ' muted' : ''}${isVideo && vcCameraOn ? '' : ' cam-off'}${myHandRaised ? ' hand' : ''}" data-key="self" title="Pin to main screen" style="--tile-rgb:246, 196, 83">
      <span class="cs-gtile-hand">✋</span>
      <video id="csGroupSelfVideo" autoplay muted playsinline></video>
      <div class="cs-gtile-av cs-gtile-av-self">${myInitials}</div>
      <div class="cs-gtile-name"><span class="cs-gtile-signal" aria-hidden="true"><i></i><i></i><i></i></span><span class="cs-gtile-presenting" title="Presenting"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg></span>You<span class="cs-gtile-mic">${MIC_OFF_ICON}</span></div>
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
    if (callsV2) _meetTick(speaker?.dataset.key);
    if (_pipOpen()) _paintPip();
  }, 1800);
}

// ── SPEAKER VIEW ──
function _stagePerson() {
  if (screenShareStream && !callPinnedKey) return { key: 'share', share: true, name: 'Your screen' };
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
  if (speaker) grid.style.paddingInline = '';
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
    stage.classList.toggle('is-share', !!p.share);
    if (p.share) {
      stage.innerHTML = `<video id="csStageVideo" autoplay muted playsinline></video>
        <span class="cs-share-tag">${SHARE_TAG_ICON}Presenting</span>
        <div class="cs-gtile-name">You · Your screen</div>`;
      document.getElementById('csStageVideo').srcObject = screenShareStream;
      stage.classList.remove('speaking', 'ringing', 'hand');
      stage.classList.add('has-video');
      return;
    }
    stage.innerHTML = `
      ${showVideo ? '<video id="csStageVideo" autoplay muted playsinline></video>' : ''}
      <div class="cs-stage-av${!p.self && _photoOf(p.key) ? ' has-photo' : ''}" style="${p.self ? 'background:var(--amber);color:var(--maroon-dark)' : _avStyle(p)}">${p.initials}</div>
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
const CALL_DEVICES = {
  mic:    { title: 'Microphone', list: ['MacBook Pro Microphone', 'AirPods Pro', 'Black Diamond'], pick: 0, toast: n => `Microphone switched to ${n}` },
  speaker:{ title: 'Speaker',    list: ['MacBook Pro Speakers', 'AirPods Pro', 'Black Diamond'],   pick: 0, toast: n => `Audio device switched to ${n}` },
  camera: { title: 'Camera',     list: ['FaceTime HD Camera', 'iPhone Continuity Camera'],          pick: 0, toast: n => `Camera switched to ${n}` },
};
function _openDeviceMenu(btn, kinds) {
  const menu = document.getElementById('csDeviceMenu');
  if (!menu.classList.contains('hidden') && menu.dataset.for === btn.dataset.device) { menu.classList.add('hidden'); return; }
  menu.dataset.for = btn.dataset.device;
  menu.innerHTML = kinds.map(k => `<div class="cs-dm-title">${CALL_DEVICES[k].title}</div>` + CALL_DEVICES[k].list.map((n, i) =>
    `<button type="button" class="call-more-item cs-dm-item${i === CALL_DEVICES[k].pick ? ' active' : ''}" data-kind="${k}" data-i="${i}"><span class="cs-dm-check">${i === CALL_DEVICES[k].pick ? '✓' : ''}</span>${n}</button>`).join('')).join('<div class="cs-dm-sep"></div>')
    + (kinds.includes('camera') ? _bgMenuHtml() : '');
  menu.classList.remove('hidden');
  _placeCallPopover(menu, btn.closest('.cs-ctl-split'));
}
document.querySelectorAll('.cs-ctl-caret').forEach(btn => btn.addEventListener('click', async e => {
  e.stopPropagation();
  if (callsV2) await _loadRealDevices();
  _openDeviceMenu(btn, btn.dataset.device === 'mic' ? ['mic', 'speaker'] : ['camera']);
}));
document.getElementById('csDeviceMenu').addEventListener('click', e => {
  e.stopPropagation();
  const bg = e.target.closest('[data-bg]');
  if (bg) {
    if (bg.dataset.bg === 'upload') document.getElementById('bgUpload').click();
    else setBackgroundEffect(bg.dataset.bg);
    return;
  }
  const item = e.target.closest('[data-kind]');
  if (!item) return;
  const d = CALL_DEVICES[item.dataset.kind];
  d.pick = Number(item.dataset.i);
  document.getElementById('csDeviceMenu').classList.add('hidden');
  callToast(d.toast(d.list[d.pick]));
  if (callsV2) _useDevice(item.dataset.kind, d.ids?.[d.pick]);
});
document.addEventListener('click', e => {
  if (!e.target.closest('#csDeviceMenu, .cs-ctl-caret')) document.getElementById('csDeviceMenu').classList.add('hidden');
});

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
  const raise = document.getElementById('csRaiseBtn');
  raise.querySelector('.cs-ctl-icon').classList.toggle('cs-ctl-icon-active', myHandRaised);
  raise.querySelector('span').textContent = myHandRaised ? 'Lower' : 'Raise';
  raise.title = myHandRaised ? 'Lower hand' : 'Raise hand';
  const cwRaise = document.getElementById('cwRaiseBtn');
  cwRaise.classList.toggle('on', myHandRaised);
  cwRaise.title = myHandRaised ? 'Lower hand' : 'Raise hand';
  _renderStage();
  if (callsV2) _syncMeetChrome();
}
function toggleHand() {
  myHandRaised = !myHandRaised;
  _paintHand();
  _closeReactPanel();
  callToast(myHandRaised ? 'You raised your hand' : 'You lowered your hand');
}
document.getElementById('csRaiseBtn').addEventListener('click', e => { e.stopPropagation(); toggleHand(); });
document.getElementById('csLowerHand').addEventListener('click', e => { e.stopPropagation(); if (myHandRaised) toggleHand(); });

document.getElementById('csReactBtn').addEventListener('click', e => {
  e.stopPropagation();
  const panel = document.getElementById('csReactPanel');
  const opening = panel.classList.contains('hidden');
  panel.classList.toggle('hidden', !opening);
  document.getElementById('csReactBtn').classList.toggle('is-open', opening);
  if (!opening) return;
  _placeCallPopover(panel, e.currentTarget);
});
document.getElementById('csReactPanel').addEventListener('click', e => {
  e.stopPropagation();
  const r = e.target.closest('[data-react]');
  if (r) { _showReaction(r.dataset.react, 'self'); _closeReactPanel(); }
});
document.addEventListener('click', e => {
  if (!e.target.closest('#csReactPanel, #csReactBtn')) _closeReactPanel();
});


// Switching screens shrinks an open call: 1:1 voice to the call card, everything else to the mini card.
function minimizeCallForNav() {
  if (!document.getElementById('callWidget').classList.contains('hidden') || _pipOpen()) return;
  if (!document.getElementById('navCallBtn').classList.contains('hidden')) return;
  const screen = document.getElementById('callScreen');
  if (screen.classList.contains('hidden') || screen.classList.contains('fullscreen')) return;
  if (!callParticipants.length) return;
  minimizeCallScreen();
}
document.querySelector('.left-nav').addEventListener('click', e => {
  if (!e.target.closest('#navCollapseBtn')) minimizeCallForNav();
}, true);


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
  // Flex-wrap with side padding so exactly best.cols fit per row and a short last row stays centered.
  const tw = Math.floor(best.w);
  grid.style.setProperty('--tile-w', tw + 'px');
  grid.style.paddingInline = Math.max(0, (W - best.cols * tw - (best.cols - 1) * GAP) / 2 - 1) + 'px';
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
        <div class="cs-ap-av" style="${_avStyle(p)}">${p.initials}</div>
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
  _onCallPersonAdded(person);
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

// Place a call popover next to its toolbar button, flipping above when the bar is at the bottom.
function _placeCallPopover(panel, btn) {
  const host = document.getElementById('callScreen').getBoundingClientRect();
  const r = btn.getBoundingClientRect();
  panel.style.transform = 'none';
  panel.style.left = Math.max(8, Math.min(host.width - panel.offsetWidth - 8, r.left - host.left + r.width / 2 - panel.offsetWidth / 2)) + 'px';
  if (r.top - host.top < host.height / 2) { panel.style.top = (r.bottom - host.top + 8) + 'px'; panel.style.bottom = 'auto'; }
  else { panel.style.bottom = (host.bottom - r.top + 8) + 'px'; panel.style.top = 'auto'; }
}

function toggleAddPanel(e) {
  e.stopPropagation();
  const panel = document.getElementById('csAddPanel');
  const isHidden = panel.classList.contains('hidden');
  panel.classList.toggle('hidden', !isHidden);
  if (isHidden) {
    _placeCallPopover(panel, document.getElementById('csAddCallerBtn'));
    refreshAddPanel();
    document.getElementById('csApSearch').value = '';
    document.getElementById('csApSearch').focus();
  }
  _syncCallChrome();
}
document.getElementById('csAddCallerBtn').addEventListener('click', toggleAddPanel);

document.getElementById('csApSearch').addEventListener('input', function() {
  refreshAddPanel(this.value);
});

document.addEventListener('click', e => {
  const panel = document.getElementById('csAddPanel');
  if (!panel.contains(e.target) &&
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
  _viewBeforeShare = null;
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
  _setCallChatOpen(false);
}

// ── CALL ↔ CHAT ──
// Every call is tied to one conversation. Its chat panel shows that conversation, so nothing
// said during the call is lost afterwards.
let callConvo = null;        // { kind: 'dm' | 'channel', key } or { kind: 'pending' } until the first message
let callChatUnread = 0;
let _callChatSeq = 0;

function _callPeopleKeys() {
  return callParticipants.map(p => p.key).filter(k => peopleData.some(pd => pd.key === k));
}
function _memberSig(keys) { return [...new Set(keys)].sort().join('|'); }

// Most recently active group whose members are exactly these people (no more, no fewer).
function findGroupWithMembers(keys) {
  const want = _memberSig(keys);
  return Object.keys(dmData)
    .filter(k => dmData[k].isGroup && _memberSig(dmData[k].members.map(m => m.key)) === want)
    .sort((a, b) => (dmData[b].lastActive || 0) - (dmData[a].lastActive || 0))[0] || null;
}
function _adHocConvo(keys) {
  if (keys.length === 1) return dmData[keys[0]] ? { kind: 'dm', key: keys[0] } : { kind: 'pending' };
  const key = findGroupWithMembers(keys);
  return key ? { kind: 'dm', key } : { kind: 'pending' };
}
function _isGroupConvo(c) {
  return c && (c.kind === 'channel' || (c.kind === 'dm' && dmData[c.key]?.isGroup));
}
function _convoName(c) {
  if (!c) return '';
  if (c.kind === 'dm') return dmData[c.key]?.name || '';
  if (c.kind === 'channel') return '#' + (channelData[c.key]?.name || '');
  return _callLabel();
}

function _pushToConvo(c, msg) {
  if (c.kind === 'dm') {
    dmData[c.key].messages.push(msg);
    dmData[c.key].lastActive = Date.now();
  } else if (c.kind === 'channel') {
    channelData[c.key].messages.push(msg.type === 'system' ? msg : {
      from: msg.from, name: msg.from === 'me' ? 'Me' : msg.senderName, initials: msg.from === 'me' ? 'ME' : msg.senderInitials,
      color: msg.from === 'me' ? '#4c1515' : msg.senderColor, text: msg.text, time: msg.time,
    });
  }
}
// Keep the chat list and any open conversation behind the call in sync.
function _refreshConvoViews(c) {
  renderDmList();
  if (c?.kind === 'dm' && activeDm === c.key && document.getElementById('dmView').offsetParent) loadDmConversation(c.key);
  if (c?.kind === 'channel' && activeChannel === c.key && document.getElementById('channelView').offsetParent) loadChannelConversation(c.key);
}

function _startNote() {
  const video = document.getElementById('callScreen').classList.contains('video-mode');
  return { type: 'system', text: `📞 <strong>You</strong> started a ${video ? 'video ' : ''}call` };
}

function _linkCall(c) {
  callConvo = c;
  callChatUnread = 0;
  const seq = ++_callChatSeq;
  if (_isGroupConvo(c)) {
    _pushToConvo(c, _startNote());
    _refreshConvoViews(c);
    // Demo: someone drops a message into the call chat shortly after joining.
    setTimeout(() => {
      if (seq !== _callChatSeq || !callConvo) return;
      const p = callParticipants.find(x => x.joined && peopleData.some(pd => pd.key === x.key));
      if (p) _receiveCallChat(p, 'Dropping the doc link here so we have it after the call 📎');
    }, 9000);
  }
  _paintCallChat();
}

// Turns a pending ad-hoc chat into a real one: the 1:1 DM, or a new group named after the call.
function _materializeCallConvo() {
  const keys = _callPeopleKeys();
  if (keys.length === 1) {
    const p = peopleData.find(x => x.key === keys[0]);
    if (!dmData[p.key]) dmData[p.key] = { name: p.name, color: p.color, initials: p.initials, online: p.online, unread: 0, messages: [] };
    callConvo = { kind: 'dm', key: p.key };
    return;
  }
  const members = keys.map(k => { const p = peopleData.find(x => x.key === k); return { key: p.key, name: p.name, color: p.color, initials: p.initials }; });
  const name = callTitle || members.map(m => m.name.split(' ')[0]).join(', ');
  const key = 'group-' + Date.now();
  dmData[key] = {
    name, isGroup: true, members, color: members[0].color,
    initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    online: false, unread: 0, lastActive: Date.now(),
    messages: [{ type: 'system', text: 'Group created from a call' }, _startNote()],
  };
  callConvo = { kind: 'dm', key };
  callToast(`New group “${name}” created for this call`);
}

function _closeCallConvo() {
  const c = callConvo;
  callConvo = null;
  _callChatSeq++;
  if (!c) return;
  const dur = callSeconds ? _fmtClock(callSeconds, false) : '';
  const video = document.getElementById('callScreen').classList.contains('video-mode');
  if (_isGroupConvo(c)) {
    _pushToConvo(c, { type: 'system', text: `📞 Call ended${dur ? ' · ' + dur : ''} · ${callParticipants.length + 1} people` });
  } else {
    // 1:1 calls always leave a call record in the DM, creating it if this is the first contact.
    // A group call nobody chatted in leaves nothing behind.
    if (c.kind === 'pending') {
      const keys = _callPeopleKeys();
      if (keys.length !== 1) return;
      const p = peopleData.find(x => x.key === keys[0]);
      if (!dmData[p.key]) dmData[p.key] = { name: p.name, color: p.color, initials: p.initials, online: p.online, unread: 0, messages: [] };
      c.kind = 'dm'; c.key = p.key;
    }
    _pushToConvo(c, { from: 'me', type: 'call', callType: 'outbound', video, dur, time: 'Just now' });
  }
  _refreshConvoViews(c);
}

function _onCallPersonAdded(person) {
  const c = callConvo;
  if (!c) return;
  if (c.kind === 'pending' || (c.kind === 'dm' && !dmData[c.key]?.isGroup)) {
    // An ad-hoc or 1:1 call follows its people: it moves to their existing group, or waits to create one.
    const next = _adHocConvo(_callPeopleKeys());
    if (next.kind === 'pending' && c.kind === 'pending') { _paintCallChat(); return; }
    _linkCall(next);
    callToast(next.kind === 'dm' ? `Chat moved to ${dmData[next.key].name}` : 'A group chat will be created when someone sends a message');
    return;
  }
  const first = person.name.split(' ')[0];
  if (c.kind === 'dm') {
    const dm = dmData[c.key];
    if (dm.members.some(m => m.key === person.key)) return;
    callToast(`${first} isn't in ${dm.name} and can't see the chat`, {
      label: 'Add to group',
      run: () => {
        dm.members.push({ key: person.key, name: person.name, color: person.color, initials: person.initials });
        _pushToConvo(c, { type: 'system', text: `You added <strong>${person.name}</strong> to the group` });
        _refreshConvoViews(c);
        _paintCallChat();
        callToast(`${first} can now see the chat`);
      },
    });
  } else if (!(channelMembers[c.key] || []).includes(person.key)) {
    callToast(`${first} isn't in ${_convoName(c)} and can't see the chat`);
  }
}

function _receiveCallChat(p, text) {
  if (!callConvo || callConvo.kind === 'pending') return;
  const person = peopleData.find(x => x.key === p.key) || p;
  const c = callConvo;
  const is1to1 = c.kind === 'dm' && !dmData[c.key].isGroup;
  _pushToConvo(c, { from: is1to1 ? 'them' : person.key, senderName: person.name, senderColor: person.color, senderInitials: person.initials, text, time: 'Just now' });
  _refreshConvoViews(c);
  if (_callChatOpen()) { renderCallChat(); return; }
  callChatUnread++;
  _paintCallChat();
  callToast(`${person.name.split(' ')[0]} in chat: ${text}`, { label: 'Open chat', run: () => _setCallChatOpen(true) });
}

function sendCallChat(text) {
  text = text.trim();
  if (!text || !callConvo) return;
  if (callConvo.kind === 'pending') _materializeCallConvo();
  _pushToConvo(callConvo, { from: 'me', text, time: 'Just now' });
  _refreshConvoViews(callConvo);
  renderCallChat();
}

function _callChatOpen() { return document.getElementById('callScreen').classList.contains('chat-open'); }
function _setCallChatOpen(open) {
  const screen = document.getElementById('callScreen');
  if (open && callsV2) _setPeopleOpen(false);
  screen.classList.toggle('chat-open', open && !!callConvo);
  document.getElementById('csChat').classList.toggle('hidden', !(open && callConvo));
  if (open && callConvo) {
    callChatUnread = 0;
    renderCallChat();
    setTimeout(() => document.getElementById('csChatInput').focus(), 30);
  }
  _paintCallChat();
  _sizeCallGrid();
}

function _paintCallChat() {
  const btn = document.getElementById('csChatBtn');
  if (!btn) return;
  btn.classList.toggle('hidden', !callConvo);
  btn.classList.toggle('is-open', _callChatOpen());
  const dot = document.getElementById('csChatDot');
  dot.textContent = callChatUnread || '';
  dot.classList.toggle('hidden', !callChatUnread);
  // The minimized views get chat too, so messages aren't missed while the call is small.
  ['pip', 'cw'].forEach(pre => {
    document.getElementById(pre === 'pip' ? 'pipChat' : 'cwChatBtn').classList.toggle('hidden', !callConvo);
    const d = document.getElementById(pre + 'ChatDot');
    d.textContent = callChatUnread || '';
    d.classList.toggle('hidden', !callChatUnread);
  });
  if (_callChatOpen()) renderCallChat();
  if (callsV2) _syncMeetChrome();
}

function renderCallChat() {
  if (!_callChatOpen() || !callConvo) return;
  const c = callConvo;
  let dm = null, msgs = [], sub = '';
  if (c.kind === 'dm') {
    dm = dmData[c.key];
    msgs = dm.messages;
    sub = dm.isGroup ? `Group chat · ${dm.members.length + 1} members` : 'Direct message';
  } else if (c.kind === 'channel') {
    const ch = channelData[c.key];
    dm = { name: ch.displayName, isGroup: true, color: '#0d8f82', initials: '#' };
    msgs = ch.messages.map(m => m.type === 'system' ? m : { from: m.from, senderName: m.name, senderColor: m.color, senderInitials: m.initials, text: m.text, time: m.time });
    sub = `Channel · posts to #${ch.name}`;
  } else {
    sub = 'Starts a new group chat';
  }
  document.getElementById('csChatName').textContent = _convoName(c);
  document.getElementById('csChatSub').textContent = sub;
  document.getElementById('csChatOpenBtn').classList.toggle('hidden', c.kind === 'pending');
  const list = document.getElementById('csChatMsgs');
  if (!msgs.length) {
    list.innerHTML = c.kind === 'pending'
      ? `<div class="cs-chat-empty"><strong>No chat yet</strong>Send a message to create a group chat with everyone in this call. Nothing is created if no one types.</div>`
      : `<div class="cs-chat-empty"><strong>No messages yet</strong>Messages you send here stay in ${_convoName(c)}.</div>`;
  } else {
    list.innerHTML = msgs.map((msg, i) => {
      const prev = msgs[i - 1];
      const showAvatar = msg.from !== 'me' && msg.type !== 'call' && msg.type !== 'system' && (!prev || prev.from !== msg.from || prev.type === 'call' || prev.type === 'system');
      return makeBubble(msg, dm, showAvatar);
    }).join('');
  }
  list.scrollTop = list.scrollHeight;
  document.getElementById('csChatInput').placeholder = `Message ${_convoName(c)}…`;
}

document.getElementById('csChatBtn').addEventListener('click', e => { e.stopPropagation(); _setCallChatOpen(!_callChatOpen()); });
document.getElementById('csChatClose').addEventListener('click', () => _setCallChatOpen(false));
document.getElementById('csChatForm').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('csChatInput');
  sendCallChat(input.value);
  input.value = '';
});
document.getElementById('csChatOpenBtn').addEventListener('click', () => {
  const c = callConvo;
  if (!c || c.kind === 'pending') return;
  minimizeCallForNav();
  if (c.kind === 'channel') { loadChannelConversation(c.key); return; }
  activeDm = c.key;
  navigateTo('dms');
  renderDmList();
  loadDmConversation(c.key);
  if (isMobile()) mobOpenDetail();
});
// ────────────────────────────────────────────────────────────────────────────

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

// Every "leave" the user chooses goes through here, so they get a Rejoin offer afterwards.
function endCallScreen() {
  const snap = callParticipants.length ? {
    people: callParticipants.map(p => p.key),
    video: document.getElementById('callScreen').classList.contains('video-mode'),
    title: callTitle,
    convo: callConvo && callConvo.kind !== 'pending' ? { ...callConvo } : null,
    label: _callLabel(),
  } : null;
  endCall();
  if (snap) _offerRejoin(snap);
}

let _rejoinSnap = null;
let _rejoinTimer = null;
function _offerRejoin(snap) {
  _rejoinSnap = snap;
  document.getElementById('rejoinText').textContent = snap.title ? `${snap.title} ended` : `Call with ${snap.label} ended`;
  const bar = document.getElementById('rejoinBar');
  bar.classList.remove('hidden');
  clearTimeout(_rejoinTimer);
  _rejoinTimer = setTimeout(_hideRejoin, 15000);
}
function _hideRejoin() {
  clearTimeout(_rejoinTimer);
  document.getElementById('rejoinBar').classList.add('hidden');
  _rejoinSnap = null;
}
document.getElementById('rejoinBtn').addEventListener('click', e => {
  e.stopPropagation();
  const s = _rejoinSnap;
  _hideRejoin();
  if (!s) return;
  if (s.people.length === 1 && !s.title && !s.video) startCall(s.people[0]);
  else startGroupCall(s.people, s.video, s.title, s.convo);
});
document.getElementById('rejoinClose').addEventListener('click', e => { e.stopPropagation(); _hideRejoin(); });


// Hides the call screen but keeps its video and share state, so maximizing restores it as it was.
function _stashCallScreen() {
  const screen = document.getElementById('callScreen');
  if (callIsFullscreen) {
    callIsFullscreen = false;
    screen.classList.remove('fullscreen');
    _placeCallScreen(false);
    _paintZoomBtn(false);
  }
  screen.classList.add('hidden');
}

// Calls have two views: maximized (the call screen) and minimized (the call card).
function minimizeCallScreen() {
  showCallWidget();
}

function expandMiniCall() {
  if (!callParticipants.length) return;
  _closeCwAdd();
  _paintNavCall(false);
  document.getElementById('callWidget').classList.add('hidden');
  document.getElementById('callPip').classList.add('hidden');
  document.getElementById('callScreen').classList.remove('hidden');
  renderCallLayout();
  _paintTimers();
  _syncCallChrome();
}

document.getElementById('cwExpandBtn').addEventListener('click', expandMiniCall);
['cwChatBtn', 'pipChat'].forEach(id => document.getElementById(id).addEventListener('click', e => {
  e.stopPropagation();
  if (callsV2) _hidePip();
  expandMiniCall();
  _setCallChatOpen(true);
}));
document.getElementById('cwAddBtn').addEventListener('click', e => { e.stopPropagation(); _openCwAdd(); });
document.getElementById('cwAddSearch').addEventListener('input', _renderCwAdd);
document.getElementById('cwAddList').addEventListener('click', e => {
  const item = e.target.closest('.cw-add-item:not(.in-call)');
  const p = item && peopleData.find(x => x.key === item.dataset.key);
  if (!p) return;
  const wasGroup = _isGroupCall();
  _closeCwAdd();
  addCallParticipant(p);
  // Adding to a 1:1 opens the tiles screen; a minimized group call stays in the card.
  if (wasGroup) _paintWidget();
  else expandMiniCall();
});
document.getElementById('cwPeople').addEventListener('click', e => {
  const btn = e.target.closest('[data-remove]');
  if (btn) removeCallParticipant(btn.dataset.remove);
});
document.addEventListener('click', e => {
  if (!e.target.closest('#cwAdd, #cwAddBtn')) _closeCwAdd();
});
document.getElementById('cwEndBtn').addEventListener('click', endCallScreen);
document.getElementById('cwMuteBtn').addEventListener('click', toggleMute);
document.getElementById('cwSpeakerBtn').addEventListener('click', toggleSpeaker);
document.getElementById('cwHoldBtn').addEventListener('click', toggleHold);
document.getElementById('cwVideoBtn').addEventListener('click', () => {
  if (document.getElementById('callScreen').classList.contains('video-mode')) return toggleCamera();
  expandMiniCall();
  toggleCamera();
});
// Drag the card from anywhere except its controls.
(function() {
  const w = document.getElementById('callWidget');
  let dragging = false, ox = 0, oy = 0;
  w.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('button, input, .cw-add')) return;
    const r = w.getBoundingClientRect();
    const cr = w.offsetParent.getBoundingClientRect();
    dragging = true;
    ox = e.clientX - r.left;
    oy = e.clientY - r.top;
    w.style.right = w.style.bottom = 'auto';
    w.style.left = (r.left - cr.left) + 'px';
    w.style.top = (r.top - cr.top) + 'px';
    w.setPointerCapture(e.pointerId);
    w.classList.add('dragging');
  });
  w.addEventListener('pointermove', e => {
    if (!dragging) return;
    const cr = w.offsetParent.getBoundingClientRect();
    w.style.left = Math.max(0, Math.min(e.clientX - cr.left - ox, cr.width - w.offsetWidth)) + 'px';
    w.style.top = Math.max(0, Math.min(e.clientY - cr.top - oy, cr.height - w.offsetHeight)) + 'px';
  });
  const stop = () => { dragging = false; w.classList.remove('dragging'); };
  w.addEventListener('pointerup', stop);
  w.addEventListener('pointercancel', stop);
})();
document.getElementById('cwContextLink').addEventListener('click', () => {
  if (_isGroupCall()) {
    if (callConvo?.kind === 'pending') _materializeCallConvo();
    minimizeCallForNav();
    if (callConvo?.kind === 'dm') openDmWith(callConvo.key);
    else if (callConvo?.kind === 'channel') {
      loadChannelConversation(callConvo.key);
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    }
    return;
  }
  const p = callParticipants[0];
  if (!p) return;
  activePersonKey = p.key;
  minimizeCallForNav();
  navigateTo('people');
});


document.getElementById('cwShareBtn').addEventListener('click', () => { expandMiniCall(); toggleScreenShare(); });

// React and raise hand without leaving the call card.
document.getElementById('cwReactPanel').innerHTML = document.getElementById('csReactPanel').innerHTML;
document.getElementById('cwRaiseBtn').addEventListener('click', e => { e.stopPropagation(); toggleHand(); });
document.getElementById('cwReactBtn').addEventListener('click', e => {
  e.stopPropagation();
  _closeCwAdd();
  document.getElementById('cwReactPanel').classList.toggle('hidden');
});
document.getElementById('cwReactPanel').addEventListener('click', e => {
  const r = e.target.closest('[data-react]');
  if (!r) return;
  e.stopPropagation();
  _showReaction(r.dataset.react, 'self');
  document.getElementById('cwReactPanel').classList.add('hidden');
  const pop = document.createElement('div');
  pop.className = 'cw-react-pop';
  pop.textContent = r.dataset.react;
  document.getElementById('callWidget').appendChild(pop);
  setTimeout(() => pop.remove(), 1600);
});
document.addEventListener('click', e => {
  if (!e.target.closest('#cwReactPanel, #cwReactBtn')) document.getElementById('cwReactPanel').classList.add('hidden');
});


// Window controls: the shrink arrows on the full call open the small call view; — hides the call
// completely. Leaving is always the red hang-up button.
document.getElementById('csCloseBtn').addEventListener('click', e => { e.stopPropagation(); minimizeCallScreen(); });
['pipHide', 'cwHideBtn'].forEach(id => document.getElementById(id).addEventListener('click', e => { e.stopPropagation(); hideCallToBackground(); }));

document.getElementById('csHangup').addEventListener('click', e => {
  if (callsV2 && _isGroupCall()) _openLeaveMenu(e);
  else endCallScreen();
});

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
    if (callsV2 && _meetEsc()) return;
    const react = document.getElementById('csReactPanel');
    const add = document.getElementById('csAddPanel');
    if (!react.classList.contains('hidden')) _closeReactPanel();
    else if (!add.classList.contains('hidden')) { add.classList.add('hidden'); _syncCallChrome(); }
    else if (_callChatOpen()) _setCallChatOpen(false);
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
document.getElementById('csShareBtn').addEventListener('click', toggleScreenShare);
document.getElementById('csMinBtn').addEventListener('click', () => hideCallToBackground());

// The — button tucks the whole call away, like minimizing a Teams call window. The call keeps
// running; the timer in the left nav brings it back.
function hideCallToBackground() {
  if (!callParticipants.length) return;
  document.getElementById('csAddPanel').classList.add('hidden');
  _closeReactPanel();
  if (callsV2) { _closeMeetMenus(); _hidePip(); }
  _stashCallScreen();
  document.getElementById('callWidget').classList.add('hidden');
  _paintNavCall(true);
}
function _paintNavCall(show) {
  const btn = document.getElementById('navCallBtn');
  if (show !== undefined) btn.classList.toggle('hidden', !show);
  document.getElementById('navCallTime').textContent = _fmtClock(callSeconds, true);
  btn.setAttribute('aria-label', `Back to call with ${_callLabel()}, ${_fmtClock(callSeconds, false)}`);
  btn.title = `Back to call · ${_callLabel()}`;
}
document.getElementById('navCallBtn').addEventListener('click', e => { e.stopPropagation(); expandMiniCall(); });
document.getElementById('csHoldBtn').addEventListener('click', toggleHold);



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
  const CHECK = `<svg width="16" height="16" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function matches(filter) {
    const q = (filter || '').toLowerCase();
    return peopleData.filter(p => !q || p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q));
  }

  // No checkbox column: tapping a person picks them, their avatar flips to a check,
  // and they show up as a chip in the search box.
  function renderList(filter) {
    list.innerHTML = matches(filter)
      .map(p => {
        const on = selected.has(p.key);
        return `
        <div class="cd-item${on ? ' selected' : ''}" data-key="${p.key}">
          <button type="button" class="cd-pick" aria-pressed="${on}" aria-label="${on ? 'Remove' : 'Add'} ${p.name} ${on ? 'from' : 'to'} group call">
            <span class="cd-av" style="background:${p.color}">${p.initials}<span class="cd-av-check" aria-hidden="true">${CHECK}</span>${p.online ? '<span class="cd-online"></span>' : ''}</span>
            <span class="cd-info"><span>${p.name}</span><small>${p.role}</small></span>
          </button>
          <button type="button" class="cd-act cd-voice" title="Voice call ${p.name}" aria-label="Voice call ${p.name}">${PHONE}</button>
          <button type="button" class="cd-act cd-video" title="Video call ${p.name}" aria-label="Video call ${p.name}">${VIDEO}</button>
        </div>`;
      }).join('');
  }

  function renderChips() {
    document.getElementById('cdChips').innerHTML = selectedPeople().map(p =>
      `<span class="cd-chip"><span class="cd-chip-av" style="background:${p.color}">${p.initials}</span>${p.name.split(' ')[0]}<button type="button" data-unpick="${p.key}" aria-label="Remove ${p.name}">×</button></span>`).join('');
    search.placeholder = selected.size ? 'Add more…' : 'Search people…';
  }

  function toggle(key) {
    selected.has(key) ? selected.delete(key) : selected.add(key);
    renderList(search.value);
    renderChips();
    syncFooter();
  }

  function syncFooter() {
    const n = selected.size;
    dd.classList.toggle('picking', n > 0);
    document.getElementById('cdHint').textContent = n ? 'Tap more people, or start the call below' : 'Tap a person to add them to a group call';
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
    renderChips();
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
  search.addEventListener('keydown', e => {
    // Enter picks the top match and clears the search, so a group can be typed name by name.
    if (e.key === 'Enter') {
      const top = matches(search.value)[0];
      if (!search.value.trim() || !top) { if (selected.size) startSelected(e.shiftKey); return; }
      e.preventDefault();
      if (!selected.has(top.key)) toggle(top.key);
      search.value = '';
      renderList();
    } else if (e.key === 'Backspace' && !search.value && selected.size) {
      toggle([...selected].pop());
    }
  });
  document.getElementById('cdChips').addEventListener('click', e => {
    const b = e.target.closest('[data-unpick]');
    if (!b) return;
    e.stopPropagation();
    toggle(b.dataset.unpick);
    search.focus();
  });

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
    toggle(person.key);
    list.querySelector(`.cd-item[data-key="${person.key}"] .cd-pick`)?.focus();
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
    renderChips();
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

  // Same full "New meeting" form as the Meetings page Schedule button
  btn.addEventListener('click', e => {
    e.stopPropagation();
    closeAllQuickDds();
    const today = mvToday();
    mvYear = today.y;
    mvMonth = today.m;
    mvSelected = today.ymd;
    navigateTo('meetings');
    showPanel('meetingsCal');
    mvOpenNewMeeting({ date: today.ymd });
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

// ── CALLS V2 (Google Meet model) ──
// Turned on from the login screen's "v2" link. See .claude/skills/video-meetings/SKILL.md.
let callsV2 = false;
let callLayout = 'auto';        // 'auto' | 'tiled' | 'spotlight'
let captionsOn = false;
let _pjBypass = false;
let _joiningMeeting = false;
let _joinCamOff = false;
let _pickedDevice = { mic: '', cam: '', speaker: '' };
let _pttActive = false;

function enableCallsV2() {
  if (callsV2) return;
  callsV2 = true;
  document.body.classList.add('calls-v2');
  // Meet keeps Raise and React in the bottom bar, after Captions.
  const anchor = document.getElementById('csCaptionsBtn');
  ['csReactBtn', 'csRaiseBtn'].forEach(id => {
    const btn = document.getElementById(id);
    btn.className = 'cs-ctl';
    btn.type = 'button';
    anchor.after(btn);
  });
  const raise = document.getElementById('csRaiseBtn');
  raise.title = 'Raise hand (⌃⌘H)';
  document.getElementById('csReactBtn').setAttribute('aria-label', 'Send a reaction');
  document.getElementById('csShareBtn').type = 'button';
  document.getElementById('csMuteBtn').type = 'button';
  document.getElementById('csCameraBtn').type = 'button';
  document.getElementById('csHangup').type = 'button';
  // Minimized calls become a compact Meet-style bar: mic, camera, leave.
  document.querySelector('#callWidget .cw-grid').append(document.getElementById('cwEndBtn'));
  document.querySelectorAll('.cs-ctl-caret').forEach(c => { c.setAttribute('aria-haspopup', 'menu'); c.setAttribute('aria-expanded', 'false'); });
}

function _mediaConstraints(audio, video) {
  return {
    audio: audio ? (_pickedDevice.mic ? { deviceId: _pickedDevice.mic } : true) : false,
    video: video ? (_pickedDevice.cam ? { deviceId: _pickedDevice.cam } : true) : false,
  };
}

function _setPressed(btn, on, label) {
  btn.setAttribute('aria-pressed', String(on));
  btn.setAttribute('aria-label', label);
}

function _paintMeetInfo() {
  const now = new Date();
  document.getElementById('csMeetTime').textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  document.getElementById('csMeetName').textContent = _callLabel();
}

function _syncMeetChrome() {
  const mic = document.getElementById('csMuteBtn');
  _setPressed(mic, !callMuted, callMuted ? 'Turn on microphone' : 'Turn off microphone');
  mic.title = (callMuted ? 'Turn on microphone' : 'Turn off microphone') + ' (⌘D)';
  const cam = document.getElementById('csCameraBtn');
  _setPressed(cam, !!vcCameraOn, vcCameraOn ? 'Turn off camera' : 'Turn on camera');
  cam.title = (vcCameraOn ? 'Turn off camera' : 'Turn on camera') + ' (⌘E)';
  const share = document.getElementById('csShareBtn');
  document.getElementById('csShareLabel').textContent = screenShareStream ? 'Stop' : 'Present';
  share.title = screenShareStream ? 'Stop presenting' : 'Present now';
  _setPressed(share, !!screenShareStream, share.title);
  const cap = document.getElementById('csCaptionsBtn');
  _setPressed(cap, captionsOn, captionsOn ? 'Turn off captions' : 'Turn on captions');
  cap.title = (captionsOn ? 'Turn off captions' : 'Turn on captions') + ' (C)';
  cap.querySelector('.cs-ctl-icon').classList.toggle('cs-ctl-icon-blue', captionsOn);
  _setPressed(document.getElementById('csRaiseBtn'), myHandRaised, myHandRaised ? 'Lower hand' : 'Raise hand');
  document.getElementById('csPeopleBadge').textContent = callParticipants.length + 1;
  const people = document.getElementById('csPeopleBtn');
  people.setAttribute('aria-pressed', String(_peopleOpen()));
  people.setAttribute('aria-label', `Show everyone, ${callParticipants.length + 1} in call`);
  const chat = document.getElementById('csChatBtn2');
  chat.classList.toggle('hidden', !callConvo);
  chat.setAttribute('aria-pressed', String(_callChatOpen()));
  document.getElementById('csChatDot2').classList.toggle('hidden', !callChatUnread || _callChatOpen());
  chat.setAttribute('aria-label', callChatUnread ? `Chat with everyone, ${callChatUnread} unread` : 'Chat with everyone');
  _paintMeetInfo();
  if (_peopleOpen()) _renderPeoplePanel();
  if (_pipOpen()) _paintPip();
}

// ── Pre-join ──
let _pj = null;

async function _openPreJoin(list, video, title, convo) {
  _closePreJoin();
  _pj = { list, video, title, convo, mic: true, cam: video, stream: null, ctx: null, raf: 0 };
  const names = list.map(p => p.name.split(' ')[0]);
  document.getElementById('pjMeeting').textContent = title || (names.length === 1 ? list[0].name : names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1]);
  document.getElementById('pjWho').innerHTML = `<div class="pj-avs">${list.slice(0, 4).map(p => `<span class="pj-av" style="${_avStyle(p)}">${p.initials}</span>`).join('')}</div>
    <span>${list.length === 1 ? `Will ring ${names[0]}` : `Will ring ${names.slice(0, 2).join(', ')}${list.length > 2 ? ` and ${list.length - 2} more` : ''}`}</span>`;
  document.getElementById('pjError').classList.add('hidden');
  document.getElementById('preJoin').classList.remove('hidden');
  _paintPreJoin();
  document.getElementById('pjJoin').focus({ preventScroll: true });
  await _pjStart();
  _fillPreJoinDevices();
}

async function _pjStart() {
  if (!_pj) return;
  _pjStop();
  const err = document.getElementById('pjError');
  if (!_pj.mic && !_pj.cam) { _paintPreJoin(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia(_mediaConstraints(_pj.mic, _pj.cam));
    if (!_pj) { stream.getTracks().forEach(t => t.stop()); return; }
    _pj.stream = stream;
    document.getElementById('pjVideo').srcObject = stream;
    err.classList.add('hidden');
    if (_pj.mic && stream.getAudioTracks().length) _pjMeter(stream);
  } catch (e) {
    err.innerHTML = 'Yuzu can\'t use your camera or microphone. Check your system permissions. <button type="button" id="pjRetry">Try again</button>';
    err.classList.remove('hidden');
    document.getElementById('pjRetry').onclick = _pjStart;
  }
  _paintPreJoin();
}

function _pjMeter(stream) {
  try {
    _pj.ctx = new AudioContext();
    const an = _pj.ctx.createAnalyser();
    an.fftSize = 256;
    _pj.ctx.createMediaStreamSource(stream).connect(an);
    const buf = new Uint8Array(an.frequencyBinCount);
    const bar = document.getElementById('pjMeter');
    const tick = () => {
      if (!_pj || !_pj.ctx) return;
      an.getByteFrequencyData(buf);
      const level = buf.reduce((a, b) => a + b, 0) / buf.length / 128;
      bar.style.transform = `scaleX(${Math.min(1, level * 1.6)})`;
      _pj.raf = requestAnimationFrame(tick);
    };
    tick();
  } catch (_) {}
}

function _pjStop() {
  if (!_pj) return;
  cancelAnimationFrame(_pj.raf);
  if (_pj.ctx) { _pj.ctx.close().catch(() => {}); _pj.ctx = null; }
  if (_pj.stream) { _pj.stream.getTracks().forEach(t => t.stop()); _pj.stream = null; }
  document.getElementById('pjVideo').srcObject = null;
  document.getElementById('pjMeter').style.transform = 'scaleX(0)';
}

function _paintPreJoin() {
  if (!_pj) return;
  const mic = document.getElementById('pjMic');
  const cam = document.getElementById('pjCam');
  mic.innerHTML = _pj.mic ? CALL_SVG.mic : CALL_SVG.micOff;
  cam.innerHTML = _pj.cam ? CALL_SVG.video : CALL_SVG.videoOff;
  mic.classList.toggle('off', !_pj.mic);
  cam.classList.toggle('off', !_pj.cam);
  _setPressed(mic, _pj.mic, _pj.mic ? 'Turn off microphone' : 'Turn on microphone');
  _setPressed(cam, _pj.cam, _pj.cam ? 'Turn off camera' : 'Turn on camera');
  mic.title = mic.getAttribute('aria-label') + ' (⌘D)';
  cam.title = cam.getAttribute('aria-label') + ' (⌘E)';
  const live = !!_pj.stream?.getVideoTracks().length;
  document.getElementById('pjCamOff').classList.toggle('hidden', live);
  document.getElementById('pjCamOff').textContent = _pj.cam ? 'Starting camera…' : 'Camera is off';
}

async function _fillPreJoinDevices() {
  let devices = [];
  try { devices = await navigator.mediaDevices.enumerateDevices(); } catch (_) {}
  const fill = (id, kind, key) => {
    const sel = document.getElementById(id);
    const list = devices.filter(d => d.kind === kind);
    sel.innerHTML = list.length
      ? list.map((d, i) => `<option value="${d.deviceId}"${d.deviceId === _pickedDevice[key] ? ' selected' : ''}>${d.label || (kind === 'audioinput' ? 'Microphone ' : 'Camera ') + (i + 1)}</option>`).join('')
      : '<option value="">None found</option>';
    sel.disabled = !list.length;
  };
  fill('pjMicSel', 'audioinput', 'mic');
  fill('pjCamSel', 'videoinput', 'cam');
}

function _closePreJoin() {
  _pjStop();
  _pj = null;
  document.getElementById('preJoin').classList.add('hidden');
}

function _joinFromPreJoin() {
  if (!_pj) return;
  const { list, video, title, convo, mic, cam } = _pj;
  _closePreJoin();
  const withVideo = video || cam;
  _joinCamOff = withVideo && !cam;
  _pjBypass = true;
  try { startGroupCall(list, withVideo, title, convo); } finally { _pjBypass = false; }
  if (!mic) toggleMute();
  _setCallLayout(callLayout);
}

document.getElementById('pjMic').addEventListener('click', () => { _pj.mic = !_pj.mic; _pjStart(); });
document.getElementById('pjCam').addEventListener('click', () => { _pj.cam = !_pj.cam; _pjStart(); });
document.getElementById('pjMicSel').addEventListener('change', e => { _pickedDevice.mic = e.target.value; _pjStart(); });
document.getElementById('pjCamSel').addEventListener('change', e => { _pickedDevice.cam = e.target.value; _pjStart(); });
document.getElementById('pjJoin').addEventListener('click', _joinFromPreJoin);
document.getElementById('pjCancel').addEventListener('click', _closePreJoin);
document.getElementById('preJoin').addEventListener('keydown', e => {
  if (e.key === 'Escape') { e.stopPropagation(); _closePreJoin(); return; }
  const mod = e.metaKey || e.ctrlKey;
  if (mod && !e.altKey && e.key.toLowerCase() === 'd') { e.preventDefault(); document.getElementById('pjMic').click(); }
  else if (mod && !e.altKey && e.key.toLowerCase() === 'e') { e.preventDefault(); document.getElementById('pjCam').click(); }
});

// ── Devices ──
async function _loadRealDevices() {
  let devices = [];
  try { devices = await navigator.mediaDevices.enumerateDevices(); } catch (_) { return; }
  const kinds = { mic: 'audioinput', speaker: 'audiooutput', camera: 'videoinput' };
  Object.entries(kinds).forEach(([k, kind]) => {
    const list = devices.filter(d => d.kind === kind && d.label);
    if (!list.length) return;
    const cur = CALL_DEVICES[k].ids?.[CALL_DEVICES[k].pick];
    CALL_DEVICES[k].list = list.map(d => d.label);
    CALL_DEVICES[k].ids = list.map(d => d.deviceId);
    CALL_DEVICES[k].pick = Math.max(0, CALL_DEVICES[k].ids.indexOf(cur));
  });
}

function _useDevice(kind, id) {
  if (!id) return;
  if (kind === 'speaker') {
    _pickedDevice.speaker = id;
    document.querySelectorAll('#callScreen video').forEach(v => v.setSinkId?.(id).catch(() => {}));
    return;
  }
  _pickedDevice[kind === 'camera' ? 'cam' : 'mic'] = id;
  if (!vcStream) return;
  const camWasOff = !vcCameraOn;
  stopVideoStream();
  _joinCamOff = camWasOff;
  startVideoStream();
}
if (navigator.mediaDevices) {
  navigator.mediaDevices.addEventListener?.('devicechange', () => {
    if (!callsV2) return;
    _loadRealDevices();
    if (_pj) _fillPreJoinDevices();
  });
}

// ── Layouts ──
function _setCallLayout(layout) {
  callLayout = layout;
  if (layout === 'tiled') setCallView('gallery');
  else if (layout === 'spotlight') setCallView('speaker');
  else setCallView(callPinnedKey || screenShareStream ? 'speaker' : 'gallery');
}

// ── Menus (More, Leave) ──
function _openMeetMenu(menu, btn) {
  _closeMeetMenus();
  menu.classList.remove('hidden');
  menu.style.position = 'absolute';
  _placeCallPopover(menu, btn);
  btn.setAttribute('aria-expanded', 'true');
  menu._opener = btn;
  menu.querySelector('[role="menuitem"]:not([disabled]), [role="menuitemradio"]')?.focus({ preventScroll: true });
}
function _closeMeetMenus(restoreFocus) {
  ['csMoreMenu', 'csLeaveMenu'].forEach(id => {
    const m = document.getElementById(id);
    if (m.classList.contains('hidden')) return;
    m.classList.add('hidden');
    m._opener?.setAttribute('aria-expanded', 'false');
    if (restoreFocus) m._opener?.focus({ preventScroll: true });
  });
}
function _menuOpen() {
  return ['csMoreMenu', 'csLeaveMenu'].some(id => !document.getElementById(id).classList.contains('hidden'));
}

function _openMoreMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('csMoreMenu');
  if (!menu.classList.contains('hidden')) return _closeMeetMenus();
  const item = (layout, label) => `<button type="button" class="call-more-item${callLayout === layout ? ' active' : ''}" role="menuitemradio" aria-checked="${callLayout === layout}" data-layout="${layout}"><span class="cs-dm-check">${callLayout === layout ? '✓' : ''}</span>${label}</button>`;
  menu.innerHTML = `<div class="cs-dm-title">Layout</div>
    ${item('auto', 'Auto')}${item('tiled', 'Tiled')}${item('spotlight', 'Spotlight')}
    <div class="cs-dm-sep"></div>
    <button type="button" class="call-more-item" role="menuitem" data-act="add">Add people</button>
    <button type="button" class="call-more-item" role="menuitem" data-act="full">${callIsFullscreen ? 'Exit full screen' : 'Full screen'}<span class="cs-kbd">F</span></button>
    <button type="button" class="call-more-item" role="menuitem" data-act="min">Minimize call</button>`;
  _openMeetMenu(menu, e.currentTarget);
}
document.getElementById('csMoreBtn').addEventListener('click', _openMoreMenu);
document.getElementById('csMoreMenu').addEventListener('click', e => {
  e.stopPropagation();
  const b = e.target.closest('button');
  if (!b) return;
  _closeMeetMenus(true);
  if (b.dataset.layout) { _setCallLayout(b.dataset.layout); callToast(`Layout: ${b.textContent.replace('✓', '').trim()}`); }
  else if (b.dataset.act === 'add') { _setPeopleOpen(true); _openAddPeople(document.getElementById('csPeopleBtn')); }
  else if (b.dataset.act === 'full') setCallFullscreen(!callIsFullscreen);
  else if (b.dataset.act === 'min') minimizeCallScreen();
});

function _openLeaveMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('csLeaveMenu');
  if (!menu.classList.contains('hidden')) return _closeMeetMenus();
  _openMeetMenu(menu, e.currentTarget);
}
document.getElementById('csLeaveOnly').addEventListener('click', () => { _closeMeetMenus(); endCallScreen(); });
document.getElementById('csEndAll').addEventListener('click', () => {
  _closeMeetMenus();
  if (callConvo && callConvo.kind !== 'pending') _pushToConvo(callConvo, { type: 'system', text: 'You ended the call for everyone' });
  endCallScreen();
});

// Arrow keys move between menu items, Esc closes and returns focus.
['csMoreMenu', 'csLeaveMenu'].forEach(id => document.getElementById(id).addEventListener('keydown', e => {
  const items = [...e.currentTarget.querySelectorAll('button')];
  const i = items.indexOf(document.activeElement);
  if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus({ preventScroll: true }); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus({ preventScroll: true }); }
  else if (e.key === 'Tab') _closeMeetMenus();
}));
document.addEventListener('click', e => {
  if (!e.target.closest('#csMoreMenu, #csLeaveMenu, #csMoreBtn, #csHangup')) _closeMeetMenus();
});

function _meetEsc() {
  if (_menuOpen()) { _closeMeetMenus(true); return true; }
  if (_peopleOpen()) { _setPeopleOpen(false); document.getElementById('csPeopleBtn').focus({ preventScroll: true }); return true; }
  return false;
}

// ── People panel ──
function _peopleOpen() { return document.getElementById('callScreen').classList.contains('people-open'); }
function _setPeopleOpen(open) {
  const screen = document.getElementById('callScreen');
  if (open && _callChatOpen()) _setCallChatOpen(false);
  screen.classList.toggle('people-open', open);
  document.getElementById('csPeople').classList.toggle('hidden', !open);
  if (open) {
    _renderPeoplePanel();
    document.getElementById('csPeopleTitle').focus({ preventScroll: true });
  }
  _syncMeetChrome();
  _sizeCallGrid();
}

const _PP_MIC_OFF = MIC_OFF_ICON.replace(/width="12" height="12"/, 'width="16" height="16"');
function _renderPeoplePanel() {
  const body = document.getElementById('csPeopleBody');
  const focused = document.activeElement?.closest?.('#csPeopleBody [data-act]');
  const refocus = focused && `[data-act="${focused.dataset.act}"][data-key="${focused.dataset.key || ''}"]`;
  const hands = callParticipants.filter(p => p.hand).sort((a, b) => a.hand - b.hand);
  const me = userEmail ? userEmail.split('@')[0] : 'You';
  const myInitials = userEmail ? me.slice(0, 2).toUpperCase() : 'ME';
  const row = p => `<li class="pp-row">
      <span class="pp-av" style="${_avStyle(p)}">${p.initials}</span>
      <span class="pp-info"><span class="pp-name">${p.name}</span><span class="pp-sub">${p.joined ? (p.muted ? 'Muted' : 'In the call') : 'Ringing…'}</span></span>
      ${p.muted ? `<span class="pp-mic" aria-label="Muted">${_PP_MIC_OFF}</span>` : ''}
      <button type="button" class="pp-act" data-act="pin" data-key="${p.key}" aria-label="Pin ${p.name}" title="Pin to main screen"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg></button>
      <button type="button" class="pp-act" data-act="mute" data-key="${p.key}" aria-label="Mute ${p.name}" title="Mute"${p.muted || !p.joined ? ' disabled' : ''}>${_PP_MIC_OFF}</button>
      <button type="button" class="pp-act" data-act="remove" data-key="${p.key}" aria-label="Remove ${p.name} from the call" title="Remove from call"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" x2="16" y1="11" y2="11"/></svg></button>
    </li>`;
  body.innerHTML = `
    <button type="button" class="pp-add" data-act="add"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>Add people</button>
    ${hands.length || myHandRaised ? `<h3 class="pp-h">Raised hands</h3><ol class="pp-list">
      ${myHandRaised ? `<li class="pp-row"><span class="pp-hand">✋</span><span class="pp-info"><span class="pp-name">You</span></span><button type="button" class="pp-lower" data-act="lower" data-key="self">Lower</button></li>` : ''}
      ${hands.map(p => `<li class="pp-row"><span class="pp-hand">✋</span><span class="pp-info"><span class="pp-name">${p.name}</span></span><button type="button" class="pp-lower" data-act="lower" data-key="${p.key}" aria-label="Lower ${p.name}'s hand">Lower</button></li>`).join('')}
    </ol>` : ''}
    <div class="pp-h-row"><h3 class="pp-h">In the call · ${callParticipants.length + 1}</h3>
      <button type="button" class="pp-muteall" data-act="muteall"${callParticipants.some(p => p.joined && !p.muted) ? '' : ' disabled'}>Mute everyone</button></div>
    <ul class="pp-list">
      <li class="pp-row"><span class="pp-av" style="background:var(--amber);color:var(--maroon-dark)">${myInitials}</span>
        <span class="pp-info"><span class="pp-name">${userEmail ? me + ' (You)' : 'You'}</span><span class="pp-sub">Meeting host</span></span>
        ${callMuted ? `<span class="pp-mic" aria-label="Muted">${_PP_MIC_OFF}</span>` : ''}</li>
      ${callParticipants.map(row).join('')}
    </ul>`;
  if (refocus) (body.querySelector(refocus) || body.querySelector('.pp-add'))?.focus({ preventScroll: true });
}

document.getElementById('csPeople').addEventListener('click', e => {
  e.stopPropagation();
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const p = callParticipants.find(x => x.key === b.dataset.key);
  const act = b.dataset.act;
  if (act === 'add') _openAddPeople(b);
  else if (act === 'pin' && p) { callPinnedKey = p.key; callView = 'speaker'; document.getElementById('csStage').dataset.key = ''; _applyCallView(); callToast(`Pinned ${p.name}`); }
  else if (act === 'mute' && p) { p.muted = true; renderCallLayout(); callToast(`You muted ${p.name}`); }
  else if (act === 'muteall') { callParticipants.forEach(x => { if (x.joined) x.muted = true; }); renderCallLayout(); callToast('You muted everyone'); }
  else if (act === 'remove' && p) { removeCallParticipant(p.key); callToast(`You removed ${p.name}`); }
  else if (act === 'lower') {
    if (b.dataset.key === 'self') toggleHand();
    else if (p) { p.hand = 0; document.querySelector(`#csGroupGrid .cs-gtile[data-key="${p.key}"]`)?.classList.remove('hand'); callToast(`You lowered ${p.name}'s hand`); }
  }
  _syncMeetChrome();
});
document.getElementById('csPeopleClose').addEventListener('click', () => { _setPeopleOpen(false); document.getElementById('csPeopleBtn').focus({ preventScroll: true }); });
document.getElementById('csPeopleBtn').addEventListener('click', e => { e.stopPropagation(); _setPeopleOpen(!_peopleOpen()); });
document.getElementById('csChatBtn2').addEventListener('click', e => { e.stopPropagation(); _setCallChatOpen(!_callChatOpen()); });

function _openAddPeople(anchor) {
  const panel = document.getElementById('csAddPanel');
  panel.classList.remove('hidden');
  refreshAddPanel();
  _placeCallPopover(panel, anchor);
  document.getElementById('csApSearch').value = '';
  document.getElementById('csApSearch').focus({ preventScroll: true });
}

// ── Captions and simulated room activity ──
const _CAPTION_LINES = [
  'I think we can ship the first part this week.',
  'Can everyone see my notes?',
  'Let\'s come back to that after the demo.',
  'The numbers look better than last month.',
  'I\'ll follow up in the channel after this.',
  'Sounds good to me.',
  'Who\'s taking the action items?',
];
let _captionTimer = null;
function toggleCaptions() {
  captionsOn = !captionsOn;
  if (!captionsOn) document.getElementById('csCaptions').classList.add('hidden');
  callToast(captionsOn ? 'Captions are on' : 'Captions are off');
  _syncMeetChrome();
}
document.getElementById('csCaptionsBtn').addEventListener('click', e => { e.stopPropagation(); toggleCaptions(); });

// Stands in for real speech, hand raises and join requests until there's a transport.
function _meetTick(speakerKey) {
  const p = callParticipants.find(x => x.key === speakerKey);
  if (captionsOn && p) {
    document.getElementById('csCaptionsWho').textContent = p.name;
    document.getElementById('csCaptionsText').textContent = _CAPTION_LINES[Math.floor(Math.random() * _CAPTION_LINES.length)];
    document.getElementById('csCaptions').classList.remove('hidden');
    clearTimeout(_captionTimer);
    _captionTimer = setTimeout(() => document.getElementById('csCaptions').classList.add('hidden'), 3000);
  }
  const idle = callParticipants.filter(x => x.joined && !x.hand);
  if (idle.length && Math.random() < 0.03) {
    const who = idle[Math.floor(Math.random() * idle.length)];
    who.hand = Date.now();
    document.querySelector(`#csGroupGrid .cs-gtile[data-key="${who.key}"]`)?.classList.add('hand');
    callToast(`${who.name} raised their hand`, { label: 'View', run: () => _setPeopleOpen(true) });
    if (_peopleOpen()) _renderPeoplePanel();
  }
}

let _knockTimer = null;
function _simulateKnock() {
  clearTimeout(_knockTimer);
  _knockTimer = setTimeout(() => {
    if (!callsV2 || !_isGroupCall()) return;
    const guest = peopleData.find(p => !callParticipants.some(c => c.key === p.key));
    if (!guest) return;
    callToast(`${guest.name} wants to join this call`, { label: 'Admit', run: () => {
      addCallParticipant(guest);
      const entry = callParticipants.find(c => c.key === guest.key);
      if (entry) entry.joined = true;
      renderCallLayout();
    } });
  }, 15000);
}

// ── Shortcuts ──
document.addEventListener('keydown', e => {
  if (!callsV2 || document.getElementById('callScreen').classList.contains('hidden')) return;
  const k = e.key.toLowerCase();
  const cmd = e.metaKey || e.ctrlKey;
  // Modifier shortcuts work while typing in chat; bare keys don't.
  if (!cmd && e.target.closest('input, textarea, select, [contenteditable]')) return;
  const both = e.metaKey && e.ctrlKey;
  if (both && k === 'h') { e.preventDefault(); toggleHand(); }
  else if (both && k === 'c') { e.preventDefault(); _setCallChatOpen(!_callChatOpen()); }
  else if (both && k === 'p') { e.preventDefault(); _setPeopleOpen(!_peopleOpen()); }
  else if (cmd && !e.altKey && !e.shiftKey && k === 'd') { e.preventDefault(); toggleMute(); callToast(callMuted ? 'Microphone off' : 'Microphone on'); }
  else if (cmd && !e.altKey && !e.shiftKey && k === 'e') { e.preventDefault(); toggleCamera(); }
  else if (!cmd && !e.altKey && k === 'c') toggleCaptions();
  else if (k === ' ' && !cmd && !e.repeat && callMuted && !e.target.closest('button')) {
    e.preventDefault();
    _pttActive = true;
    toggleMute();
  }
});
document.addEventListener('keyup', e => {
  if (e.key === ' ' && _pttActive) { _pttActive = false; if (!callMuted) toggleMute(); }
});

function _resetMeet() {
  clearTimeout(_knockTimer);
  clearTimeout(_captionTimer);
  _closeMeetMenus();
  document.getElementById('csCaptions').classList.add('hidden');
  _hidePip();
  document.getElementById('callScreen').classList.remove('people-open');
  document.getElementById('csPeople').classList.add('hidden');
  _pttActive = false;
}

// ── Minimized call window (v2) ──
// Meet-style picture-in-picture: drag the header to move, drag a bottom corner to resize.
// Dragging it to the top edge or resizing it to nearly full size maximizes the call again.
const PIP_MIN = { w: 260, h: 260 };
let _pipSig = '';

function _pipOpen() { return !document.getElementById('callPip').classList.contains('hidden'); }

function _showPip(at) {
  const pip = document.getElementById('callPip');
  document.getElementById('csAddPanel').classList.add('hidden');
  _closeReactPanel();
  _closeMeetMenus();
  _stashCallScreen();
  document.getElementById('callWidget').classList.add('hidden');
  pip.classList.remove('hidden');
  _pipSig = '';
  if (at) _placePip(at.x, at.y);
  _paintPip();
  document.getElementById('pipTime').textContent = _fmtClock(callSeconds, true);
}

function _hidePip() {
  const pip = document.getElementById('callPip');
  pip.classList.add('hidden');
  document.getElementById('pipMenu').classList.add('hidden');
  pip.querySelectorAll('video').forEach(v => { v.srcObject = null; });
  _pipSig = '';
}

function _maximizePip() {
  _hidePip();
  expandMiniCall();
}

function _pipBounds() {
  const pip = document.getElementById('callPip');
  return (pip.offsetParent || pip.parentElement).getBoundingClientRect();
}
// Puts the window's header under the pointer (used when dragging the full call down into it).
function _placePip(clientX, clientY) {
  const pip = document.getElementById('callPip');
  const cr = _pipBounds();
  pip.style.right = pip.style.bottom = 'auto';
  pip.style.left = Math.max(0, Math.min(clientX - cr.left - pip.offsetWidth / 2, cr.width - pip.offsetWidth)) + 'px';
  pip.style.top = Math.max(0, Math.min(clientY - cr.top - 18, cr.height - pip.offsetHeight)) + 'px';
}

function _pipTileHtml(t) {
  return `<div class="pip-tile${t.share ? ' pip-share' : ''}" data-key="${t.key}" style="--tile-rgb:${t.rgb || '0,0,0'}">
    ${t.video ? '<video autoplay muted playsinline></video>' : `<span class="pip-av" style="${t.av}">${t.initials}</span>`}
    <span class="pip-hand">✋</span>
    <span class="pip-mic" aria-label="Muted">${MIC_OFF_ICON}</span>
    <span class="pip-name">${t.name}</span>
  </div>`;
}

function _paintPip() {
  if (!_pipOpen()) return;
  const isVideo = document.getElementById('callScreen').classList.contains('video-mode');
  const selfVideo = isVideo && vcCameraOn && vcStream;
  const tiles = callParticipants.map(p => ({ key: p.key, name: p.name.split(' ')[0], initials: p.initials, av: _avStyle(p), rgb: hexToRgb(p.color) }));
  tiles.push({ key: 'self', name: 'You', initials: (userEmail ? userEmail.split('@')[0].slice(0, 2).toUpperCase() : 'ME'), av: 'background:var(--amber);color:var(--maroon-dark)', rgb: '246, 196, 83', video: !!selfVideo });
  if (screenShareStream) tiles.push({ key: 'share', share: true, name: 'Your screen', video: true });
  const box = document.getElementById('pipTiles');
  const sig = tiles.map(t => t.key + (t.video ? 'v' : '')).join('|');
  if (sig !== _pipSig) {
    _pipSig = sig;
    box.innerHTML = tiles.map(_pipTileHtml).join('');
    const sv = box.querySelector('[data-key="self"] video');
    if (sv) sv.srcObject = vcStream;
    const sh = box.querySelector('[data-key="share"] video');
    if (sh) sh.srcObject = screenShareStream;
  }
  box.classList.toggle('has-share', !!screenShareStream);
  _fitPipTiles();
  box.querySelectorAll('.pip-tile').forEach(el => {
    const src = document.querySelector(`#csGroupGrid .cs-gtile[data-key="${el.dataset.key}"]`);
    const p = callParticipants.find(x => x.key === el.dataset.key);
    el.classList.toggle('speaking', !!src?.classList.contains('speaking'));
    el.classList.toggle('ringing', !!p && !p.joined);
    el.classList.toggle('muted', el.dataset.key === 'self' ? callMuted : !!p?.muted);
    el.classList.toggle('hand', el.dataset.key === 'self' ? myHandRaised : !!p?.hand);
  });
  document.getElementById('pipTitle').textContent = _callLabel();
  document.getElementById('pipPresent').classList.toggle('hidden', !screenShareStream);
  const mic = document.getElementById('pipMic');
  mic.innerHTML = callMuted ? CALL_SVG.micOff : CALL_SVG.mic;
  mic.classList.toggle('off', callMuted);
  _setPressed(mic, !callMuted, callMuted ? 'Turn on microphone' : 'Turn off microphone');
  mic.title = mic.getAttribute('aria-label') + ' (⌘D)';
  const cam = document.getElementById('pipCam');
  const camLive = isVideo && vcCameraOn;
  cam.innerHTML = camLive ? CALL_SVG.video : CALL_SVG.videoOff;
  cam.classList.toggle('off', !camLive);
  _setPressed(cam, camLive, camLive ? 'Turn off camera' : 'Turn on camera');
  cam.title = cam.getAttribute('aria-label') + ' (⌘E)';
  const share = document.getElementById('pipShare');
  share.classList.toggle('on', !!screenShareStream);
  _setPressed(share, !!screenShareStream, screenShareStream ? 'Stop presenting' : 'Present now');
  share.title = share.getAttribute('aria-label');
}

document.getElementById('pipMax').addEventListener('click', e => { e.stopPropagation(); _maximizePip(); });
document.getElementById('pipHead').addEventListener('dblclick', e => { if (!e.target.closest('button')) _maximizePip(); });
document.getElementById('pipMic').addEventListener('click', () => { toggleMute(); _paintPip(); });
document.getElementById('pipCam').addEventListener('click', () => { toggleCamera(); setTimeout(() => { _pipSig = ''; _paintPip(); }, 400); });
document.getElementById('pipShare').addEventListener('click', async () => { await toggleScreenShare(); _pipSig = ''; _paintPip(); });
document.getElementById('pipStopPresent').addEventListener('click', () => { stopScreenShare(); _pipSig = ''; _paintPip(); });
document.getElementById('pipLeave').addEventListener('click', () => endCallScreen());

document.getElementById('pipReactRow').innerHTML = document.querySelector('#csReactPanel .cs-react-row').innerHTML;
document.getElementById('pipMore').addEventListener('click', e => {
  e.stopPropagation();
  const menu = document.getElementById('pipMenu');
  const open = menu.classList.contains('hidden');
  menu.classList.toggle('hidden', !open);
  e.currentTarget.setAttribute('aria-expanded', String(open));
  if (!open) return;
  menu.querySelector('[data-act="hand"]').textContent = myHandRaised ? 'Lower hand' : 'Raise hand';
  menu.querySelector('[data-act="captions"]').textContent = captionsOn ? 'Turn off captions' : 'Turn on captions';
  menu.querySelector('.pip-menu-item').focus({ preventScroll: true });
});
document.getElementById('pipMenu').addEventListener('click', e => {
  e.stopPropagation();
  const b = e.target.closest('button');
  if (!b) return;
  _closePipMenu();
  if (b.dataset.react) {
    _showReaction(b.dataset.react, 'self');
    const pop = document.createElement('div');
    pop.className = 'cw-react-pop';
    pop.textContent = b.dataset.react;
    document.getElementById('callPip').appendChild(pop);
    setTimeout(() => pop.remove(), 1600);
  }
  else if (b.dataset.act === 'hand') toggleHand();
  else if (b.dataset.act === 'captions') toggleCaptions();
  else if (b.dataset.act === 'chat') { _maximizePip(); _setCallChatOpen(true); }
  else if (b.dataset.act === 'people') { _maximizePip(); _setPeopleOpen(true); }
  _paintPip();
});
function _closePipMenu(restoreFocus) {
  const menu = document.getElementById('pipMenu');
  if (menu.classList.contains('hidden')) return;
  menu.classList.add('hidden');
  document.getElementById('pipMore').setAttribute('aria-expanded', 'false');
  if (restoreFocus) document.getElementById('pipMore').focus({ preventScroll: true });
}
document.getElementById('pipMenu').addEventListener('keydown', e => {
  const items = [...e.currentTarget.querySelectorAll('button')];
  const i = items.indexOf(document.activeElement);
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
  else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
  else if (e.key === 'Escape') { e.stopPropagation(); _closePipMenu(true); }
});
document.addEventListener('click', e => { if (!e.target.closest('#pipMenu, #pipMore')) _closePipMenu(); });

// One drag at a time, tracked on the document so it survives the call screen hiding mid-drag.
let _pipDrag = null;
function _pipDragTo(e) {
  const d = _pipDrag;
  if (!d) return;
  const pip = document.getElementById('callPip');
  if (d.mode === 'pending') {
    if (e.clientY - d.y0 < 60) return;
    _showPip({ x: e.clientX, y: e.clientY });
    const r = pip.getBoundingClientRect();
    Object.assign(d, { mode: 'move', ox: e.clientX - r.left, oy: e.clientY - r.top });
    pip.classList.add('dragging');
  }
  const cr = _pipBounds();
  if (d.mode === 'move') {
    pip.style.left = Math.max(0, Math.min(e.clientX - cr.left - d.ox, cr.width - pip.offsetWidth)) + 'px';
    pip.style.top = Math.max(0, Math.min(e.clientY - cr.top - d.oy, cr.height - pip.offsetHeight)) + 'px';
    pip.classList.toggle('will-max', e.clientY - cr.top < 12);
  } else if (d.mode === 'resize') {
    const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
    let { w, h } = d;
    if (d.dir.includes('l')) w = Math.max(PIP_MIN.w, Math.min(d.w - dx, d.left + d.w));
    if (d.dir.includes('r')) w = Math.max(PIP_MIN.w, Math.min(d.w + dx, cr.width - d.left));
    if (d.dir.includes('t')) h = Math.max(PIP_MIN.h, Math.min(d.h - dy, d.top + d.h));
    if (d.dir.includes('b')) h = Math.max(PIP_MIN.h, Math.min(d.h + dy, cr.height - d.top));
    pip.style.width = w + 'px';
    pip.style.height = h + 'px';
    if (d.dir.includes('l')) pip.style.left = (d.left + d.w - w) + 'px';
    if (d.dir.includes('t')) pip.style.top = (d.top + d.h - h) + 'px';
    pip.classList.toggle('will-max', w > cr.width * 0.8 && h > cr.height * 0.8);
    _fitPipTiles();
  }
}
function _pipDragEnd() {
  const d = _pipDrag;
  _pipDrag = null;
  document.removeEventListener('pointermove', _pipDragTo);
  document.removeEventListener('pointerup', _pipDragEnd);
  document.removeEventListener('pointercancel', _pipDragEnd);
  const pip = document.getElementById('callPip');
  pip.classList.remove('dragging', 'resizing');
  if (d && d.mode !== 'pending' && pip.classList.contains('will-max')) {
    pip.classList.remove('will-max');
    pip.style.width = pip.style.height = '';
    _maximizePip();
  }
}
function _startPipDrag(state) {
  _pipDrag = state;
  document.addEventListener('pointermove', _pipDragTo);
  document.addEventListener('pointerup', _pipDragEnd);
  document.addEventListener('pointercancel', _pipDragEnd);
}
document.getElementById('pipHead').addEventListener('pointerdown', e => {
  if (e.button !== 0 || e.target.closest('button')) return;
  e.preventDefault();
  const pip = document.getElementById('callPip');
  const r = pip.getBoundingClientRect();
  const cr = _pipBounds();
  pip.style.right = pip.style.bottom = 'auto';
  pip.style.left = (r.left - cr.left) + 'px';
  pip.style.top = (r.top - cr.top) + 'px';
  pip.classList.add('dragging');
  _startPipDrag({ mode: 'move', ox: e.clientX - r.left, oy: e.clientY - r.top });
});
document.querySelectorAll('#callPip .pip-grip').forEach(g => g.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  e.preventDefault();
  const pip = document.getElementById('callPip');
  const r = pip.getBoundingClientRect();
  const cr = _pipBounds();
  pip.style.right = pip.style.bottom = 'auto';
  pip.style.left = (r.left - cr.left) + 'px';
  pip.style.top = (r.top - cr.top) + 'px';
  pip.classList.add('resizing');
  _startPipDrag({ mode: 'resize', dir: g.dataset.dir, x0: e.clientX, y0: e.clientY, w: r.width, h: r.height, left: r.left - cr.left, top: r.top - cr.top });
}));
// Pull the full call down by its header to shrink it into the window.
document.getElementById('csHeader').addEventListener('pointerdown', e => {
  if (!callsV2 || e.button !== 0 || e.target.closest('button') || !callParticipants.length) return;
  _startPipDrag({ mode: 'pending', y0: e.clientY });
});

// Keep tiles near video proportions as the window is resized: pick the column count that gives
// the largest 16:10 tiles, like the full call grid does.
function _fitPipTiles() {
  const box = document.getElementById('pipTiles');
  const n = box.querySelectorAll('.pip-tile:not(.pip-share)').length;
  const W = box.clientWidth, H = box.clientHeight * (screenShareStream ? 0.38 : 1), GAP = 6, RATIO = 1.6;
  if (!n || !W || !H) return;
  let best = { w: 0, cols: 1 };
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const w = Math.min((W - GAP * (cols - 1)) / cols, ((H - GAP * (rows - 1)) / rows) * RATIO);
    if (w > best.w) best = { w, cols };
  }
  box.style.setProperty('--pip-tile-w', Math.floor(best.w) + 'px');
}
new ResizeObserver(_fitPipTiles).observe(document.getElementById('pipTiles'));

// ── BACKGROUND EFFECTS ──
// Blur or replace what's behind you. MediaPipe's selfie segmenter finds the person in each
// camera frame; the result is composited on a canvas whose stream stands in for the camera track,
// both in our own tiles and on the peer connection.
const MP_VERSION = '0.10.14';
// Scene backgrounds are painted in code (no image files to ship or license), then softened
// with a depth-of-field blur so they read like a photo behind you.
function _rng(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function _grad(c, x0, y0, x1, y1, stops) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([at, col]) => g.addColorStop(at, col));
  return g;
}
function _books(c, x, y, w, h, rnd, palette) {
  let bx = x;
  while (bx < x + w - 6) {
    const bw = 8 + rnd() * 14, bh = h * (0.7 + rnd() * 0.28);
    c.fillStyle = palette[Math.floor(rnd() * palette.length)];
    if (rnd() < 0.08 && bx > x + 20) {
      c.save(); c.translate(bx, y + h); c.rotate(-0.25); c.fillRect(0, -bh, bw, bh); c.restore(); bx += bw + 10;
    } else { c.fillRect(bx, y + h - bh, bw, bh); bx += bw + 1.5; }
  }
}
function _plant(c, x, y, s, potCol) {
  c.fillStyle = potCol;
  c.beginPath(); c.moveTo(x - 26 * s, y); c.lineTo(x + 26 * s, y); c.lineTo(x + 20 * s, y + 46 * s); c.lineTo(x - 20 * s, y + 46 * s); c.closePath(); c.fill();
  const leaves = ['#2f6b3a', '#3d8a4a', '#4f9e58', '#2a5c33'];
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI / 2 + (i - 6.5) * 0.2, len = (60 + (i * 37) % 50) * s;
    c.strokeStyle = leaves[i % 4]; c.lineWidth = 9 * s; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * len * 0.5 - 10 * s, y + Math.sin(a) * len * 0.6, x + Math.cos(a) * len, y + Math.sin(a) * len); c.stroke();
  }
}
const BG_SCENES = {
  beach(c, W, H) {
    c.fillStyle = _grad(c, 0, 0, 0, H * 0.56, [[0, '#4aa6e0'], [0.7, '#9fd6f2'], [1, '#e3f4fb']]); c.fillRect(0, 0, W, H);
    const sun = c.createRadialGradient(W * 0.8, H * 0.18, 0, W * 0.8, H * 0.18, H * 0.35);
    sun.addColorStop(0, 'rgba(255,250,220,1)'); sun.addColorStop(0.12, 'rgba(255,244,200,.9)'); sun.addColorStop(1, 'rgba(255,244,200,0)');
    c.fillStyle = sun; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(255,255,255,.85)';
    [[0.2, 0.16, 1], [0.45, 0.1, 0.8], [0.62, 0.26, 0.6]].forEach(([x, y, k]) => { for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(W * x + i * 34 * k, H * y + (i % 2) * 8, 46 * k, 20 * k, 0, 0, 7); c.fill(); } });
    c.fillStyle = _grad(c, 0, H * 0.55, 0, H * 0.74, [[0, '#1d7fb0'], [0.6, '#2fa3c4'], [1, '#6fd0d8']]); c.fillRect(0, H * 0.55, W, H * 0.2);
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2;
    const r = _rng(7);
    for (let i = 0; i < 26; i++) { const y = H * (0.57 + r() * 0.15), x = r() * W; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30 + r() * 60, y); c.stroke(); }
    c.fillStyle = _grad(c, 0, H * 0.72, 0, H, [[0, '#f4e3bb'], [1, '#dcb985']]);
    c.beginPath(); c.moveTo(0, H * 0.74);
    for (let x = 0; x <= W; x += 20) c.lineTo(x, H * 0.735 + Math.sin(x / 70) * 6);
    c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 4;
    c.beginPath(); for (let x = 0; x <= W; x += 20) c.lineTo(x, H * 0.737 + Math.sin(x / 70) * 6); c.stroke();
    // Palm on the left
    c.strokeStyle = '#7a5532'; c.lineWidth = 20; c.lineCap = 'round';
    c.beginPath(); c.moveTo(W * 0.1, H); c.quadraticCurveTo(W * 0.04, H * 0.55, W * 0.13, H * 0.22); c.stroke();
    ['#2e7d32', '#388e3c', '#1b5e20', '#43a047', '#2e7d32', '#388e3c'].forEach((col, i) => {
      const a = -2.9 + i * 0.55; c.strokeStyle = col; c.lineWidth = 16;
      c.beginPath(); c.moveTo(W * 0.13, H * 0.22); c.quadraticCurveTo(W * 0.13 + Math.cos(a) * 120, H * 0.22 + Math.sin(a) * 70 - 40, W * 0.13 + Math.cos(a) * 210, H * 0.22 + Math.sin(a) * 90 + 40); c.stroke();
    });
  },
  office(c, W, H) {
    c.fillStyle = _grad(c, 0, 0, 0, H, [[0, '#efebe5'], [1, '#e2dcd2']]); c.fillRect(0, 0, W, H);
    const wx = W * 0.52, wy = H * 0.08, ww = W * 0.44, wh = H * 0.66;
    c.fillStyle = _grad(c, 0, wy, 0, wy + wh, [[0, '#9cc9ea'], [1, '#dcecf5']]); c.fillRect(wx, wy, ww, wh);
    const r = _rng(3);
    for (let i = 0; i < 12; i++) { const bw = 30 + r() * 60, bh = wh * (0.2 + r() * 0.55), bx = wx + i * ww / 11 - 10; c.fillStyle = `rgba(${90 + r() * 40},${110 + r() * 30},${140 + r() * 30},.75)`; c.fillRect(bx, wy + wh - bh, bw, bh); }
    c.fillStyle = '#5a5550'; [0, 1 / 3, 2 / 3, 1].forEach(t => c.fillRect(wx + ww * t - 4, wy, 8, wh)); c.fillRect(wx, wy - 4, ww, 8); c.fillRect(wx, wy + wh * 0.55, ww, 6); c.fillRect(wx - 4, wy + wh - 2, ww + 8, 10);
    c.fillStyle = '#c4b49c'; c.fillRect(0, H * 0.8, W, H * 0.2);
    // Shelf on the left
    c.fillStyle = '#8a6a4a'; c.fillRect(W * 0.03, H * 0.18, W * 0.24, H * 0.6);
    c.fillStyle = '#efe9e1'; for (let i = 0; i < 3; i++) c.fillRect(W * 0.04, H * (0.2 + i * 0.19), W * 0.22, H * 0.165);
    const br = _rng(11);
    for (let i = 0; i < 3; i++) _books(c, W * 0.045, H * (0.2 + i * 0.19), W * 0.15, H * 0.16, br, ['#4c1515', '#f6c453', '#2f4f6f', '#7a8c6e', '#c9a27e', '#3e3f40']);
    _plant(c, W * 0.38, H * 0.72, 1.1, '#f2f0ec');
    c.strokeStyle = '#3e3f40'; c.lineWidth = 2; c.beginPath(); c.moveTo(W * 0.4, 0); c.lineTo(W * 0.4, H * 0.12); c.stroke();
    c.fillStyle = '#3e3f40'; c.beginPath(); c.moveTo(W * 0.37, H * 0.16); c.lineTo(W * 0.43, H * 0.16); c.lineTo(W * 0.415, H * 0.12); c.lineTo(W * 0.385, H * 0.12); c.closePath(); c.fill();
    const glow = c.createRadialGradient(W * 0.4, H * 0.17, 0, W * 0.4, H * 0.17, 90); glow.addColorStop(0, 'rgba(255,230,170,.7)'); glow.addColorStop(1, 'rgba(255,230,170,0)'); c.fillStyle = glow; c.fillRect(W * 0.3, H * 0.1, 200, 160);
  },
  living(c, W, H) {
    c.fillStyle = _grad(c, 0, 0, W, H, [[0, '#e6d5bf'], [1, '#d4bea3']]); c.fillRect(0, 0, W, H);
    c.fillStyle = '#a07e5c'; c.fillRect(0, H * 0.82, W, H * 0.18);
    // Framed art
    c.fillStyle = '#3e2a1e'; c.fillRect(W * 0.62, H * 0.12, W * 0.26, H * 0.3);
    c.fillStyle = '#f5efe6'; c.fillRect(W * 0.63, H * 0.14, W * 0.24, H * 0.26);
    c.fillStyle = '#f6c453'; c.beginPath(); c.arc(W * 0.72, H * 0.26, H * 0.07, 0, 7); c.fill();
    c.fillStyle = '#4c1515'; c.fillRect(W * 0.77, H * 0.2, W * 0.06, H * 0.16);
    c.fillStyle = '#7fa8a0'; c.fillRect(W * 0.66, H * 0.33, W * 0.17, H * 0.04);
    // Sofa
    c.fillStyle = '#4f7f86';
    c.beginPath(); c.roundRect(W * 0.08, H * 0.56, W * 0.84, H * 0.2, 24); c.fill();
    c.fillStyle = '#5f939a'; c.beginPath(); c.roundRect(W * 0.05, H * 0.62, W * 0.1, H * 0.2, 18); c.roundRect(W * 0.85, H * 0.62, W * 0.1, H * 0.2, 18); c.fill();
    c.fillStyle = '#6aa1a8'; c.beginPath(); c.roundRect(W * 0.13, H * 0.68, W * 0.74, H * 0.12, 16); c.fill();
    c.fillStyle = '#f6c453'; c.beginPath(); c.roundRect(W * 0.17, H * 0.6, W * 0.08, H * 0.1, 10); c.fill();
    c.fillStyle = '#e8ded0'; c.beginPath(); c.roundRect(W * 0.75, H * 0.6, W * 0.08, H * 0.1, 10); c.fill();
    // Floor lamp
    c.strokeStyle = '#2d2a26'; c.lineWidth = 5; c.beginPath(); c.moveTo(W * 0.04, H * 0.85); c.lineTo(W * 0.04, H * 0.2); c.stroke();
    c.fillStyle = '#f3e7d0'; c.beginPath(); c.moveTo(W * 0.0, H * 0.24); c.lineTo(W * 0.08, H * 0.24); c.lineTo(W * 0.065, H * 0.13); c.lineTo(W * 0.015, H * 0.13); c.closePath(); c.fill();
    _plant(c, W * 0.96, H * 0.78, 1.2, '#c06a3c');
  },
  library(c, W, H) {
    c.fillStyle = '#3b2617'; c.fillRect(0, 0, W, H);
    const rows = 5, rh = H / rows, r = _rng(21);
    const palette = ['#7a1f1f', '#2f4f6f', '#3c5a3a', '#8a6a2f', '#5a3a5f', '#c9a27e', '#1f2f3f', '#9a4a2a'];
    for (let i = 0; i < rows; i++) {
      c.fillStyle = '#2a1a0f'; c.fillRect(0, i * rh + rh * 0.08, W, rh * 0.86);
      _books(c, 6, i * rh + rh * 0.1, W - 12, rh * 0.82, r, palette);
      c.fillStyle = '#5a3a22'; c.fillRect(0, i * rh + rh * 0.92, W, rh * 0.1);
    }
    for (let x = 0; x < W; x += W / 4) { c.fillStyle = '#4a2e1b'; c.fillRect(x - 6, 0, 12, H); }
    const warm = c.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, W * 0.7); warm.addColorStop(0, 'rgba(255,200,120,.18)'); warm.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = warm; c.fillRect(0, 0, W, H);
  },
  city(c, W, H) {
    c.fillStyle = _grad(c, 0, 0, 0, H, [[0, '#2a2f5c'], [0.5, '#8a5a86'], [0.8, '#f0a070'], [1, '#f6c453']]); c.fillRect(0, 0, W, H);
    const r = _rng(5);
    [[0.55, '#3a3558'], [0.7, '#24213b']].forEach(([top, col], layer) => {
      let x = 0;
      while (x < W) {
        const bw = 40 + r() * 90, bh = H * (0.25 + r() * (layer ? 0.45 : 0.35));
        c.fillStyle = col; c.fillRect(x, H - bh, bw, bh);
        if (layer) for (let wy = H - bh + 10; wy < H - 10; wy += 16) for (let wx = x + 8; wx < x + bw - 8; wx += 14) if (r() < 0.35) { c.fillStyle = r() < 0.5 ? '#ffd27a' : '#fff0c0'; c.fillRect(wx, wy, 6, 8); }
        x += bw + 2;
      }
    });
    c.fillStyle = '#1a1814'; c.fillRect(0, 0, W, 14); c.fillRect(0, H - 14, W, 14); c.fillRect(0, 0, 14, H); c.fillRect(W - 14, 0, 14, H); c.fillRect(W / 2 - 6, 0, 12, H);
  },
  mountains(c, W, H) {
    c.fillStyle = _grad(c, 0, 0, 0, H * 0.6, [[0, '#6fa9d8'], [1, '#e9f1f4']]); c.fillRect(0, 0, W, H);
    const r = _rng(13);
    [['#9fb4c7', 0.42, 0.25], ['#6f8aa3', 0.5, 0.22], ['#45627a', 0.6, 0.18]].forEach(([col, base, amp]) => {
      c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
      let y = H * base;
      for (let x = 0; x <= W; x += 40) { y = Math.min(H * (base + 0.12), Math.max(H * (base - amp), y + (r() - 0.5) * 70)); c.lineTo(x, y); }
      c.lineTo(W, H); c.closePath(); c.fill();
    });
    c.fillStyle = _grad(c, 0, H * 0.7, 0, H, [[0, '#5d8fae'], [1, '#2f5d78']]); c.fillRect(0, H * 0.72, W, H * 0.28);
    c.fillStyle = '#2d4a2f';
    for (let i = 0; i < 40; i++) { const x = r() * W, h = 30 + r() * 50, y = H * 0.73; c.beginPath(); c.moveTo(x, y - h); c.lineTo(x - h * 0.3, y); c.lineTo(x + h * 0.3, y); c.closePath(); c.fill(); }
  },
};
const _sceneCache = {};
function _sceneCanvas(key, W = 1280, H = 720) {
  const id = `${key}:${W}x${H}`;
  if (_sceneCache[id]) return _sceneCache[id];
  const raw = document.createElement('canvas'); raw.width = W; raw.height = H;
  BG_SCENES[key](raw.getContext('2d'), W, H);
  const out = document.createElement('canvas'); out.width = W; out.height = H;
  const o = out.getContext('2d');
  o.filter = `blur(${Math.max(1, W / 420)}px)`;
  o.drawImage(raw, 0, 0);
  return (_sceneCache[id] = out);
}
const _sceneThumbs = {};
function _sceneThumb(key) {
  return _sceneThumbs[key] || (_sceneThumbs[key] = _sceneCanvas(key, 320, 180).toDataURL('image/jpeg', 0.8));
}

const BG_PRESETS = {
  none:   { label: 'Off' },
  blur1:  { label: 'Slight blur', blur: 6 },
  blur2:  { label: 'Blur', blur: 16 },
  beach:  { label: 'Beach', scene: true },
  office: { label: 'Office', scene: true },
  living: { label: 'Living room', scene: true },
  library:{ label: 'Library', scene: true },
  city:   { label: 'City at dusk', scene: true },
  mountains: { label: 'Mountains', scene: true },
  yuzu:   { label: 'Yuzu', stops: ['#f6c453', '#e08a3c', '#4c1515'] },
  dusk:   { label: 'Dusk', stops: ['#2b2d5c', '#7a4a8c', '#e7a07a'] },
  mint:   { label: 'Mint', stops: ['#d9f2e6', '#8fd1b5', '#2f6f5e'] },
};
let bgEffect = 'none';
let _bgUploadImg = null;
let _bgProc = null;
let _segmenterPromise = null;

function _bgSwatchStyle(key) {
  const p = BG_PRESETS[key];
  if (key === 'upload' && _bgUploadImg) return `background:center/cover url('${_bgUploadImg.src}')`;
  if (p?.scene) return `background:center/cover url('${_sceneThumb(key)}')`;
  if (p?.stops) return `background:linear-gradient(160deg, ${p.stops.join(', ')})`;
  return '';
}
function _bgMenuHtml() {
  const icon = {
    none: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/></svg>',
    blur1: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2"/><circle cx="6" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/><circle cx="12" cy="6" r="1.3"/><circle cx="12" cy="18" r="1.3"/></svg>',
    blur2: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2.2"/><circle cx="6" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/><circle cx="12" cy="6" r="1.6"/><circle cx="12" cy="18" r="1.6"/><circle cx="7.5" cy="7.5" r="1.2"/><circle cx="16.5" cy="7.5" r="1.2"/><circle cx="7.5" cy="16.5" r="1.2"/><circle cx="16.5" cy="16.5" r="1.2"/></svg>',
    upload: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/></svg>',
  };
  const keys = [...Object.keys(BG_PRESETS), 'upload'];
  return `<div class="cs-dm-sep"></div><div class="cs-dm-title">Background</div>
    <div class="bg-swatches" role="group" aria-label="Background effects">${keys.map(k => {
      const label = k === 'upload' ? (_bgUploadImg ? 'Your image' : 'Upload image') : BG_PRESETS[k].label;
      const on = bgEffect === k;
      return `<button type="button" class="bg-swatch${on ? ' on' : ''}" data-bg="${k}" aria-pressed="${on}" aria-label="${label}" title="${label}" style="${_bgSwatchStyle(k)}">${icon[k] && !(k === 'upload' && _bgUploadImg) ? icon[k] : ''}</button>`;
    }).join('')}</div>`;
}

function _loadSegmenter() {
  if (!_segmenterPromise) {
    _segmenterPromise = import(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/vision_bundle.mjs`)
      .then(async ({ FilesetResolver, ImageSegmenter }) => {
        const files = await FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`);
        return ImageSegmenter.createFromOptions(files, {
          baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite', delegate: 'GPU' },
          runningMode: 'VIDEO',
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        });
      })
      .catch(err => { _segmenterPromise = null; throw err; });
  }
  return _segmenterPromise;
}

async function setBackgroundEffect(effect) {
  bgEffect = effect;
  _repaintBgMenu();
  if (!vcStream) { callToast(effect === 'none' ? 'Background effects off' : `${_bgLabel()} will apply when your camera is on`); return; }
  await _applyBg();
}
function _bgLabel() { return bgEffect === 'upload' ? 'Your background' : BG_PRESETS[bgEffect]?.label; }
function _repaintBgMenu() {
  const menu = document.getElementById('csDeviceMenu');
  menu.querySelectorAll('.bg-swatch').forEach(b => {
    const on = b.dataset.bg === bgEffect;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
  });
}

async function _applyBg() {
  if (bgEffect === 'none') { _stopBg(); callToast('Background effects off'); return; }
  if (_bgProc) return;   // already running; the draw loop reads bgEffect each frame
  if (!vcStream) return;
  const raw = vcStream.getVideoTracks()[0];
  if (!raw) return;
  const proc = { raw, stopped: false };
  _bgProc = proc;
  let segmenter;
  try {
    segmenter = await _loadSegmenter();
  } catch (_) {
    if (_bgProc === proc) _bgProc = null;
    bgEffect = 'none';
    _repaintBgMenu();
    callToast('Couldn\'t load background effects. Check your connection and try again.');
    return;
  }
  if (proc.stopped || !vcStream) return;

  const { width = 1280, height = 720 } = raw.getSettings();
  const src = document.createElement('video');
  src.muted = true;
  src.playsInline = true;
  src.srcObject = new MediaStream([raw]);
  await src.play().catch(() => {});
  const out = document.createElement('canvas');
  out.width = width; out.height = height;
  const ctx = out.getContext('2d');
  const maskCanvas = document.createElement('canvas');
  const mctx = maskCanvas.getContext('2d');
  let lastTs = -1;

  const drawBackground = () => {
    const p = BG_PRESETS[bgEffect];
    if (p?.blur) { ctx.filter = `blur(${p.blur}px)`; ctx.drawImage(src, 0, 0, width, height); ctx.filter = 'none'; }
    else if ((bgEffect === 'upload' && _bgUploadImg) || p?.scene) {
      const img = p?.scene ? _sceneCanvas(bgEffect) : _bgUploadImg;
      const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
      const s = Math.max(width / iw, height / ih);
      const w = iw * s, h = ih * s;
      // Self view is mirrored, so mirror the image too and it reads the right way round.
      ctx.save(); ctx.translate(width, 0); ctx.scale(-1, 1);
      ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
      ctx.restore();
    } else if (p?.stops) {
      const g = ctx.createLinearGradient(0, 0, width * 0.4, height);
      p.stops.forEach((c, i) => g.addColorStop(i / (p.stops.length - 1), c));
      ctx.fillStyle = g; ctx.fillRect(0, 0, width, height);
    }
  };

  const frame = () => {
    if (proc.stopped) return;
    if (src.readyState >= 2 && src.currentTime !== lastTs) {
      lastTs = src.currentTime;
      segmenter.segmentForVideo(src, performance.now(), result => {
        const mask = result.confidenceMasks?.[0];
        if (!mask) return;
        const mw = mask.width, mh = mask.height, conf = mask.getAsFloat32Array();
        if (maskCanvas.width !== mw) { maskCanvas.width = mw; maskCanvas.height = mh; }
        const img = mctx.createImageData(mw, mh);
        for (let i = 0; i < conf.length; i++) img.data[i * 4 + 3] = conf[i] * 255;
        mctx.putImageData(img, 0, 0);
        mask.close();
        // Person: mask (softened) keeps the camera frame; background goes behind it.
        ctx.save();
        ctx.globalCompositeOperation = 'copy';
        ctx.filter = 'blur(3px)';
        ctx.drawImage(maskCanvas, 0, 0, width, height);
        ctx.filter = 'none';
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(src, 0, 0, width, height);
        ctx.globalCompositeOperation = 'destination-over';
        drawBackground();
        ctx.restore();
      });
    }
    proc.raf = src.requestVideoFrameCallback ? src.requestVideoFrameCallback(frame) : requestAnimationFrame(frame);
  };
  frame();

  const track = out.captureStream(30).getVideoTracks()[0];
  track.enabled = raw.enabled;
  proc.track = track;
  proc.src = src;
  vcStream.removeTrack(raw);
  vcStream.addTrack(track);
  vcPc1?.getSenders().find(s => s.track === raw)?.replaceTrack(track);
  _refreshSelfVideos();
  callToast(`Background: ${_bgLabel()}`);
}

function _stopBg() {
  const proc = _bgProc;
  _bgProc = null;
  if (!proc) return;
  proc.stopped = true;
  if (proc.src) {
    proc.src.cancelVideoFrameCallback?.(proc.raf);
    proc.src.srcObject = null;
  }
  cancelAnimationFrame(proc.raf);
  if (proc.track && vcStream) {
    proc.raw.enabled = proc.track.enabled;
    vcStream.removeTrack(proc.track);
    vcStream.addTrack(proc.raw);
    vcPc1?.getSenders().find(s => s.track === proc.track)?.replaceTrack(proc.raw);
    _refreshSelfVideos();
  }
  proc.track?.stop();
}

// Video elements don't always pick up a track swapped inside the same MediaStream, so rebind them.
function _refreshSelfVideos() {
  ['localVideo', 'csGroupSelfVideo', 'csStageVideo'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.srcObject === vcStream) { el.srcObject = null; el.srcObject = vcStream; }
  });
  document.querySelectorAll('#pipTiles [data-key="self"] video').forEach(el => { el.srcObject = null; el.srcObject = vcStream; });
}

document.getElementById('bgUpload').addEventListener('change', e => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file || !file.type.startsWith('image/')) return;
  const img = new Image();
  img.onload = () => {
    _bgUploadImg = img;
    const menu = document.getElementById('csDeviceMenu');
    const sw = menu.querySelector('.bg-swatch[data-bg="upload"]');
    if (sw) { sw.style.cssText = _bgSwatchStyle('upload'); sw.innerHTML = ''; sw.title = sw.ariaLabel = 'Your image'; }
    setBackgroundEffect('upload');
  };
  img.src = URL.createObjectURL(file);
});


// /v1 and /v2 (see v1/ and v2/) open straight to home with that calling version, for side-by-side comparison.
(function() {
  const v = new URLSearchParams(location.search).get('calls');
  if (v !== 'v1' && v !== 'v2') return;
  if (v === 'v2') enableCallsV2();
  document.title = `Yuzu · calls ${v}`;
  showHome();
})();
