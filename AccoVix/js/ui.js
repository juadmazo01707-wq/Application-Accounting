// AccoVix — UI Module

const UI = (() => {
	// Formatters 
	function fmt(n) {
		return '$' + Math.abs(Number(n) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 });
	}
	function fmtSigned(n, type) {
		const isIncome = type === 'income';
		return `<span class="tx-amount ${isIncome ? 'up' : 'down'}">${isIncome ? '+' : '-'}${fmt(n)}</span>`;
	}
	function pill(status) {
		const map = { income: ['pill-green', 'Ingreso'], expense: ['pill-red', 'Gasto'], active: ['pill-green', 'Activo'], inactive: ['pill-purple', 'Inactivo'] };
		const [cls, label] = map[status] || ['pill-blue', status];
		return `<span class="pill ${cls}">${label}</span>`;
	}
	function pctColor(pct) {
		return pct >= 100 ? '#e8634f' : pct >= 80 ? '#f5a623' : '#3ec98a';
	}
	function esc(s) {
		if (typeof s !== 'string') return s ?? '';
		return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}
	function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
	//  KPIs 
	function updateKPIs() {
		const s = Storage.Transactions.summaryThisMonth();
		setText('kpi-balance', fmt(s.balance));
		setText('kpi-income', fmt(s.income));
		setText('kpi-expense', fmt(s.expense));
		setText('kpi-saving', fmt(s.saving));
		// Color and label for saving KPI
		const savEl = document.getElementById('kpi-saving');
		if (savEl) savEl.style.color = s.saving >= 0 ? 'var(--green)' : 'var(--red)';
	}
	//  Recent transactions (dashboard mini) 
	function renderTxDash() {
		const el = document.getElementById('tx-dash');
		const empty = document.getElementById('tx-dash-empty');
		const txs = Storage.Transactions.all().slice(0, 6);
		if (!txs.length) { if (el) el.innerHTML = ''; if (empty) empty.style.display = ''; return; }
		if (empty) empty.style.display = 'none';
		el.innerHTML = txs.map(tx => `
				<div class="tx-item">
					<div class="tx-icon" style="background:${tx.type === 'income' ? '#0b2a1e' : '#2e0f0b'}"> ${tx.icon || '💸'} </div>
					<div class="tx-info">
						<div class="tx-name"> ${esc(tx.description)} </div>
						<div class="tx-cat"> ${esc(tx.category)} · ${tx.date} </div>
					</div>
					<div class="tx-right"> ${fmtSigned(tx.amount, tx.type)} </div>
				</div>
			`).join('');
	}
	//  Transactions table 
	function renderMovimientos(txs) {
		const tbody = document.getElementById('tx-table-body');
		const empty = document.getElementById('tx-table-empty');
		if (!tbody) return;

		if (!txs || !txs.length) {
			tbody.innerHTML = '';
			if (empty) empty.style.display = '';
			return;
		}
		if (empty) empty.style.display = 'none';

		tbody.innerHTML = txs.map(tx => `
			<tr>
				<td> ${tx.date} </td>
				<td> <span style="display:flex;align-items:center;gap:7px"> <span> ${tx.icon || ''} </span> ${esc(tx.description)} </span> </td>
				<td> <span class="pill pill-blue"> ${esc(tx.category)} </span> </td>
				<td style="color:var(--t2)"> ${esc(tx.account || '')} </td>
				<td> ${pill(tx.type)} </td>
				<td> ${fmtSigned(tx.amount, tx.type)} </td>
				<td> 
					<div class="tbl-actions">
						<button class="tbl-btn" onclick="App.editTx(${tx.id})" style="display:flex;align-items:center;gap:3px"> ✏ Editar </button>
						<button class="tbl-btn danger" onclick="App.deleteTx(${tx.id})" style="display:flex;align-items:center;gap:3px"> 🗑 Eliminar </button>
					</div>
				</td>
			</tr>
		`).join('');
	}
	//  Budget mini (dashboard) 
	function renderBudgetDash() {
		const el = document.getElementById('budget-dash');
		const empty = document.getElementById('budget-dash-empty');
		const bgs = Storage.Budgets.withSpent();
		if (!bgs.length) { if (el) el.innerHTML = ''; if (empty) empty.style.display = ''; return; }
		if (empty) empty.style.display = 'none';
		el.innerHTML = bgs.slice(0, 5).map(b => {
			const pct = b.limit > 0 ? Math.min(Math.round((b.spent / b.limit) * 100), 100) : 0;
			const col = pctColor(pct);
			return `
				<div class="budget-row">
					<div class="budget-header-row">
						<span class="budget-name"> ${b.icon || '📌'} ${esc(b.category)} </span>
						<span style="font-size:11px;color:${col};font-weight:600"> ${pct}% </span>
					</div>
					<div style="font-size:11px;color:var(--t3);margin-bottom:5px"> ${fmt(b.spent)} de ${fmt(b.limit)} </div>
					<div class="progress"> <div class="progress-fill" style="width:${pct}%;background:${col}"> </div> </div>
				</div>
			`;
		}).join('');
	}
	//  Budget full detail 
	function renderBudgetDetail() {
		const el = document.getElementById('budget-detail');
		const empty = document.getElementById('budget-empty');
		const bgs = Storage.Budgets.withSpent();

		const totalLimit = bgs.reduce((s, b) => s + Number(b.limit), 0);
		const totalSpent = bgs.reduce((s, b) => s + Number(b.spent), 0);
		setText('bgt-total', fmt(totalLimit));
		setText('bgt-spent', fmt(totalSpent));
		setText('bgt-avail', fmt(totalLimit - totalSpent));

		if (!bgs.length) { if (el) el.innerHTML = ''; if (empty) empty.style.display = ''; return; }
		if (empty) empty.style.display = 'none';

		el.innerHTML = bgs.map(b => {
			const pct = b.limit > 0 ? Math.min(Math.round((b.spent / b.limit) * 100), 100) : 0;
			const remaining = b.limit - b.spent;
			const col = pctColor(pct);
			return `
				<div class="budget-row" style="padding:14px 0;border-bottom:1px solid var(--bd)">
					<div class="budget-header-row">
						<span class="budget-name" style="font-size:13px"> ${b.icon || '📌'} ${esc(b.category)} </span>
						<span style="display:flex;gap:8px;align-items:center">
							<span style="font-size:12px;color:${col};font-weight:600"> ${remaining >= 0 ? 'Quedan ' + fmt(remaining) : 'Pasado ' + fmt(-remaining)} </span>
							<button class="tbl-btn" onclick="App.editBudget(${b.id})" style="display:flex;align-items:center;gap:3px"> ✏ Editar </button>
							<button class="tbl-btn danger" onclick="App.deleteBudget(${b.id})" style="display:flex;align-items:center;gap:3px"> 🗑 Eliminar </button>
						</span>
					</div>
					<div class="progress" style="height:8px;margin-top:8px">
						<div class="progress-fill" style="width:${pct}%;background:${col}"> </div>
					</div>
					<div style="display:flex;justify-content:space-between;margin-top:4px">
						<span style="font-size:11px;color:var(--t3)"> ${fmt(b.spent)} gastado de ${fmt(b.limit)} </span>
						<span style="font-size:11px;font-weight:600;color:${col}"> ${pct}% </span>
					</div>
				</div>
			`;
		}).join('');
	}
	//  Savings view 
	function renderSavings() {
		const txs = Storage.Transactions.all();
		const allIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount), 0);
		const totalSaved = txs.filter(t => t.type === 'expense' && t.category === 'Ahorro').reduce((s, t) => s + Math.abs(t.amount), 0);

		const savBudget = Storage.Budgets.withSpent().find(b => b.category === 'Ahorro');
		setText('sav-total', fmt(totalSaved));
		setText('sav-goal', savBudget ? fmt(savBudget.limit) : 'Sin meta');
		const rate = allIncome > 0 ? Math.round((totalSaved / allIncome) * 100) : 0;
		setText('sav-rate', rate + '%');
		// Show chart section whenever there are any transactions (chart compares income/expense/saving)
		const chartSection = document.getElementById('savings-chart-section');
		if (chartSection) chartSection.style.display = txs.length ? '' : 'none';
		// Savings transactions list
		const filtered = txs.filter(t => t.category === 'Ahorro');
		const el = document.getElementById('savings-txs');
		const empty = document.getElementById('savings-empty');
		if (!filtered.length) { if (el) el.innerHTML = ''; if (empty) empty.style.display = ''; return; }
		if (empty) empty.style.display = 'none';
		el.innerHTML = `
			<table class="data-table">
				<thead>
					<tr>
						<th> Fecha </th>
						<th> Descripción </th>
						<th> Cuenta </th>
						<th> Monto </th>
					</tr>
				</thead>
				<tbody>${filtered.map(tx => `
						<tr>
							<td> ${tx.date} </td>
							<td> ${esc(tx.description)} </td>
							<td style="color:var(--t2)"> ${esc(tx.account || '')} </td>
							<td> ${fmtSigned(tx.amount, tx.type)} </td>
						</tr>
					`).join('')}
				</tbody>
			</table>
		`;
	}
	//  Alerts (dashboard mini) 
	function renderAlertsDash() {
		const el = document.getElementById('alerts-dash');
		const nbadge = document.getElementById('nbadge');
		const ndot = document.getElementById('notif-dot');
		if (!el) return;
		// E: computeAlerts already filters out read alerts (done in storage.js)
		const alerts = Storage.computeAlerts();
		const critical = alerts.filter(a => a.type === 'danger' || a.type === 'warn').length;
		if (nbadge) nbadge.style.display = critical ? '' : 'none';
		if (ndot) ndot.style.display = critical ? '' : 'none';
		el.innerHTML = alerts.slice(0, 3).map(a => `
				<div class="alert-item ${a.type}">
					<div class="alert-icon"> ${a.icon} </div>
					<div class="alert-content"> 
						<div class="alert-title"> ${a.title} </div>
						<div class="alert-body"> ${a.body} </div> 
					</div>
				</div>
			`).join('');
	}
	//  Alerts full 
	function renderAlertsFull() {
		const el = document.getElementById('alerts-full');
		const badge = document.getElementById('alerts-badge');
		if (!el) return;
		// E: computeAlerts already filters out read alerts
		const alerts = Storage.computeAlerts();
		const critical = alerts.filter(a => a.type === 'danger' || a.type === 'warn').length;
		if (badge) { badge.textContent = critical + ' alertas'; badge.style.display = critical ? '' : 'none'; }
		if (!alerts.length) {
			el.innerHTML = `
				<div class="alert-item success" style="padding:16px">
					<div class="alert-icon" style="font-size:20px"> ✅ </div>
					<div class="alert-content" style="flex:1">
						<div class="alert-title" style="font-size:13px"> ¡Todo en orden! </div>
						<div class="alert-body" style="margin-top:4px"> No tienes alertas pendientes. </div>
					</div>
				</div>
			`;
			return;
		}
		el.innerHTML = alerts.map(a => `
				<div class="alert-item ${a.type}" style="padding:16px;margin-bottom:8px">
					<div class="alert-icon" style="font-size:20px"> ${a.icon} </div>
					<div class="alert-content" style="flex:1">
						<div class="alert-title" style="font-size:13px"> ${a.title} </div>
						<div class="alert-body" style="margin-top:4px"> ${a.body} </div>
					</div>
					<!-- E: Mark as read button -->
					<button class="alert-read-btn" onclick="markAlertRead('${a._id}')" title="Marcar como leída" style="display:flex;align-items:center;gap:4px;white-space:nowrap"> ✓ Leída </button>
				</div>
			`).join('');
	}
	//  Report — Resumen mensual 
	function renderReportResumen() {
		const el = document.getElementById('report-resumen-table');
		const prd = document.getElementById('rpt-period');
		if (!el) return;
		const monthly = Storage.Transactions.monthly(3);
		if (prd) prd.textContent = monthly.map(m => m.label).join(' — ');

		const txs = Storage.Transactions.all();
		const cats = [...new Set(txs.map(t => t.category))];
		const now = new Date();
		const months = Array.from({ length: 3 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - 2 + i); return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('es', { month: 'short', year: 'numeric' }) }; });

		const sum = (key, type, cat) => txs.filter(t => t.type === type && t.category === cat && t.date?.startsWith(key)).reduce((s, t) => s + Math.abs(t.amount), 0);
		const totInc = (key) => txs.filter(t => t.type === 'income' && t.date?.startsWith(key)).reduce((s, t) => s + Math.abs(t.amount), 0);
		const totExp = (key) => txs.filter(t => t.type === 'expense' && t.date?.startsWith(key)).reduce((s, t) => s + Math.abs(t.amount), 0);

		el.innerHTML = `
			<table class="report-table
				<thead>
					<tr>
						<th> Concepto </th> ${months.map(m => `<th> ${m.label} </th>`).join('')}
						<th> Total </th> 
					</tr>
				</thead>
				<tbody>
					<tr class="section-header">
						<td colspan="${months.length + 2}"> INGRESOS </td>
					</tr>
					${cats.filter(c => txs.some(t => t.category === c && t.type === 'income')).map(c => {
						const vals = months.map(m => sum(m.key, 'income', c));
						return `
							<tr>
								<td class="indent"> ${esc(c)} </td> ${vals.map(v => `<td> ${fmt(v)} </td>`).join('')}
								<td> ${fmt(vals.reduce((s, v) => s + v, 0))} </td>
							</tr>`;
						}).join('')}
					<tr class="subtotal"> 
						<td> Total ingresos </td> ${months.map(m => `<td> ${fmt(totInc(m.key))} </td>`).join('')}
						<td> ${fmt(months.reduce((s, m) => s + totInc(m.key), 0))} </td>
					</tr>
					<tr class="section-header">
						<td colspan="${months.length + 2}"> GASTOS </td>
					</tr> 
					${cats.filter(c => txs.some(t => t.category === c && t.type === 'expense')).map(c => {
						const vals = months.map(m => sum(m.key, 'expense', c));
						return `
							<tr>
								<td class="indent"> ${esc(c)} </td> ${vals.map(v => `<td> ${fmt(v)} </td>`).join('')}
								<td> ${fmt(vals.reduce((s, v) => s + v, 0))} </td>
							</tr>`;
						}).join('')}
					<tr class="subtotal"> 
						<td> Total gastos </td> ${months.map(m => `<td> ${fmt(totExp(m.key))} </td>`).join('')}
						<td> ${fmt(months.reduce((s, m) => s + totExp(m.key), 0))} </td>
					</tr>
					<tr class="total-row">
						<td> BALANCE </td> ${months.map(m => `<td class="${totInc(m.key) - totExp(m.key) >= 0 ? 'green' : 'red'}"> ${fmt(totInc(m.key) - totExp(m.key))} </td>`).join('')}
						<td class="green"> ${fmt(months.reduce((s, m) => s + totInc(m.key) - totExp(m.key), 0))} </td>
					</tr>
				</tbody>
			</table>}
		`;
	}
	//  Report — Category table 
	function renderCatTable() {
		const el = document.getElementById('cat-table');
		const prd = document.getElementById('rpt-period-2');
		if (!el) return;
		const now = new Date();
		const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
		if (prd) prd.textContent = now.toLocaleDateString('es', { month: 'long', year: 'numeric' });
		const entries = Storage.Transactions.byCategory();
		if (!entries.length) { el.innerHTML = '<p style="color:var(--t3);text-align:center;padding:20px">Sin gastos este mes</p>'; return; }
		const total = entries.reduce((s, e) => s + e[1], 0);
		el.innerHTML = `
			<table class="report-table">
				<thead>
					<tr>
						<th> Categoría </th>
						<th> Monto </th>
						<th> % del total </th>
					</tr> 
				</thead>
				<tbody> ${entries.map(([cat, amt]) => `
					<tr>
						<td> ${esc(cat)} </td>
						<td> ${fmt(amt)} </td>
						<td style="color:var(--t2)"> ${total > 0 ? Math.round((amt / total) * 100) : 0}% </td>
					</tr>`).join('')}
					<tr class="total-row">
						<td> Total gastos </td>
						<td class="red"> ${fmt(total)} </td>
						<td> 100% </td>
					</tr>
				</tbody>
			</table>
		`;
	}
	//  Report — Historial 
	function renderHistorial() {
		const tbody = document.getElementById('historial-body');
		if (!tbody) return;
		const txs = Storage.Transactions.all();
		if (!txs.length) { tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--t3);padding:24px">Sin movimientos</td></tr>`; return; }
		tbody.innerHTML = txs.map(tx => `
				<tr>
					<td> ${tx.date} </td>
					<td> ${esc(tx.description)} </td>
					<td> <span class="pill pill-blue">${esc(tx.category)} </span> </td>
					<td> ${pill(tx.type)} </td>
					<td> ${fmtSigned(tx.amount, tx.type)} </td>
				</tr>
			`).join('');
	}

	return {
		fmt, esc, setText,
		updateKPIs,
		renderTxDash, renderMovimientos,
		renderBudgetDash, renderBudgetDetail,
		renderSavings,
		renderAlertsDash, renderAlertsFull,
		renderReportResumen, renderCatTable, renderHistorial,
	};
})();