// auth.js — Google Sign-In with Identity Services

(function () {
  const CLIENT_ID = '277344040824-l3gotpgsm72mfnlqa3eip4l6pmfd6b57.apps.googleusercontent.com';

  function onSignIn(response) {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));

    localStorage.setItem('sommplicity_user', JSON.stringify({
      name: payload.name,
      givenName: payload.given_name,
      email: payload.email,
      picture: payload.picture,
      credential: response.credential
    }));

    // Refresh account page if visible
    if (typeof refreshAccount === 'function') refreshAccount();
    // Trigger a custom event so account.js can pick it up
    window.dispatchEvent(new Event('sommplicity-auth-change'));
  }

  function initGoogleAuth() {
    if (typeof google === 'undefined' || !google.accounts) {
      setTimeout(initGoogleAuth, 300);
      return;
    }

    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: onSignIn,
      auto_select: true
    });

    // Wire account page sign-in button
    const accountBtn = document.getElementById('account-google-signin-btn');
    if (accountBtn) {
      accountBtn.addEventListener('click', () => {
        google.accounts.id.prompt();
      });
    }

    // Wire modal sign-in button (if modal still exists)
    const modalBtn = document.getElementById('google-signin-btn');
    if (modalBtn) {
      modalBtn.addEventListener('click', () => {
        google.accounts.id.prompt();
      });
    }
  }

  // Expose signOut globally for account.js
  window.sommplicitySignOut = function () {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.disableAutoSelect();
    }
    localStorage.removeItem('sommplicity_user');
    window.dispatchEvent(new Event('sommplicity-auth-change'));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGoogleAuth);
  } else {
    initGoogleAuth();
  }
})();
