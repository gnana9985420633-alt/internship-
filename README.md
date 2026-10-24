# TaskFlow — Full-Stack Internship Project

TaskFlow is a working task-management web application that demonstrates frontend development, backend APIs, data persistence, validation and basic application security.

## Technology stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript
- **Backend:** Node.js built-in HTTP server
- **Database:** SQLite through Node's built-in `node:sqlite` module
- **API:** JSON REST-style endpoints
- **Version control:** Git and GitHub

> **Requirements:** Use Node.js 22.13+ (or a current Node.js release that supports `node:sqlite`). No `npm install` is needed because this project uses built-in Node.js modules only.

## Features

- Create tasks with title, description, status and priority
- Read tasks from a SQLite database
- Edit task details
- Delete tasks after confirmation
- Mark tasks completed or cycle between statuses
- Search tasks and filter by status/priority
- Dashboard counters update from saved data
- Input validation and safe HTML escaping
- Connection status indicator and error messages
- Responsive desktop and mobile layout

## Project structure

```text
apexplanet-live-internship-project/
├── package.json
├── server.js
├── README.md
└── public/
    ├── index.html
    ├── styles.css
    └── app.js
```

## Run locally

1. Install Node.js 22.13 or newer: https://nodejs.org/
2. Extract this project ZIP.
3. Open the project folder in VS Code.
4. Open a terminal in that folder.
5. Run:

```bash
node --version
npm start
```

6. Open http://localhost:3000 in your browser.
7. Create a task, refresh the page and confirm the task is still there. This verifies database persistence.

The SQLite database file `data.sqlite` is created automatically at runtime. It is intentionally not included in the repository.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check server status |
| GET | `/api/tasks` | List tasks and dashboard counts |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

Example create request:

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Test task\",\"description\":\"Check persistence\",\"priority\":\"high\"}"
```

## Push to GitHub

Create an empty repository at https://github.com/new, then from this project folder run:

```bash
git init
git add .
git commit -m "Build TaskFlow full-stack internship project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the placeholder GitHub URL with your own repository URL.

## Deploying online

This app needs a Node.js server and a writable persistent disk for SQLite. **GitHub Pages alone cannot run the backend or database.** Deploy the Node.js app to a Node-compatible hosting service that supports persistent storage, set the start command to `npm start`, and configure a persistent disk/path for `data.sqlite` using the `DB_PATH` environment variable. Confirm the host's current Node.js version and persistent-disk support before deployment. If the hosting platform has ephemeral storage, tasks may disappear after redeploy/restart.

## Test checklist

- [ ] Dashboard loads and shows API connection status.
- [ ] Create a task with a title.
- [ ] Refresh the browser; task remains saved.
- [ ] Edit the title, description, status and priority.
- [ ] Search for a task by title.
- [ ] Filter by status and priority.
- [ ] Mark a task completed.
- [ ] Delete a task after confirmation.
- [ ] Test the layout on mobile and desktop.
- [ ] Stop the server and verify the UI displays a connection error; restart it and retry.

## Limitations / production improvements

This is a functional learning project, not a production multi-user service. It has no login, roles, CSRF protection, rate limiting or multi-user isolation. Add authentication, authorization, backups, logging and production-grade security before storing real or sensitive data. Test all features in your own environment before describing them as verified.
