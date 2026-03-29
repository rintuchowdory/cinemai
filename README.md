# 🎬 CinemAI — Your Infinite Watchlist

A free Netflix-style movie streaming app powered by:
- **TMDB API** — real movie data, posters, ratings (100% free)
- **VidSrc.cc** — free movie streaming embeds (no API key needed)
- **Claude AI (Anthropic)** — smart movie recommendations

---

## 🚀 Quick Setup (5 minutes)

### Step 1 — Get your FREE TMDB API Key
1. Go to [themoviedb.org](https://www.themoviedb.org/) and create a free account
2. Go to **Settings → API → Create API Key** (choose "Developer")
3. Copy your **API Key (v3 auth)**

### Step 2 — Get your FREE Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up — you get **$5 free credit** (enough for thousands of AI requests)
3. Go to **API Keys → Create Key**
4. Copy your key

### Step 3 — Add your keys
Open `js/config.js` and replace:
```js
TMDB_API_KEY: "YOUR_TMDB_API_KEY_HERE",
ANTHROPIC_API_KEY: "YOUR_ANTHROPIC_API_KEY_HERE",
```

### Step 4 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial CinemAI commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cinemai.git
git push -u origin main
```

### Step 5 — Deploy FREE on Vercel (get your live URL)
1. Go to [vercel.com](https://vercel.com) — sign up free with GitHub
2. Click **"Add New Project"**
3. Import your `cinemai` GitHub repo
4. Click **Deploy** — done! ✅

**Your live URL:** `cinemai.vercel.app` (or similar — totally free, HTTPS included)

---

## 📁 File Structure

```
cinemai/
├── index.html          # Main app
├── css/
│   └── style.css       # All styles
├── js/
│   ├── config.js       # ← PUT YOUR API KEYS HERE
│   ├── api.js          # TMDB + Claude API calls
│   └── app.js          # App logic
└── README.md
```

---

## ✨ Features

- 🎬 Real movie posters & data from TMDB
- ▶️ Free streaming via VidSrc embed player
- 🤖 AI movie recommendations powered by Claude
- 🔍 Search any movie or TV show
- 🎭 Filter by genre (Action, Drama, Sci-Fi, Horror...)
- 📱 Fully responsive (works on mobile)
- ⭐ Trending & Top Rated sections
- 🎥 Similar movies suggestions in modal

---

## ⚠️ Legal Note

VidSrc aggregates publicly available streams. This app is for **personal/educational use only**.
For commercial use, license content through official providers.
Movie data provided by [TMDB](https://www.themoviedb.org/).

---

## 🆓 Cost Breakdown

| Service | Cost |
|---------|------|
| TMDB API | FREE (non-commercial) |
| VidSrc embed | FREE |
| Anthropic AI | FREE $5 credit (then ~$0.003/req) |
| GitHub | FREE |
| Vercel hosting | FREE |
| **Total to get started** | **$0** |
