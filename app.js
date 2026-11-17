(() => {
  "use strict";

  const instruments = [
    { id: "angklung", name: "Angklung", short: "Bambu · dua tabung", region: "JAWA BARAT · BAMBU", description: "Kurulung dari dua resonator bambu: goyangan berulang, denting berpasangan, dan ekor nada yang panjang.", caption: "DUA TABUNG · KURULUNG · BAMBU", color: "#c6e779", family: "bamboo", volume: .27 },
    { id: "bonang", name: "Bonang", short: "Gamelan Jawa", region: "JAWA TENGAH · PENCON", description: "Pencon perunggu dengan pukulan empuk, nada-nada tak selaras, dan dengung gong yang membulat.", caption: "PENCON · PERUNGGU · GEMA", color: "#e2b967", family: "gong", volume: .25 },
    { id: "saron", name: "Saron", short: "Gamelan Jawa", region: "JAWA TENGAH · BILAH", description: "Bilah perunggu berpukulan tegas, dengan kilau tinggi yang cepat surut dan nada pokok yang tinggal.", caption: "BILAH · PERUNGGU · PUKUL", color: "#d1ee74", family: "bar", volume: .23 },
    { id: "bali", name: "Gangsa Bali", short: "Gamelan Bali", region: "BALI · BILAH PERUNGGU", description: "Gangsa yang terang dan tajam, dengan dua nada berdekatan yang berdenyut seperti ombak.", caption: "BALI · KILAU · OMBAK", color: "#edbd65", family: "bali", volume: .23 },
    { id: "sunda", name: "Kacapi Sunda", short: "Sunda", region: "JAWA BARAT · DAWAI", description: "Petikan kacapi dengan bunyi dawai yang jatuh cepat lalu beresonansi lembut.", caption: "DAWAI · PETIK · RESONANSI", color: "#8ec4a2", family: "string", volume: .22 }
  ];
  const scales = {
    diatonic: { name: "Diatonis", steps: [0, 2, 4, 5, 7, 9, 11, 12] },
    slendro: { name: "Slendro", steps: [0, 2.4, 4.8, 7.2, 9.6, 12, 14.4, 16.8] },
    pelog: { name: "Pelog", steps: [0, 1.9, 4.1, 7.1, 8.9, 12, 13.9, 16.1] }
  };
  const keyMap = ["a", "s", "d", "f", "g", "h", "j", "k"];
  const state = { instrument: instruments[0], scale: "diatonic", octave: 4, audio: null, voices: new Map(), activeKeys: new Map(), toastTimer: 0 };
  const $ = (selector) => document.querySelector(selector);
  const instrumentList = $("#instrumentList");
  const keyboard = $("#keyboard");

  function renderInstruments() {
    instrumentList.innerHTML = "";
    instruments.forEach((instrument, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "instrument-card";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(instrument.id === state.instrument.id));
      button.setAttribute("aria-label", `${instrument.name}, ${instrument.short}`);
      button.innerHTML = `<span class="card-index">0${index + 1} / 05</span><span class="card-name">${instrument.name}</span><span class="card-sub">${instrument.short}</span>`;
      button.addEventListener("click", () => selectInstrument(instrument));
      instrumentList.append(button);
    });
  }
  function selectInstrument(instrument) {
    releaseAll();
    state.instrument = instrument;
    renderInstruments();
    $("#instrumentRegion").textContent = instrument.region;
    $("#instrumentName").textContent = instrument.name;
    $("#instrumentDescription").textContent = instrument.description;
    $("#artCaption").textContent = instrument.caption;
    $("#instrumentArt").dataset.instrument = instrument.id;
    $("#artNumber").textContent = `0${instruments.indexOf(instrument) + 1}`;
    $("#keyboardHint").innerHTML = instrument.family === "bamboo"
      ? `Ketuk untuk satu goyangan · tahan untuk kurulung 2–3×/detik <kbd>A</kbd>—<kbd>K</kbd>`
      : `Pad memainkan satu pukulan atau petikan <kbd>A</kbd>—<kbd>K</kbd>`;
    updatePads();
  }
  function midiToFrequency(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }
  function getNote(index) {
    const midi = 60 + (state.octave - 4) * 12 + scales[state.scale].steps[index];
    const names = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
    const rounded = Math.round(midi);
    const label = `${names[((rounded % 12) + 12) % 12]}${Math.floor(rounded / 12) - 1}`;
    return { midi, frequency: midiToFrequency(midi), label };
  }
  function updatePads() {
    keyboard.innerHTML = "";
    scales[state.scale].steps.forEach((_, index) => {
      const note = getNote(index);
      const button = document.createElement("button");
      button.type = "button"; button.className = "note-pad"; button.dataset.index = String(index);
      button.setAttribute("aria-label", `Mainkan derajat ${index + 1}, ${note.label}`);
      button.innerHTML = `<span class="pad-degree">${toRoman(index + 1)}</span><span class="pad-key">${keyMap[index].toUpperCase()}</span><span class="pad-note">${note.label}</span><span class="pad-frequency">${Math.round(note.frequency)} HZ</span>`;
      button.addEventListener("pointerdown", (event) => { event.preventDefault(); button.setPointerCapture?.(event.pointerId); startNote(index, `pointer-${event.pointerId}`); });
      button.addEventListener("pointerup", (event) => stopNote(`pointer-${event.pointerId}`));
      button.addEventListener("pointercancel", (event) => stopNote(`pointer-${event.pointerId}`));
      button.addEventListener("lostpointercapture", (event) => stopNote(`pointer-${event.pointerId}`));
      button.addEventListener("contextmenu", (event) => event.preventDefault());
      keyboard.append(button);
    });
    $("#octaveValue").textContent = String(state.octave);
  }
  function toRoman(n) { return ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][n - 1]; }

  function ensureAudio() {
    if (!state.audio) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) { showToast("Browser ini belum mendukung Web Audio API."); return null; }
      const context = new AudioContext();
      const master = context.createGain();
      const compressor = context.createDynamicsCompressor();
      master.gain.value = .72;
      compressor.threshold.value = -18; compressor.knee.value = 14; compressor.ratio.value = 4;
      compressor.attack.value = .006; compressor.release.value = .28;
      master.connect(compressor).connect(context.destination);
      state.audio = { context, master };
    }
    if (state.audio.context.state === "suspended") state.audio.context.resume();
    $("#audioStatus").textContent = "AUDIO AKTIF";
    return state.audio;
  }
  function makeNoiseBuffer(context, duration) {
    const buffer = context.createBuffer(1, Math.max(128, Math.floor(context.sampleRate * duration)), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
    return buffer;
  }
  function addFmMode(voice, bus, frequency, start, peak, decay, options = {}) {
    const { context } = state.audio;
    const carrier = context.createOscillator();
    const modulator = context.createOscillator();
    const depth = context.createGain();
    const envelope = context.createGain();
    const ratio = options.modRatio || 1.37;
    const fmIndex = options.fmIndex ?? .012;
    carrier.type = "sine";
    carrier.frequency.setValueAtTime(frequency, start);
    modulator.type = "sine";
    modulator.frequency.setValueAtTime(frequency * ratio, start);
    depth.gain.setValueAtTime(frequency * fmIndex, start);
    const attack = options.attack || .002;
    const peakTime = start + attack;
    const end = start + decay;
    envelope.gain.setValueAtTime(.0001, start);
    envelope.gain.linearRampToValueAtTime(peak, peakTime);
    if (options.grow) {
      envelope.gain.setValueAtTime(peak * .22, peakTime + .04);
      envelope.gain.exponentialRampToValueAtTime(peak, Math.min(end - .05, peakTime + options.grow));
    }
    envelope.gain.exponentialRampToValueAtTime(.0001, end);
    modulator.connect(depth).connect(carrier.frequency);
    carrier.connect(envelope).connect(bus);
    carrier.start(start); modulator.start(start);
    carrier.stop(end + .04); modulator.stop(end + .04);
    const modeNodes = [carrier, modulator, depth, envelope];
    voice.nodes.push(...modeNodes);
    window.setTimeout(() => { modeNodes.forEach((node) => { try { node.disconnect(); } catch (_) {} }); voice.nodes = voice.nodes.filter((node) => !modeNodes.includes(node)); }, Math.max(100, (end - context.currentTime + .2) * 1000));
    return end;
  }
  function addNoiseHit(voice, bus, start, peak, duration, center, q = .8) {
    const { context } = state.audio;
    const source = context.createBufferSource(); source.buffer = makeNoiseBuffer(context, duration);
    const filter = context.createBiquadFilter(); filter.type = "bandpass"; filter.frequency.setValueAtTime(center, start); filter.Q.value = q;
    const gain = context.createGain(); gain.gain.setValueAtTime(.0001, start);
    gain.gain.linearRampToValueAtTime(peak, start + .0015);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    source.connect(filter).connect(gain).connect(bus); source.start(start); source.stop(start + duration);
    const hitNodes = [source, filter, gain];
    voice.nodes.push(...hitNodes);
    window.setTimeout(() => { hitNodes.forEach((node) => { try { node.disconnect(); } catch (_) {} }); voice.nodes = voice.nodes.filter((node) => !hitNodes.includes(node)); }, Math.max(100, (start + duration - context.currentTime + .15) * 1000));
  }
  function makeVoice(index, voiceId, note, family) {
    const { context, master } = state.audio;
    const bus = context.createGain(); bus.gain.value = state.instrument.volume; bus.connect(master);
    const voice = { nodes: [bus], released: false, family, index, timer: null, cleanup: null };
    state.voices.set(voiceId, voice); state.activeKeys.set(voiceId, index);
    keyboard.querySelector(`[data-index="${index}"]`)?.classList.add("is-playing");
    $("#audioStatus").textContent = `${Math.round(note.frequency)} HZ · AKTIF`;
    return { voice, bus, context };
  }
  function startNote(index, voiceId) {
    if (state.voices.has(voiceId)) return;
    const audio = ensureAudio(); if (!audio) return;
    const note = getNote(index);
    if (state.instrument.family === "bamboo") { startAngklung(index, voiceId, note); return; }
    const family = state.instrument.family;
    const { voice, bus, context } = makeVoice(index, voiceId, note, family);
    const t = context.currentTime + .004;
    let end = t + 1.5;
    if (family === "gong") end = bonang(voice, bus, note.frequency, t);
    else if (family === "bar") end = saron(voice, bus, note.frequency, t);
    else if (family === "bali") end = gangsa(voice, bus, note.frequency, t);
    else if (family === "string") end = kacapi(voice, bus, note.frequency, t);
    scheduleCleanup(voiceId, voice, Math.max(250, (end - context.currentTime + .25) * 1000));
  }
  function bonang(voice, bus, f, t) {
    // Pencon/gong: a soft mallet, inharmonic bronze modes, and a swelling mid partial.
    addNoiseHit(voice, bus, t, .085, .055, Math.min(1800, f * 5.2), .55);
    const modes = [[1, .44, 2.7, .008], [1.49, .22, 3.2, .009], [2.02, .22, 1.7, .014], [2.72, .12, 1.15, .018], [4.43, .075, .58, .02], [7.55, .045, .36, .025], [8.02, .035, .28, .02]];
    let end = t;
    modes.forEach(([r, a, d, fm], i) => { end = Math.max(end, addFmMode(voice, bus, f * r * (1 + (Math.random() - .5) * .003), t + (i === 1 ? .035 : 0), a, d, { fmIndex: fm, attack: i === 1 ? .13 : .003, grow: i === 1 ? .55 : 0, modRatio: 1.39 })); });
    return end;
  }
  function saron(voice, bus, f, t) {
    // A bronze bar has a firm strike and strongly inharmonic flexural modes.
    addNoiseHit(voice, bus, t, .15, .028, Math.min(3200, f * 7), 1.2);
    const modes = [[1, .53, 1.35, .009], [2.76, .21, .58, .018], [5.40, .12, .31, .021], [7.48, .07, .23, .025], [10.2, .035, .16, .02]];
    let end = t;
    modes.forEach(([r, a, d, fm], i) => { end = Math.max(end, addFmMode(voice, bus, f * r * (1 + (Math.random() - .5) * .0015), t, a, d, { fmIndex: fm, attack: .001, modRatio: i % 2 ? 1.51 : 1.31 })); });
    return end;
  }
  function gangsa(voice, bus, f, t) {
    // Balinese paired tuning: close pitches beat against each other (ombak).
    addNoiseHit(voice, bus, t, .16, .025, Math.min(3800, f * 8), 1.4);
    const modes = [[1, .38, 1.2, .008], [2.76, .19, .56, .016], [5.40, .11, .30, .02], [7.48, .065, .22, .023], [10.2, .03, .14, .02]];
    let end = t;
    modes.forEach(([r, a, d, fm], i) => {
      const center = f * r;
      end = Math.max(end, addFmMode(voice, bus, center - 3.2, t, a, d, { fmIndex: fm, attack: .001, modRatio: 1.48 }));
      end = Math.max(end, addFmMode(voice, bus, center + 3.2, t + .002, a * .9, d * .94, { fmIndex: fm, attack: .001, modRatio: 1.52 }));
    });
    return end;
  }
  function kacapi(voice, bus, f, t) {
    // Plucked-string Karplus–Strong loop: a short noise burst circulates through a tuned delay.
    const { context } = state.audio;
    const period = Math.max(1 / 1200, 1 / f);
    const excitation = context.createBufferSource(); excitation.buffer = makeNoiseBuffer(context, .035);
    const pluck = context.createBiquadFilter(); pluck.type = "highpass"; pluck.frequency.value = Math.min(2600, f * 2.2);
    const delay = context.createDelay(.08); delay.delayTime.setValueAtTime(period, t);
    const loopFilter = context.createBiquadFilter(); loopFilter.type = "lowpass"; loopFilter.frequency.value = Math.min(4500, f * 6);
    const feedback = context.createGain(); feedback.gain.value = .985;
    const output = context.createGain(); output.gain.value = .54;
    excitation.connect(pluck).connect(delay);
    delay.connect(loopFilter).connect(feedback).connect(delay);
    delay.connect(output).connect(bus);
    excitation.start(t); excitation.stop(t + .035);
    voice.nodes.push(excitation, pluck, delay, loopFilter, feedback, output);
    // A quiet, short body resonance supplies the wooden kacapi color.
    addFmMode(voice, bus, f * 2.01, t + .006, .11, 1.25, { fmIndex: .006, attack: .004, modRatio: 1.8 });
    return t + 2.1;
  }
  function startAngklung(index, voiceId, note) {
    const { voice, bus, context } = makeVoice(index, voiceId, note, "bamboo");
    state.voices.set(voiceId, voice);
    playKurulungShake(voice, bus, note.frequency, context.currentTime + .006);
    // Kurulung: keep the shake around 2–3 cycles per second, with overlapping tube tails.
    voice.timer = window.setInterval(() => { if (!voice.released) playKurulungShake(voice, bus, note.frequency, context.currentTime + .006); }, 400);
  }
  function playKurulungShake(voice, bus, f, t) {
    const drift = (Math.random() - .5) * .003;
    // Twin tuned tubes at near-unison and octave; generous rings make the texture "truuung".
    [[1.008 + drift, .20, 1.30, .012], [2.016 - drift, .42, 1.72, .01], [2.37, .055, .44, .018], [2.83, .03, .31, .018], [4.04, .025, .52, .014]].forEach(([r, a, d, fm], i) => {
      addFmMode(voice, bus, f * r, t + (i === 1 ? .008 : 0), a, d, { fmIndex: fm, attack: .002, modRatio: i % 2 ? 1.37 : 1.43 });
    });
    addNoiseHit(voice, bus, t, .045, .024, 1700 + Math.random() * 500, .65);
    addNoiseHit(voice, bus, t + .058, .034, .022, 1950 + Math.random() * 450, .7);
  }
  function scheduleCleanup(id, voice, delay) {
    voice.cleanup = window.setTimeout(() => {
      voice.nodes.forEach((node) => { try { node.disconnect(); } catch (_) {} });
      state.voices.delete(id);
    }, delay);
  }
  function stopNote(voiceId) {
    const voice = state.voices.get(voiceId); if (!voice || voice.released) return;
    voice.released = true;
    const index = state.activeKeys.get(voiceId);
    if (voice.family === "bamboo") window.clearInterval(voice.timer);
    state.activeKeys.delete(voiceId);
    if (![...state.activeKeys.values()].includes(index)) keyboard.querySelector(`[data-index="${index}"]`)?.classList.remove("is-playing");
    if (!state.activeKeys.size) $("#audioStatus").textContent = "AUDIO AKTIF";
    if (voice.family === "bamboo") scheduleCleanup(voiceId, voice, 1900);
    // Other instruments are one-shot strikes/plucks. Let their natural envelopes ring out.
  }
  function releaseAll() { [...state.voices.keys()].forEach(stopNote); }
  function showToast(message) {
    const toast = $("#toast"); toast.textContent = message; toast.classList.add("show");
    clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
  }
  $("#scaleSelect").addEventListener("change", (event) => { state.scale = event.target.value; releaseAll(); updatePads(); });
  $("#octaveDown").addEventListener("click", () => { if (state.octave > 2) { state.octave--; releaseAll(); updatePads(); } });
  $("#octaveUp").addEventListener("click", () => { if (state.octave < 6) { state.octave++; releaseAll(); updatePads(); } });
  window.addEventListener("keydown", (event) => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    const key = event.key.toLowerCase(); const index = keyMap.indexOf(key);
    if (index !== -1 && !state.activeKeys.has(`keyboard-${key}`)) { event.preventDefault(); startNote(index, `keyboard-${key}`); }
    if (key === "arrowup" && state.octave < 6) { state.octave++; releaseAll(); updatePads(); }
    if (key === "arrowdown" && state.octave > 2) { state.octave--; releaseAll(); updatePads(); }
  });
  window.addEventListener("keyup", (event) => { const key = event.key.toLowerCase(); if (keyMap.includes(key)) stopNote(`keyboard-${key}`); });
  window.addEventListener("blur", releaseAll);
  document.addEventListener("visibilitychange", () => { if (document.hidden) releaseAll(); });
  $("#helpButton").addEventListener("click", () => $("#helpDialog").showModal());
  $("#closeHelp").addEventListener("click", () => $("#helpDialog").close());
  $("#gotIt").addEventListener("click", () => $("#helpDialog").close());
  selectInstrument(state.instrument);
})();
