# SCOREBUG OCR — Free Server Hosting Guide

This guide explains how to host the **SCOREBUG OCR** website completely free with global SSL CDN, high availability, and custom domain support.

---

## 🚀 1. Free Hosting Platforms

### Method 1: GitHub Pages (Recommended — 100% Free Forever)
- **Cost:** Free permanently
- **Bandwidth:** Unlimited global edge delivery
- **Custom Domain:** Supported with automatic free HTTPS

1. Create a public repository on [GitHub](https://github.com) named `scorebug-ocr`.
2. Push or upload the workspace files (`index.html`, `styles.css`, `app.js`, `SCOREBUG_OCR_Setup.exe`) to your repository.
3. Open repository **Settings** → **Pages**.
4. Set **Source** to `Deploy from a branch`, choose `main` branch and `/ (root)` folder.
5. Click **Save**. Within 1–2 minutes, your website will be live at `https://<your-username>.github.io/scorebug-ocr/`.

---

### Method 2: Vercel (1-Click Deployment)
- **Cost:** Free
- **Speed:** Sub-50ms worldwide CDN

1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New Project** and connect your GitHub repository or drag-and-drop the project folder.
3. Click **Deploy**. Your site will immediately be online with a free `*.vercel.app` domain.

---

### Method 3: Netlify Drop (Instant Drag & Drop)
- **Cost:** Free

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop this folder onto the page.
3. Your site is live in ~10 seconds with an instant public HTTPS address.

---

### Method 4: Instant Public Live Link via SSH (Zero Signup)
You can instantly share your website online directly from your computer without creating any accounts:

1. Double-click `share_live_tunnel.bat` or run:
   ```cmd
   python server.py
   ```
2. In a second terminal, run:
   ```cmd
   ssh -p 443 -R0:localhost:8080 a.pinggy.io
   ```
3. A free public HTTPS link (e.g. `https://xxxx.a.pinggy.link`) is generated instantly to test or share with anyone worldwide.

---

## 💻 2. Running Locally

Double click **`start_website.bat`** (or execute `python server.py`) and open **[http://localhost:8080](http://localhost:8080)** in your browser.
