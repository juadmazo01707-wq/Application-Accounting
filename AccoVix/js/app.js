// AccoVix — App Controller

//  SESSION & BOOTSTRAP
let SESSION = null;

function logout() {
	sessionStorage.removeItem('iq_session');
	window.location = '../AccoVix/html/login.html';
}

function bootstrap() {
	SESSION = Storage.getSession();
	if (!SESSION) { window.location = '../AccoVix/html/login.html'; return; }

	// Fill user info
	document.getElementById('user-name').textContent = SESSION.name;
	document.getElementById('user-avatar').textContent = (SESSION.name || '?')[0].toUpperCase();

	// Init default month filter
	const now = new Date();
	const monthInput = document.getElementById('f-filter-month');
	if (monthInput) monthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

	showView('inicio', document.querySelector('.nav-item'));
}

//  NAVIGATION
const PAGE_TITLES = {
	inicio: 'Inicio', movimientos: 'Movimientos', presupuesto: 'Presupuesto',
	ahorro: 'Ahorro', reportes: 'Reportes', alertas: 'Alertas', calculadora: 'Calculadora'
};

const _inited = {};

function showView(id, navEl) {
	// Swap active view
	document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
	const target = document.getElementById('view-' + id);
	if (target) target.classList.add('active');

	// Nav highlight
	document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
	if (navEl) {
		navEl.classList.add('active');
	} else {
		document.querySelectorAll('.nav-item').forEach(n => {
			if (n.getAttribute('onclick')?.includes(`'${id}'`)) n.classList.add('active');
		});
	}

	document.getElementById('page-title').textContent = PAGE_TITLES[id] || id;
	// Always refresh data on visit
	_refreshView(id);
	_inited[id] = true;
	// Close sidebar on mobile
	if (window.innerWidth < 960) document.getElementById('sidebar')?.classList.remove('open');
}

function _refreshView(id) {
	switch (id) {
		case 'inicio':
			UI.updateKPIs();
			UI.renderTxDash();
			UI.renderBudgetDash();
			UI.renderAlertsDash();
			Charts.initSparklines();
			setTimeout(() => { Charts.cashflow('cashflowChart'); Charts.donut('donutChart'); }, 30);
			break;

		case 'movimientos':
			_populateCatFilter();
			renderMovimientos();
			break;

		case 'presupuesto':
			UI.renderBudgetDetail();
			setTimeout(() => Charts.budgetCompare('budgetChart'), 30);
			break;

		case 'ahorro':
			UI.renderSavings();
			// Show chart whenever there are transactions (comparison makes sense even without savings)
			setTimeout(() => {
				const hasTxs = Storage.Transactions.all().length > 0;
				const chartSection = document.getElementById('savings-chart-section');
				if (hasTxs) {
					if (chartSection) chartSection.style.display = '';
					Charts.savings('savingsChart');
				} else {
					if (chartSection) chartSection.style.display = 'none';
				}
			}, 30);
			break;

		case 'reportes':
			UI.renderReportResumen();
			break;

		case 'alertas':
			UI.renderAlertsFull();
			_refreshAlertBadges();
			break;

		case 'calculadora':
			Calc.init();
			break;
	}
}

function _refreshAlertBadges() {
	const alerts = Storage.computeAlerts();
	const critical = alerts.filter(a => a.type === 'danger' || a.type === 'warn').length;
	const dot = document.getElementById('notif-dot');
	const nbdg = document.getElementById('nbadge');
	if (dot) dot.style.display = critical ? '' : 'none';
	if (nbdg) nbdg.style.display = critical ? '' : 'none';
}

//  MOVIMIENTOS VIEW
function _populateCatFilter() {
	const sel = document.getElementById('f-filter-cat');
	if (!sel || sel.options.length > 1) return;
	Storage.Categories.all().forEach(c => sel.add(new Option(c, c)));
}

