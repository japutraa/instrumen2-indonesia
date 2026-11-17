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

- **Angklung** — a bamboo inspired FM voice with a brief breathy rattle.
- **Bonang** — a rounded gong voice with inharmonic partials and a long resonant tail.
- **Saron** — a bright, struck metal bar voice.
- **Gangsa Bali** — a brighter metal voice with a stronger beating shimmer.
- **Kacapi Sunda** — a plucked, string-like FM voice.

These are original synthesized interpretations, not recordings or exact replicas of specific instruments or regional tuning systems. Slendro and Pelog are offered as playable approximations.

## Deploy on GitHub Pages

1. Create a GitHub repository and add these files at its root.
2. Push the default branch named `main`.
3. In the repository, open **Settings → Pages** and choose **GitHub Actions** as the source.
4. The included workflow deploys on each push to `main`; GitHub Pages will show the published URL in the workflow run and Pages settings.

The app is static, so it can also be deployed to Netlify, Cloudflare Pages, or any static host. No secrets, server, or dependency installation are needed.

## Browser support

Use a current version of Chrome, Firefox, Safari, or Edge. The Web Audio API requires a user gesture before sound can play. Audio quality and latency depend on the device and browser.
