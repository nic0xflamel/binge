const url = 'https://vtqejqhmatpyrcshfnfm.supabase.co/auth/v1/token?grant_type=password';
const headers = {
  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cWVqcWhtYXRweXJjc2hmbmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzQxMDksImV4cCI6MjA3NTI1MDEwOX0.GImprSyOhcBItiSns6jtETMD9Ixy6GxzAsfhG2wzIDs',
  'Content-Type': 'application/json'
};
const body = JSON.stringify({
  email: 'testuser1@example.com',
  password: 'TestPassword123!'
});

fetch(url, { method: 'POST', headers, body })
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err));