function renderMovimientos() {
	let txs = Storage.Transactions.all();
	const type = document.getElementById('f-filter-type')?.value;
	const cat = document.getElementById('f-filter-cat')?.value;
	const month = document.getElementById('f-filter-month')?.value;
	if (type) txs = txs.filter(t => t.type === type);
	if (cat) txs = txs.filter(t => t.category === cat);
	if (month) txs = txs.filter(t => t.date?.startsWith(month));
	UI.renderMovimientos(txs);
}

//  REPORT SUB-TABS
function switchReport(id, btn) {
	document.querySelectorAll('.report-section').forEach(s => s.style.display = 'none');
	document.querySelectorAll('.rtab').forEach(b => b.classList.remove('active'));
	const el = document.getElementById('report-' + id);
	if (el) el.style.display = '';
	if (btn) btn.classList.add('active');

	if (id === 'resumen') UI.renderReportResumen();
	if (id === 'categorias') { UI.renderCatTable(); setTimeout(() => Charts.categoryBar('catBarChart'), 30); }
	if (id === 'historial') UI.renderHistorial();
}

//  MODAL ENGINE
let _editId = null;
let _editType = null;

function openModal(type, data = null) {
	_editId = data ? data.id : null;
	_editType = type;
	const cfg = _getModalConfig(type, data);
	if (!cfg) return;
	document.getElementById('modal-title').textContent = cfg.title;
	document.getElementById('modal-body').innerHTML = cfg.html;
	document.getElementById('modal-overlay').classList.add('open');
	setTimeout(() => document.querySelector('#modal-body .form-input')?.focus(), 80);
}

function closeModal() {
	document.getElementById('modal-overlay').classList.remove('open');
	_editId = _editType = null;
}

