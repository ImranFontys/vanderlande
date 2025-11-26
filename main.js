const statusSteps = [
  { id: 1, label: 'Ingecheckt', icon: 'fa-suitcase-rolling' },
  { id: 2, label: 'In sorteercentrum', icon: 'fa-gears' },
  { id: 3, label: 'Geladen op vliegtuig', icon: 'fa-plane-departure' },
  { id: 4, label: 'Aangekomen op bestemming', icon: 'fa-plane-arrival' },
  { id: 5, label: 'Op bagageband', icon: 'fa-person-walking-luggage' },
  { id: 6, label: 'Opgehaald door reiziger', icon: 'fa-circle-check' },
];

const mockBags = {
  bag001: { id: 'bag001', currentStatus: 3, history: [
    { status: 1, label: 'Ingecheckt', time: '09:12' },
    { status: 2, label: 'In sorteercentrum', time: '09:30' },
    { status: 3, label: 'Geladen op vliegtuig', time: '10:15' },
  ]},
  bag002: { id: 'bag002', currentStatus: 5, history: [
    { status: 1, label: 'Ingecheckt', time: '07:05' },
    { status: 2, label: 'In sorteercentrum', time: '07:18' },
    { status: 3, label: 'Geladen op vliegtuig', time: '07:55' },
    { status: 4, label: 'Aangekomen op bestemming', time: '09:25' },
    { status: 5, label: 'Op bagageband', time: '09:40' },
  ]},
  bag003: { id: 'bag003', currentStatus: 2, history: [
    { status: 1, label: 'Ingecheckt', time: '11:02' },
    { status: 2, label: 'In sorteercentrum', time: '11:20' },
  ]},
  bag004: { id: 'bag004', currentStatus: 6, history: [
    { status: 1, label: 'Ingecheckt', time: '08:42' },
    { status: 2, label: 'In sorteercentrum', time: '08:58' },
    { status: 3, label: 'Geladen op vliegtuig', time: '09:35' },
    { status: 4, label: 'Aangekomen op bestemming', time: '11:00' },
    { status: 5, label: 'Op bagageband', time: '11:20' },
    { status: 6, label: 'Opgehaald door reiziger', time: '11:32' },
  ]},
};

const shipments = [
  { id: 'bag001', status: 'intransit', eta: '10:15', hub: 'AMS', label: 'Geladen' },
  { id: 'bag002', status: 'arrived', eta: '09:40', hub: 'AMS', label: 'Op band' },
  { id: 'bag003', status: 'exception', eta: '11:20', hub: 'RTM', label: 'Sorteer' },
  { id: 'bag004', status: 'arrived', eta: '11:32', hub: 'EIN', label: 'Afgehaald' },
  { id: 'bag005', status: 'intransit', eta: '12:05', hub: 'AMS', label: 'Onderweg' },
];

const trendPoints = [40, 52, 48, 60, 70, 68, 82];

const form = document.getElementById('searchForm');
const bagInput = document.getElementById('bagInput');
const errorMessage = document.getElementById('errorMessage');
const progressFill = document.getElementById('progressFill');
const markers = document.getElementById('statusMarkers');
const timelineEl = document.getElementById('timeline');
const progressContainer = document.getElementById('progressContainer');
const emptyState = document.getElementById('emptyState');
const statusMeta = document.getElementById('statusMeta');
const statusChip = document.getElementById('statusChip');
const bagRef = document.getElementById('bagRef');
const updatedAt = document.getElementById('updatedAt');
const generateBtn = document.getElementById('generateBtn');
const shipmentsTable = document.getElementById('shipmentsTable');
const trendChart = document.getElementById('trendChart');
const statusFilter = document.getElementById('statusFilter');
const refreshBtn = document.getElementById('refreshBtn');
const kpiTransit = document.getElementById('kpiTransit');
const kpiOntime = document.getElementById('kpiOntime');
const kpiExceptions = document.getElementById('kpiExceptions');
const kpiArrivals = document.getElementById('kpiArrivals');
const submitBtn = form?.querySelector('button');

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const id = sanitizeId(bagInput.value.trim());
  handleLookup(id);
});

generateBtn?.addEventListener('click', () => {
  const id = getRandomBagId();
  bagInput.value = id;
  handleLookup(id);
});

statusFilter?.addEventListener('change', (e) => {
  renderTable(filterShipments(e.target.value));
});

refreshBtn?.addEventListener('click', () => {
  renderTable(filterShipments(statusFilter.value));
  renderChart(trendPoints);
});

function handleLookup(id) {
  if (!id) return;
  setLoading(true);
  setTimeout(() => {
    const bag = mockBags[id];
    if (bag) {
      renderDashboard(bag);
      hideError();
    } else {
      showError('Onbekend ID. Probeer opnieuw.');
      resetDashboard();
    }
    setLoading(false);
  }, 200);
}

function setLoading(isLoading) {
  if (submitBtn) submitBtn.disabled = isLoading;
  if (generateBtn) generateBtn.disabled = isLoading;
  if (submitBtn) submitBtn.textContent = isLoading ? 'Bezig...' : 'Track';
}

function renderDashboard(bag) {
  const currentStep = statusSteps.find((step) => step.id === bag.currentStatus);
  statusChip.textContent = `Status: ${currentStep ? currentStep.label : '-'}`;
  const chipStyles = getChipStyles(bag.currentStatus);
  statusChip.style.background = chipStyles.background;
  statusChip.style.color = chipStyles.color;
  statusChip.style.borderColor = chipStyles.border;

  bagRef.textContent = `ID: ${bag.id}`;
  const latestTime = bag.history[bag.history.length - 1]?.time || '-';
  updatedAt.textContent = `Laatste update: ${latestTime}`;

  renderProgress(bag.currentStatus);
  renderTimeline(bag.history, bag.currentStatus);
  setViewState(true);
}

