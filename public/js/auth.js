(function() {
  const ADMIN_EMAIL = 'admin@citycare.com';
  const ADMIN_PASSWORD = 'admin123';

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem('citycare_users') || '[]');
    } catch(e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem('citycare_users', JSON.stringify(users));
  }

  function setCurrentUser(user) {
    localStorage.setItem('citycare_current_user', JSON.stringify(user));
  }

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('citycare_current_user') || 'null');
    } catch(e) {
      return null;
    }
  }

  // Register
  const regForm = document.getElementById('registerForm');
  if (regForm) {
    regForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim().toLowerCase();
      const pass = document.getElementById('regPassword').value.trim();

      if (!name || !email || !pass) return;

      const users = getUsers();
      if (users.find(u => u.email === email)) {
        showToast('User already exists');
        return;
      }

      const user = { id: Date.now(), name, email, password: pass, role: 'user' };
      users.push(user);
      saveUsers(users);
      setCurrentUser({ id: user.id, name: user.name, email: user.email, role: 'user' });

      showToast('Account created');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    });
  }

  // Login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim().toLowerCase();
      const pass = document.getElementById('loginPassword').value.trim();
      const asAdmin = document.getElementById('loginAsAdmin').checked;

      if (asAdmin) {
        if (email === ADMIN_EMAIL && pass === ADMIN_PASSWORD) {
          setCurrentUser({ id: 0, name: 'City Admin', email: ADMIN_EMAIL, role: 'admin' });
          showToast('Logged in as admin');
          setTimeout(() => { window.location.href = 'admin-dashboard.html'; }, 800);
        } else {
          showToast('Invalid admin credentials');
        }
        return;
      }

      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === pass);
      if (!user) {
        showToast('Invalid user credentials');
        return;
      }

      setCurrentUser({ id: user.id, name: user.name, email: user.email, role: 'user' });
      showToast('Login successful');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    });
  }

  // Logout buttons
  const logout = () => {
    localStorage.removeItem('citycare_current_user');
    showToast('Logged out');
    setTimeout(() => { window.location.href = 'index.html'; }, 700);
  };

  const logoutBtn = document.getElementById('logoutBtn');
  const logoutBtnAdmin = document.getElementById('logoutBtnAdmin');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
  if (logoutBtnAdmin) logoutBtnAdmin.addEventListener('click', logout);

  // Protect pages (basic)
  const protectedUserPages = ['dashboard.html', 'complaint_form.html', 'recent.html', 'profile.html'];
  const adminPages = ['admin-dashboard.html'];
  const path = window.location.pathname;
  const currentPage = path.substring(path.lastIndexOf('/') + 1);

  if (currentPage && currentPage !== 'login.html' && currentPage !== 'register.html' && currentPage !== 'index.html' && currentPage !== 'services.html') {
    const user = getCurrentUser();
    if (!user) {
      // redirect to login
      if (currentPage !== 'recent.html') {
        // allow public recent via index
        window.location.href = 'login.html';
      }
    } else {
      if (protectedUserPages.includes(currentPage) && user.role !== 'user') {
        window.location.href = 'admin-dashboard.html';
      }
      if (adminPages.includes(currentPage) && user.role !== 'admin') {
        window.location.href = 'dashboard.html';
      }
    }
  }

  // Expose for other scripts
  window.CityAuth = {
    getCurrentUser
  };
})();