function _getModalConfig(type, data) {
	const cats = Storage.Categories.all();
	const accounts = Storage.Accounts.all();
	const today = new Date().toISOString().slice(0, 10);
	const isEdit = !!data;
	// 3: Iconos de ingreso primero, luego gastos
	const iconOptions = [
		['📈', 'Ingreso'], ['💼', 'Trabajo'], ['💰', 'Otro ingreso'], ['💻', 'Freelance'],
		['🛒', 'Supermercado'], ['🍽️', 'Restaurante'], ['⛽', 'Gasolina'], ['🚗', 'Transporte'],
		['🏠', 'Hogar'], ['💊', 'Salud'], ['📺', 'Suscripciones'],
		['🎮', 'Entretenimiento'], ['👕', 'Ropa'], ['📚', 'Educación'], ['🐷', 'Ahorro'], ['💸', 'Gasto general'],
	];
	// 3: Categorías de ingreso al inicio
	const INCOME_CATS = ['Salario', 'Ingresos extra', 'Freelance'];
	const sortedCats = [
		...INCOME_CATS.filter(c => cats.includes(c)),
		...cats.filter(c => !INCOME_CATS.includes(c)),
	];

	const configs = {
		// TRANSACTION 
		// 3: Tipo por defecto → Ingreso en nuevos movimientos
		transaction: {
			title: isEdit ? 'Editar movimiento' : 'Nuevo movimiento',
			html: (() => {
				const defaultType = isEdit ? (data?.type || 'income') : 'income';
				const expClass = defaultType === 'expense' ? 'active-expense' : '';
				const incClass = defaultType !== 'expense' ? 'active-income' : '';
				return `
					<div class="type-selector">
						<button type="button" class="type-btn ${incClass}" id="btn-income" onclick="selectType('income')"> <span> 📈 </span> Ingreso </button>
						<button type="button" class="type-btn ${expClass}" id="btn-expense" onclick="selectType('expense')"> <span> 💸 </span> Gasto </button>
					</div>
					<input type="hidden" id="f-type" value="${defaultType}"/>
					<div class="form-group">
						<label class="form-label"> ¿Cuánto? </label>
						<div style="position:relative">
							<span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--t3);font-size:16px"> $ </span>
							<input class="form-input" id="f-amount" type="text" inputmode="numeric" placeholder="0" value="${Math.abs(data?.amount || '') ? _fmtAmountDisplay(String(Math.abs(data?.amount || ''))) : ''}" data-raw="${Math.abs(data?.amount || '')}" oninput="formatAmountInput(this)" style="padding-left:28px;font-size:18px;font-weight:600"/>
						</div>
					</div>
					<div class="form-group">
						<label class="form-label"> ¿En qué? </label>
						<input class="form-input" id="f-desc" type="text" placeholder="Describe el movimiento…" value="${UI.esc(data?.description || '')}"/>
					</div>
					<div class="form-row">
						<div class="form-group">
							<label class="form-label"> Categoría </label>
							<select class="form-select" id="f-cat"> ${sortedCats.map(c => `<option ${data?.category === c ? 'selected' : ''}>${UI.esc(c)} </option>`).join('')} </select>
						</div>
						<div class="form-group">
							<label class="form-label"> Fecha </label>
							<input class="form-input" id="f-date" type="date" value="${data?.date || today}"/>
						</div>
					</div>
					<div class="form-row">
						<div class="form-group">
							<label class="form-label">Ícono</label>
							<select class="form-select" id="f-icon">
							${iconOptions.map(([ico, lbl]) => `<option value="${ico}" ${data?.icon === ico ? 'selected' : ''}>${ico} ${lbl}</option>`).join('')}
							</select>
						</div>
						<div class="form-group">
							<label class="form-label"> Cuenta </label>
							<select class="form-select" id="f-account"> ${accounts.map(a => `<option ${data?.account === a.name ? 'selected' : ''}> ${UI.esc(a.name)} </option>`).join('')} </select>
						</div>
					</div>
					<div class="form-group">
						<label class="form-label"> Nota (opcional) </label>
						<input class="form-input" id="f-notes" type="text" placeholder="Referencia, detalle…" value="${UI.esc(data?.notes || '')}"/>
					</div>
					<div class="modal-footer">
						<button class="btn-outline" onclick="closeModal()"> Cancelar </button>
						<button class="btn-primary" onclick="App.saveTx()"> 💾 ${isEdit ? 'Actualizar' : 'Guardar'} </button>
					</div>
				`;})(),
		},
		// BUDGET 
		// 4: Orden cambiado → 1 Monto, 2 Categoría + formato de monto con máscara
		budget: {
			title: isEdit ? 'Editar presupuesto' : 'Nuevo presupuesto',
			html: `
				<div class="form-group">
					<label class="form-label"> Monto límite mensual </label>
					<div style="position:relative">
						<span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--t3);font-size:16px"> $ </span>
						<input class="form-input" id="f-blimit" type="text" inputmode="numeric" placeholder="0" value="${data?.limit ? _fmtAmountDisplay(String(data.limit)) : ''}" data-raw="${data?.limit || ''}" oninput="formatAmountInput(this)" style="padding-left:28px;font-size:18px;font-weight:600"/>
					</div>
				</div>
				<div class="form-group">
					<label class="form-label"> Categoría </label>
					<select class="form-select" id="f-bcat"> ${sortedCats.map(c => `<option ${data?.category === c ? 'selected' : ''}>${UI.esc(c)} </option>`).join('')} </select>
				</div>
				<div class="form-group">
					<label class="form-label"> Ícono </label>
					<select class="form-select" id="f-bicon"> ${iconOptions.map(([ico, lbl]) => `<option value="${ico}" ${data?.icon === ico ? 'selected' : ''}>${ico} ${lbl} </option>`).join('')} </select>
				</div>
				<div class="modal-footer">
					<button class="btn-outline" onclick="closeModal()"> Cancelar </button>
					<button class="btn-primary" onclick="App.saveBudget()"> 💾 ${isEdit ? 'Actualizar' : 'Crear límite'} </button>
				</div>
			`,
		},
		// SETTINGS
		settings: {
			title: 'Mi configuración',
			html: `
				<div class="form-group">
					<label class="form-label"> Mi nombre </label>
					<input class="form-input" id="f-sname" type="text" value="${UI.esc(SESSION.name || '')}"/>
				</div>
				<hr style="border:none;border-top:1px solid var(--bd);margin:16px 0"/>
				<div class="form-group">
					<label class="form-label"> Mis cuentas / bolsillos </label>
					<div id="accounts-list" style="margin-bottom:10px"> ${Storage.Accounts.all().map(a => `
						<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--bd);font-size:13px">
							<span> 💳 ${UI.esc(a.name)} </span>
							<button class="tbl-btn danger" onclick="App.removeAccount(${a.id})" style="padding:4px 10px"> 🗑 Eliminar </button>
						</div>`).join('')}
					</div>
					<div style="display:flex;gap:8px">
						<input class="form-input" id="f-newaccount" type="text" placeholder="Ej: Ahorros, Efectivo, Nequi…"/>
						<button class="btn-outline" onclick="App.addAccount()"> + Agregar </button>
					</div>
				</div>
				<hr style="border:none;border-top:1px solid var(--bd);margin:16px 0"/>
				<div class="form-group">
					<label class="form-label">Mis categorías</label>
					<div id="cats-list" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px"> ${Storage.Categories.all().map(c => `
						<span style="background:var(--bg3);border:1px solid var(--bd2);border-radius:20px;padding:3px 10px;font-size:12px;display:inline-flex;align-items:center;gap:4px"> ${UI.esc(c)}
							<button onclick="App.removeCat('${UI.esc(c)}')" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:13px;line-height:1" title="Eliminar"> ✕ </button>
						</span>`).join('')}
					</div>
					<div style="display:flex;gap:8px">
						<input class="form-input" id="f-newcat" type="text" placeholder="Ej: Mascotas, Gimnasio…"/>
						<button class="btn-outline" onclick="App.addCat()"> + Agregar </button>
					</div>
				</div>
				<div class="modal-footer" style="margin-top:16px">
					<button class="btn-outline" onclick="closeModal()"> ✕ Cerrar </button>
					<button class="btn-primary" onclick="App.saveSettings()"> 💾 Guardar </button>
				</div>
			`,
		},
	};
	return configs[type] || null;
}

