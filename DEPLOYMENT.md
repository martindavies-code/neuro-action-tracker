# Deploying RhythmQuest to GitHub Pages 🚀

RhythmQuest is configured to automatically build and deploy directly to **GitHub Pages** via GitHub Actions on every push to the `main` branch.

Live URL: **[https://martindavies-code.github.io/neuro-action-tracker/](https://martindavies-code.github.io/neuro-action-tracker/)**

---

## 1. Automated GitHub Pages CI/CD

Whenever changes are pushed to `main`:
1. The `.github/workflows/deploy.yml` workflow triggers.
2. It sets up Node.js 22 and runs `npm ci`.
3. It runs the full automated test suite (`npm test`).
4. It compiles TypeScript and runs `npm run build` using Vite with relative base asset paths (`base: './'`).
5. It deploys the resulting `dist/` directory directly to the `gh-pages` branch using `peaceiris/actions-gh-pages@v4`.
6. GitHub Pages serves the live application at `https://martindavies-code.github.io/neuro-action-tracker/`.

---

## 2. Optional: Connecting Firebase Cloud Sync

RhythmQuest runs **100% offline out-of-the-box** using browser LocalStorage and Service Workers.

If you want cross-device cloud sync with Google Sign-In and Firestore:
1. Go to [Firebase Console](https://console.firebase.google.com/) and open your project.
2. In **Authentication > Settings > Authorized Domains**, ensure:
   - `localhost`
   - `martindavies-code.github.io`
   are listed as authorized domains.
3. In the app, click the **☁️ Sign In / Cloud** button in the header, expand **⚙️ Cloud Project Settings & Local Mode**, and verify or customize your Firebase project credentials.
4. (Optional) You can also add repository secrets in GitHub (`Settings > Secrets and variables > Actions`) for `VITE_FIREBASE_API_KEY`, etc. if you prefer injecting custom keys at build time.

---

## 3. Local Verification

To test the exact production build locally:
```bash
npm run build
npm run preview
```
Open `http://localhost:4173/` to inspect the built bundle.
