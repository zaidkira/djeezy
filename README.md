Split files:

- `djezzy-website-replica.html` — main HTML (now references `styles.css` and `script.js`)
- `styles.css` — extracted stylesheet
- `script.js` — extracted JavaScript (update `GOOGLE_SCRIPT_URL` inside this file)

How to view locally:

1. Open `djezzy-website-replica.html` in your browser directly (double-click), or serve the folder with a simple local server.

PowerShell quick server (if you have Python installed):

```powershell
cd C:\Users\zaid\Desktop\chatbot
python -m http.server 8000; # then open http://localhost:8000/djezzy-website-replica.html
```

Notes:
- Update `GOOGLE_SCRIPT_URL` in `script.js` with your Google Apps Script Web App URL if you want form submissions to go to Google Sheets.
- The script uses `localStorage` for consent state; clear site storage to reset the cookie banner during testing.

---

**Troubleshooting: CORS and webhook errors for the chat widget**

If you see errors like:

- "No 'Access-Control-Allow-Origin' header is present on the requested resource"
- "Response to preflight request doesn't pass access control check"
- POST to your webhook returning 500 (Internal Server Error)

This means two things happened:

- The browser blocked the cross-origin request because the webhook server did not allow your page origin (CORS).
- The webhook server may also be failing (500) when it receives the request — this is a separate server-side issue.

Quick checks

- Open DevTools → Console/Network and look at the failing request. If you see an OPTIONS preflight failing (no CORS headers), the browser will not send the real POST.
- Use curl (or Postman) to send the same payload to the webhook — this bypasses browser CORS and shows the real server response. Example (PowerShell / cmd):

```powershell
curl -X POST "https://zaidkira.app.n8n.cloud/webhook/5424fadd-2d53-48da-9d58-efa2c910e2b1/chat" -H "Content-Type: application/json" -d '{"action":"sendMessage","sessionId":"test","chatInput":"hello"}' -i
```

If curl returns 500, inspect the webhook / server logs or n8n execution logs to find the server-side error.

How to fix CORS (recommended)

1. Enable CORS on the webhook server so it responds to preflight OPTIONS with the appropriate headers and allows your page origin. At minimum the server should send:

```
Access-Control-Allow-Origin: http://127.0.0.1:5500  # or * for testing
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

2. Ensure the server returns 200 for OPTIONS requests (no body required).

Example Express middleware to add to a Node webhook server:

```js
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*'); // restrict when moving to production
	res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	if (req.method === 'OPTIONS') return res.sendStatus(200);
	next();
});
```

If you don't control the webhook (third-party like n8n cloud)

- Check the provider docs/settings to enable CORS on that webhook endpoint.
- If impossible, run a small local proxy/relay on the same origin as your page that forwards requests to the webhook. The browser will talk to your proxy (same-origin), and the proxy forwards to the external webhook (server-side, no CORS issue).

Local proxy (Node + Express) — useful for local testing

1. Create `proxy.js` in this folder with the contents below.

```js
// proxy.js - simple relay for local testing
const express = require('express');
const fetch = require('node-fetch'); // node-fetch v2 for CommonJS
const app = express();
app.use(express.json());

// Allow requests from your dev server (adjust origin in production)
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	if (req.method === 'OPTIONS') return res.sendStatus(200);
	next();
});

app.post('/proxy/chat', async (req, res) => {
	try {
		const resp = await fetch('https://zaidkira.app.n8n.cloud/webhook/5424fadd-2d53-48da-9d58-efa2c910e2b1/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(req.body)
		});
		const text = await resp.text();
		res.status(resp.status).send(text);
	} catch (err) {
		console.error('Proxy error:', err);
		res.status(500).send('Proxy error');
	}
});

app.listen(3000, () => console.log('Proxy running on http://localhost:3000'));
```

2. Install and run the proxy (PowerShell):

```powershell
cd C:\Users\zaid\Desktop\chatbot
npm init -y
npm install express node-fetch@2
node proxy.js
```

3. Update the chat widget `CHAT_WEBHOOK_URL` in `script.js` to point to the proxy when testing locally:

```js
const CHAT_WEBHOOK_URL = 'http://localhost:3000/proxy/chat';
```

Notes about `no-cors` fallback

- Your frontend currently retries with `mode: 'no-cors'` if the normal fetch fails. `no-cors` may allow the browser to send the request, but the response is opaque — you cannot read response JSON or status. This is only a last-resort testing fallback and not a real fix.

Recommended next steps

- If you control the webhook: add correct CORS headers and fix the server-side 500 error (check logs). Once CORS is correct the widget can perform the POST and read the JSON response.
- If you don't control the webhook: run the local proxy above, point `script.js` to it for local testing, and inspect proxy logs to see the server response.

If you'd like, I can:

- Add `proxy.js` to this workspace and update `script.js` to use `http://localhost:3000/proxy/chat` for local testing.
- Or, if you can share the n8n workflow error logs (or allow me to run curl tests), I can help locate why the webhook returns 500.

