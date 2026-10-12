---
name: video-meetings
description: Build accessible, production-minded video meeting experiences with real-time audio/video, rooms, screen sharing, chat, host controls, and optional AI features. Use when adding to or changing calling in Yuzu desktop (call screen, call card, people picker, in-call chat, WebRTC), or when asked to make calls behave like Google Meet.
---

# Video meetings in Yuzu

Yuzu's calling lives in `yuzu-desktop` (Electron + vanilla JS, no build step). The target model is
**Google Meet**: one room per meeting, a pre-join check, a bottom control bar, side panels for
People / Chat / Activities, host controls, and Meet's keyboard shortcuts. When an existing Yuzu
behavior conflicts with Meet, follow Meet unless the user says otherwise, and list the behavior you
replaced in your reply.

## Calls v2 flag

The Meet model ships behind a flag: the **v2** link next to Skip on the login screen calls
`enableCallsV2()`, which sets `callsV2` and `body.calls-v2`. Classic calling stays the default.
- v2 code lives in `// ── CALLS V2 (Google Meet model) ──` at the end of `renderer.js` and the
  `/* ── Calls v2 ── */` block at the end of `styles.css`.
- Mark markup with `v2-only` / `v1-only` instead of branching in CSS elsewhere.
- Existing call functions call into v2 through `if (callsV2) …` hooks (pre-join gate in
  `startGroupCall`, `_syncMeetChrome` from `_paintCallStatus`, `_meetTick` from the speaker loop).

## Where the code is

All of it is in `renderer.js` (search for these section banners), with markup in `index.html` and
styles in `styles.css` under the `cs-` (call screen), `cw-` (call card) and `cpm-` / `cd-` (pickers)
prefixes.

| Area | Banner / function | Notes |
|---|---|---|
| Call state + timers | `// ── CALL WIDGET ──` | `callMuted`, `callHeld`, `callSpeakerOn`, `callSeconds` |
| Toggles | `toggleMute`, `toggleCamera`, `toggleHold`, `toggleSpeaker`, `endCall` | `_syncCallChrome()` repaints every control after a state change |
| Media | `// ── VIDEO CALL — WebRTC ──` | `startVideoStream` builds a **local loopback** (`vcPc1` → `vcPc2`); there is no signaling server |
| Screen share | `toggleScreenShare`, `_syncShareTile`, `_paintPresenting` | Presenting forces speaker view and restores the previous view after |
| Rooms / participants | `startGroupCall`, `callParticipants`, `_joinAfter` | Joins and active speaker are simulated with timers |
| Layout | `renderCallLayout`, `_applyCallView`, `_renderStage`, `_sizeCallGrid` | Views: `gallery` and `speaker`, plus pinning (`callPinnedKey`) |
| Devices | `CALL_DEVICES`, `_openDeviceMenu` | Device lists are hard-coded, not from `enumerateDevices()` |
| Reactions / hand | `_showReaction`, `toggleHand` | |
| In-call chat | `// ── CALL ↔ CHAT ──` | Every call is tied to one conversation (`callConvo`); chat persists after the call |
| Call card | `showCallWidget`, `minimizeCallForNav`, `expandMiniCall` | Draggable floating card used when navigating away |
| Notices | `callToast(text, action?)` | Use this for every in-call notice; don't add new toast elements |
| Shortcuts | `keydown` listener after `setCallFullscreen` | Currently `F` (full screen) and `Esc` |
| Pickers | `openCallPicker`, `// ── CALL DROPDOWN ──` | Start calls from people, DMs and channels |

Electron permissions are in `main.js` (`setPermissionRequestHandler`). It does **not** set
`session.setDisplayMediaRequestHandler`, so `getDisplayMedia` fails inside Electron and screen share
only works in the browser build (`npm run web`). Add that handler (using `desktopCapturer`) before
claiming screen share works in the desktop app.

## Target behavior (Google Meet model)

### Joining
- Yuzu calls are internal calls, not meetings to join. Calling someone (1:1 or group, voice or
  video, from a DM, channel, people list or the call picker) **rings directly** into the call
  screen, with no pre-join step.
