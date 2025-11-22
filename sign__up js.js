// --- Local sign-up (save to localStorage) --- //

function loadUsers() {
  try { return JSON.parse(localStorage.getItem('users') || '[]'); }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

const signupUsername = document.getElementById('signupUsername');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const signupBtn = document.getElementById('signupBtn');
const signupMsg = document.getElementById('signupMsg');

signupBtn.onclick = () => {
  const u = signupUsername.value.trim();
  const e = signupEmail.value.trim();
  const p = signupPassword.value;

  signupMsg.textContent = '';

  if (!u || !e || !p) {
    signupMsg.textContent = 'Fill all fields';
    return;
  }

  if (p.length < 4) {
    signupMsg.textContent = 'Password too short';
    return;
  }

  const users = loadUsers();

  if (users.find(x => x.username === u || x.email === e)) {
    signupMsg.textContent = 'User already exists';
    return;
  }

  users.push({
    username: u,
    email: e,
    password: p,
    name: u,
    picture: ''
  });

  saveUsers(users);

  signupMsg.textContent = 'Account created! Redirecting...';

  // redirect to login page
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1200);
};
