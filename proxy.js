// proxy.js
// Simple Node.js + Express proxy for forwarding chat widget requests to an n8n webhook.
// Replace N8N_WEBHOOK_URL with your actual webhook URL or set the env var N8N_WEBHOOK_URL.

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Replace this with your actual n8n webhook URL or set process.env.N8N_WEBHOOK_URL
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://zaidkira.app.n8n.cloud/webhook/5424fadd-2d53-48da-9d58-efa2c910e2b1/chat';

// Allowed origin for CORS. For testing you can use '*', for production set a specific origin.
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || ALLOWED_ORIGIN === '*' || origin === ALLOWED_ORIGIN) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: This origin is not allowed'));
    }
  },
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from project root so the server can serve the frontend
// (index.html, styles.css, script.js) as well as handle the proxy endpoint.
app.use(express.static(path.join(__dirname)));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Proxy endpoint: forward POST body to n8n webhook and return response
app.post('/api/chat', async (req, res) => {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const contentType = response.headers.get('content-type') || 'text/plain';
    res.status(response.status);
    res.set('Content-Type', contentType);

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.send(data);
    } else {
      const text = await response.text();
      return res.send(text);
    }
  } catch (err) {
    console.error('Error forwarding to n8n webhook:', err);
    return res.status(500).json({ error: 'Failed to forward request to webhook' });
  }
});

// Fallback to index.html for SPA routing or direct access
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.message ? err.message : err);
  if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  else next(err);
});

app.listen(PORT, () => {
  console.log(`Proxy listening on port ${PORT}`);
  console.log(`Forwarding POST /api/chat -> ${N8N_WEBHOOK_URL}`);
  console.log(`CORS allowed origin: ${ALLOWED_ORIGIN}`);
});