- The **pre-join screen** is only for joining a scheduled meeting (`joinMeeting`): live camera
  preview, mic level meter, mic/camera toggles, device pickers, the meeting name, and a
  **Join now** button. Mic and camera choices carry into the call.
- Ringing and "waiting for others" states are visible on the tile and announced to screen readers.

### In the call
- **Bottom bar**, centered: Mic · Camera · Captions · Raise hand · React · Present · Add people · More (⋮) · Leave
  (red). Right side of the bar: Info · People (with count) · Chat (with unread dot) · Activities.
  Left side: time and meeting name.
- Mic and camera buttons are split buttons: the main part toggles, the caret opens the device menu.
  Fill device menus from `navigator.mediaDevices.enumerateDevices()` and listen for `devicechange`.
- **Side panels** (People, Chat, Info, Activities) open on the right, one at a time, and close with
  `Esc` or by clicking the same button again. The video grid reflows instead of being covered.
- **Layout** (Auto / Tiled / Spotlight) is reachable everywhere: the header Layout menu (`_openLayoutMenu`),
  More, the small window's More menu, and the phone header. The small window draws Spotlight too.
- **Add people** sits on the bottom bar just before More, and the **Speaker / Gallery** toggle stays in the header; don't bury either in More.
- **Layouts** (More → Change layout): Auto, Tiled, Spotlight, Sidebar, and a max-tiles slider. Map
  Yuzu's `gallery` to Tiled and `speaker` to Spotlight; add Auto (speaker when someone presents or
  pinned, otherwise tiled) as the default.
- Tiles show name, mic-off icon, speaking outline, raised hand, and connection quality. Hovering a
  tile shows Pin, Mute (host), and Remove (host) actions; these must also be reachable by keyboard.
- Self view can be minimized to a floating tile or hidden.
- Minimizing (button, navigating away, or dragging the call screen's header down) opens the
  picture-in-picture window (`_showPip`, `#callPip`), not the phone-style card: live tiles, the
  shared screen, and Mic · Camera · Raise · React · Present · Add people · Chat · More · Leave (narrow windows drop Add people/React, then Raise, from the bar; More always lists every action). Drag the header to move it, drag a bottom
  corner to resize it; dragging it to the top edge, resizing it near full size, double-clicking the
  header or the expand icon maximizes the call again.
- Raised hands are queued in order in the People panel; the host can lower anyone's hand.
- Presenting shows a "You are presenting" bar with **Stop presenting**, and warns about the
  infinity mirror when sharing the whole screen.
- Leaving: hosts get **Leave call** or **End call for everyone**; others just leave.

### On phones (≤520px, see `mobile/` for every state at 390 × 780)
- Header: call name + timer on the left; People, Chat and the shrink button on the right. No window
  or full-screen buttons.
- Bar: Mic · Camera · Raise · More · Leave, round 52px buttons. Captions, React, Present, Add people,
  People, Chat and Layout move into More, which opens as a bottom sheet with a reaction row on top.
- Tiles fill the screen: in a 1:1 call the other person fills it and you float in the bottom-right
  corner (`.one-to-one`); groups use two portrait columns (`_sizeCallGrid`).
- Minimized, the call is a maroon band across the very top (call icon, "name – time", expand icon);
  the app sits below it as a sheet with rounded top corners. Tapping the band returns to the call.
- `?calls=v2&screen=<name>` opens any state (`_openScreen`); add a screen there and in `mobile/index.html`.

### Host controls
- Host management toggle; when on, only hosts and co-hosts can: mute everyone, turn off everyone's
  camera, remove people, admit people from the waiting list, and lock screen share, chat,
  reactions, mic or camera for participants.
- Add co-hosts from the People panel.
- "Ask to join" requests appear as a toast with **Admit** / **Deny** (`callToast` with an action).

### Activities (optional, behind the Activities panel)
Whiteboard, polls, Q&A, breakout rooms, recording, transcripts. Recording and transcripts must show
a persistent indicator to everyone in the call and announce when they start.

### Optional AI features
Only add these when asked, and make each one opt-in with a visible on-state:
- Live captions (`C`), with caption language in settings; captions overlay sits above the bar.
- "Take notes for me": summary and action items posted to the call's conversation (`callConvo`)
  when the call ends, so they appear in chat next to the call record.
- Background blur/replace is built (`// ── BACKGROUND EFFECTS ──`): MediaPipe selfie segmenter
  loaded on first use from jsdelivr, composited on a canvas whose track replaces the camera track in
  `vcStream` and on `vcPc1`. Picked from the Background section of the camera caret menu, in both
  v1 and v2. Noise cancellation and lighting are not built yet.
- Anything that sends audio or transcripts to a model must say so in the UI before it starts. For
  model calls use the latest Claude models (see the `claude-api` skill).

## Keyboard shortcuts (Meet conventions, macOS)

| Action | Shortcut |
|---|---|
| Toggle mic | `⌘D` |
| Toggle camera | `⌘E` |
| Raise / lower hand | `⌃⌘H` |
| Open / close chat | `⌃⌘C` |
| Open / close people | `⌃⌘P` |
| Captions | `C` |
| Push to talk while muted | hold `Space` |
| Full screen (Yuzu) | `F` |
| Close panel / exit full screen | `Esc` |

Ignore shortcuts while focus is in an input, textarea or contenteditable (the existing listener
already does this). Show each shortcut in the button's tooltip.

## Accessibility (required, not optional)
- Every control is a `<button type="button">` with an `aria-label`; toggles use `aria-pressed`
  ("Turn off microphone" / "Turn on microphone"), split-button carets use `aria-haspopup="menu"`
  and `aria-expanded`.
- One `aria-live="polite"` region for joins, leaves, hand raises, recording and share state; route
  `callToast` text through it. Use `assertive` only for "You've been muted by the host" and errors.
- Popovers (devices, reactions, More) are menus: arrow-key navigation, `Esc` closes and returns
  focus to the button that opened it. Side panels move focus to their heading when opened.
- Visible focus rings on dark call backgrounds; text and icons meet 4.5:1 / 3:1 contrast.
- Don't convey state by color alone (mic-off needs the icon, speaking needs the outline plus the
  name in the live region for the active-speaker change at most every few seconds).
