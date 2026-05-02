const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let url = '';
let key = '';
for (const line of env.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

console.log('Testing URL:', url);
fetch(`${url}/auth/v1/health`, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
}).then(async res => {
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}).catch(console.error);
