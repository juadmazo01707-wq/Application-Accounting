// AccoVix — Charts Module

const Charts = (() => {
	Chart.defaults.color = '#4d6080';
	Chart.defaults.borderColor = '#1e2d45';
	Chart.defaults.font.family = "'DM Sans', sans-serif";

	const C = {
		blue: '#5b8def', green: '#3ec98a', red: '#e8634f',
		amber: '#f5a623', purple: '#a78bfa',
		cyan: '#22d3ee', pink: '#f472b6', lime: '#84cc16',
		orange: '#fb923c', teal: '#2dd4bf'
	};
	const PALETTE = [C.blue, C.green, C.amber, C.purple, C.red, C.teal, C.pink, C.orange, C.lime, C.cyan];

	const _instances = {};

	function _destroy(id) {
		if (_instances[id]) { try { _instances[id].destroy(); } catch (e) { } delete _instances[id]; }
	}
	function _create(id, cfg) {
		_destroy(id);
		const el = document.getElementById(id);
		if (!el) return;
		_instances[id] = new Chart(el, cfg);
		return _instances[id];
	}
	function _tooltip(extra = {}) {
		return { tooltip: { backgroundColor: '#1a2235', titleColor: '#e6edf8', bodyColor: '#8496b0', borderColor: '#2a3d58', borderWidth: 1, padding: 10, ...extra } };
	}
	function _axisStyle() {
		return { ticks: { font: { size: 11 } }, grid: { color: '#1e2d45' } };
	}
	//Sparkline 
	function sparkline(id, data, color) {
		_create(id, {
			type: 'line',
			data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor: color, borderWidth: 1.5, fill: true, backgroundColor: color + '22', tension: .4, pointRadius: 0 }] },
			options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
		});
	}
	//  Cash flow (home) 
	function cashflow(id) {
		const data = Storage.Transactions.monthly(6);
		_create(id, {
			data: {
				labels: data.map(m => m.label),
				datasets: [
					{ type: 'bar', label: 'Ingresos', data: data.map(m => m.income), backgroundColor: C.blue + 'cc', borderRadius: 4, order: 2 },
					{ type: 'bar', label: 'Gastos', data: data.map(m => m.expense), backgroundColor: C.red + 'cc', borderRadius: 4, order: 2 },
					{ type: 'line', label: 'Balance', data: data.map(m => m.saving), borderColor: C.green, backgroundColor: C.green + '18', borderWidth: 2, fill: true, tension: .4, pointRadius: 4, pointBackgroundColor: C.green, pointBorderColor: '#111827', pointBorderWidth: 2, order: 1 },
				]
			},
			options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, ..._tooltip({ mode: 'index', intersect: false }) }, scales: { x: _axisStyle(), y: { ..._axisStyle(), ticks: { callback: v => '$' + (Math.abs(v) / 1000).toFixed(0) + 'k' } } }, animation: { duration: 800 } }
		});
	}
	//  Donut (spending by category) 
	function donut(id) {
		const entries = Storage.Transactions.byCategory();
		if (!entries.length) { _destroy(id); return null; }
		const labels = entries.map(e => e[0]);
		const data = entries.map(e => e[1]);
		const colors = labels.map((_, i) => PALETTE[i % PALETTE.length]);

		_create(id, {
			type: 'doughnut',
			data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }] },
			options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, ..._tooltip({ callbacks: { label: ctx => ` ${ctx.label}: $${Math.abs(ctx.parsed).toLocaleString('es-CO')}` } }) }, cutout: '70%', animation: { duration: 900 } }
		});
		// Legend
		const el = document.getElementById('donut-legend');
		if (el) el.innerHTML = labels.map((l, i) => `
			<div class="dl-item">
				<span class="dl-dot" style="background:${colors[i]}"> </span>
				<span class="dl-name"> ${l} </span>
				<strong> $${data[i].toLocaleString('es-CO')} </strong>
			</div>
		`).join('');
	}
	//  Budget compare 
	function budgetCompare(id) {
		const budgets = Storage.Budgets.withSpent();
		if (!budgets.length) { _destroy(id); return; }
		_create(id, {
			type: 'bar',
			data: {
				labels: budgets.map(b => b.category),
				datasets: [
					{ label: 'Límite', data: budgets.map(b => b.limit), backgroundColor: '#2a3d5888', borderRadius: 4 },
					{ label: 'Gastado', data: budgets.map(b => b.spent), backgroundColor: budgets.map(b => { const p = b.limit > 0 ? (b.spent / b.limit) * 100 : 0; return p >= 90 ? C.red + 'cc' : p >= 70 ? C.amber + 'cc' : C.green + 'cc'; }), borderRadius: 4 }
				]
			},
			options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, ..._tooltip({ mode: 'index', intersect: false }) }, scales: { x: { ..._axisStyle(), ticks: { autoSkip: false, font: { size: 11 } } }, y: { ..._axisStyle(), ticks: { callback: v => '$' + (v / 1000).toFixed(0) + 'k' } } }, animation: { duration: 700 } }
		});
	}
	//  Savings line 
	function savings(id) {
		const monthly = Storage.Transactions.monthly(6);
		// Gráfica comparativa: Ingresos, Gastos y Ahorro neto por mes
		_create(id, {
			type: 'bar',
			data: {
				labels: monthly.map(m => m.label),
				datasets: [
					{
						label: 'Ingresos',
						data: monthly.map(m => m.income),
						backgroundColor: C.green + 'bb',
						borderRadius: 4,
						order: 2,
					},
					{
						label: 'Gastos',
						data: monthly.map(m => m.expense),
						backgroundColor: C.red + 'bb',
						borderRadius: 4,
						order: 2,
					},
					{
						// Ahorro neto como línea superpuesta
						label: 'Ahorro neto',
						data: monthly.map(m => Math.max(m.saving, 0)),
						type: 'line',
						borderColor: C.green,
						backgroundColor: C.green + '22',
						fill: true,
						tension: 0.4,
						borderWidth: 2,
						pointRadius: 4,
						pointBackgroundColor: C.green,
						pointBorderColor: '#111827',
						pointBorderWidth: 2,
						order: 1,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					..._tooltip({
						mode: 'index', intersect: false,
						callbacks: { label: ctx => ` ${ctx.dataset.label}: $${Math.abs(ctx.parsed.y).toLocaleString('es-CO')}` }
					}),
				},
				scales: {
					x: { ..._axisStyle(), ticks: { autoSkip: false, font: { size: 11 } } },
					y: { ..._axisStyle(), ticks: { ...(_axisStyle().ticks), callback: v => '$' + (Math.abs(v) / 1000).toFixed(0) + 'k' } },
				},
				animation: { duration: 800 },
			},
		});
	}
	//  Category bar (report) 
	function categoryBar(id) {
		const entries = Storage.Transactions.byCategory();
		if (!entries.length) { _destroy(id); return; }
		const labels = entries.map(e => e[0]);
		const data = entries.map(e => e[1]);
		const h = Math.max(labels.length * 42 + 60, 200);
		const el = document.getElementById(id);
		if (el) el.closest('.chart-wrap').style.height = h + 'px';
		_create(id, {
			type: 'bar',
			data: { labels, datasets: [{ data, backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length] + 'cc'), borderRadius: 4 }] },
			options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, ..._tooltip({ callbacks: { label: ctx => ` $${Math.abs(ctx.parsed.x).toLocaleString('es-CO')}` } }) }, scales: { x: { ..._axisStyle(), ticks: { callback: v => '$' + (v / 1000).toFixed(0) + 'k' } }, y: { ..._axisStyle(), ticks: { font: { size: 12 } } } }, animation: { duration: 700 } }
		});
	}
	//  Sparklines from real monthly data 
	function initSparklines() {
		const monthly = Storage.Transactions.monthly(6);
		sparkline('spark1', monthly.map(m => m.income - m.expense), C.blue);
		sparkline('spark2', monthly.map(m => m.income), C.green);
		sparkline('spark3', monthly.map(m => m.expense), C.red);
		sparkline('spark4', monthly.map(m => m.saving), C.purple);
	}

	return { initSparklines, cashflow, donut, budgetCompare, savings, categoryBar };
})();