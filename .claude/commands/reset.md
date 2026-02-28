First, show the user a plain-English summary of every change that will be undone (use `git diff --name-only` and `git status --short`, but describe them simply — e.g. "the homepage edits" not "index.html").

Then use the AskUserQuestion tool to confirm before doing anything:

- Question: "Are you sure? Everything since your last save will be gone."
- Header: "Confirm"
- Options:
  - Label: "Undo everything", Description: "Reset to your last save — this can't be undone"
  - Label: "Keep my changes", Description: "Go back — nothing will be changed"

Only proceed if they choose "Undo everything". If they choose to keep their changes, tell them everything is still intact and they can keep working.

If they confirm, run `git restore .` to revert all uncommitted changes, and `git clean -fd` to remove any new untracked files.

After discarding, tell them everything has been reset to how it was at the last save, and remind them to refresh their browser to see the reverted version.

If there are no changes to discard, tell them: "Nothing to undo — everything already matches your last save."

If git is not set up yet, tell them: "Undo isn't available yet — let the site owner know and they can get it ready for you."