// Helper: toggle income/expense type selector in modal
function selectType(type) {
	document.getElementById('f-type').value = type;
	document.getElementById('btn-expense').className = 'type-btn' + (type === 'expense' ? ' active-expense' : '');
	document.getElementById('btn-income').className = 'type-btn' + (type === 'income' ? ' active-income' : '');
}

//  CRUD OPERATIONS

/** Format any digit string with dots every 3 digits: "1500000" → "1.500.000" */
function _fmtAmountDisplay(raw) {
	if (!raw || raw === '') return '';
	const parts = String(raw).split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	return parts.length > 1 ? parts[0] + ',' + parts[1] : parts[0];
}

/** Called on every keystroke in the amount field */
function formatAmountInput(input) {
	// 1. Remove ALL dots (thousand separators added by display) and commas first, then re-extract only digits and the decimal comma if present.
	const raw = input.value;
	// Split on comma (decimal separator in display)
	const commaParts = raw.split(',');
	// Integer part: strip every dot (they are thousand separators, not decimal)
	const intDigits = commaParts[0].replace(/\./g, '').replace(/[^0-9]/g, '');
	// Decimal part (if user typed a comma): keep only digits
	const decDigits = commaParts.length > 1 ? commaParts[1].replace(/[^0-9]/g, '') : undefined;
	// 2. Build clean numeric string for data-raw
	const cleanRaw = decDigits !== undefined ? intDigits + '.' + decDigits : intDigits;
	// 3. Strip leading zeros (but allow "0." for decimals like 0,50)
	const intNormalized = intDigits.replace(/^0+(\d)/, '$1') || (intDigits === '' ? '' : '0');
	// 4. Store clean value in data-raw
	input.dataset.raw = decDigits !== undefined ? intNormalized + '.' + decDigits : intNormalized;
	// 5. Build display with dots every 3 digits on the integer part
	const intFormatted = intNormalized.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	// 6. Set display value
	if (decDigits !== undefined) {
		input.value = intFormatted + ',' + decDigits;
	} else {
		input.value = intFormatted;
	}
}

