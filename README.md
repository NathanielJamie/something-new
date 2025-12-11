# iPhone History Wiki — Short section notes

This README gives short notes for each project file so you know where to look.

- index.html
  - Header: site title and search input.
  - Main (#list): grid where JS injects device cards.
  - Footer: small footer message.
  - Script: loads assets/js/app.js to render content.

- device.html
  - Nav: back link to the list.
  - Article (#device): JS injects the device detail here based on ?id=slug.

- style.css
  - :root: color variables — change theme colors here.
  - Base: reset and typography.
  - Hero: top banner with blurred image and overlay.
  - Cards: grid and .card rules (you asked to make these dark).
  - Device detail: styles for the detail page.

- assets/js/app.js
  - Loads data/devices.json.
  - Renders list and handles search input.
  - Exposes renderDeviceById(id) which device.html calls to render details.

- data/devices.json
  - JSON array of device objects.
  - Fields: id, name, model, slug, released (ISO), year, description, image, specs (object), fun_facts (array), sources (array).

How to test quickly

1. Open the project root in VS Code.
2. Install Live Server extension and click "Go Live".
3. Open the page and try the search and "Read more" links.

If you want, next I can:

- Walk through one file live with you (step-by-step).
- Add a tiny inline tutorial in VS Code-friendly format.
- Add a theme toggle so you can switch card colors while experimenting.
