# Web Development Internship Project

A beginner-friendly, responsive portfolio-style website created with **HTML5, CSS3 and vanilla JavaScript**. It is based on the technology stack and learning topics described in the internship report.

## Features

- Responsive layout for mobile, tablet and desktop
- Semantic HTML sections and accessible navigation
- Mobile navigation menu
- Project cards with category filters
- Contact form validation using JavaScript
- Current year in the footer
- No build tools, dependencies or backend required

## Project structure

```text
web-development-internship-project/
├── index.html
├── style.css
├── script.js
├── README.md
└── .gitignore
```

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a browser.
3. For a better development workflow, open the folder in Visual Studio Code and use the Live Server extension if installed.

## Push to GitHub

Create an **empty repository** on GitHub (do not add a README if you plan to push this folder as-is), then run these commands from this project folder:

```bash
git init
git add .
git commit -m "Initial commit: web development internship project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the URL with your own GitHub repository URL.

If Git says a remote named `origin` already exists, use:

```bash
git remote set-url origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

## Deploy with GitHub Pages

1. Push the project to GitHub.
2. Open the repository's **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select branch `main` and folder `/(root)`, then save.
5. Wait for GitHub Pages to publish the site; the URL will appear in the Pages settings.

## Test checklist

- [ ] Navigation links scroll to the correct sections.
- [ ] Mobile menu opens and closes.
- [ ] All / Design / JavaScript filters show the correct cards.
- [ ] Empty or invalid contact form values show helpful errors.
- [ ] Valid values show a success message.
- [ ] Layout works at mobile, tablet and desktop widths.

## Important note

The contact form is a **frontend demo only**. It does not send emails or store messages. Replace the sample email address and project content with your own details before presenting the project. Only describe features you have actually tested and understand.
