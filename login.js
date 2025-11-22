// login.js (module)
// Replace with your Google OAuth client ID
const GOOGLE_CLIENT_ID = '763660019548-6q46a2r1h23rt373f67rtatju36g5aue.apps.googleusercontent.com';

// Helper to decode JWT credential from Google (returns payload object)
function decodeJwt (jwt) {
  const parts = jwt.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(payload)));
  } catch(e) {
    console.error('Failed to decode JWT', e);
    return null;
  }
}

// DOM
const gSignInDiv = document.getElementById('gSignIn');
const signinUsername = document.getElementById('signinUsername');
const signinPassword = document.getElementById('signinPassword');
const signinBtn = document.getElementById('signinBtn');
const signinMsg = document.getElementById('signinMsg');

const signupUsername = document.getElementById('signupUsername');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const signupBtn = document.getElementById('signupBtn');
const signupMsg = document.getElementById('signupMsg');

// --- Google Identity setup ---
function setupGoogleButton() {
  if (!window.google || !google.accounts || !google.accounts.id) {
    console.warn('GSI not loaded yet');
    return;
  }
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
    auto_select: false,
    cancel_on_tap_outside: true
  });
  // Render the standard Google button
  google.accounts.id.renderButton(gSignInDiv, {
    theme: 'outline',
    size: 'large',
    width: '100%'
  });
  // Optional: one-tap prompt (commented out, enable if you want)
  // google.accounts.id.prompt();
}

function handleGoogleCredential(response) {
  if (!response || !response.credential) {
    console.error('No credential from Google', response);
    return;
  }
  const payload = decodeJwt(response.credential);
  if (!payload) {
    alert('Google sign-in failed to decode profile.');
    return;
  }
  // profile fields: payload.name, payload.email, payload.picture, sub (id)
  const profile = {
    source: 'google',
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    picture: payload.picture
  };
  // Save session and redirect
  localStorage.setItem('sessionUser', JSON.stringify(profile));
  window.location.href = 'home.html';
}

// Wait for GSI script and initialize button
window.addEventListener('load', () => {
  const trySetup = () => {
    if (window.google && google.accounts && google.accounts.id) {
      setupGoogleButton();
    } else {
      // try again shortly (script loads async)
      setTimeout(trySetup, 200);
    }
  };
  trySetup();
});

// --- Local sign-up / sign-in (simple, localStorage) ---
function loadUsers() {
  try { return JSON.parse(localStorage.getItem('users') || '[]'); }
  catch { return []; }
}
function saveUsers(users) { localStorage.setItem('users', JSON.stringify(users)); }

signupBtn.onclick = () => {
  const u = signupUsername.value.trim();
  const e = signupEmail.value.trim();
  const p = signupPassword.value;
  signupMsg.textContent = '';
  if (!u || !e || !p) { signupMsg.textContent = 'Fill all fields'; return; }
  if (p.length < 4) { signupMsg.textContent = 'Password too short'; return; }
  const users = loadUsers();
  if (users.find(x => x.username === u || x.email === e)) { signupMsg.textContent = 'User already exists'; return; }
  users.push({ username: u, email: e, password: p, name: u, picture: '' });
  saveUsers(users);
  signupMsg.textContent = 'Account created — you can sign in now';
  signupUsername.value = ''; signupEmail.value=''; signupPassword.value='';
};

signinBtn.onclick = () => {
  const u = signinUsername.value.trim();
  const p = signinPassword.value;
  signinMsg.textContent = '';
  if (!u || !p) { signinMsg.textContent = 'Enter username/email and password'; return; }
  const users = loadUsers();
  const user = users.find(x => (x.username === u || x.email === u) && x.password === p);
  if (!user) { signinMsg.textContent = 'Invalid credentials'; return; }
  // Create session object similar to Google profile
  const profile = { source: 'local', id: 'local:' + user.username, name: user.name || user.username, email: user.email, picture: user.picture || '' };
  localStorage.setItem('sessionUser', JSON.stringify(profile));
  // redirect to home
  window.location.href = 'home.html';
};

// Optional: show demo credentials in console (for testing)
console.log('Demo local user: username "demo", password "demo" — create via Sign Up.');
