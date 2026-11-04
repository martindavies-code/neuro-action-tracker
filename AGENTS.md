# Neuro Action Tracker - Agent Rules

## Git Synchronization

1. **Task-Start Sync**:
   - Before starting any work or edits, verify the workspace is up-to-date with GitHub:
     - Verify on branch `main` and upstream is `'origin/main'`.
     - Verify working tree is clean (`git status --porcelain` is empty).
     - Fetch upstream (`git fetch origin`).
     - Check divergence with `git rev-list --left-right --count HEAD...'@{upstream}'`.
     - If local is behind, fast-forward pull: `git pull --ff-only`.
     - Stop and notify user if dirty, detached, diverged, or ahead.

2. **Automatic Push on Changes**:
   - Whenever changes are made and verified as part of a task in this repository, always commit the changes with a clear, conventional commit message and push to GitHub (`origin/main`) automatically.
