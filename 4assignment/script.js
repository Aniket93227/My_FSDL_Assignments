const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let displayedMonths = 12;

const patientFlow = Array.from({ length: 24 }, (_, i) => ({
  month: `${months[i % 12]} ${2024 + Math.floor(i / 12)}`,
  admissions: Math.round(250 + i * 8 + Math.random() * 65),
  discharges: Math.round(220 + i * 9 + Math.random() * 70)
}));

let occupancy = 0.75;
const diseaseTrends = {
  flu: Array.from({ length: 24 }, (_, i) => Math.round(80 + 40 * Math.sin(i / 3) + Math.random() * 20)),
  dengue: Array.from({ length: 24 }, (_, i) => Math.round(35 + 20 * Math.sin(i / 4 + 1) + Math.random() * 10)),
  covid: Array.from({ length: 24 }, (_, i) => Math.round(50 + 15 * Math.cos(i / 5) + Math.random() * 15))
};

const schedule = [
  { name: "Dr. Singh", dept: "ER", status: "On Duty", shift: "08:00 - 16:00" },
  { name: "Dr. Patel", dept: "ICU", status: "On Duty", shift: "12:00 - 20:00" },
  { name: "Dr. Kumar", dept: "Pediatrics", status: "Off Duty", shift: "--" },
  { name: "Dr. Mehta", dept: "Surgery", status: "On Duty", shift: "10:00 - 18:00" },
  { name: "Dr. Jain", dept: "Cardiology", status: "On Call", shift: "20:00 - 08:00" }
];

let patientFlowChart, occupancyChart, diseaseChart;
let useApiData = false;
const hospitalCapacity = 350;
let inPatients = Math.round(hospitalCapacity * occupancy);
let lastAdmissions = 0;
let lastDischarges = 0;

function updateLiveMetrics() {
  const now = new Date();
  document.getElementById("liveTime").textContent = now.toLocaleTimeString();
  document.getElementById("inPatients").textContent = `${inPatients}`;
  document.getElementById("newAdmissions").textContent = `${lastAdmissions}`;
  document.getElementById("newDischarges").textContent = `${lastDischarges}`;
}

function buildPatientFlowChart() {
  const ctx = document.getElementById("patientFlowChart");
  if (patientFlowChart) patientFlowChart.destroy();
  const slice = patientFlow.slice(-displayedMonths);

  patientFlowChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: slice.map(r => r.month),
      datasets: [
        { label: "Admissions", data: slice.map(r => r.admissions), borderColor: "#00aaff", fill: false, tension: 0.2 },
        { label: "Discharges", data: slice.map(r => r.discharges), borderColor: "#ff8c00", fill: false, tension: 0.2 }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "Month" } },
        y: { title: { display: true, text: "Patients" }, beginAtZero: true }
      }
    }
  });
}

function buildOccupancyGauge() {
  const ctx = document.getElementById("occupancyChart");
  if (occupancyChart) occupancyChart.destroy();
  const filled = Math.round(occupancy * 100);
  occupancyChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Used", "Free"],
      datasets: [{
        data: [filled, 100 - filled],
        backgroundColor: [filled > 70 ? "#ff3a3a" : "#00b15c", "#143a2c"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      rotation: -90,
      circumference: 180,
      cutout: "75%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  });
  document.getElementById("occupancyPct").textContent = `${filled}%`;
}

function buildDiseaseAreaChart() {
  const ctx = document.getElementById("diseaseChart");
  if (diseaseChart) diseaseChart.destroy();
  const labels = patientFlow.slice(-displayedMonths).map(r => r.month);
  diseaseChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Flu", data: diseaseTrends.flu.slice(-displayedMonths), backgroundColor: "rgba(0, 170, 255, 0.2)", borderColor: "#00aaff", fill: true, tension: 0.2 },
        { label: "Dengue", data: diseaseTrends.dengue.slice(-displayedMonths), backgroundColor: "rgba(255, 140, 0, 0.2)", borderColor: "#ff8c00", fill: true, tension: 0.2 },
        { label: "COVID", data: diseaseTrends.covid.slice(-displayedMonths), backgroundColor: "rgba(220, 20, 60, 0.2)", borderColor: "#dc143c", fill: true, tension: 0.2 }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "Month" } },
        y: { title: { display: true, text: "Case Count" }, beginAtZero: true }
      }
    }
  });
}

