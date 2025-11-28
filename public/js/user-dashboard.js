(function() {
  const canvasTrend = document.getElementById('userTrendChart');
  const canvasCategory = document.getElementById('userCategoryChart');
  const tableBody = document.querySelector('#myComplaintsTable tbody');

  if (!canvasTrend && !canvasCategory && !tableBody) return;

  CityComplaints.createSampleDataIfEmpty();
  const user = CityAuth.getCurrentUser();
  if (!user) return;

  const all = CityComplaints.getComplaints();
  const mine = all.filter(c => c.userId === user.id);

  // Stats
  const statTotal = document.getElementById('statTotal');
  const statPending = document.getElementById('statPending');
  const statWorking = document.getElementById('statWorking');
  const statResolved = document.getElementById('statResolved');

  const total = mine.length;
  const pending = mine.filter(c => c.status === 'Pending').length;
  const working = mine.filter(c => c.status === 'Working').length;
  const resolved = mine.filter(c => c.status === 'Resolved').length;

  if (statTotal) statTotal.textContent = total;
  if (statPending) statPending.textContent = pending;
  if (statWorking) statWorking.textContent = working;
  if (statResolved) statResolved.textContent = resolved;

  // Profile stats if present
  const pTotal = document.getElementById('profileTotal');
  const pResolved = document.getElementById('profileResolved');
  const pPending = document.getElementById('profilePending');
  const pName = document.getElementById('profileName');
  const pEmail = document.getElementById('profileEmail');
  const avatar = document.querySelector('.avatar-circle');

  if (pTotal) pTotal.textContent = total;
  if (pResolved) pResolved.textContent = resolved;
  if (pPending) pPending.textContent = pending;
  if (pName) pName.textContent = user.name;
  if (pEmail) pEmail.textContent = user.email;
  if (avatar && user.name) avatar.textContent = user.name[0].toUpperCase();

  // Table
  if (tableBody) {
    mine
      .slice()
      .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))
      .forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${c.id}</td>
          <td>${c.title}</td>
          <td>${c.category}</td>
          <td><span class="status-pill status-${c.status.toLowerCase()}">${c.status}</span></td>
          <td>${new Date(c.createdAt).toLocaleDateString()}</td>
        `;
        tableBody.appendChild(tr);
      });
  }

  // Trend (last 7 days)
  if (canvasTrend) {
    const days = [];
    const counts = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = `${d.getDate()}/${d.getMonth()+1}`;
      days.push(label);
      const count = mine.filter(c => {
        const cd = new Date(c.createdAt);
        return cd.toDateString() === d.toDateString();
      }).length;
      counts.push(count);
    }

    new Chart(canvasTrend.getContext('2d'), {
      type: 'line',
      data: {
        labels: days,
        datasets: [{
          label: 'Complaints',
          data: counts,
          tension: 0.4
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  // Category chart
  if (canvasCategory) {
    const categories = ['Road', 'Drainage', 'Garbage', 'Street Light', 'Electricity'];
    const data = categories.map(cat => mine.filter(c => c.category === cat).length);

    new Chart(canvasCategory.getContext('2d'), {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [{
          label: 'Complaints',
          data
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }
})();