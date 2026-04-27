// ── Screen navigation ──
let userEmail = '';
function goTo(id) {
  const cur = document.querySelector('.screen.active');
  if (cur) { cur.classList.add('exit'); setTimeout(() => cur.classList.remove('active','exit'), 350); }
  document.getElementById(id).classList.add('active');
}

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
  const greetEmoji = h < 12 ? 'Good morning 👋' : h < 18 ? 'Good afternoon 👋' : 'Good evening 👋';
  const timeWord = h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening';
  const name = userEmail ? userEmail.split('@')[0] : 'friend';
  document.getElementById('greetingMsg').textContent = greetEmoji;
  document.getElementById('greetingEmail').textContent = userEmail;
  document.getElementById('chatGreeting').textContent = timeWord + ', ' + name;
  goTo('screen-home');
  showIdle();
  switchMiddleView('home');
}

// ── MIDDLE PANEL NAV ──
function switchMiddleView(tab) {
  ['homeContent','tasksFullView','dmContent'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  if (tab === 'tasks') document.getElementById('tasksFullView').classList.remove('hidden');
  else if (tab === 'dms') { document.getElementById('dmContent').classList.remove('hidden'); }
  else document.getElementById('homeContent').classList.remove('hidden');

  // Right panel: DMs → show conversation; others → show idle recording UI
  if (tab === 'dms') {
    showPanel('dmView');
    loadDmConversation(activeDm);
  } else {
    showIdle();
  }
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    switchMiddleView(btn.dataset.tab);
  });
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
      { from: 'them', text: 'Totally agree. Sure! Available at 3pm today?', time: '12:01 PM' },
    ]
  },
  david: {
    name: 'David Chen', color: '#2563eb', initials: 'DC', online: false,
    messages: [
      { from: 'them', text: 'Sent the Q3 report document over 📎', time: '2h ago' },
      { from: 'me',   text: 'Got it, will review by EOD', time: '2h ago' },
      { from: 'them', text: 'No rush — let me know if you need any context', time: '2h ago' },
    ]
  },
  alex: {
    name: 'Alex Kim', color: '#059669', initials: 'AK', online: true,
    messages: [
      { from: 'them', text: 'The new brand looks 🔥', time: 'Yesterday' },
      { from: 'me',   text: 'Thanks! Still a work in progress', time: 'Yesterday' },
      { from: 'them', text: 'What stack are you using for the desktop app?', time: 'Yesterday' },
      { from: 'me',   text: 'Electron + vanilla JS — keeping it simple', time: 'Yesterday' },
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

function loadDmConversation(dmKey) {
  activeDm = dmKey;
  const dm = dmData[dmKey];
  if (!dm) return;

  // Header
  document.getElementById('dmConvoHeader').innerHTML = `
    <div class="dm-convo-avatar" style="background:${dm.color}">${dm.initials}</div>
    <div class="dm-convo-info">
      <div class="dm-convo-name">${dm.name}</div>
      <div class="dm-convo-status">
        <div class="status-dot ${dm.online ? 'online' : ''}"></div>
        <span>${dm.online ? 'Active now' : 'Offline'}</span>
      </div>
    </div>
    <div class="dm-header-actions">
      <button class="dm-header-btn" title="Call">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2.5C2 2.5 3 1 4.5 1C5.5 1 6 1.5 6.5 3C7 4.5 6 5 6 5.5C6 6 7 7.5 8.5 9C10 10.5 11.5 11 12 11C12.5 11 13 10 14.5 10.5C16 11 16.5 11.5 16.5 12.5C16.5 14 15 15 15 15" stroke="#888d96" stroke-width="1.3" stroke-linecap="round"/></svg>
      </button>
      <button class="dm-header-btn" title="Video">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="10" height="8" rx="1.5" stroke="#888d96" stroke-width="1.3"/><path d="M11 7L15 4.5V11.5L11 9" stroke="#888d96" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
  `;

  // Messages — group consecutive same-sender messages
  const msgs = document.getElementById('dmMessages');
  msgs.innerHTML = '<div class="dm-date-sep">Today</div>';
  let i = 0;
  while (i < dm.messages.length) {
    const sender = dm.messages[i].from;
    const group = document.createElement('div');
    group.className = `dm-msg-group ${sender}`;
    while (i < dm.messages.length && dm.messages[i].from === sender) {
      const b = document.createElement('div');
      b.className = 'dm-bubble';
      b.textContent = dm.messages[i].text;
      group.appendChild(b);
      i++;
    }
    const meta = document.createElement('div');
    meta.className = 'dm-msg-meta';
    meta.textContent = dm.messages[i - 1].time;
    group.appendChild(meta);
    msgs.appendChild(group);
  }
  msgs.scrollTop = msgs.scrollHeight;

  // Update input placeholder
  document.getElementById('dmInput').placeholder = `Message ${dm.name.split(' ')[0]}…`;

  // Highlight selected item in list
  document.querySelectorAll('.dm-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.dm === dmKey);
  });
}

function sendDmMessage(text) {
  if (!text.trim()) return;
  const dm = dmData[activeDm];
  dm.messages.push({ from: 'me', text: text.trim(), time: 'Just now' });

  const msgs = document.getElementById('dmMessages');
  const group = document.createElement('div');
  group.className = 'dm-msg-group me';
  const b = document.createElement('div');
  b.className = 'dm-bubble';
  b.textContent = text.trim();
  const meta = document.createElement('div');
  meta.className = 'dm-msg-meta';
  meta.textContent = 'Just now';
  group.appendChild(b);
  group.appendChild(meta);
  msgs.appendChild(group);
  msgs.scrollTop = msgs.scrollHeight;
}

// ── RIGHT PANEL STATES ──
const allPanels = ['dmView','recIdle','recView','recIntent','recResult'];
function showPanel(id) {
  allPanels.forEach(p => {
    const el = document.getElementById(p);
    if (el) el.classList.toggle('hidden', p !== id);
  });
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
    confirmText: 'Confirm & Schedule',
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
  switchMiddleView(tab);
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

  } else {
    navigateTo('home');
    showIdle();
  }
});

