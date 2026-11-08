# Running rushkoff.com and the article archive — handoff guide

This file exists so that **anyone** — Douglas, a new web developer, or any capable
AI coding assistant — can keep these websites running **without** relying on any
particular company, Cowork account, saved "skill," or assistant. If you're taking
this over, read this first. Everything essential lives in two GitHub repositories
that Douglas owns. Nothing here depends on a third party.

## The two websites

1. **rushkoff.com** — repo `github.com/rushkoff/website`, branch `main`.
   Hosted free on **GitHub Pages**. Push to `main` and the live site updates in
   ~1–2 minutes. (The `CNAME` file maps the repo to rushkoff.com.)

2. **archive.rushkoff.com** — repo `github.com/rushkoff/rushkoff-archive`,
   branch `master`. A Jekyll site deployed automatically by a GitHub Action.
   Push to `master` and it rebuilds and goes live in ~2–3 minutes.

Both repos belong to the `rushkoff` GitHub account. If you have that account, you
have everything.

## Ordinary edits (rushkoff.com)

Plain HTML/CSS — no build step. Edit the `.html` files (the nav and footer are
copied into each page) or `css/styles.css`, commit, and push to `main`.

## The Press page (rushkoff.com/press.html)

Master source is a Google Doc:
https://docs.google.com/document/d/1EA7D1hFewzyXqpP9PWxglK1lnXp0zywJDiXC5zfHkFw/edit
Douglas pastes press links + descriptions there. The page is then regenerated
from the doc by a script. Full steps are in `press-build/README.md`. Short version:
put the doc's text in a file and run
`python3 press-build/build_press.py press_doc.txt press.html`, then commit and push.
No Google integration is required — the script accepts pasted text.

## Adding articles to the archive (archive.rushkoff.com)

Each article is a Markdown file at `src/_articles/<slug>.md` in the archive repo,
with this front matter followed by the full text:

```
---
title: Article title
subtitle: Optional subtitle
publication: _publications/Substack.md
categories:
  - _categories/journalism.md
date: 2026-11-05T00:00:00.000-05:00
notes: >
  Source: [https://example.com/url](https://example.com/url)
---

Full article text. Paragraphs separated by blank lines.
```

Add the file, commit, push to `master`; the site rebuilds itself. Valid values
for `publication` and `categories` are the files already in `src/_publications/`
and `src/_categories/`.

## The podcast page's YouTube video (self-updating)

rushkoff.com/podcast embeds the latest full video from the YouTube channel. A
GitHub Action, `.github/workflows/update-latest-video.yml`, runs daily, finds the
newest non-Short upload, and swaps it in automatically. To change channels, edit
`CHANNEL_ID` in that file. The Action needs the repo's Settings → Actions →
"Workflow permissions" set to **Read and write**.

## Redirects

`rushkoff.com/support` → Patreon; `rushkoff.com/podcast` is the podcast page;
`rushkoff.com/teamhuman` (and `teamhuman.html`) redirect to it. These are small
HTML files in the `support/`, `podcast/`, and `teamhuman/` folders.

## Handing this to a successor

Give any competent web developer or AI coding assistant access to the two GitHub
repos above and point them to this file. It's all standard git + HTML + a little
Python. It does **not** require any Cowork account, any saved skill, or any
specific assistant. Those are conveniences layered on top of these written
instructions — never requirements.
