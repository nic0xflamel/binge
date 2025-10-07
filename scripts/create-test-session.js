// Script to create test session tokens using Supabase service role key
const SUPABASE_URL = 'https://vtqejqhmatpyrcshfnfm.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cWVqcWhtYXRweXJjc2hmbmZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY3NDEwOSwiZXhwIjoyMDc1MjUwMTA5fQ.--_DSPanlYIuR817ur1KiJ46vIzbAuPxkYtWjqKmfwE';

const userId = process.argv[2];
const email = process.argv[3];

if (!userId || !email) {
  console.error('Usage: node create-test-session.js <userId> <email>');
  process.exit(1);
}

const url = `${SUPABASE_URL}/auth/v1/admin/generate_link`;

fetch(url, {
  method: 'POST',
  headers: {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'magiclink',
    email: email
  })
})
  .then(r => r.json())
  .then(data => {
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(err => console.error(err));
