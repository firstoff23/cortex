const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const keyMatch = env.match(/VITE_OPENROUTER_KEY=(.*)/);
const key = keyMatch ? keyMatch[1].trim().replace(/['"]/g, '') : '';

const fetch = require('node-fetch');
async function test() {
  const payload = {
    model: 'deepseek/deepseek-r1-distill-llama-70b:free',
    messages: [{ role: 'user', content: 'hello test' }]
  };
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify(payload)
  });
  console.log('STATUS:', res.status);
  console.log(await res.text());
}
test();
