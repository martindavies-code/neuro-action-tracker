# Official Deployment: GitHub Pages 🚀

The single, authoritative, and official production version of **RhythmQuest** is hosted directly on **GitHub Pages**:

🔗 **Live Application**: [https://martindavies-code.github.io/neuro-action-tracker/](https://martindavies-code.github.io/neuro-action-tracker/)  
📦 **GitHub Repository**: [https://github.com/martindavies-code/neuro-action-tracker](https://github.com/martindavies-code/neuro-action-tracker)

---

## Single Source of Truth: Automated GitHub CI/CD

All hosting, bundling, testing, and continuous deployment are managed 100% through GitHub:

1. **Push to `main`**: Any commit pushed to the `main` branch automatically triggers the GitHub Actions workflow ([`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml)).
2. **Automated Verification**: GitHub Actions runs the complete test runner (`npm test`) to guarantee zero regressions.
3. **Production Compilation**: Vite compiles TypeScript and packages optimized static assets with relative path resolution (`base: './'`).
4. **Instant Deployment**: The build artifacts are deployed automatically to the `gh-pages` branch.
5. **Live Within Seconds**: GitHub Pages immediately serves the updated release at [https://martindavies-code.github.io/neuro-action-tracker/](https://martindavies-code.github.io/neuro-action-tracker/).

---

## Zero External Hosting Dependencies

- **No Firebase Hosting**: Firebase hosting configurations have been completely removed. GitHub Pages is the sole host.
- **No Local Server Required**: You do not need to run `localhost:5173` or a local Node.js process to use the application. Simply open the GitHub Pages link on any phone, tablet, or desktop browser.
- **Client-Side Sovereignty**: All tasks, streaks, audio soundscapes, AI breakdown features, and mascot evolutions run directly in the browser and persist via HTML5 LocalStorage and downloadable JSON backups.