Tell me which of the two actions you prefer and I'll implement it.

---

**Deploy to Render**

This project can be deployed to Render in two ways:

### Option 1: Static Site (HTML, CSS, JS only) — Recommended for quick deployment

This is the simplest. You upload just the website files (no backend needed).

**Step 1: Prepare files**

Upload these files to a Git repo (GitHub, GitLab, or Gitea):

```
djezzy-website-replica.html
styles.css
script.js
```

Optionally create a `.gitignore` file:

```
node_modules/
.env
proxy.js
README.md
```

**Step 2: Create a Render Static Site**

1. Go to https://render.com and sign up / log in.
2. Click **New +** → **Static Site**.
3. Connect your Git repo (GitHub/GitLab).
4. Select the branch (e.g., main).
5. Set **Build Command**: leave empty (no build needed).
6. Set **Publish Directory**: `.` (root folder, since your HTML is in the root).
7. Click **Create Static Site**.
8. Render will deploy your site and give you a URL like `https://your-site.onrender.com`.

**Step 3: Test and fix CORS**

Once deployed, the chat widget will still encounter CORS issues because your webhook server doesn't allow requests from `https://your-site.onrender.com`. You have two choices:

- **A) Update webhook CORS headers** to allow your Render domain:
  ```
  Access-Control-Allow-Origin: https://your-site.onrender.com
  ```
- **B) Deploy a proxy** (see Option 2 below) to relay chat requests server-side and avoid CORS.

### Option 2: Deploy with Node Proxy (for CORS workaround)

If you want to bypass CORS issues, deploy both the static site AND a small Node proxy on Render.

**Step 1: Create a Git repo with both site and proxy**

Create this folder structure:

```
/
├── public/
│   ├── djezzy-website-replica.html
│   ├── styles.css
│   └── script.js
├── proxy.js
├── package.json
└── .gitignore
```

**Step 2: Create `package.json`**

```json
{
  "name": "djezzy-chatbot",
  "version": "1.0.0",
  "description": "Djezzy website with chat widget and proxy",
  "main": "proxy.js",
  "scripts": {
    "start": "node proxy.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "node-fetch": "^2.7.0"
  }
}
```

**Step 3: Create `proxy.js`**

```js
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Enable CORS for your Render domain + localhost (for testing)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // or restrict to your domain
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Serve static site files from public/
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint for chat widget
app.post('/api/chat', async (req, res) => {
  try {
    const resp = await fetch('https://zaidkira.app.n8n.cloud/webhook/5424fadd-2d53-48da-9d58-efa2c910e2b1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const text = await resp.text();
    res.status(resp.status).type('application/json').send(text);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error' });
  }
});

// Fallback to index (serve HTML for single-page routing if needed)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'djezzy-website-replica.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

**Step 4: Update `script.js` to use the proxy**

In `script.js`, change the chat webhook URL:

```js
const CHAT_WEBHOOK_URL = '/api/chat'; // same-origin, no CORS needed
```

**Step 5: Deploy to Render**

1. Push the folder to Git.
2. Go to https://render.com → **New +** → **Web Service**.
3. Connect your Git repo.
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Set **Environment**: Node
7. Click **Create Web Service**.
8. Render will build and deploy. Your site will be at `https://your-service.onrender.com`.

**Step 6: Test**

- Open your Render URL.
- Try the chat widget — it will now send requests to `/api/chat` (your own server), which relays them to the n8n webhook server-side. No CORS errors from the browser.

Choosing between Option 1 and Option 2

- **Option 1 (Static)**: Simpler, faster to deploy, lower cost (free tier often available). Use if you can fix CORS on the webhook server or live with the CORS error.
- **Option 2 (Node Proxy)**: Solves CORS completely, but requires a running Node server (slightly higher cost on Render free tier or paid tiers). Recommended if you want a fully working chat widget without touching the webhook server.

For now, I recommend **Option 1** — deploy the static site first, then decide if you need the proxy later.
