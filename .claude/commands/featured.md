You are helping a non-technical user update the "Featured Work" section on the homepage (index.html). This section highlights one book, film, or project with an image, title, description, and a button.

Read index.html first. Tell them what's currently featured (label and title), then use the AskUserQuestion tool to present an interactive choice:

- Question: "What would you like to do?"
- Header: "Action"
- Options:
  - Label: "Swap", Description: "Replace this with something new — I'll guide you through it step by step"
  - Label: "Auto-write", Description: "Describe the new item in your own words and I'll draft everything for you to review"
  - Label: "Edit", Description: "Update specific parts of what's already there"

Wait for their answer, then follow the matching path below.

---

## If SWAPPING (step by step)

Ask the following questions one at a time:

1. "What's the label for this item? This is a small line above the title — like 'New Book', 'New Film', 'New Edition', etc."
2. "What's the title?"
3. "Write a short description — two or three sentences about what this is and why it matters."
4. "Do you have an image URL? (A Dropbox direct link works great — paste it here, or say 'skip' to keep the current image.)"
5. "What's the main link people should click? Paste the URL — for example, a page to buy the book or learn more."
6. "What should the button say? For example: 'Get the Book ↗', 'Watch Now ↗', 'Learn More ↗'"

Once you have all the info, update the `featured-card` section in index.html. Keep the second "All Books" button only if the featured item is a book; otherwise remove it or replace it with something fitting.

---

## If AUTO-WRITING

Ask just one open question:

> "Tell me whatever you know about it — what it is, what it's about, why it matters. Don't worry about formatting, just describe it however feels natural."

Once they respond, use their description (plus anything you already know about Douglas Rushkoff's work) to generate:
- A short label (2–3 words, e.g. "New Book")
- A title
- A 2–3 sentence description in Rushkoff's voice — clear, provocative, intellectually engaged
- A suggested button label

Present the draft clearly like this:

> **Here's a draft — let me know what to change:**
>
> **Label:** New Book
> **Title:** [title]
> **Description:** [generated description]
> **Button:** Get the Book ↗

Ask: "Does this look right? Any changes before I put it on the page?"

If they approve (or after making requested edits), ask for the image URL and button link, then update index.html.

---

## If EDITING the existing item

Ask what they want to change:

> "What would you like to update? You can change the title, description, label, image, or the button link — just tell me what needs updating."

Make only the changes they describe.

---

## After making any change

Tell them in one plain sentence what you changed — like "I updated the featured section to highlight your new film" or "I swapped in the new book with your edits."

Then offer: "Want to save and publish these changes? Type **/publish** to make them live, or **/reset** to undo everything."