document.getElementById('tryAgainBtn').addEventListener('click', () => showIdle());

// ── DM LIST CLICKS ──
document.getElementById('dmList').addEventListener('click', e => {
  const item = e.target.closest('.dm-item');
  if (item) loadDmConversation(item.dataset.dm);
});

// ── DM COMPOSER ──
document.getElementById('dmSendBtn').addEventListener('click', () => {
  const input = document.getElementById('dmInput');
  sendDmMessage(input.value);
  input.value = '';
});
document.getElementById('dmInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    sendDmMessage(e.target.value);
    e.target.value = '';
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

// ── SCHEDULE EVENT → Home Upcoming ──
function createAndShowSchedule(title, date, time, duration, withName) {
  const section = document.getElementById('upcomingSection');
  const list    = document.getElementById('upcomingList');

  const item = document.createElement('div');
  item.className = 'upcoming-item event-new';
  item.innerHTML = `
    <div class="upcoming-icon">📅</div>
    <div class="upcoming-body">
      <span class="upcoming-name">${title}</span>
      <span class="upcoming-meta">${date} · ${time}${duration ? ' · ' + duration : ''}${withName ? ' · with ' + withName : ''}</span>
    </div>
    <span class="upcoming-badge">Scheduled</span>
  `;

  // Remove no-border from last existing item
  const last = list.querySelector('.upcoming-item:last-child');
  if (last) last.classList.remove('no-border');
  list.appendChild(item);
  section.classList.remove('hidden');

  navigateTo('home');
  showIdle();

  // Scroll to upcoming section
  setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
  setTimeout(() => item.classList.remove('event-new'), 2200);
}

// ── TASK CREATION ──
function taskItemHTML(title, dueDate, status) {
  const statusCls = status.toLowerCase().replace(/\s+/g, '-');
  return `<div class="task-item task-new no-border">
    <div class="task-check"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#d1d5db" stroke-width="1.5"/></svg></div>
    <div class="task-body">
      <span class="task-name">${title}</span>
      <div class="task-meta"><span class="task-due">⏱ ${dueDate}</span><span class="task-dot">•</span><span class="task-status ${statusCls}">${status}</span></div>
    </div>
  </div>`;
}

function createAndShowTask(title, dueDate, status) {
  const html = taskItemHTML(title, dueDate, status);

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

  // Return right panel to idle
  showIdle();

  // Remove highlight class after animation completes
  setTimeout(() => {
    document.querySelectorAll('.task-new').forEach(t => t.classList.remove('task-new'));
  }, 2200);
}
