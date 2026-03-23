// AccoVix — Storage Module

const Storage = (() => {
	// Session 
	function getSession() {
		try { return JSON.parse(sessionStorage.getItem('iq_session')); }
		catch (e) { console.warn('[AccoVix] Error leyendo sesión:', e); return null; }
	}
	function getUserId() { const s = getSession(); return s ? s.id : null; }
	// Store I/O 
	function _key() { return 'iq_data_' + getUserId(); }
	function _read() {
		try { return JSON.parse(localStorage.getItem(_key())) || _empty(); }
		catch (e) { console.warn('[AccoVix] Error leyendo store:', e); return _empty(); }
	}
	function _save(data) { localStorage.setItem(_key(), JSON.stringify(data)); }
	function _empty() {
		return {
			transactions: [],
			budgets: [],
			accounts: [{ id: 1, name: 'Cuenta principal', type: 'checking', balance: 0 }],
			categories: ['Alimentación', 'Transporte', 'Salud', 'Entretenimiento', 'Hogar', 'Ropa', 'Suscripciones', 'Ahorro', 'Otros']
		};
	}
	function _nextId(arr) {
		return arr.length ? Math.max(...arr.map(x => Number(x.id) || 0)) + 1 : 1;
	}
	// TRANSACTIONS 
	const Transactions = {
		all() { return _read().transactions; },

		add(tx) {
			const store = _read();
			tx.id = _nextId(store.transactions);
			store.transactions.unshift(tx);
			_save(store);
			return tx;
		},

		update(id, patch) {
			const store = _read();
			const i = store.transactions.findIndex(t => t.id == id);
			if (i < 0) return null;
			store.transactions[i] = { ...store.transactions[i], ...patch };
			_save(store);
			return store.transactions[i];
		},

		remove(id) {
			const store = _read();
			store.transactions = store.transactions.filter(t => t.id != id);
			_save(store);
		},
		/** Totals for the current calendar month */
		summaryThisMonth() {
			const txs = this.all();
			const now = new Date();
			const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
			const mine = txs.filter(t => t.date && t.date.startsWith(month));
			const income = mine.filter(t => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount), 0);
			const expense = mine.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
			const balance = txs.reduce((s, t) => t.type === 'income' ? s + Math.abs(t.amount) : s - Math.abs(t.amount), 0);
			return { income, expense, balance, saving: income - expense };
		},
		/** Last N months for charts */
		monthly(n = 6) {
			const txs = this.all();
			return Array.from({ length: n }, (_, i) => {
				const d = new Date();
				d.setMonth(d.getMonth() - (n - 1 - i));
				const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
				const label = d.toLocaleDateString('es', { month: 'short' });
				const inc = txs.filter(t => t.type === 'income' && t.date?.startsWith(key)).reduce((s, t) => s + Math.abs(t.amount), 0);
				const exp = txs.filter(t => t.type === 'expense' && t.date?.startsWith(key)).reduce((s, t) => s + Math.abs(t.amount), 0);
				return { label, income: inc, expense: exp, saving: inc - exp };
			});
		},
		/** Spending by category this month */
		byCategory() {
			const txs = this.all();
			const now = new Date();
			const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
			const map = {};
			txs.filter(t => t.type === 'expense' && t.date?.startsWith(month))
				.forEach(t => { map[t.category] = (map[t.category] || 0) + Math.abs(t.amount); });
			return Object.entries(map).sort((a, b) => b[1] - a[1]);
		}
	};
	// BUDGETS 
	const Budgets = {
		all() { return _read().budgets; },

		add(b) {
			const store = _read();
			b.id = _nextId(store.budgets);
			store.budgets.push(b);
			_save(store);
			return b;
		},

		update(id, patch) {
			const store = _read();
			const i = store.budgets.findIndex(x => x.id == id);
			if (i < 0) return null;
			store.budgets[i] = { ...store.budgets[i], ...patch };
			_save(store);
			return store.budgets[i];
		},

		remove(id) {
			const store = _read();
			store.budgets = store.budgets.filter(x => x.id != id);
			_save(store);
		},
		/** Enriches budgets with real spent amount from transactions */
		withSpent() {
			const txs = Transactions.all();
			const now = new Date();
			const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
			const expenses = txs.filter(t => t.type === 'expense' && t.date?.startsWith(month));
			return this.all().map(b => {
				const spent = expenses
					.filter(t => t.category === b.category)
					.reduce((s, t) => s + Math.abs(t.amount), 0);
				return { ...b, spent };
			});
		}
	};
	// ACCOUNTS 
	const Accounts = {
		all() { return _read().accounts; },

		add(a) {
			const store = _read();
			a.id = _nextId(store.accounts);
			store.accounts.push(a);
			_save(store);
			return a;
		},

		remove(id) {
			const store = _read();
			if (store.accounts.length <= 1) return false; // keep at least one
			store.accounts = store.accounts.filter(x => x.id != id);
			_save(store);
			return true;
		}
	};
	// CATEGORIES 
	const Categories = {
		all() { return _read().categories || []; },

		add(cat) {
			const store = _read();
			if (!store.categories.includes(cat)) {
				store.categories.push(cat);
				_save(store);
			}
		},

		remove(cat) {
			const store = _read();
			store.categories = store.categories.filter(c => c !== cat);
			_save(store);
		}
	};
	// ALERTS (computed, not stored) 
	function computeAlerts() {
		const alerts = [];
		const budgets = Budgets.withSpent();
		const today = new Date().toISOString().slice(0, 10);
		// Budget warnings
		budgets.forEach(b => {
			if (b.limit <= 0) return;
			const pct = (b.spent / b.limit) * 100;
			if (pct >= 100)
				alerts.push({ type: 'danger', icon: '🚨', title: `Presupuesto "${b.category}" agotado`, body: `Gastaste ${fmtAmt(b.spent)} de ${fmtAmt(b.limit)} este mes.` });
			else if (pct >= 80)
				alerts.push({ type: 'warn', icon: '⚡', title: `"${b.category}" al ${Math.round(pct)}% del límite`, body: `Solo quedan ${fmtAmt(b.limit - b.spent)} de tu presupuesto.` });
		});
		// No income this month
		const summary = Transactions.summaryThisMonth();
		if (summary.income === 0) {
			alerts.push({ type: 'info', icon: '💡', title: 'Sin ingresos registrados este mes', body: 'Recuerda registrar tu salario u otros ingresos.' });
		}
		// Monthly expense trend
		const monthly = Transactions.monthly(2);
		if (monthly.length === 2 && monthly[0].expense > 0 && monthly[1].expense > monthly[0].expense * 1.2) {
			const inc = Math.round(((monthly[1].expense / monthly[0].expense) - 1) * 100);
			alerts.push({ type: 'warn', icon: '📈', title: `Gastos subieron un ${inc}% este mes`, body: 'Tus gastos aumentaron respecto al mes anterior. Revisa el detalle por categoría.' });
		}
		// Savings goal check
		const savingsBudget = budgets.find(b => b.category === 'Ahorro');
		if (savingsBudget && savingsBudget.spent < savingsBudget.limit) {
			const pending = savingsBudget.limit - savingsBudget.spent;
			alerts.push({ type: 'info', icon: '🐷', title: `Faltan ${fmtAmt(pending)} para tu meta de ahorro`, body: '¿Ya transferiste a tu cuenta de ahorros este mes?' });
		}
		// NUEVAS ALERTAS (D) 
		// D1: Primer ingreso del mes
		if (summary.income > 0) {
			const txs = Transactions.all();
			const now = new Date();
			const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
			const incomeCount = txs.filter(t => t.type === 'income' && t.date?.startsWith(month)).length;
			if (incomeCount === 1) {
				alerts.unshift({ type: 'success', icon: '🎉', title: '¡Primer ingreso del mes registrado!', body: `Llevas ${fmtAmt(summary.income)} en ingresos este mes. ¡Buen comienzo!` });
			}
		}
		// D2: Gastos superan 150% de los ingresos del mes
		if (summary.income > 0 && summary.expense > summary.income * 1.5) {
			alerts.unshift({ type: 'danger', icon: '🚨', title: '¡Alerta! Gastos superan el 150% de tus ingresos', body: `Gastaste ${fmtAmt(summary.expense)} vs ${fmtAmt(summary.income)} de ingresos este mes. Revisa tu situación.` });
		}
		// D3: Tasa de ahorro — calculada sobre movimientos reales de categoría "Ahorro"
		const thisMonth = new Date().toISOString().slice(0, 7);
		const allTxs = Transactions.all();
		const savingsTxsThisMonth = allTxs.filter(t => t.category === 'Ahorro' && t.date?.startsWith(thisMonth));
		const totalSavedThisMonth = savingsTxsThisMonth.reduce((s, t) => s + Math.abs(t.amount), 0);

		if (summary.income > 0 && totalSavedThisMonth > 0) {
			const savingsRate = Math.round((totalSavedThisMonth / summary.income) * 100);
			if (savingsRate < 5) {
				alerts.push({ type: 'warn', icon: '💰', title: `Tasa de ahorro muy baja: ${savingsRate}%`, body: 'Intenta reservar al menos un 10% de tus ingresos mensuales.' });
			} else if (savingsRate >= 20) {
				alerts.push({ type: 'success', icon: '🏆', title: `¡Excelente tasa de ahorro! ${savingsRate}%`, body: 'Estás ahorrando más del 20% de tus ingresos. ¡Sigue así!' });
			}
		}

		// NUEVAS ALERTAS (B) 
		// B2: Gastos superan 130% de ingresos (entre 130% y 150% — el caso >150% lo cubre D2)
		if (summary.income > 0 && summary.expense > summary.income * 1.3 && summary.expense <= summary.income * 1.5) {
			alerts.unshift({
				type: 'danger', icon: '⚠️',
				title: 'Gastos superan ingresos',
				body: `Este mes has gastado ${fmtAmt(summary.expense)} mientras tus ingresos son ${fmtAmt(summary.income)}. Te faltan ${fmtAmt(summary.expense - summary.income)} para equilibrar.`,
			});
		}
		// B3a: Presupuesto sin gastos aún (aviso útil para presupuestos recién creados)
		budgets.forEach(b => {
			if (b.spent === 0 && b.limit > 0 && b.category !== 'Ahorro') {
				alerts.push({
					type: 'info', icon: '🎯',
					title: `Presupuesto "${b.category}" sin gastos aún`,
					body: 'No hay gastos registrados en esta categoría este mes.',
				});
			}
		});
		// B3b: Primer movimiento de ahorro del mes — usa conteo real, sin filtro de leídas aquí
		if (savingsTxsThisMonth.length === 1) {
			alerts.push({
				type: 'success', icon: '🐷',
				title: '¡Primer ahorro del mes registrado!',
				body: `Apartaste ${fmtAmt(totalSavedThisMonth)} este mes. ¡Sigue así!`,
			});
		}

		if (alerts.length === 0)
			alerts.push({ type: 'success', icon: '✅', title: '¡Todo en orden!', body: 'Tus finanzas van bien. No hay alertas activas.' });
		// E: Filter out alerts that have been marked as read
		const readIds = ReadAlerts.getReadIds();
		return alerts.map((a, i) => ({ ...a, _id: _alertId(a) }))
			.filter(a => !readIds.includes(a._id));
	}
	//  Alert ID (deterministic hash for mark-as-read) 
	// Uses title as a stable key — sufficient for our use case
	function _alertId(alert) {
		return (alert.title || '').replace(/\s+/g, '_').toLowerCase();
	}

	function fmtAmt(n) {
		return '$' + Math.abs(Number(n) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 });
	}
	//  E: Read Alerts (persisted per user) 
	const ReadAlerts = {
		_key() { return 'iq_read_alerts_' + getUserId(); },

		getReadIds() {
			try { return JSON.parse(localStorage.getItem(this._key())) || []; }
			catch (e) { console.warn('[AccoVix] Error leyendo alertas leídas:', e); return []; }
		},

		markRead(alertId) {
			const ids = this.getReadIds();
			if (!ids.includes(alertId)) {
				ids.push(alertId);
				localStorage.setItem(this._key(), JSON.stringify(ids));
			}
		},

		clear() { localStorage.removeItem(this._key()); },
	};

	return { getSession, getUserId, Transactions, Budgets, Accounts, Categories, computeAlerts, ReadAlerts };
})();