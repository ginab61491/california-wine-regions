// account.js — My Account page logic

document.addEventListener('DOMContentLoaded', () => {
  const TOPIC_NAMES = {
    grapes: 'Grape Varieties', regions: 'Wine Regions', tasting: 'Tasting Technique',
    pairing: 'Food Pairing', winemaking: 'Winemaking', history: 'Wine History',
    buying: 'Buying & Value', cellar: 'Cellaring & Aging', exam: 'Exam Prep'
  };
  const LEVEL_NAMES = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced / Studying' };

  function refreshAccount() {
    const user = JSON.parse(localStorage.getItem('sommplicity_user') || 'null');
    const sub = JSON.parse(localStorage.getItem('sommplicity_daily_sub') || 'null');

    const notSignedIn = document.getElementById('account-not-signed-in');
    const signedIn = document.getElementById('account-signed-in');

    if (user) {
      notSignedIn.style.display = 'none';
      signedIn.style.display = 'block';
      document.getElementById('account-avatar').src = user.picture || '';
      document.getElementById('account-name').textContent = user.name || '—';
      document.getElementById('account-email').textContent = user.email || '—';
    } else {
      notSignedIn.style.display = 'block';
      signedIn.style.display = 'none';
    }

    // Email subscription status
    const notSubbed = document.getElementById('account-email-not-subscribed');
    const subbed = document.getElementById('account-email-subscribed');

    if (sub && sub.email) {
      notSubbed.style.display = 'none';
      subbed.style.display = 'block';
      document.getElementById('account-sub-level').textContent = LEVEL_NAMES[sub.level] || sub.level || '—';
      const topicLabels = (sub.topics || []).map(t => TOPIC_NAMES[t] || t).join(', ');
      document.getElementById('account-sub-topics').textContent = topicLabels || 'All topics';
    } else {
      notSubbed.style.display = 'block';
      subbed.style.display = 'none';
    }
  }

  // Make refreshAccount available globally
  window.refreshAccount = refreshAccount;

  // Listen for auth changes
  window.addEventListener('sommplicity-auth-change', refreshAccount);

  // Sign out from account page
  const signOutBtn = document.getElementById('account-signout-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
      if (window.sommplicitySignOut) window.sommplicitySignOut();
    });
  }

  // "Set up daily emails" navigates to the daily wine tab
  const goToEmails = document.getElementById('account-go-to-emails');
  if (goToEmails) {
    goToEmails.addEventListener('click', () => {
      const navItem = document.querySelector('[data-section="dailywine"]');
      if (navItem) navItem.click();
    });
  }

  // "Edit preferences" navigates to daily wine tab
  const editEmails = document.getElementById('account-edit-emails');
  if (editEmails) {
    editEmails.addEventListener('click', () => {
      const navItem = document.querySelector('[data-section="dailywine"]');
      if (navItem) navItem.click();
    });
  }

  // Unsubscribe
  const unsubBtn = document.getElementById('account-unsub-btn');
  if (unsubBtn) {
    unsubBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to unsubscribe from daily wine emails?')) {
        localStorage.removeItem('sommplicity_daily_sub');
        refreshAccount();
      }
    });
  }

  // Refresh when switching to the account tab
  const observer = new MutationObserver(() => {
    const section = document.getElementById('preferences-section');
    if (section && section.classList.contains('active')) refreshAccount();
  });
  const section = document.getElementById('preferences-section');
  if (section) observer.observe(section, { attributes: true, attributeFilter: ['class'] });

  refreshAccount();
});
