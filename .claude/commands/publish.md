First, show the user a plain-English summary of every file that has changed since the last save (use `git diff --name-only` and `git status --short` to find them, but describe the changes in simple terms like "you updated the homepage" not file names).

Then use the AskUserQuestion tool to confirm before doing anything:

- Question: "Ready to publish? This will make your changes live."
- Header: "Confirm"
- Options:
  - Label: "Publish", Description: "Make these changes live now"
  - Label: "Cancel", Description: "Go back — your changes are still saved locally"

Only proceed if they choose Publish. If they cancel, tell them their changes are still saved locally and they can keep working or use /reset to undo them.

If they confirm, do the following:
1. Stage all changes with `git add -A`
2. Write a short, plain-English commit message that describes what actually changed (e.g. "Updated the about page and added two new books")
3. Commit with that message
4. Push to the remote with `git push`

After pushing, tell them in one sentence that their changes are now live, and what was published.

If git or the remote is not set up yet, tell them clearly: "Publishing isn't set up yet — let the site owner know and they can get it ready for you."
