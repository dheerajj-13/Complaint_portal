(function() {
  const canvasCat = document.getElementById('adminCategoryChart');
  const canvasTrend = document.getElementById('adminTrendChart');
  const tableBody = document.querySelector('#allComplaintsTable tbody');
  const legendList = document.getElementById('meterLegend');
  const topCategoryLabel = document.getElementById('topCategoryLabel');

  if (!canvasCat && !canvasTrend && !tableBody && !legendList) return;

  CityComplaints.createSampleDataIfEmpty();
  const all = CityComplaints.getComplaints();

  // Stats
  const total = all.length;
  const pending = all.filter(c => c.status === 'Pending').length;
  const working = all.filter(c => c.status === 'Working').length;
  const resolved = all.filter(c => c.status === 'Resolved').length;

  const aTotal = document.getElementById('adminTotal');
  const aPending = document.getElementById('adminPending');
  const aWorking = document.getElementById('adminWorking');
  const aResolved = document.getElementById('adminResolved');
  if (aTotal) aTotal.textContent = total;
  if (aPending) aPending.textContent = pending;
  if (aWorking) aWorking.textContent = working;
  if (aResolved) aResolved.textContent = resolved;

  // Table with status update
  if (tableBody) {
    tableBody.innerHTML = '';
    all
      .slice()
      .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))
      .forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${c.id}</td>
          <td>${c.userName}</td>
          <td>${c.title}</td>
          <td>${c.category}</td>
          <td><span class="status-pill status-${c.status.toLowerCase()}">${c.status}</span></td>
          <td>${new Date(c.createdAt).toLocaleDateString()}</td>
          <td>
            <select data-id="${c.id}">
              <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Working" ${c.status === 'Working' ? 'selected' : ''}>Working</option>
              <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
            </select>
          </td>
        `;
        tableBody.appendChild(tr);
      });

    tableBody.addEventListener('change', function(e) {
      const sel = e.target;
      if (sel.tagName.toLowerCase() !== 'select') return;
      const id = Number(sel.getAttribute('data-id'));
      const status = sel.value;
      const list = CityComplaints.getComplaints();
      const item = list.find(c => c.id === id);
      if (item) {
        item.status = status;
        CityComplaints.saveComplaints(list);
        showToast('Status updated for complaint #' + id);
        // update pill
        const row = sel.closest('tr');
        const pill = row.querySelector('.status-pill');
        pill.textContent = status;
        pill.className = 'status-pill status-' + status.toLowerCase();
      }
    });
  }

  // Category analytics
  const categories = ['Road', 'Drainage', 'Garbage', 'Street Light', 'Electricity'];
  const catCounts = categories.map(cat => all.filter(c => c.category === cat).length);
  const totalCat = catCounts.reduce((a,b)=>a+b,0) || 1;
  const withPercent = categories.map((cat, i) => ({
    name: cat,
    count: catCounts[i],
    percent: Math.round((catCounts[i] / totalCat) * 100)
  })).sort((a,b)=> b.count - a.count);

  if (topCategoryLabel && withPercent[0]) {
    topCategoryLabel.textContent = withPercent[0].name;
  }

  if (legendList) {
    legendList.innerHTML = '';
    withPercent.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.name}: ${item.count} (${item.percent}%)`;
      legendList.appendChild(li);
    });
  }

  if (canvasCat) {
    new Chart(canvasCat.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: catCounts
        }]
      },
      options: {
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // Weekly trend (all complaints)
  if (canvasTrend) {
    const days = [];
    const counts = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = `${d.getDate()}/${d.getMonth()+1}`;
      days.push(label);
      const count = all.filter(c => {
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
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
  }
})();