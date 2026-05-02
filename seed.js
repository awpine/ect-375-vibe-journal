const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
let url = '';
let key = '';
for (const line of env.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

const supabase = createClient(url, key);

async function seed() {
  console.log('Seeding departments...');
  const { error: deptError } = await supabase.from('departments').upsert([
    { name: 'Telemetry' },
    { name: 'ER' },
    { name: 'Nutrition' },
    { name: 'Maintenance' }
  ], { onConflict: 'name' });
  
  if (deptError) {
    console.error('Department Seeding Error:', deptError.message);
  } else {
    console.log('Departments seeded successfully!');
  }

  console.log('Seeding badges...');
  const badges = [];
  for (let i = 1; i <= 10; i++) {
    const num = i.toString().padStart(2, '0');
    badges.push({ identifier: `VOC-${num}`, status: 'available' });
  }
  
  const { error: badgeError } = await supabase.from('badges').upsert(badges, { onConflict: 'identifier' });
  
  if (badgeError) {
    console.error('Badge Seeding Error:', badgeError.message);
  } else {
    console.log('Badges seeded successfully!');
  }
}

seed();
