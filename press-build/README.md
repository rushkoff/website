# If you are taking this over

You do not need the usual Cowork assistant or this account to keep the Press page
updated. This page is generated from the Google Doc below by `build_press.py`, and
the exact steps are in this file. Hand this repo to any web developer or AI coding
assistant, point them here, and they can do it. The phrase "refresh the press
archive" is only a Cowork shortcut; the portable procedure is the steps below.
See `HANDOFF.md` in the repo root for how the whole site works.

---

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

---

## How to format a new entry (give this to whoever/whatever edits the doc)

The Press page is generated from the Google Doc by `build_press.py`, which parses a
specific structure. A new entry must match the existing ones or it may be
mislabeled or skipped. Rules:

1. **Section.** Put it under the correct heading, at the TOP (newest first). Sections:
   Interviews, Reviews, Profiles, Talks, Documentaries/Movies, TV/Documentary
   appearances, Radio/Podcasts, Served as source, Miscellaneous.

2. **One line: a hyperlinked title, then source + date.** The title is the clickable
   text (hyperlinked to the piece's URL). Right after it, in plain text: the source
   (outlet or show name), then the date. In Markdown terms the doc renders as
   `[Title](URL) Source, Date`.

3. **Media tag — only when it differs from the section default.** Defaults: Talks =
   video, Radio/Podcasts = audio, Interviews/Reviews/Profiles = text. If an entry is
   a different type, mark it right after the link: `(video)`, `(audio)` (or
   `(podcast)`), or `(text)`. Example: a YouTube video placed in Radio/Podcasts
   (default audio) must be tagged `(video)` or it will show an "audio" badge.

4. **Asterisk is rare.** Prefix with `*` ONLY for a genuinely major, career-marker
   piece. It is used very sparingly (two entries in the whole archive).

5. **Clean the title.** Use the piece's real title; drop platform cruft like a
   trailing " | Douglas Rushkoff" that YouTube appends.

**Worked example** (a YouTube podcast interview, added to the top of Radio/Podcasts):

    [Big Tech CEOs Are Betting On Our Demise](https://youtu.be/Cx-nW3PcsrA) (video) The Smart Cookies Podcast, November 9, 2026

After the doc is edited, the daily "Refresh Press archive" GitHub Action (or a manual
run of it) rebuilds and publishes the page within a day.