const App = {
	// Transactions 
	saveTx() {
		// D: amount is stored in data-raw (raw numeric string) to avoid parsing formatted display value
		const amountInput = document.getElementById('f-amount');
		const rawVal = amountInput?.dataset?.raw ?? amountInput?.value ?? '';
		const amount = parseFloat(rawVal || 0);
		const desc = document.getElementById('f-desc')?.value?.trim();
		const type = document.getElementById('f-type')?.value || 'expense';
		if (!desc) { showToast('Describe el movimiento', 'error'); return; }
		if (amount <= 0) { showToast('Ingresa un monto mayor a 0', 'error'); return; }

		const tx = {
			type, description: desc,
			amount: Math.abs(amount),
			category: document.getElementById('f-cat')?.value || '',
			date: document.getElementById('f-date')?.value || new Date().toISOString().slice(0, 10),
			icon: document.getElementById('f-icon')?.value || (type === 'income' ? '📈' : '💸'),
			account: document.getElementById('f-account')?.value || '',
			notes: document.getElementById('f-notes')?.value || '',
		};

		if (_editId) { Storage.Transactions.update(_editId, tx); showToast('Movimiento actualizado ✓', 'success'); }
		else { Storage.Transactions.add(tx); showToast('Movimiento guardado ✓', 'success'); }

		closeModal();
		// Refresh any open view
		_refreshView('inicio');
		if (_inited['movimientos']) renderMovimientos();
		if (_inited['presupuesto']) _refreshView('presupuesto');
		if (_inited['ahorro']) _refreshView('ahorro');
	},

	editTx(id) {
		const tx = Storage.Transactions.all().find(t => t.id == id);
		if (tx) openModal('transaction', tx);
	},

	deleteTx(id) {
		if (!confirm('¿Eliminar este movimiento?')) return;
		Storage.Transactions.remove(id);
		showToast('Movimiento eliminado', 'info');
		renderMovimientos();
		_refreshView('inicio');
	},

	//  Budgets 
	saveBudget() {
		const cat = document.getElementById('f-bcat')?.value?.trim();
		// 4: read from data-raw (formatted input) same as saveTx
		const limitInput = document.getElementById('f-blimit');
		const limitRaw = limitInput?.dataset?.raw ?? limitInput?.value ?? '';
		const limit = parseFloat(limitRaw || 0);
		if (!cat) { showToast('Selecciona una categoría', 'error'); return; }
		if (limit <= 0) { showToast('Ingresa un límite mayor a 0', 'error'); return; }

		const b = { category: cat, limit, icon: document.getElementById('f-bicon')?.value?.trim() || '📌' };

		if (_editId) { Storage.Budgets.update(_editId, b); showToast('Presupuesto actualizado ✓', 'success'); }
		else { Storage.Budgets.add(b); showToast('Presupuesto creado ✓', 'success'); }

		closeModal();
		_refreshView('presupuesto');
		if (_inited['inicio']) _refreshView('inicio');
	},

	editBudget(id) {
		const b = Storage.Budgets.all().find(x => x.id == id);
		if (b) openModal('budget', b);
	},

	deleteBudget(id) {
		if (!confirm('¿Eliminar este presupuesto?')) return;
		Storage.Budgets.remove(id);
		showToast('Presupuesto eliminado', 'info');
		_refreshView('presupuesto');
		if (_inited['inicio']) _refreshView('inicio');
	},

	//  Settings 
	saveSettings() {
		const name = document.getElementById('f-sname')?.value?.trim();
		if (!name) { showToast('Ingresa tu nombre', 'error'); return; }

		// Update in localStorage
		const accounts = JSON.parse(localStorage.getItem('iq_accounts') || '[]');
		const idx = accounts.findIndex(a => a.id == SESSION.id);
		if (idx >= 0) { accounts[idx].name = name; localStorage.setItem('iq_accounts', JSON.stringify(accounts)); }

		SESSION.name = name;
		sessionStorage.setItem('iq_session', JSON.stringify(SESSION));
		document.getElementById('user-name').textContent = name;
		document.getElementById('user-avatar').textContent = name[0].toUpperCase();

		closeModal();
		showToast('Cambios guardados ✓', 'success');
	},

	addAccount() {
		const input = document.getElementById('f-newaccount');
		const val = input?.value?.trim();
		if (!val) { showToast('Escribe el nombre de la cuenta', 'error'); return; }
		Storage.Accounts.add({ name: val, type: 'checking', balance: 0 });
		input.value = '';
		_reloadAccountList();
		showToast('Cuenta agregada ✓', 'success');
	},

	removeAccount(id) {
		if (!Storage.Accounts.remove(id)) { showToast('Debe quedar al menos una cuenta', 'warn'); return; }
		_reloadAccountList();
	},

	addCat() {
		const input = document.getElementById('f-newcat');
		const val = input?.value?.trim();
		if (!val) { showToast('Escribe el nombre de la categoría', 'error'); return; }
		Storage.Categories.add(val);
		input.value = '';
		_reloadCatList();
		showToast('Categoría agregada ✓', 'success');
	},

	removeCat(cat) {
		Storage.Categories.remove(cat);
		_reloadCatList();
	},
};

