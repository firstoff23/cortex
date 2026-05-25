const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Alexandre/.gemini/antigravity/brain/b9336264-9f5b-4676-b00e-1b12f5ae2844/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');
const inputs = lines.filter(l => l.includes('"type":"USER_INPUT"') && l.includes('patch-master'));
console.log(JSON.parse(inputs[inputs.length-1]).content);
