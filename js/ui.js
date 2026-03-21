/* ═══════════════════════════════════════════════
   AccountIQ — UI Rendering Module
═══════════════════════════════════════════════ */

const UI = (() => {

  /* ── Status pill helper ── */
  function pill(status) {
    const map = {
      paid:     ['pill-green',  'Cobrada'],
      pending:  ['pill-amber',  'Pendiente'],
      overdue:  ['pill-red',    'Vencida'],
      active:   ['pill-green',  'Activo'],
      inactive: ['pill-purple', 'Inactivo'],
      ok:       ['pill-green',  'Normal'],
      low:      ['pill-red',    'Stock bajo'],
    };
    const [cls, label] = map[status] || ['pill-blue', status];
    return `<span class="pill ${cls}">${label}</span>`;
  }

  /* ── Format currency ── */
  function fmt(n) {
    return '$' + Math.abs(n).toLocaleString('es-CO');
  }

  /* ── Format amount with color ── */
  function fmtAmount(n) {
    const cls = n >= 0 ? 'up' : 'down';
    const sign = n >= 0 ? '+' : '-';
    return `<span class="tx-amount ${cls}">${sign}${fmt(n)}</span>`;
  }

  /* ── Render transactions (dashboard mini) ── */
  function renderTxDash() {
    const el = document.getElementById('tx-list-dash');
    if (!el) return;
    el.innerHTML = AppData.transactions.slice(0, 6).map(tx => `
      <div class="tx-item">
        <div class="tx-icon" style="background:${tx.type==='income'?'#0b2a1e':'#2e0f0b'}">${tx.icon}</div>
        <div class="tx-info">
          <div class="tx-name">${tx.description}</div>
          <div class="tx-cat">${tx.category}</div>
        </div>
        <div class="tx-right">
          ${fmtAmount(tx.amount)}
          <div class="tx-date">${tx.date}</div>
        </div>
      </div>
    `).join('');
  }

  /* ── Render transactions (full table) ── */
  function renderTxTable() {
    const tbody = document.getElementById('tx-full-body');
    if (!tbody) return;
    tbody.innerHTML = AppData.transactions.map(tx => `
      <tr>
        <td>${tx.date}</td>
        <td><span style="display:flex;align-items:center;gap:8px"><span>${tx.icon}</span>${tx.description}</span></td>
        <td><span class="pill pill-blue">${tx.category}</span></td>
        <td style="color:var(--t2)">${tx.account}</td>
        <td>${pill(tx.type === 'income' ? 'paid' : 'overdue').replace('Cobrada','Ingreso').replace('Vencida','Egreso')}</td>
        <td>${fmtAmount(tx.amount)}</td>
        <td><div class="tbl-actions"><button class="tbl-btn">✏ Editar</button><button class="tbl-btn danger">✕</button></div></td>
      </tr>
    `).join('');
  }

  /* ── Render budgets (dashboard) ── */
  function renderBudgetDash() {
    const el = document.getElementById('budget-list');
    if (!el) return;
    el.innerHTML = AppData.budgets.map(b => {
      const pct = Math.round((b.used / b.total) * 100);
      const color = pct >= 90 ? '#e8634f' : pct >= 70 ? '#f5a623' : '#3ec98a';
      return `
        <div class="budget-row">
          <div class="budget-header-row">
            <span class="budget-name">${b.icon} ${b.category}</span>
            <span class="budget-pct" style="color:${color}">${pct}%</span>
          </div>
          <div class="budget-meta" style="display:flex;justify-content:space-between;margin-bottom:5px">
            <span style="font-size:11px;color:var(--t3)">${fmt(b.used)} / ${fmt(b.total)}</span>
          </div>
          <div class="progress"><div class="progress-fill" style="width:${pct}%;background:${color}"></div></div>
        </div>
      `;
    }).join('');
  }

  /* ── Render budgets (full detail) ── */
  function renderBudgetDetail() {
    const el = document.getElementById('budget-detail');
    if (!el) return;
    el.innerHTML = AppData.budgets.map(b => {
      const pct = Math.round((b.used / b.total) * 100);
      const remaining = b.total - b.used;
      const color = pct >= 90 ? '#e8634f' : pct >= 70 ? '#f5a623' : '#3ec98a';
      return `
        <div class="budget-row">
          <div class="budget-header-row">
            <span class="budget-name" style="font-size:13px">${b.icon} ${b.category}</span>
            <span style="font-size:12px;color:var(--t2)">${fmt(b.used)} utilizado · <span style="color:${color};font-weight:600">${fmt(remaining)} disponible</span></span>
          </div>
          <div class="progress" style="height:8px;margin-top:6px">
            <div class="progress-fill" style="width:${pct}%;background:${color}"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:4px">
            <span style="font-size:11px;color:var(--t3)">Meta: ${fmt(b.total)}</span>
            <span style="font-size:11px;font-weight:600;color:${color}">${pct}%</span>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ── Render alerts (dashboard) ── */
  function renderAlertsDash() {
    const el = document.getElementById('alerts-dash');
    if (!el) return;
    el.innerHTML = AppData.alerts.slice(0, 4).map(a => `
      <div class="alert-item ${a.type}">
        <div class="alert-icon">${a.icon}</div>
        <div class="alert-content">
          <div class="alert-title">${a.title}</div>
          <div class="alert-body">${a.body}</div>
        </div>
      </div>
    `).join('');
  }

  /* ── Render alerts (full) ── */
  function renderAlertsFull() {
    const el = document.getElementById('alerts-full');
    if (!el) return;
    el.innerHTML = AppData.alerts.map(a => `
      <div class="alert-item ${a.type}" style="padding:16px">
        <div class="alert-icon" style="font-size:20px">${a.icon}</div>
        <div class="alert-content" style="flex:1">
          <div class="alert-title" style="font-size:13px">${a.title}</div>
          <div class="alert-body" style="margin-top:4px">${a.body}</div>
        </div>
        <div>
          <button class="tbl-btn" onclick="this.closest('.alert-item').style.opacity='.4'">Marcar leída</button>
        </div>
      </div>
    `).join('');
  }

  /* ── Render invoices ── */
  function renderInvoices() {
    const tbody = document.getElementById('invoice-body');
    if (!tbody) return;
    tbody.innerHTML = AppData.invoices.map(inv => `
      <tr>
        <td style="font-weight:700;color:var(--blue)">${inv.id}</td>
        <td>${inv.client}</td>
        <td>${inv.date}</td>
        <td>${inv.due}</td>
        <td style="color:var(--t2)">${inv.concept}</td>
        <td style="font-weight:700">${fmt(inv.amount)}</td>
        <td>${pill(inv.status)}</td>
        <td><div class="tbl-actions">
          <button class="tbl-btn" onclick="showToast('PDF generado','success')">PDF</button>
          <button class="tbl-btn">✏</button>
          <button class="tbl-btn danger">✕</button>
        </div></td>
      </tr>
    `).join('');
  }

  /* ── Render clients ── */
  function renderClients() {
    const tbody = document.getElementById('clients-body');
    if (!tbody) return;
    tbody.innerHTML = AppData.clients.map(c => `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td style="color:var(--blue)">${c.email}</td>
        <td style="color:var(--t2)">${c.phone}</td>
        <td>${c.city}</td>
        <td style="font-weight:700;color:var(--green)">${fmt(c.total)}</td>
        <td>${pill(c.status)}</td>
        <td><div class="tbl-actions">
          <button class="tbl-btn">Ver</button>
          <button class="tbl-btn">✏</button>
        </div></td>
      </tr>
    `).join('');
  }

  /* ── Render inventory ── */
  function renderInventory() {
    const tbody = document.getElementById('inventory-body');
    if (!tbody) return;
    tbody.innerHTML = AppData.inventory.map(p => `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td style="color:var(--t3);font-family:monospace">${p.sku}</td>
        <td><span class="pill pill-blue">${p.category}</span></td>
        <td style="font-weight:600;color:${p.stock <= 3 ? 'var(--red)' : 'var(--t1)'}">${p.stock}</td>
        <td>${fmt(p.price)}</td>
        <td style="font-weight:600">${fmt(p.stock * p.price)}</td>
        <td>${pill(p.status)}</td>
      </tr>
    `).join('');
  }

  /* ── Render AI recommendations ── */
  function renderAIRecs() {
    const el = document.getElementById('ai-recs');
    if (!el) return;
    el.innerHTML = AppData.aiRecommendations.map(r => `
      <div class="ai-rec ${r.type}">
        <div class="ai-rec-type">${r.tag}</div>
        <div class="ai-rec-text">${r.text}</div>
      </div>
    `).join('');
  }

  return {
    renderTxDash, renderTxTable,
    renderBudgetDash, renderBudgetDetail,
    renderAlertsDash, renderAlertsFull,
    renderInvoices, renderClients, renderInventory,
    renderAIRecs, fmt, pill
  };

})();
