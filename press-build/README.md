# Press archive build

`press.html` (the site's Press page) is generated from a Google Doc, which is
the **master** list. A human edits the doc; this folder rebuilds the page from it.

- **Master doc:** https://docs.google.com/document/d/1EA7D1hFewzyXqpP9PWxglK1lnXp0zywJDiXC5zfHkFw/edit
- **Output:** `../press.html` (repo root), served at https://rushkoff.com/press.html
- Nothing on the page depends on Google at runtime — it's a static snapshot you
  regenerate on demand.

## To refresh the page after editing the doc

1. Read the Google Doc's text and save it to a file, e.g. `press_doc.txt`
   (the reader may return JSON like `{"fileContent": "..."}` — the script accepts
   either that JSON or raw text).
2. Run:

   ```
   python3 press-build/build_press.py press_doc.txt press.html
   ```

3. Commit `press.html` and push. The site redeploys automatically.

In a Cowork session you can just say **"refresh the press archive"** and Claude
runs this procedure for you (it has access to the Google Doc).

## Notes

- Sections in the doc map to filter chips; the two video sections
  (Documentaries/Movies + TV/Documentary appearances) are merged into **TV & Film**.
- Media badges: only **video** and **audio** are labelled; text is the default (no badge).
- Entries whose source/date sit on a separate line below the link are handled.
- `OVERRIDE` at the top of `build_press.py` holds manual date corrections the doc
  can't express yet (currently: the NewsNation "MK Ultra" interview → May 13, 2026,
  because the doc has it as 2025). Fix the doc line and you can remove the override.
