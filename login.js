const GOOGLE_CLIENT_ID = '763660019548-6q46a2r1h23rt373f67rtatju36g5aue.apps.googleusercontent.com'; // Replace with your actual Google Client ID

const signinUsername = document.getElementById('signinUsername');
const signinPassword = document.getElementById('signinPassword');
const signinBtn = document.getElementById('signinBtn');
const signinMsg = document.getElementById('signinMsg');

// --- Local login ---
function loadUsers(){ return JSON.parse(localStorage.getItem('users')||'[]'); }

signinBtn.addEventListener('click', ()=>{
  const u = signinUsername.value.trim(), p = signinPassword.value;
  signinMsg.textContent = '';
  if(!u||!p){ signinMsg.textContent='Enter username/email and password'; return; }
  const users = loadUsers();
  const user = users.find(x => (x.username===u || x.email===u) && x.password===p);
  if(!user){ signinMsg.textContent='Invalid credentials'; return; }
  const profile = { source:'local', id:'local:' + user.username, name:user.name||user.username, email:user.email, picture:user.picture||'' };
  localStorage.setItem('sessionUser', JSON.stringify(profile));
  window.location.href='home.html';
});

// --- Google Sign-In setup ---
function decodeJwt(jwt) {
  const parts = jwt.split('.');
  if(parts.length !== 3) return null;
  try {
    const payload = atob(parts[1].replace(/-/g,'+').replace(/_/g,'/'));
    return JSON.parse(decodeURIComponent(escape(payload)));
  } catch(e){ console.error(e); return null; }
}

// Render Google button properly
window.onload = function() {
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse
  });

  google.accounts.id.renderButton(
    document.getElementById("gSignInContainer"),
    { theme: "outline", size: "large", text: "continue_with", width: '100%' } // uses Google API button
  );
  google.accounts.id.prompt(); // optional auto prompt
};

function handleCredentialResponse(response) {
  if(!response?.credential) { alert('Google sign-in failed'); return; }
  const payload = decodeJwt(response.credential);
  if(!payload) { alert('Failed to decode Google profile'); return; }
  const profile = {
    source:'google',
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    picture: payload.picture
  };
  localStorage.setItem('sessionUser', JSON.stringify(profile));
  window.location.href='home.html';
}
