// Replace with your Google OAuth client ID
const GOOGLE_CLIENT_ID = '763660019548-6q46a2r1h23rt373f67rtatju36g5aue.apps.googleusercontent.com';

// Helper to decode JWT credential from Google
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

// DOM elements
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

  // Render Google button
  google.accounts.id.renderButton(
    gSignInDiv,
    {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: '100%',
      text: 'signin_with',
      shape: 'rectangular'
    }
  );
}

function handleGoogleCredential(response) {
  if (!response || !response.credential) return;
  const payload = decodeJwt(response.credential);
  if (!payload) {
    alert('Google sign-in failed.');
    return;
  }

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

// Wait for GSI script
window.addEventListener('load', () => {
  const trySetup = () => {
    if (window.google && google.accounts && google.accounts.id) {
      setupGoogleButton();
    } else {
      setTimeout(trySetup, 200);
    }
  };
  trySetup();
});

// --- Local sign-up / sign-in ---
function loadUsers() {
  try { return JSON.parse(localStorage.getItem('users') || '[]'); } 
  catch { return []; }
}
function saveUsers(users) { localStorage.setItem('users', JSON.stringify(users)); }

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

console.log('Demo local user: username "demo", password "demo".');
