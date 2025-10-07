// Generate a valid JWT token for testing
const jwt = require('jsonwebtoken');

const userId = process.argv[2] || 'b1e29fa7-1ea1-4ef2-9d62-70e8f09167f4';
const email = process.argv[3] || 'testuser1@example.com';

// This is a simplified approach - create a session object
const payload = {
  aud: 'authenticated',
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
  iat: Math.floor(Date.now() / 1000),
  iss: 'https://vtqejqhmatpyrcshfnfm.supabase.co/auth/v1',
  sub: userId,
  email: email,
  phone: '',
  app_metadata: {
    provider: 'email',
    providers: ['email']
  },
  user_metadata: {},
  role: 'authenticated',
  aal: 'aal1',
  amr: [{method: 'otp', timestamp: Math.floor(Date.now() / 1000)}],
  session_id: require('crypto').randomUUID()
};

const secret = 'your-jwt-secret'; // This won't work without the actual secret

console.log(JSON.stringify({
  userId,
  email,
  payload
}, null, 2));
