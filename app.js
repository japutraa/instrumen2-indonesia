(() => {
  "use strict";

  const instruments = [
    { id: "angklung", name: "Angklung", short: "Bambu · dua tabung", region: "JAWA BARAT · BAMBU", description: "Dua resonator bambu dengan benturan singkat, nada berpasangan, dan ekor yang meluruh alami.", caption: "DUA TABUNG · GETAR · BAMBU", color: "#c6e779", family: "bamboo", ratio: 1.41, index: 2.22, modulation: 2.9, decay: 1.05, release: .55, brightness: .44, noise: .12, beat: .012, volume: .27 },
    { id: "bonang", name: "Bonang", short: "Gamelan Jawa", region: "JAWA TENGAH · PERUNGGU", description: "Gong kecil dengan pukulan bulat dan gema berlapis.", caption: "PERUNGGU · GONG · GEMA", color: "#e2b967", family: "gong", ratio: 1.38, index: 2.7, modulation: 4.4, decay: 2.3, release: 1.05, brightness: .67, noise: .04, beat: .018, volume: .28 },
    { id: "saron", name: "Saron", short: "Gamelan Jawa", region: "JAWA TENGAH · BILAH", description: "Bilah perunggu yang jernih, tegas, dan berkilau panjang.", caption: "BILAH · PERUNGGU · PULSA", color: "#d1ee74", family: "metal", ratio: 2.01, index: 3.1, modulation: 3.25, decay: 1.15, release: .48, brightness: .75, noise: .035, beat: .01, volume: .24 },
    { id: "bali", name: "Gangsa Bali", short: "Gamelan Bali", region: "BALI · BILAH PERUNGGU", description: "Nada gangsa yang terang dengan dengung dan denyut khas Bali.", caption: "BALI · KILAU · DENYUT", color: "#edbd65", family: "metal", ratio: 2.43, index: 3.8, modulation: 5.1, decay: .78, release: .3, brightness: .92, noise: .045, beat: .03, volume: .24 },
    { id: "sunda", name: "Kacapi Sunda", short: "Sunda", region: "JAWA BARAT · DAWAI", description: "Petikan dawai kacapi dengan serangan lembut dan ekor resonan.", caption: "DAWAI · PETIK · LIRIH", color: "#8ec4a2", family: "string", ratio: 1.99, index: 2.02, modulation: 1.8, decay: 1.45, release: .65, brightness: .56, noise: .025, beat: .006, volume: .25 }
  ];

  const scales = {
    slendro: { name: "Slendro", steps: [0, 2.4, 4.8, 7.2, 9.6, 12, 14.4, 16.8] },
    pelog: { name: "Pelog", steps: [0, 1.9, 4.1, 7.1, 8.9, 12, 13.9, 16.1] },
    diatonic: { name: "Diatonis", steps: [0, 2, 4, 5, 7, 9, 11, 12] }
  };
  const keyMap = ["a", "s", "d", "f", "g", "h", "j", "k"];
  const state = { instrument: instruments[0], scale: "slendro", octave: 4, audio: null, voices: new Map(), activeKeys: new Map(), toastTimer: 0 };
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
      ? `Ketuk untuk satu goyangan · tahan untuk mengulang <kbd>A</kbd>—<kbd>K</kbd>`
      : `Klik dan tahan pad atau gunakan tombol <kbd>A</kbd>—<kbd>K</kbd>`;
    updatePads();
  }

  function midiToFrequency(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  function getNote(index) {
    const midi = 60 + (state.octave - 4) * 12 + scales[state.scale].steps[index];
    const chromaticNames = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
    const rounded = Math.round(midi);
    const cents = Math.round((midi - rounded) * 100);
    const name = `${chromaticNames[((rounded % 12) + 12) % 12]}${Math.floor(rounded / 12) - 1}`;
    return { midi, frequency: midiToFrequency(midi), label: name, cents };
  }

  function updatePads() {
    keyboard.innerHTML = "";
    const scale = scales[state.scale];
    scale.steps.forEach((_, index) => {
      const note = getNote(index);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "note-pad";
      button.dataset.index = String(index);
      button.setAttribute("aria-label", `Mainkan derajat ${index + 1}, ${note.label}`);
      button.innerHTML = `<span class="pad-degree">${toRoman(index + 1)}</span><span class="pad-key">${keyMap[index].toUpperCase()}</span><span class="pad-note">${note.label}</span><span class="pad-frequency">${Math.round(note.frequency)} HZ</span>`;
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        button.setPointerCapture?.(event.pointerId);
        startNote(index, `pointer-${event.pointerId}`);
      });
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
      master.gain.value = .68;
      compressor.threshold.value = -18;
      compressor.knee.value = 14;
      compressor.ratio.value = 4;
      compressor.attack.value = .006;
      compressor.release.value = .22;
      master.connect(compressor).connect(context.destination);
      state.audio = { context, master };
    }
    if (state.audio.context.state === "suspended") state.audio.context.resume();
    $("#audioStatus").textContent = "AUDIO AKTIF";
    return state.audio;
  }

  function makeEnvelope(context, peak, attack, decay, sustain = .12) {
    const gain = context.createGain();
    const now = context.currentTime;
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(.001, peak), now + Math.max(.004, attack));
    gain.gain.exponentialRampToValueAtTime(Math.max(.001, peak * sustain), now + attack + Math.max(.025, decay));
    return gain;
  }

  function startNote(index, voiceId) {
    if (state.voices.has(voiceId)) return;
    const audio = ensureAudio();
    if (!audio) return;
    const { context, master } = audio;
    const instrument = state.instrument;
    const note = getNote(index);
    const now = context.currentTime;
    if (instrument.family === "bamboo") {
      startAngklung(index, voiceId, note, instrument, audio);
      return;
    }
    const voice = { nodes: [], released: false, release: instrument.release };
    const base = context.createGain();
    base.gain.value = instrument.volume;
    base.connect(master);
    voice.nodes.push(base);

    const carrier = context.createOscillator();
    const modulator = context.createOscillator();
    const modGain = context.createGain();
    const amp = makeEnvelope(context, 1, instrument.family === "string" ? .009 : .003, instrument.decay, instrument.family === "gong" ? .28 : .17);
    carrier.type = instrument.family === "string" ? "sawtooth" : "sine";
    carrier.frequency.setValueAtTime(note.frequency, now);
    modulator.type = "sine";
    const modFreq = note.frequency * instrument.ratio;
    modulator.frequency.setValueAtTime(modFreq, now);
    modGain.gain.setValueAtTime(modFreq * instrument.index * instrument.brightness, now);
    if (instrument.family === "bamboo") {
      carrier.frequency.setValueAtTime(note.frequency * 1.013, now);
      modulator.detune.value = 13;
    }
    carrier.detune.setValueAtTime((Math.random() - .5) * (instrument.family === "metal" ? 3 : 1.4), now);
    modulator.connect(modGain).connect(carrier.frequency);
    carrier.connect(amp).connect(base);
    carrier.start(now);
    modulator.start(now);
    voice.nodes.push(carrier, modulator, modGain, amp);

    // A quiet second partial adds the beating, inharmonic shimmer of struck metal.
    if (instrument.family === "gong" || instrument.family === "metal" || instrument.family === "bamboo") {
      const overtone = context.createOscillator();
      const overtoneGain = makeEnvelope(context, instrument.family === "gong" ? .24 : .12, .004, instrument.decay * .72, .08);
      const overtoneMod = context.createOscillator();
      const overtoneModGain = context.createGain();
      const partial = instrument.family === "gong" ? 2.71 : instrument.family === "bamboo" ? 2.01 : 3.17;
      overtone.type = "sine";
      overtone.frequency.setValueAtTime(note.frequency * partial, now);
      overtoneMod.frequency.setValueAtTime(note.frequency * partial * .51, now);
      overtoneModGain.gain.setValueAtTime(note.frequency * partial * (instrument.index * .42), now);
      overtoneMod.connect(overtoneModGain).connect(overtone.frequency);
      overtone.connect(overtoneGain).connect(base);
      overtone.start(now); overtoneMod.start(now);
      voice.nodes.push(overtone, overtoneGain, overtoneMod, overtoneModGain);
    }

    if (instrument.family === "metal" || instrument.family === "gong") {
      const beating = context.createOscillator();
      const beatGain = makeEnvelope(context, instrument.family === "gong" ? .16 : .1, .002, instrument.decay * .85, .12);
      beating.type = "sine";
      beating.frequency.setValueAtTime(note.frequency * (instrument.family === "gong" ? 1.49 : 2.76) * (1 + instrument.beat), now);
      beating.connect(beatGain).connect(base);
      beating.start(now);
      voice.nodes.push(beating, beatGain);
    }

    if (instrument.noise > 0) {
      const noise = makeNoise(context, instrument.family === "bamboo" ? .075 : .035, instrument.decay < 1 ? .075 : .14);
      noise.gain.gain.value = instrument.noise * instrument.volume;
      noise.source.connect(noise.filter).connect(noise.gain).connect(base);
      noise.source.start(now);
      voice.nodes.push(noise.source, noise.filter, noise.gain);
    }

    if (instrument.family === "string") {
      carrier.frequency.setValueAtTime(note.frequency * 1.008, now);
      carrier.frequency.exponentialRampToValueAtTime(note.frequency, now + .075);
    }

    state.voices.set(voiceId, voice);
    state.activeKeys.set(voiceId, index);
    const pad = keyboard.querySelector(`[data-index="${index}"]`);
    pad?.classList.add("is-playing");
    const freq = Math.round(note.frequency);
    $("#audioStatus").textContent = `${freq} HZ · AKTIF`;
  }

  // Angklung is modeled as a struck, coupled pair of bamboo tube resonators.
  // FM adds a small moving edge to each tube; inharmonic modes and two short
  // impacts keep it from behaving like a held keyboard oscillator.
  function startAngklung(index, voiceId, note, instrument, audio) {
    const { context, master } = audio;
    const bus = context.createGain();
    bus.gain.value = .53;
    bus.connect(master);
    const voice = { nodes: [bus], released: false, release: instrument.release, timer: null };
    state.voices.set(voiceId, voice);
    state.activeKeys.set(voiceId, index);
    playAngklungShake(voice, context, bus, note.frequency);
    voice.timer = window.setInterval(() => {
      if (!voice.released) playAngklungShake(voice, context, bus, note.frequency);
    }, 235);
    keyboard.querySelector(`[data-index="${index}"]`)?.classList.add("is-playing");
    $("#audioStatus").textContent = `${Math.round(note.frequency)} HZ · RATTLE`;
  }

  function playAngklungShake(voice, context, bus, frequency) {
    const now = context.currentTime + .006;
    // A quick change of shake direction can create a second tube/frame impact.
    makeAngklungImpact(voice, context, bus, now, frequency, .92, 0);
    makeAngklungImpact(voice, context, bus, now + .058, frequency, .62, 1);
  }

  function makeAngklungImpact(voice, context, bus, time, frequency, strikeLevel, direction) {
    const nodes = [];
    const drift = (Math.random() - .5) * .004 + (direction ? .0015 : -.0015);
    // The long tube carries the note. The short tube sits close to the octave;
    // the weaker upper modes add the bamboo tube's uneven, non-sine color.
    const modes = [
      { ratio: 1.006, level: .34, decay: .62, fm: .028 },
      { ratio: 2.012, level: .72, decay: 1.12, fm: .024 },
      { ratio: 2.36, level: .12, decay: .30, fm: .035 },
      { ratio: 2.84, level: .065, decay: .21, fm: .03 },
      { ratio: 4.06, level: .055, decay: .40, fm: .02 }
    ];
    modes.forEach((mode, index) => {
      const carrier = context.createOscillator();
      const modulator = context.createOscillator();
      const modDepth = context.createGain();
      const envelope = context.createGain();
      const modeFrequency = frequency * mode.ratio * (1 + drift * (index + 1));
      const duration = mode.decay * (index === 1 ? 1 + direction * .12 : 1);
      carrier.type = "sine";
      carrier.frequency.setValueAtTime(modeFrequency, time);
      modulator.type = "sine";
      modulator.frequency.setValueAtTime(modeFrequency * (1.37 + direction * .025), time);
      modDepth.gain.setValueAtTime(modeFrequency * mode.fm, time);
      envelope.gain.setValueAtTime(.0001, time);
      envelope.gain.linearRampToValueAtTime(mode.level * strikeLevel, time + .0015);
      envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
      modulator.connect(modDepth).connect(carrier.frequency);
      carrier.connect(envelope).connect(bus);
      carrier.start(time);
      modulator.start(time);
      carrier.stop(time + duration + .035);
      modulator.stop(time + duration + .035);
      nodes.push(carrier, modulator, modDepth, envelope);
    });

    const burstLength = .014;
    const buffer = context.createBuffer(1, Math.max(128, Math.floor(context.sampleRate * burstLength)), context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / samples.length, 2);
    const impact = context.createBufferSource();
    const body = context.createBiquadFilter();
    const impactGain = context.createGain();
    impact.buffer = buffer;
    body.type = "bandpass";
    body.frequency.setValueAtTime(direction ? 2050 : 1560, time);
    body.Q.value = .68;
    impactGain.gain.setValueAtTime(.0001, time);
    impactGain.gain.linearRampToValueAtTime(.115 * strikeLevel, time + .001);
    impactGain.gain.exponentialRampToValueAtTime(.0001, time + .028);
    impact.connect(body).connect(impactGain).connect(bus);
    impact.start(time);
    impact.stop(time + burstLength);
    nodes.push(impact, body, impactGain);

    voice.nodes.push(...nodes);
    window.setTimeout(() => {
      nodes.forEach((node) => { try { node.disconnect(); } catch (_) {} });
      voice.nodes = voice.nodes.filter((node) => !nodes.includes(node));
    }, 1550);
  }

  function makeNoise(context, duration, cutoff) {
    const bufferSize = Math.max(256, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
    const source = context.createBufferSource();
    source.buffer = buffer;
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = context.sampleRate > 18000 ? 6700 : 3400;
    filter.Q.value = 1.2;
    const gain = context.createGain();
    gain.gain.setValueAtTime(.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.12, context.currentTime + .004);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + cutoff);
    return { source, filter, gain };
  }

  function stopNote(voiceId) {
    const voice = state.voices.get(voiceId);
    if (!voice || voice.released) return;
    voice.released = true;
    const index = state.activeKeys.get(voiceId);
    const { context } = state.audio;
    const now = context.currentTime;
    const release = voice.release;
    if (state.instrument.family === "bamboo") {
      window.clearInterval(voice.timer);
      window.setTimeout(() => {
        voice.nodes.forEach((node) => { try { node.disconnect(); } catch (_) {} });
        state.voices.delete(voiceId);
      }, 1450);
      state.activeKeys.delete(voiceId);
      if (![...state.activeKeys.values()].includes(index)) keyboard.querySelector(`[data-index="${index}"]`)?.classList.remove("is-playing");
      if (!state.activeKeys.size) $("#audioStatus").textContent = "AUDIO AKTIF";
      return;
    }
    voice.nodes.forEach((node) => {
      if (node instanceof OscillatorNode) {
        try { node.stop(now + Math.max(.05, release)); } catch (_) {}
      } else if (node instanceof AudioBufferSourceNode) {
        try { node.stop(now + .18); } catch (_) {}
      } else if (node instanceof GainNode && node !== state.audio.master) {
        try {
          const current = Math.max(.0001, node.gain.value);
          node.gain.cancelScheduledValues(now);
          node.gain.setValueAtTime(current, now);
          node.gain.exponentialRampToValueAtTime(.0001, now + Math.max(.07, release));
        } catch (_) {}
      }
    });
    window.setTimeout(() => {
      voice.nodes.forEach((node) => { try { node.disconnect(); } catch (_) {} });
      state.voices.delete(voiceId);
    }, Math.max(250, release * 1000 + 150));
    state.activeKeys.delete(voiceId);
    if (![...state.activeKeys.values()].includes(index)) keyboard.querySelector(`[data-index="${index}"]`)?.classList.remove("is-playing");
    if (!state.activeKeys.size) $("#audioStatus").textContent = "AUDIO AKTIF";
  }

  function releaseAll() { [...state.voices.keys()].forEach(stopNote); }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
  }

  $("#scaleSelect").addEventListener("change", (event) => { state.scale = event.target.value; releaseAll(); updatePads(); });
  $("#octaveDown").addEventListener("click", () => { if (state.octave > 2) { state.octave--; releaseAll(); updatePads(); } });
  $("#octaveUp").addEventListener("click", () => { if (state.octave < 6) { state.octave++; releaseAll(); updatePads(); } });
  window.addEventListener("keydown", (event) => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    const key = event.key.toLowerCase();
    const index = keyMap.indexOf(key);
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
