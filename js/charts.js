/* ═══════════════════════════════════════════════
   AccountIQ — Charts Module (Chart.js 4)
═══════════════════════════════════════════════ */

const Charts = (() => {

  Chart.defaults.color = '#4d6080';
  Chart.defaults.borderColor = '#1e2d45';
  Chart.defaults.font.family = "'DM Sans', sans-serif";

  const COLORS = {
    blue:   '#5b8def',
    green:  '#3ec98a',
    red:    '#e8634f',
    amber:  '#f5a623',
    purple: '#a78bfa',
    teal:   '#2dd4bf',
  };

  /* ── Sparkline ── */
  function sparkline(id, data, color) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.map((_, i) => i),
        datasets: [{
          data,
          borderColor: color,
          borderWidth: 2,
          fill: true,
          backgroundColor: color + '22',
          tension: 0.4,
          pointRadius: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
        animation: { duration: 800 },
      }
    });
  }

  /* ── Cash Flow Bar+Line ── */
  function cashflow(id, data) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    new Chart(canvas, {
      data: {
        labels: data.labels,
        datasets: [
          {
            type: 'bar',
            label: 'Ingresos',
            data: data.income,
            backgroundColor: COLORS.blue + 'cc',
            borderRadius: 4,
            borderSkipped: false,
            order: 2,
          },
          {
            type: 'bar',
            label: 'Gastos',
            data: data.expense,
            backgroundColor: COLORS.red + 'cc',
            borderRadius: 4,
            borderSkipped: false,
            order: 2,
          },
          {
            type: 'line',
            label: 'Ahorro neto',
            data: data.saving,
            borderColor: COLORS.green,
            backgroundColor: COLORS.green + '18',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: COLORS.green,
            pointBorderColor: '#111827',
            pointBorderWidth: 2,
            order: 1,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, backgroundColor: '#1a2235', titleColor: '#e6edf8', bodyColor: '#8496b0', borderColor: '#2a3d58', borderWidth: 1, padding: 10 } },
        scales: {
          x: { ticks: { autoSkip: false, font: { size: 11 } }, grid: { color: '#1e2d45' } },
          y: { ticks: { callback: v => '$' + (v / 1000).toFixed(0) + 'k', font: { size: 11 } }, grid: { color: '#1e2d45' } }
        },
        animation: { duration: 900, easing: 'easeInOutQuart' },
      }
    });
  }

  /* ── Donut ── */
  function donut(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Operación', 'Nómina', 'Marketing', 'Servicios', 'Otros'],
        datasets: [{
          data: [32, 28, 18, 12, 10],
          backgroundColor: [COLORS.blue, COLORS.green, COLORS.amber, COLORS.purple, COLORS.red],
          borderWidth: 0,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a2235', titleColor: '#e6edf8', bodyColor: '#8496b0', borderColor: '#2a3d58', borderWidth: 1, callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` } } },
        cutout: '72%',
        animation: { animateRotate: true, duration: 900 },
      }
    });
  }

  /* ── Budget Compare Bar ── */
  function budgetCompare(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Operación', 'Nómina', 'Marketing', 'Tecnología', 'Arriendo', 'Ahorro'],
        datasets: [
          { label: 'Presupuestado', data: [4000, 6000, 2000, 1500, 1800, 8000], backgroundColor: '#2a3d5888', borderRadius: 4 },
          { label: 'Utilizado',     data: [3200, 5400,  850, 1100, 1800, 5510], backgroundColor: [COLORS.amber + 'cc', COLORS.red + 'cc', COLORS.green + 'cc', COLORS.blue + 'cc', COLORS.red + 'cc', COLORS.purple + 'cc'], borderRadius: 4 },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, backgroundColor: '#1a2235', titleColor: '#e6edf8', bodyColor: '#8496b0', borderColor: '#2a3d58', borderWidth: 1 } },
        scales: {
          x: { ticks: { autoSkip: false, font: { size: 11 } }, grid: { color: '#1e2d45' } },
          y: { ticks: { callback: v => '$' + (v / 1000).toFixed(0) + 'k', font: { size: 11 } }, grid: { color: '#1e2d45' } }
        },
        animation: { duration: 700 },
      }
    });
  }

  /* ── Prediction Line ── */
  function prediction(id, data) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          { label: 'Base', data: data.base, borderColor: COLORS.blue, backgroundColor: COLORS.blue + '18', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 5, pointBackgroundColor: COLORS.blue, pointBorderColor: '#111827', pointBorderWidth: 2, borderDash: [6, 3] },
          { label: 'Optimista', data: data.optimistic, borderColor: COLORS.green, backgroundColor: 'transparent', fill: false, tension: 0.4, borderWidth: 1.5, pointRadius: 3, borderDash: [3, 3] },
          { label: 'Conservador', data: data.conservative, borderColor: COLORS.amber, backgroundColor: 'transparent', fill: false, tension: 0.4, borderWidth: 1.5, pointRadius: 3, borderDash: [3, 3] },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, backgroundColor: '#1a2235', titleColor: '#e6edf8', bodyColor: '#8496b0', borderColor: '#2a3d58', borderWidth: 1 } },
        scales: {
          x: { ticks: { autoSkip: false, font: { size: 11 } }, grid: { color: '#1e2d45' } },
          y: { ticks: { callback: v => '$' + (v / 1000).toFixed(0) + 'k', font: { size: 11 } }, grid: { color: '#1e2d45' } }
        },
        animation: { duration: 900 },
      }
    });
  }

  /* ── Flujo de Caja (report) ── */
  function flujoCaja(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Ene', 'Feb', 'Mar'],
        datasets: [
          { label: 'Entradas', data: [10100, 11880, 12850], backgroundColor: COLORS.green + 'bb', borderRadius: 4 },
          { label: 'Salidas',  data: [-6900, -7118, -7340], backgroundColor: COLORS.red + 'bb',   borderRadius: 4 },
          { label: 'Neto',     data: [3200,  4762,  5510],  backgroundColor: COLORS.blue + 'bb',  borderRadius: 4 },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, backgroundColor: '#1a2235', titleColor: '#e6edf8', bodyColor: '#8496b0', borderColor: '#2a3d58', borderWidth: 1, callbacks: { label: ctx => ` ${ctx.dataset.label}: $${Math.abs(ctx.parsed.y).toLocaleString()}` } } },
        scales: {
          x: { ticks: { font: { size: 12 } }, grid: { color: '#1e2d45' } },
          y: { ticks: { callback: v => '$' + Math.abs(v / 1000).toFixed(0) + 'k', font: { size: 11 } }, grid: { color: '#1e2d45' } }
        },
        animation: { duration: 700 },
      }
    });
  }

  /* ── Init all charts ── */
  function initAll() {
    sparkline('spark1', AppData.sparklines.balance,  COLORS.blue);
    sparkline('spark2', AppData.sparklines.income,   COLORS.green);
    sparkline('spark3', AppData.sparklines.expenses, COLORS.red);
    sparkline('spark4', AppData.sparklines.savings,  COLORS.purple);
    cashflow('cashflowChart', AppData.cashflow);
    donut('donutChart');
  }

  function initPresupuesto() {
    budgetCompare('budgetCompareChart');
  }

  function initPredicciones() {
    prediction('predChart', AppData.prediction);
  }

  function initReportes() {
    flujoCaja('flujoCajaChart');
  }

  return { initAll, initPresupuesto, initPredicciones, initReportes };

})();
