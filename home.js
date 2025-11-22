// home.js
const logoutBtn=document.getElementById('logoutBtn');
const profileName=document.getElementById('profileName');
const profileEmail=document.getElementById('profileEmail');
const profilePic=document.getElementById('profilePic');

const sessionUser=JSON.parse(localStorage.getItem('sessionUser')||'null');
if(!sessionUser){ window.location.href='index.html'; }
else{
  profileName.textContent=sessionUser.name||'User';
  profileEmail.textContent=sessionUser.email||'';
  profilePic.src=sessionUser.picture||'https://via.placeholder.com/64';
}

logoutBtn.onclick=()=>{
  localStorage.removeItem('sessionUser');
  window.location.href='index.html';
};