- Respect `prefers-reduced-motion` for floating reactions, ringing pulses and tile transitions.
- Tiles reachable with `Tab`; pin/remove actions available from the keyboard, not hover only.

## Production-minded rules
- Treat the current loopback WebRTC and timer-driven joins as a **demo seam**. Keep new UI driven
  by state (`callParticipants`, flags) so a real transport can replace the simulation without UI
  changes. Put any simulation behind a clearly named function (like `_joinAfter`).
- Real calls need: a signaling channel, an SFU for groups (LiveKit, mediasoup or similar), and TURN
  servers in addition to the STUN entries in `RTC_CONFIG`. Don't add these unless asked.
- Always stop every `MediaStreamTrack` when leaving, switching devices, or stopping a share, and
  handle a track's `ended` event (the OS can stop a share or unplug a camera).
- Handle permission denied and no-device cases with a clear message and a retry, never a dead
  button. `startVideoStream` already falls back to the avatar; keep that pattern.
- Mute applies to the actual track (`track.enabled = false`), not just the icon.
- Keep the call ↔ conversation link: anything said, shared or generated during a call lands in
  `callConvo` so it survives the call.

## Style
- Colors come from the shared tokens in `styles.css` (`--amber`, `--maroon`, `--maroon-dark`);
  write shared tokens with hex fallbacks, e.g. `var(--yuzu-900, #4c1515)`.
- Reuse existing classes (`cs-ctl`, `cs-ctl-split`, `cs-hdr-btn`, `call-more-item`) and
  `_placeCallPopover` for anything that opens from the bar.
- Match the surrounding code: small functions prefixed `_` for internals, `getElementById`, inline
  SVG icons (lucide style, `stroke-width="2"`), comments only for a non-obvious why.

## Verifying a change
1. `npm run web` (port 3000; use `npx serve . -p 3001` if 3000 is taken) and test 1:1 voice, 1:1
   video, a 3+ person group call, presenting, minimizing to the card and expanding back, in-call
   chat, and leaving.
2. Tab through the whole call screen with the keyboard only, and try every shortcut.
3. For camera, mic or screen share behavior, also run `npm start`, since Electron permissions differ
   from the browser.
