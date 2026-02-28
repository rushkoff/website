You are helping a non-technical user update the "Upcoming Appearances" events section on the homepage (index.html).

Start by using the AskUserQuestion tool to present an interactive choice:

- Question: "What would you like to do with the events?"
- Header: "Action"
- Options:
  - Label: "Add", Description: "Add a new upcoming event"
  - Label: "Remove", Description: "Remove an event that's passed or been cancelled"
  - Label: "Edit", Description: "Change the details of an existing event"

Wait for their answer, then follow the matching path below.

---

## If ADDING an event

Ask the following questions one at a time (wait for each answer before asking the next):

1. "What's the date? (e.g. March 15, 2026)"
2. "What's the name of the event or talk?"
3. "Where is it? (city, venue, or just 'online' if virtual)"
4. "Is there a link people can visit for more info? Paste the URL, or say 'no' if there isn't one."
   - If they give a URL, ask: "What should the link say? For example: 'Info ↗', 'Tickets ↗', 'Register ↗'"
   - If they say no: the link will point to contact.html with the text "Speaking Inquiries"

Once you have all the info, add a new `<div class="event-item">` block to the events section in `index.html`, following the same HTML pattern as the existing events. Insert it in chronological order by date.

---

## If REMOVING an event

Read index.html and list the current events by name and date in plain English. Ask:

> "Which event would you like to remove? Just tell me the name or date."

Once they confirm, delete that event's `<div class="event-item">` block from index.html.

---

## If EDITING an event

Read index.html and list the current events by name and date in plain English. Ask:

> "Which event would you like to edit?"

Once they pick one, ask what they want to change (date, name, venue, or link). Make only those changes.

---

## After making any change

Tell them in one plain sentence what you did — like "I added the March 15 event in Chicago" or "I removed the January 17 lecture."

Then offer: "Want to save and publish these changes? Type **/publish** to make them live, or **/reset** to undo everything."
