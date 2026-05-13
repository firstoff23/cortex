const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const keyMatch = env.match(/VITE_OPENROUTER_KEY=(.*)/);
const key = keyMatch ? keyMatch[1].trim().replace(/['"]/g, '') : '';

const handler = require('./api/chat.js').default;
const req = {
  method: 'POST',
  headers: {
    'x-openrouter-cache': 'true',
    'x-openrouter-cache-ttl': '600'
  },
  body: {
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    messages: [{ role: 'user', content: 'hello test' }],
    plugins: [{ id: 'response-healing' }],
    response_format: { type: 'json_object' },
    max_tokens: 1500
  }
};
const res = {
  setHeader: () => {},
  status: (code) => {
    console.log('STATUS:', code);
    return {
      json: (data) => console.log('JSON:', JSON.stringify(data, null, 2)),
      end: () => console.log('END')
    };
  }
};

process.env.OPENROUTER_KEY = key;
handler(req, res).catch(console.error);