function getChipStyles(currentId) {
  if (currentId === statusSteps.length) {
    return { background: 'rgba(46, 125, 50, 0.14)', color: '#1b5e20', border: 'rgba(46, 125, 50, 0.25)' };
  }
  if (currentId <= 2) {
    return { background: 'rgba(255, 204, 0, 0.18)', color: '#7a3f00', border: 'rgba(255, 204, 0, 0.35)' };
  }
  return { background: 'rgba(255, 102, 0, 0.16)', color: '#c2410c', border: 'rgba(255, 102, 0, 0.26)' };
}

function renderProgress(currentStatus) {
  const total = statusSteps.length - 1;
  const completedSteps = Math.max(0, currentStatus - 1);
  const percent = (completedSteps / total) * 100;
  progressFill.style.width = `${percent}%`;

  markers.innerHTML = '';
  statusSteps.forEach((step) => {
    const state = getStateClass(step.id, currentStatus);
    const node = document.createElement('div');
    node.className = `marker ${state}`;
    node.innerHTML = `<div class="marker-icon"><i class="fa-solid ${step.icon}"></i></div><span>${step.label}</span>`;
    markers.appendChild(node);
  });
}

function renderTimeline(history, currentStatus) {
  timelineEl.innerHTML = '';
  statusSteps.forEach((step) => {
    const state = getStateClass(step.id, currentStatus);
    const historyItem = history.find((entry) => entry.status === step.id);
    const time = historyItem ? historyItem.time : '--:--';
    const descriptor = historyItem ? 'Stap voltooid' : (step.id === currentStatus ? 'Actieve stap' : 'Nog niet bereikt');
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
      <div class="badge-icon ${state}">
        <i class="fa-solid ${step.icon}"></i>
      </div>
      <div class="timeline-body">
        <header>
          <strong>${step.label}</strong>
          <span class="chip ${state}">${descriptor}</span>
        </header>
        <p>${historyItem ? `Tijdstempel: ${time}` : 'Tijdstempel volgt zodra de stap is bereikt.'}</p>
      </div>
    `;
    timelineEl.appendChild(item);
  });
}

function getStateClass(stepId, currentId) {
  if (stepId < currentId) return 'complete';
  if (stepId === currentId) return 'active';
  return 'upcoming';
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function hideError() {
  errorMessage.classList.add('hidden');
}

function setViewState(hasData) {
  progressContainer.classList.toggle('hidden', !hasData);
  timelineEl.classList.toggle('hidden', !hasData);
  statusMeta.classList.toggle('hidden', !hasData);
  emptyState.classList.toggle('hidden', hasData);
}

function resetDashboard() {
  setViewState(false);
  statusChip.textContent = 'Status: nog niet geladen';
  statusChip.style.background = 'rgba(255, 122, 26, 0.12)';
  statusChip.style.color = '#b3470f';
  statusChip.style.borderColor = 'rgba(255, 122, 26, 0.32)';
  bagRef.textContent = 'ID: —';
  updatedAt.textContent = 'Laatste update: —';
  progressFill.style.width = '0%';
  markers.innerHTML = '';
  timelineEl.innerHTML = '';
}

function getRandomBagId() {
  const keys = Object.keys(mockBags);
  return keys[Math.floor(Math.random() * keys.length)];
}

function filterShipments(filter) {
  if (filter === 'all') return shipments;
  return shipments.filter((s) => s.status === filter);
}

function renderTable(rows) {
  shipmentsTable.innerHTML = '';
  rows.forEach((row) => {
    const el = document.createElement('div');
    el.className = 'table-row';
    el.innerHTML = `
      <span>${row.id}</span>
      <span class="pill ${getStatusPillClass(row.status)}">${row.label}</span>
      <span>${row.eta}</span>
      <span>${row.hub}</span>
      <span><a href="#track">Open</a></span>
    `;
    shipmentsTable.appendChild(el);
  });
}

function renderChart(points) {
  if (!points.length) {
    trendChart.innerHTML = '';
    return;
  }
  const max = Math.max(...points);
  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * 320;
    const y = 120 - (v / max) * 100 - 10;
    return `${x},${y}`;
  });
  trendChart.innerHTML = `
    <polyline points="${coords.join(' ')}" fill="none" stroke="#ff7a1a" stroke-width="3" stroke-linecap="round"/>
    ${coords.map((c) => `<circle cx="${c.split(',')[0]}" cy="${c.split(',')[1]}" r="3.5" fill="#f43f5e" stroke="#ff7a1a" stroke-width="1.5"/>`).join('')}
  `;
}

function getStatusPillClass(status) {
  if (status === 'arrived') return 'pill-green';
  if (status === 'exception') return 'pill-orange';
  return 'pill-yellow';
}

function renderKpis() {
  const intransit = shipments.filter((s) => s.status === 'intransit').length;
  const arrived = shipments.filter((s) => s.status === 'arrived').length;
  const exceptions = shipments.filter((s) => s.status === 'exception').length;
  const ontime = Math.round(((shipments.length - exceptions) / shipments.length) * 100);
  kpiTransit.textContent = intransit;
  kpiArrivals.textContent = arrived;
  kpiExceptions.textContent = exceptions;
  kpiOntime.textContent = `${ontime}%`;
}

function sanitizeId(value) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
}

renderTable(shipments);
renderChart(trendPoints);
renderKpis();
resetDashboard();
