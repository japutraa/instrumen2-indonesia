# Instrumen2

**Instrumen2 — Indonesian Virtual Instruments** is a browser instrument for exploring synthesized sounds inspired by Indonesian musical traditions. It builds sound in real time with the Web Audio API; there are no audio samples or build step.

## Play it

Open `index.html` in a current browser, or serve this folder locally:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. Audio starts after the first user interaction.

### Controls

- Select an instrument and click or touch a pad, or press **A S D F G H J K**.
- Hold an Angklung pad for repeated **kurulung** shakes (about 2.5 per second). The other instruments play one struck or plucked note per touch, with the note tail continuing after release.
- **Diatonis** is the default tuning for every instrument. Slendro and Pelog are optional.
- Use **+ / −** or the arrow keys to change octave.

## Sound models

- **Angklung** — paired bamboo tube resonances, two quick impacts per shake, gentle FM color, and long overlapping decays. The repeat rate follows the approximately 2–3 shakes-per-second kurulung technique described by [Angklung.org](https://angklung.org/angklung-playing-techniques/). Published measurements describe coupled resonances and prominent tube modes ([Hamdan et al., 2022](https://doi.org/10.15376/biores.17.1.1670-1679); [Arifin & Pribadi, 2019](https://doi.org/10.1250/ast.40.178)).
- **Bonang** — a soft mallet transient and inharmonic FM resonances, with a delayed, swelling mid partial for a rounded kettle-gong quality.
- **Saron** — a short, firm mallet transient and inharmonic bar modes whose brighter partials decay faster than the fundamental.
- **Gangsa Bali** — a brighter bar model with paired modes a few hertz apart to evoke the beating shimmer called *ombak* in Balinese ensemble tuning ([study of ombak](https://doi.org/10.1121/1.4964503)).
- **Kacapi Sunda** — a plucked-string Karplus–Strong delay loop with a quiet FM body resonance.

These are original synthesized interpretations, not recordings or exact replicas of particular instruments, makers, ensembles, or regional tunings. The modeled spectral relationships are intentionally simplified. For angklung context, see [UNESCO: Indonesian Angklung](https://ich.unesco.org/en/RL/angklung-00393).

## Deploy on GitHub Pages

1. Add these files to the root of a GitHub repository and push to `main`.
2. Open **Settings → Pages** and choose **GitHub Actions** as the source.
3. The included workflow deploys on each push to `main`.

The app is static and can also be deployed to Netlify, Cloudflare Pages, or another static host. No secrets or dependency installation are needed.

## Browser support

Use a current version of Chrome, Firefox, Safari, or Edge. Audio quality and latency depend on the device and browser.