function _reloadAccountList() {
	const el = document.getElementById('accounts-list');
	if (!el) return;
	el.innerHTML = Storage.Accounts.all().map(a => `
			<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--bd);font-size:13px">
				<span> 💳 ${UI.esc(a.name)} </span>
				<button class="tbl-btn danger" onclick="App.removeAccount(${a.id})" style="padding:4px 10px;display:flex;align-items:center;gap:4px"> 🗑 Eliminar </button>
			</div>
		`).join('');
}

function _reloadCatList() {
	const el = document.getElementById('cats-list');
	if (!el) return;
	el.innerHTML = Storage.Categories.all().map(c => `
			<span style="background:var(--bg3);border:1px solid var(--bd2);border-radius:20px;padding:3px 10px;font-size:12px;display:inline-flex;align-items:center;gap:4px"> ${UI.esc(c)}
				<button onclick="App.removeCat('${UI.esc(c)}')" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:13px;line-height:1"> ✕ </button>
			</span>
		`).join('');
}

//  SEARCH
function onSearch(q) {
	if (!q.trim()) return;
	showView('movimientos', null);
	const txs = Storage.Transactions.all().filter(t =>
		t.description?.toLowerCase().includes(q.toLowerCase()) ||
		t.category?.toLowerCase().includes(q.toLowerCase())
	);
	UI.renderMovimientos(txs);
}

