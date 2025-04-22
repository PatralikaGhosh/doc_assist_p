/* ─── 1. Import the modular SDKs straight from Google’s CDN ─── */
import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth,
         onAuthStateChanged,
         signInWithPopup,
         signOut,
         GoogleAuthProvider } from
  "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getAnalytics } from
  "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js"; // optional

/* ─── 2. Paste your Firebase project keys ─── */
const firebaseConfig = {
  apiKey:            "AIzaSyDWcYKlNAIzpnTd_5k39fKWxR3U0QUKSUk",
  authDomain:        "docassist-54094.firebaseapp.com",
  projectId:         "docassist-54094",
  storageBucket:     "docassist-54094.appspot.com",     // typo fixed 👍
  messagingSenderId: "747941990004",
  appId:             "1:747941990004:web:90964ed48feeb99e4d8b21",
  measurementId:     "G-8PK01WBJZT"
};

/* ─── 3. Boot Firebase ─── */
const app       = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);          // delete this line if you don’t need GA
const auth      = getAuth(app);
const provider  = new GoogleAuthProvider();
provider.addScope('profile');
provider.addScope('email');

/* ─── 4. Wire your buttons ─── */
document.getElementById("google-login").addEventListener("click",
  () => signInWithPopup(auth, provider)          // opens Google popup
);

document.getElementById("logout").addEventListener("click",
  () => signOut(auth)
);

/* ─── 5. Show/hide UI based on auth state ─── */
onAuthStateChanged(auth, user => {
  const loginBtn = document.getElementById("google-login");
  const logoutBtn = document.getElementById("logout");

  if (user) {
    console.log("Hello", user.displayName);

    // Hide login button and show logout
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    
    // Create profile image if not already present
    if (!document.getElementById("profile-pic")) {
      const profileImg = document.createElement("img");
      profileImg.src = user.photoURL;
      profileImg.alt = "Profile";
      profileImg.crossOrigin = "anonymous";
      profileImg.id = "profile-pic";
      profileImg.style.width = "40px";
      profileImg.style.height = "40px";
      profileImg.style.borderRadius = "50%";
      profileImg.style.marginLeft = "1rem";
      profileImg.style.cursor = "pointer";
      profileImg.title = user.displayName;
      console.log("User object:", user);
      console.log("Profile image URL:", user.photoURL);
      // Insert the profile image right after the logout button
      logoutBtn.parentNode.insertBefore(profileImg, logoutBtn.nextSibling);
    }
  } else {
    // Show login, hide logout, remove profile picture
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    
    const profilePic = document.getElementById("profile-pic");
    if (profilePic) profilePic.remove();
  }
});
