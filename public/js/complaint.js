(function() {
  function getComplaints() {
    try {
      return JSON.parse(localStorage.getItem('citycare_complaints') || '[]');
    } catch(e) {
      return [];
    }
  }

  function saveComplaints(list) {
    localStorage.setItem('citycare_complaints', JSON.stringify(list));
  }

  function createSampleDataIfEmpty() {
    const existing = getComplaints();
    if (existing.length > 0) return;
    const sample = [
      { title: 'Pothole near main circle', category: 'Road', status: 'Pending', location: 'Main Circle', priority: 'High' },
      { title: 'Street light not working', category: 'Street Light', status: 'Working', location: 'MG Road', priority: 'Medium' },
      { title: 'Drainage overflow', category: 'Drainage', status: 'Resolved', location: 'Sector 5', priority: 'High' },
      { title: 'Garbage not collected', category: 'Garbage', status: 'Pending', location: 'Lake View', priority: 'Medium' },
      { title: 'Frequent power cuts', category: 'Electricity', status: 'Working', location: 'Old Town', priority: 'High' }
    ];
    const now = new Date();
    const user = CityAuth.getCurrentUser() || { id: 1, name: 'Demo User', email: 'demo@citycare.com' };
    const withMeta = sample.map((c, idx) => ({
      id: idx + 1,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      createdAt: new Date(now.getTime() - (idx * 86400000)).toISOString(),
      image: null,
      description: c.title,
      ...c
    }));
    saveComplaints(withMeta);
  }

  const form = document.getElementById('complaintForm');
  const imageInput = document.getElementById('cImage');
  const captureBtn = document.getElementById('captureImageBtn');
  const cameraContainer = document.getElementById('cameraContainer');
  const cameraStreamEl = document.getElementById('cameraStream');
  const takePhotoBtn = document.getElementById('takePhotoBtn');
  const closeCameraBtn = document.getElementById('closeCameraBtn');
  const capturedPreview = document.getElementById('capturedPreview');
  const profileNameEl = document.getElementById('profileName');
  const profileEmailEl = document.getElementById('profileEmail');
  const profileTotalEl = document.getElementById('profileTotal');
  const profileResolvedEl = document.getElementById('profileResolved');
  const profilePendingEl = document.getElementById('profilePending');
  const profileAvatarEl = document.querySelector('.avatar-circle');
  const profileComplaintsList = document.getElementById('profileComplaintsList');
  const statusCards = document.querySelectorAll('.status-card');
  const statusFilterButtons = document.querySelectorAll('[data-status-filter]');
  let cameraStream = null;
  let capturedImageData = null;
  let profileComplaintsData = [];
  let activeStatusFilter = 'all';

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    cameraContainer?.classList.remove('active');
    if (cameraStreamEl) {
      cameraStreamEl.srcObject = null;
    }
  }

  function resetCapturedPreview() {
    capturedImageData = null;
    if (capturedPreview) {
      capturedPreview.src = '';
      capturedPreview.classList.remove('visible');
    }
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      showToast('Camera not supported on this device');
      return;
    }
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      if (cameraStreamEl) {
        cameraStreamEl.srcObject = cameraStream;
        await cameraStreamEl.play?.();
      }
      cameraContainer?.classList.add('active');
    } catch (err) {
      showToast('Unable to access camera');
      stopCamera();
    }
  }

  function captureFrame() {
    if (!cameraStreamEl || !cameraStream) {
      showToast('Camera is not active');
      return;
    }
    const width = cameraStreamEl.videoWidth || 640;
    const height = cameraStreamEl.videoHeight || 480;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(cameraStreamEl, 0, 0, width, height);
    capturedImageData = canvas.toDataURL('image/jpeg', 0.9);
    if (capturedPreview) {
      capturedPreview.src = capturedImageData;
      capturedPreview.classList.add('visible');
    }
    stopCamera();
  }

  captureBtn?.addEventListener('click', () => {
    startCamera();
  });

  takePhotoBtn?.addEventListener('click', () => {
    captureFrame();
  });

  closeCameraBtn?.addEventListener('click', () => {
    stopCamera();
  });

  imageInput?.addEventListener('change', () => {
    if (imageInput.files?.length) {
      resetCapturedPreview();
    }
  });

  form?.addEventListener('reset', () => {
    resetCapturedPreview();
    stopCamera();
  });

  function renderProfileComplaints(filter = 'all') {
    if (!profileComplaintsList) return;
    activeStatusFilter = filter;
    statusCards.forEach(card => {
      const status = card.dataset.status || 'all';
      card.classList.toggle('active', status === filter);
    });
    statusFilterButtons.forEach(btn => {
      const status = btn.dataset.statusFilter || 'all';
      btn.classList.toggle('active', status === filter);
    });

    const normalizedFilter = filter.toLowerCase();
    const list = profileComplaintsData.filter(c => {
      if (normalizedFilter === 'all') return true;
      return (c.status || '').toLowerCase() === normalizedFilter;
    });

    if (!list.length) {
      profileComplaintsList.classList.add('empty-state');
      profileComplaintsList.innerHTML = 'No complaints found for this status.';
      return;
    }

    profileComplaintsList.classList.remove('empty-state');
    profileComplaintsList.innerHTML = list
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(c => {
        const status = (c.status || '').toLowerCase();
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
        return `
        <div class="profile-complaints-item">
          <div class="profile-complaint-row">
            <h3>${c.title}</h3>
            <span class="status-chip ${status}">${statusLabel}</span>
          </div>
          <p>${c.category} • ${c.location}</p>
          <div class="complaint-meta">
            <span>Submitted: ${new Date(c.createdAt).toLocaleDateString()}</span>
            <span>Priority: ${c.priority}</span>
          </div>
        </div>`;
      })
      .join('');
  }

  statusCards.forEach(card => {
    card.addEventListener('click', () => {
      const status = card.dataset.status || 'all';
      renderProfileComplaints(status);
    });
  });

  statusFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const status = btn.dataset.statusFilter || 'all';
      renderProfileComplaints(status);
    });
  });

  if (profileNameEl || profileEmailEl || profileComplaintsList) {
    const user = CityAuth.getCurrentUser();
    if (user) {
      if (profileNameEl) profileNameEl.textContent = user.name;
      if (profileEmailEl) profileEmailEl.textContent = user.email;
      if (profileAvatarEl && user.name) {
        profileAvatarEl.textContent = user.name.charAt(0).toUpperCase();
      }
      profileComplaintsData = getComplaints().filter(c => c.userId === user.id);
      const resolvedCount = profileComplaintsData.filter(c => (c.status || '').toLowerCase() === 'resolved').length;
      const pendingCount = profileComplaintsData.filter(c => (c.status || '').toLowerCase() === 'pending').length;
      if (profileTotalEl) profileTotalEl.textContent = profileComplaintsData.length;
      if (profileResolvedEl) profileResolvedEl.textContent = resolvedCount;
      if (profilePendingEl) profilePendingEl.textContent = pendingCount;
      if (profileComplaintsList) {
        renderProfileComplaints(activeStatusFilter);
      }
    } else {
      showToast('Please login first');
      setTimeout(() => window.location.href = 'login.html', 800);
    }
  }

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const user = CityAuth.getCurrentUser();
      if (!user) {
        showToast('Please login first');
        return;
      }

      const title = document.getElementById('cTitle').value.trim();
      const category = document.getElementById('cCategory').value;
      const location = document.getElementById('cLocation').value.trim();
      const priority = document.getElementById('cPriority').value;
      const description = document.getElementById('cDescription').value.trim();

      const complaints = getComplaints();
      const id = complaints.length ? Math.max(...complaints.map(c => c.id)) + 1 : 1;

      const baseComplaint = {
        id,
        title,
        category,
        location,
        priority,
        description,
        status: 'Pending',
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        createdAt: new Date().toISOString(),
        image: null
      };

      const saveAndRedirect = (complaint) => {
        complaints.push(complaint);
        saveComplaints(complaints);
        showToast('Complaint submitted');
        form.reset();
        resetCapturedPreview();
        setTimeout(() => window.location.href = 'dashboard.html', 900);
      };

      if (capturedImageData) {
        baseComplaint.image = capturedImageData;
        saveAndRedirect(baseComplaint);
      } else if (imageInput && imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          baseComplaint.image = ev.target.result;
          saveAndRedirect(baseComplaint);
        };
        reader.readAsDataURL(imageInput.files[0]);
      } else {
        saveAndRedirect(baseComplaint);
      }
    });
  }

  // Recent complaints page
  const recentList = document.getElementById('recentList');
  if (recentList) {
    createSampleDataIfEmpty();
    const all = getComplaints().sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    const searchInput = document.getElementById('searchRecent');

    function render(list) {
      recentList.innerHTML = '';
      list.forEach(c => {
        const div = document.createElement('div');
        div.className = 'complaint-card';
        div.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span class="badge">${c.category}</span>
            <span class="status-pill status-${c.status.toLowerCase()}">${c.status}</span>
          </div>
          <h3>${c.title}</h3>
          <p>${c.location}</p>
          <p class="subtitle">By ${c.userName} • ${new Date(c.createdAt).toLocaleDateString()}</p>
        `;
        recentList.appendChild(div);
      });
    }

    function filter() {
      const q = (searchInput?.value || '').toLowerCase();
      const filtered = all.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      );
      render(filtered);
    }

    if (searchInput) searchInput.addEventListener('input', filter);
    render(all);
  }

  // Expose helpers
  window.CityComplaints = {
    getComplaints,
    saveComplaints,
    createSampleDataIfEmpty
  };
})();