function renderSchedule() {
  const tbody = document.querySelector("#doctorSchedule tbody");
  tbody.innerHTML = schedule.map(s =>
    `<tr><td>${s.name}</td><td>${s.dept}</td><td>${s.status}</td><td>${s.shift}</td></tr>`
  ).join("");
}

function simulateDataUpdate() {
  occupancy = Math.max(0.5, Math.min(0.95, occupancy + (Math.random() - 0.5) * 0.05));
  inPatients = Math.round(occupancy * hospitalCapacity);

  lastAdmissions = Math.round(12 + Math.random() * 12);
  lastDischarges = Math.round(8 + Math.random() * 10);

  const latest = patientFlow[patientFlow.length - 1];
  latest.admissions = Math.max(0, latest.admissions + lastAdmissions);
  latest.discharges = Math.max(0, latest.discharges + lastDischarges);

  patientFlow.forEach((row, index) => {
    if (index === patientFlow.length - 1) return;
    row.admissions = Math.max(100, row.admissions + Math.round((Math.random() - 0.5) * 12));
    row.discharges = Math.max(80, row.discharges + Math.round((Math.random() - 0.5) * 10));
  });
}

async function refreshData() {
  if (useApiData) {
    await fetchAndApplyLiveData();
  } else {
    simulateDataUpdate();
  }
  redrawAll();
}

async function fetchAndApplyLiveData() {
  try {
    const response = await fetch('/api/hospital-data');
    if (!response.ok) throw new Error('API offline');

    const payload = await response.json();
    if (payload.occupancy != null) occupancy = Math.max(0.0, Math.min(1.0, payload.occupancy));
    if (payload.inPatients != null) inPatients = payload.inPatients;
    if (payload.newAdmissions != null) lastAdmissions = payload.newAdmissions;
    if (payload.newDischarges != null) lastDischarges = payload.newDischarges;

    if (Array.isArray(payload.patientFlow)) {
      payload.patientFlow.forEach((row, idx) => {
        if (!patientFlow[idx]) return;
        patientFlow[idx].admissions = Math.max(0, row.admissions || patientFlow[idx].admissions);
        patientFlow[idx].discharges = Math.max(0, row.discharges || patientFlow[idx].discharges);
      });
    }

    if (payload.diseaseTrends) {
      diseaseTrends.flu = payload.diseaseTrends.flu || diseaseTrends.flu;
      diseaseTrends.dengue = payload.diseaseTrends.dengue || diseaseTrends.dengue;
      diseaseTrends.covid = payload.diseaseTrends.covid || diseaseTrends.covid;
    }

    if (payload.schedule) {
      schedule.splice(0, schedule.length, ...payload.schedule);
    }

  } catch (error) {
    console.warn('Live API data fetch failed, using simulation', error);
    simulateDataUpdate();
  }
}


function redrawAll() {
  buildPatientFlowChart();
  buildOccupancyGauge();
  buildDiseaseAreaChart();
  renderSchedule();
  updateLiveMetrics();
}

function setApiMode(enabled) {
  useApiData = enabled;
  const btn = document.getElementById("toggleApiMode");
  btn.textContent = enabled ? "Use Simulated Data" : "Use Live API Data";
  btn.classList.toggle("btn-success", enabled);
  btn.classList.toggle("btn-secondary", !enabled);
}

function initialize() {
  document.getElementById("monthSelect").addEventListener("change", e => {
    displayedMonths = Number(e.target.value);
    redrawAll();
  });
  document.getElementById("updateOccupancy").addEventListener("click", () => {
    occupancy = Math.random() * 0.35 + 0.65;
    inPatients = Math.round(occupancy * hospitalCapacity);
    refreshData();
  });
  document.getElementById("refreshData").addEventListener("click", refreshData);
  document.getElementById("toggleApiMode").addEventListener("click", () => {
    setApiMode(!useApiData);
    refreshData();
  });

  redrawAll();
  setInterval(refreshData, 5000);
}

initialize();
