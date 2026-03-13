# TriQualify.com — Kona Qualification Calculator

## Project structure

```
triqualify/
├── index.html              ← main page (all UI text in English)
├── vercel.json             ← Vercel hosting config
├── README.md               ← this file
└── src/
    ├── app.js              ← UI logic and event handlers
    ├── calculator.js       ← pure calculation functions (no DOM)
    ├── css/
    │   └── style.css       ← all styles
    └── data/
        └── races.js        ← race database + coefficients  ← EDIT THIS TO ADD RACES
```

---

## Step 1 — Install required tools (one time only)

### Git
- **Windows:** Download from https://git-scm.com/download/win, install with defaults
- **Mac:** Open Terminal, type `git --version` — Mac will prompt you to install automatically

### Node.js (optional, for local testing)
- Download from https://nodejs.org (LTS version)

### VS Code (recommended editor)
- Download from https://code.visualstudio.com

---

## Step 2 — Create a GitHub account

1. Go to https://github.com
2. Click **Sign up** → enter email, password, username
3. Verify your email

---

## Step 3 — Create a repository on GitHub

1. Click the green **New** button (top left)
2. Repository name: `triqualify`
3. Set to **Public** (required for free Vercel hosting)
4. Click **Create repository**

---

## Step 4 — Upload files to GitHub

Open **Terminal** (Mac) or **Git Bash** (Windows — installed with Git):

```bash
# Navigate to the project folder
cd ~/Downloads/triqualify

# Initialize Git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial version of calculator"

# Connect to GitHub (copy URL from your GitHub repo page)
git remote add origin https://github.com/YOUR-USERNAME/triqualify.git

# Push to GitHub
git push -u origin main
```

GitHub will ask for your username and a **personal access token** (not password):
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → check `repo` scope → Generate
3. Copy the token and use it as your password when pushing

**Alternative:** Use **GitHub Desktop** (https://desktop.github.com) — graphical interface, no command line needed.

---

## Step 5 — Deploy to Vercel (free hosting)

1. Go to https://vercel.com
2. Click **Sign Up** → **Continue with GitHub**
3. Allow Vercel access to your GitHub account
4. Click **Add New Project**
5. Find the `triqualify` repository → click **Import**
6. Leave settings as default (Framework: Other, Root: /)
7. Click **Deploy**

Your site will be live at `triqualify.vercel.app` in ~30 seconds.

---

## Step 6 — Connect your custom domain

### Buy a domain
Recommended: **Cloudflare Registrar** (https://cloudflare.com) — ~$10/year for .com, cheapest rates.
Alternatives: GoDaddy, Namecheap.

### Connect domain to Vercel
1. Vercel → your project → **Settings** → **Domains**
2. Enter `triqualify.com` → Add
3. Vercel will show you DNS records to configure
4. In Cloudflare (or your registrar) → DNS → add the records Vercel shows
5. Wait 5–30 minutes → your site is live on your own domain

---

## How to update the site after making changes

Every time you edit files, push the changes:

```bash
cd ~/Downloads/triqualify
git add .
git commit -m "Description of what changed"
git push
```

Vercel automatically detects the push and deploys the new version in ~30 seconds.

---

## How to add or edit a race

Open `src/data/races.js` in VS Code and copy an existing race block:

```javascript
{
  id: 17,                              // unique number
  name: "IRONMAN Lanzarote",
  date: "May 24, 2026",
  country: "Spain",
  continent: "europe",
  officialUrl: "https://www.ironman.com/im-lanzarote",
  slots: 40,
  starters: 1800,
  bike: "vhilly",    // flat | hilly | vhilly
  run: "flat",       // flat | hilly | vhilly
  heat: "hot",       // normal | hot | extreme
  wetsuit: true,
  wind: "moderate",  // none | moderate | strong
  flagship: false,
  cutoffMin: 530,    // historical cutoff estimate in minutes
  fieldPct: 12,      // estimated % of field meeting Kona Standard
},
```

---

## Recommended tools

| Tool | Purpose | Link |
|------|---------|------|
| VS Code | Code editor | https://code.visualstudio.com |
| GitHub Desktop | Git without command line | https://desktop.github.com |
| Vercel | Free hosting | https://vercel.com |
| Cloudflare | Domain + CDN | https://cloudflare.com |