//  C: EXPORT PDF
function exportPDF() {
	const txs = Storage.Transactions.all();
	if (!txs.length) { showToast('No hay movimientos para exportar', 'warn'); return; }

	const { jsPDF } = window.jspdf;
	const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
	//  Header 
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(16);
	doc.text('AccoVix — Movimientos', 14, 16);

	doc.setFont('helvetica', 'normal');
	doc.setFontSize(9);
	doc.setTextColor(120);
	doc.text(`Exportado el ${new Date().toLocaleDateString('es-CO')}`, 14, 22);
	doc.setTextColor(0);
	//  Column definitions 
	const cols = ['Fecha', 'Descripción', 'Categoría', 'Cuenta', 'Tipo', 'Monto'];
	const colWidths = [22, 80, 38, 38, 22, 32]; // mm, total ≈ 232 (A4 landscape ~277mm usable)
	const startX = 14;
	let y = 30;
	const rowH = 7;
	// Draw header row
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(8);
	doc.setFillColor(30, 45, 69);    // --bd2 dark blue
	doc.setTextColor(230, 237, 248); // --t1 light
	let x = startX;
	cols.forEach((col, i) => {
		doc.rect(x, y, colWidths[i], rowH, 'F');
		doc.text(col, x + 2, y + 4.5);
		x += colWidths[i];
	});
	doc.setTextColor(0);
	// Draw data rows
	doc.setFont('helvetica', 'normal');
	doc.setFontSize(7.5);
	let rowNum = 0;
	txs.forEach(t => {
		y += rowH;
		// Page break if needed
		if (y > 190) {
			doc.addPage();
			y = 14;
		}
		// Alternating row background
		if (rowNum % 2 === 0) {
			doc.setFillColor(245, 247, 252);
			doc.rect(startX, y, colWidths.reduce((s, w) => s + w, 0), rowH, 'F');
		}
		const isIncome = t.type === 'income';
		const monto = (isIncome ? '+' : '-') + '$' + Math.abs(t.amount).toLocaleString('es-CO');
		const cells = [
			t.date || '',
			(t.description || '').slice(0, 50),
			t.category || '',
			t.account || '',
			isIncome ? 'Ingreso' : 'Gasto',
			monto,
		];
		x = startX;
		cells.forEach((cell, i) => {
			// Color monto column
			if (i === 5) doc.setTextColor(isIncome ? 0x22 : 0xe8, isIncome ? 0xc9 : 0x63, isIncome ? 0x8a : 0x4f);
			doc.text(String(cell), x + 2, y + 4.5, { maxWidth: colWidths[i] - 4 });
			doc.setTextColor(0);
			x += colWidths[i];
		});
		// Bottom border per row
		doc.setDrawColor(200, 210, 220);
		doc.line(startX, y + rowH, startX + colWidths.reduce((s, w) => s + w, 0), y + rowH);
		rowNum++;
	});

	doc.save('movimientos_accovix.pdf');
	showToast('PDF exportado ✓', 'success');
}

//  TOAST
let _toastT;
function showToast(msg, type = 'info') {
	const icons = { success: '✓', error: '✕', info: 'i', warn: '⚠' };
	const el = document.getElementById('toast');
	el.innerHTML = `<span>${icons[type] || ''}</span> ${msg}`;
	el.className = `toast ${type} show`;
	clearTimeout(_toastT);
	_toastT = setTimeout(() => el.classList.remove('show'), 3000);
}

//  MISC
function toggleSidebar() { document.getElementById('sidebar')?.classList.toggle('open'); }

//  E: Mark alert as read 
function markAlertRead(alertId) {
	Storage.ReadAlerts.markRead(alertId);
	// 6: Actualizar dashboard, vista completa Y badges del sidebar/topbar
	UI.renderAlertsDash();
	_refreshAlertBadges();
	if (document.getElementById('view-alertas')?.classList.contains('active')) {
		UI.renderAlertsFull();
	}
	showToast('✓ Alerta marcada como leída', 'info');
}

document.addEventListener('keydown', e => {
	if (e.key === 'Escape') { closeModal(); return; }
	// Teclado para calculadora — solo activo cuando su vista está visible
	if (!document.getElementById('view-calculadora')?.classList.contains('active')) return;
	const KEY_MAP = {
		'0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
		'5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
		'.': '.', '+': '+', '-': '-', '*': '×', '/': '÷',
		'(': ' (', ')': ')', '^': '^', '%': '%',
	};
	if (e.key === 'Enter') { e.preventDefault(); Calc.compute(); return; }
	if (e.key === 'Backspace') { e.preventDefault(); Calc.backspace(); return; }
	if (e.key === 'Delete') { e.preventDefault(); Calc.clear(); return; }
	const token = KEY_MAP[e.key];
	if (token) { e.preventDefault(); Calc.press(token); }
});

document.addEventListener('DOMContentLoaded', bootstrap);

//  CALCULADORA CIENTÍFICA

