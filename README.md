# CityCare Complaint Portal

CityCare is a lightweight municipal complaint portal built with a static frontend and a minimal Node/Express backend. Residents can register, log in, submit complaints with photos (including camera capture support), and track progress via user dashboards, while admins can review tickets from their own console.

## Features
- **Smart complaint intake**: capture title, category, location, priority, description, and optional image or live camera snapshot.
- **User dashboards**: charts, status pills, and searchable history of past submissions.
- **Profile insights**: quick view of total/resolved/pending complaints with interactive drill-down.
- **Admin tools**: simple admin dashboard (login via fixed credentials) to monitor system-wide trends.
- **Theme toggles**: light/dark mode with persistence.

## Tech Stack
- **Frontend**: HTML, CSS, vanilla JavaScript (localStorage used for persistence/demo data).
- **Backend**: Node.js with Express serving the static `public/` bundle.

## Getting Started
```bash
# install dependencies
npm install

# run the dev server (defaults to port 3000, respects PORT env)
npm start
```
Open `http://localhost:3000` (or the port shown in the console).

### Sample Credentials
- **Admin**: `admin@citycare.com` / `admin123`
- **User**: register any account via `register.html`, or log in with an existing user saved in `localStorage`.

## Project Structure
```
citycare_pro_full_project/
├── public/                # static frontend (pages, css, js, assets)
├── server.js              # Express server for static hosting
├── package.json           # npm metadata & scripts
└── README.md
```

## Notes & Next Steps
- LocalStorage is used instead of a database for simplicity; swap with a proper API/database for production deployments.
- Complaint images are stored as base64 strings in LocalStorage, so keep submissions modest in size.
- To deploy, use any Node-compatible host (Render, Railway, etc.) and run `npm start` on the platform’s assigned port.

Contributions and issues are welcome!

