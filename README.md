# Instrumen2

**Instrumen2 — Indonesian Virtual Instruments** is a small browser instrument for exploring synthesized sounds inspired by Indonesian musical traditions. It uses the Web Audio API and FM synthesis; it downloads no audio samples and needs no build step.

## Play it

Open `index.html` in a modern browser, or serve this folder locally:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. The browser starts audio after the first user interaction.

### Controls

- Select an instrument from the collection.
- Click or touch a pad, or press **A S D F G H J K**. Hold to sustain the note.
- Change the tuning between **Slendro**, **Pelog**, and **Diatonis**.
- Use **+ / −** or the arrow keys to change octave.

## Instruments

- **Angklung** — two coupled, struck bamboo resonators, synthesized with FM, a short impact, an octave pair, and separate natural decays. Hold a pad to repeat the shake.
- **Bonang** — a rounded gong voice with inharmonic partials and a long resonant tail.
- **Saron** — a bright, struck metal bar voice.
- **Gangsa Bali** — a brighter metal voice with a stronger beating shimmer.
- **Kacapi Sunda** — a plucked, string-like FM voice.

These are original synthesized interpretations, not recordings or exact replicas of specific instruments or regional tuning systems. Slendro and Pelog are offered as playable approximations.

### Angklung sound model

The angklung patch uses two resonant tube voices: a lower note and a second resonance near the octave. Each shake starts with a short bamboo-like impact and the tube voices ring out with different decay times. Holding a pad repeats the paired impacts. FM adds a restrained, changing edge to the tube resonances; it is not a sustained keyboard tone.

This is a synthesis approximation, not a recording. The sound is based on published acoustic descriptions of paired bamboo rattle tubes, their coupled pitch peaks, short impacts, and prominent partials:

- [Hamdan et al., “Study on Vibro-acoustic Characteristics of Bamboo-based Angklung Instrument” (2022)](https://doi.org/10.15376/biores.17.1.1670-1679)
- [Haron et al., “Synthesizing an Angklung” (2018)](https://doi.org/10.1166/asl.2018.11219)
- [Arifin & Pribadi, “Modeling of angklung to determine its pitch frequency” (2019)](https://doi.org/10.1250/ast.40.178)
- [UNESCO: Indonesian Angklung](https://ich.unesco.org/en/RL/angklung-00393)

## Deploy on GitHub Pages

1. Create a GitHub repository and add these files at its root.
2. Push the default branch named `main`.
3. In the repository, open **Settings → Pages** and choose **GitHub Actions** as the source.
4. The included workflow deploys on each push to `main`; GitHub Pages will show the published URL in the workflow run and Pages settings.

The app is static, so it can also be deployed to Netlify, Cloudflare Pages, or any static host. No secrets, server, or dependency installation are needed.

## Browser support

Use a current version of Chrome, Firefox, Safari, or Edge. The Web Audio API requires a user gesture before sound can play. Audio quality and latency depend on the device and browser.
