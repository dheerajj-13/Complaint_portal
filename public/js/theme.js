(function() {
  const body = document.body;
  const toast = document.getElementById('toast');

  function applyTheme(theme) {
    if (theme === 'dark') {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
    localStorage.setItem('citycare_theme', theme);
  }

  function toggleTheme() {
    const current = body.classList.contains('dark') ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
    showToast('Theme switched to ' + (body.classList.contains('dark') ? 'dark' : 'light') + ' mode');
  }

  const saved = localStorage.getItem('citycare_theme') || 'light';
  applyTheme(saved);

  const themeButtons = [
    document.getElementById('themeToggle'),
    document.getElementById('sidebarThemeToggle'),
    document.getElementById('sidebarThemeToggleAdmin')
  ].filter(Boolean);

  themeButtons.forEach(btn => btn.addEventListener('click', toggleTheme));

  window.showToast = function(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  };
})();