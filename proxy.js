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
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://zaidkira.app.n8n.cloud/webhook/djeezy-chat';

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

// Proxy endpoint: forward requests to n8n webhook and return response
// Accept all methods (GET/POST/PUT...) so we can detect if the frontend/browser used GET by mistake.
app.all('/api/chat', async (req, res) => {
  try {
    // Log incoming request for debugging
    console.log(`Incoming ${req.method} ${req.originalUrl} - query: ${JSON.stringify(req.query)}`);
    if (Object.keys(req.body || {}).length) console.log('Incoming body:', req.body);

    // Build fetch options using the incoming method. Only include a body for methods that commonly carry one.
    const method = req.method || 'POST';
    const fetchOptions = { method };

    // Forward Content-Type header if present, otherwise default to application/json
    const incomingContentType = req.get('content-type');
    fetchOptions.headers = { 'Content-Type': incomingContentType || 'application/json' };

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
      // If body is already parsed (JSON), re-stringify. If no body, send empty JSON object.
      try {
        fetchOptions.body = JSON.stringify(req.body && Object.keys(req.body).length ? req.body : {});
      } catch (e) {
        fetchOptions.body = '{}';
      }
    }

    // If the webhook URL needs query string forwarding, append original query string
    const url = new URL(N8N_WEBHOOK_URL);
    const originalQs = req.originalUrl.split('?')[1];
    if (originalQs) {
      // append incoming query string to the webhook URL
      url.search = url.search ? `${url.search}&${originalQs}` : `?${originalQs}`;
    }

    console.log(`Forwarding ${method} -> ${url.toString()}`);

    const response = await fetch(url.toString(), fetchOptions);

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

// Fallback to djezzy-website-replica.html for SPA routing or direct access
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'djezzy-website-replica.html'));
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
