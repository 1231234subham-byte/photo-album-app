// login.js
// Replace with your Google OAuth client ID
const GOOGLE_CLIENT_ID = '763660019548-6q46a2r1h23rt373f67rtatju36g5aue.apps.googleusercontent.com';

// Decode JWT from Google
function decodeJwt(jwt) {
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

// Load / save local users
function loadUsers() { return JSON.parse(localStorage.getItem('users') || '[]'); }
function saveUsers(users) { localStorage.setItem('users', JSON.stringify(users)); }

// DOM elements
let signinUsername, signinPassword, signinBtn, signinMsg;
let signupUsername, signupEmail, signupPassword, signupBtn, signupMsg;
let gSignInDiv;

window.addEventListener('DOMContentLoaded', () => {
  // DOM references
  signinUsername = document.getElementById('signinUsername');
  signinPassword = document.getElementById('signinPassword');
  signinBtn = document.getElementById('signinBtn');
  signinMsg = document.getElementById('signinMsg');

  signupUsername = document.getElementById('signupUsername');
  signupEmail = document.getElementById('signupEmail');
  signupPassword = document.getElementById('signupPassword');
  signupBtn = document.getElementById('signupBtn');
  signupMsg = document.getElementById('signupMsg');

  gSignInDiv = document.getElementById('gSignIn');

  // Setup Google button
  setupGoogleButton();

  // Local sign-in
  signinBtn?.addEventListener('click', () => {
    const u = signinUsername.value.trim();
    const p = signinPassword.value;
    signinMsg.textContent = '';
    if (!u || !p) { signinMsg.textContent = 'Enter username/email and password'; return; }
    const users = loadUsers();
    const user = users.find(x => (x.username === u || x.email === u) && x.password === p);
    if (!user) { signinMsg.textContent = 'Invalid credentials'; return; }
    const profile = { source: 'local', id: 'local:' + user.username, name: user.name || user.username, email: user.email, picture: user.picture || '' };
    localStorage.setItem('sessionUser', JSON.stringify(profile));
    window.location.href = 'home.html';
  });

  // Local sign-up
  signupBtn?.addEventListener('click', () => {
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
  });
});

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

  // Custom Google button
  const btn = document.createElement('button');
  btn.className = 'btn google-btn';
  btn.innerHTML = `<img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google Logo" /> Sign in with Google`;
  btn.addEventListener('click', () => google.accounts.id.prompt());

  gSignInDiv.appendChild(btn);
}

function handleGoogleCredential(response) {
  if (!response?.credential) { console.error('No credential from Google', response); return; }
  const payload = decodeJwt(response.credential);
  if (!payload) { alert('Google sign-in failed to decode profile.'); return; }
  const profile = {
    source: 'google',
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    picture: payload.picture
  };
  localStorage.setItem('sessionUser', JSON.stringify(profile));
  window.location.href = 'home.html';
}