//  Objeto aislado — no modifica ninguna función existente.
const Calc = (() => {

	let _expr = '';
	let _result = null;
	let _history = [];
	const MAX_HISTORY = 8;
	// Mapa de display → JS evaluable
	const REPLACEMENTS = [
		[/×/g, '*'],
		[/÷/g, '/'],
		[/π/g, String(Math.PI)],
		// 'e' solo como token aislado (no dentro de nombres)
		[/(?<![a-zA-Z])e(?![a-zA-Z])/g, String(Math.E)],
		[/sqrt\(/g, 'Math.sqrt('],
		[/log\(/g, 'Math.log10('],
		[/ln\(/g, 'Math.log('],
		[/sin\(/g, 'Math.sin('],
		[/cos\(/g, 'Math.cos('],
		[/tan\(/g, 'Math.tan('],
		[/\^/g, '**'],
		[/%/g, '/100'],
	];

	function _toEval(expr) {
		let s = expr;
		REPLACEMENTS.forEach(([re, rep]) => { s = s.replace(re, rep); });
		return s;
	}

	function _formatNum(n) {
		if (!isFinite(n)) return 'Error';
		return parseFloat(n.toPrecision(12)).toLocaleString('es-CO', { maximumFractionDigits: 10 });
	}

	function _render() {
		const exprEl = document.getElementById('calc-expr');
		const resultEl = document.getElementById('calc-result');
		if (exprEl) exprEl.textContent = _expr || '';
		if (resultEl) resultEl.textContent = _result !== null ? _formatNum(_result) : (_expr || '0');
	}

	function _renderHistory() {
		const el = document.getElementById('calc-history');
		if (!el) return;
		if (!_history.length) {
			el.innerHTML = '<p class="calc-history-empty">Sin operaciones aún</p>';
			return;
		}
		el.innerHTML = [..._history].reverse().map(h => `
				<div class="calc-history-item" onclick="Calc.recallHistory(${h.result})">
					<span class="calc-history-expr"> ${h.expr} </span>
					<span class="calc-history-res"> = ${_formatNum(h.result)} </span>
				</div>
			`).join('');
	}

	return {
		init() { _render(); _renderHistory(); },

		press(token) {
			// Nuevo número después de un resultado: empieza desde cero
			if (_result !== null && /^[\d(πe]/.test(token)) {
				_expr = ''; _result = null;
			}
			// Paréntesis inteligente: abre o cierra según contexto
			if (token === '(') {
				const opens = (_expr.match(/\(/g) || []).length;
				const closes = (_expr.match(/\)/g) || []).length;
				_expr += opens > closes ? ')' : '(';
			} else {
				_expr += token;
			}
			_result = null;
			_render();
		},

		compute() {
			if (!_expr.trim()) return;
			try {
				const safe = _toEval(_expr);
				// Function() es más seguro que eval() y suficiente aquí eslint-disable-next-line no-new-func
				const result = Function('"use strict"; return (' + safe + ')')();
				if (!isFinite(result)) throw new Error('inf');
				_result = result;
				_history.push({ expr: _expr, result });
				if (_history.length > MAX_HISTORY) _history.shift();
				_renderHistory();
				_render();
			} catch {
				const el = document.getElementById('calc-result');
				if (el) el.textContent = 'Error';
				_result = null;
			}
		},

		backspace() { _expr = _expr.slice(0, -1); _result = null; _render(); },
		clear() { _expr = ''; _result = null; _render(); },
		clearHistory() { _history = []; _renderHistory(); },
		recallHistory(val) { _expr = String(val); _result = null; _render(); },

		useResult() {
			if (_result === null || !isFinite(_result)) {
				if (typeof showToast === 'function') showToast('Calcula un resultado primero', 'warn');
				return;
			}
			// 7: Abrir modal de nuevo movimiento y prellenar el monto
			if (typeof openModal === 'function') {
				openModal('transaction');
				// Dar tiempo al modal a renderizarse antes de escribir el valor
				setTimeout(() => {
					const inp = document.getElementById('f-amount');
					if (inp) {
						const absVal = String(Math.abs(Math.round(_result * 100) / 100));
						inp.dataset.raw = absVal;
						// Aplicar el formato visual con puntos de miles
						if (typeof formatAmountInput === 'function') {
							inp.value = absVal;
							formatAmountInput(inp);
						} else {
							inp.value = absVal;
						}
						inp.focus();
					}
					if (typeof showToast === 'function') showToast('Monto prellenado desde la calculadora ✓', 'success');
				}, 120);
			}
		},
	};
})();