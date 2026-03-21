/* ═══════════════════════════════════════════════
   AccountIQ — App Controller
   Navigation, Modals, Toast, Export
═══════════════════════════════════════════════ */

/* ── View navigation ── */
const viewTitles = {
  dashboard:    'Dashboard',
  transacciones: 'Transacciones',
  presupuesto:  'Presupuesto Inteligente',
  reportes:     'Reportes Contables',
  facturacion:  'Facturación',
  crm:          'Clientes — CRM',
  inventario:   'Inventario',
  predicciones: 'Predicciones IA',
  alertas:      'Centro de Alertas',
};

const viewInited = {};

function showView(id, navEl) {
  /* Hide all views */
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + id);
  if (!target) return;
  target.classList.add('active');

  /* Update nav active state */
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navEl) navEl.classList.add('active');
  else {
    /* Find matching nav item by text */
    document.querySelectorAll('.nav-item').forEach(n => {
      if (n.getAttribute('onclick') && n.getAttribute('onclick').includes(`'${id}'`)) {
        n.classList.add('active');
      }
    });
  }

  /* Update page title */
  document.getElementById('page-title').textContent = viewTitles[id] || id;

  /* Init content on first visit */
  if (!viewInited[id]) {
    viewInited[id] = true;
    initView(id);
  }

  /* Close sidebar on mobile */
  if (window.innerWidth < 960) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

function initView(id) {
  switch (id) {
    case 'dashboard':
      UI.renderTxDash();
      UI.renderBudgetDash();
      UI.renderAlertsDash();
      Charts.initAll();
      break;
    case 'transacciones':
      UI.renderTxTable();
      break;
    case 'presupuesto':
      UI.renderBudgetDetail();
      setTimeout(() => Charts.initPresupuesto(), 50);
      break;
    case 'reportes':
      /* charts init when tab is clicked */
      break;
    case 'facturacion':
      UI.renderInvoices();
      break;
    case 'crm':
      UI.renderClients();
      break;
    case 'inventario':
      UI.renderInventory();
      break;
    case 'predicciones':
      UI.renderAIRecs();
      setTimeout(() => Charts.initPredicciones(), 50);
      break;
    case 'alertas':
      UI.renderAlertsFull();
      break;
  }
}

/* ── Report sub-tabs ── */
let reportInited = {};
function switchReport(id, btn) {
  document.querySelectorAll('.report-view').forEach(v => v.style.display = 'none');
  document.querySelectorAll('.rtab').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('report-' + id);
  if (el) el.style.display = 'block';
  if (btn) btn.classList.add('active');
  if (!reportInited[id]) {
    reportInited[id] = true;
    if (id === 'flujo') setTimeout(() => Charts.initReportes(), 50);
  }
}

/* ── Period tab clicks ── */
document.querySelectorAll('.ptab').forEach(btn => {
  btn.addEventListener('click', function() {
    this.closest('.period-tabs').querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});

/* ── Sidebar toggle (mobile) ── */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

/* ══════════════════════════════════════
   MODALS
══════════════════════════════════════ */
const modalForms = {
  transaction: {
    title: 'Nueva Transacción',
    html: `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Tipo</label>
          <select class="form-select" id="f-type">
            <option value="income">Ingreso</option>
            <option value="expense">Egreso</option>
            <option value="transfer">Transferencia</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Monto</label>
          <input class="form-input" id="f-amount" type="number" min="0" step="0.01" placeholder="0.00"/>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Descripción</label>
        <input class="form-input" id="f-desc" type="text" placeholder="Descripción de la transacción"/>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Categoría</label>
          <select class="form-select" id="f-cat">
            <option>Ventas</option><option>Operación</option><option>Nómina</option>
            <option>Marketing</option><option>Tecnología</option><option>Inmueble</option><option>Otros</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Fecha</label>
          <input class="form-input" id="f-date" type="date" value="${new Date().toISOString().slice(0,10)}"/>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Cuenta</label>
        <select class="form-select" id="f-account">
          <option>Bancolombia — Cta. Corriente</option>
          <option>Bancolombia — Ahorros</option>
          <option>Davivienda</option>
          <option>Caja Menor</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Notas (opcional)</label>
        <input class="form-input" id="f-notes" type="text" placeholder="Referencia, número de factura..."/>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" onclick="saveTransaction()">Guardar Transacción</button>
      </div>
    `
  },
  invoice: {
    title: 'Nueva Factura',
    html: `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Cliente</label>
          <select class="form-select">
            ${AppData.clients.map(c => `<option>${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Monto</label>
          <input class="form-input" type="number" placeholder="0.00"/>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Concepto / Descripción</label>
        <input class="form-input" type="text" placeholder="Servicios de desarrollo, consultoría..."/>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Fecha Emisión</label>
          <input class="form-input" type="date" value="${new Date().toISOString().slice(0,10)}"/>
        </div>
        <div class="form-group">
          <label class="form-label">Fecha Vencimiento</label>
          <input class="form-input" type="date"/>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Impuesto (IVA %)</label>
        <select class="form-select">
          <option>19% — IVA General</option>
          <option>0% — Exento</option>
          <option>5% — IVA Reducido</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Notas para el cliente</label>
        <input class="form-input" type="text" placeholder="Condiciones de pago, términos..."/>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" onclick="closeModal();showToast('Factura creada correctamente','success')">Crear Factura</button>
      </div>
    `
  },
  budget: {
    title: 'Nueva Categoría de Presupuesto',
    html: `
      <div class="form-group">
        <label class="form-label">Nombre de la categoría</label>
        <input class="form-input" type="text" placeholder="Ej: Transporte, Proveedores..."/>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Monto Mensual</label>
          <input class="form-input" type="number" placeholder="0.00"/>
        </div>
        <div class="form-group">
          <label class="form-label">Ícono</label>
          <input class="form-input" type="text" placeholder="Emoji: 🚗 🏭 📦"/>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Tipo</label>
        <select class="form-select">
          <option>Gasto fijo</option>
          <option>Gasto variable</option>
          <option>Ahorro / inversión</option>
        </select>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" onclick="closeModal();showToast('Categoría creada','success')">Guardar</button>
      </div>
    `
  },
  client: {
    title: 'Nuevo Cliente',
    html: `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nombre / Razón Social</label>
          <input class="form-input" type="text" placeholder="Empresa o persona"/>
        </div>
        <div class="form-group">
          <label class="form-label">NIT / Cédula</label>
          <input class="form-input" type="text" placeholder="900.123.456-7"/>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-input" type="email" placeholder="contacto@empresa.com"/>
        </div>
        <div class="form-group">
          <label class="form-label">Teléfono</label>
          <input class="form-input" type="tel" placeholder="+57 310 000 0000"/>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Ciudad</label>
          <select class="form-select">
            <option>Medellín</option><option>Bogotá</option><option>Cali</option><option>Barranquilla</option><option>Otra</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tipo de cliente</label>
          <select class="form-select">
            <option>Empresa</option><option>Persona Natural</option><option>Gobierno</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" onclick="closeModal();showToast('Cliente registrado','success')">Guardar Cliente</button>
      </div>
    `
  },
  product: {
    title: 'Nuevo Producto / Servicio',
    html: `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nombre del producto</label>
          <input class="form-input" type="text" placeholder="Nombre descriptivo"/>
        </div>
        <div class="form-group">
          <label class="form-label">SKU / Código</label>
          <input class="form-input" type="text" placeholder="SW-001"/>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Precio Unitario</label>
          <input class="form-input" type="number" placeholder="0.00"/>
        </div>
        <div class="form-group">
          <label class="form-label">Stock inicial</label>
          <input class="form-input" type="number" placeholder="0"/>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Categoría</label>
          <select class="form-select">
            <option>Software</option><option>Hardware</option><option>Servicios</option><option>Otro</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Stock mínimo alerta</label>
          <input class="form-input" type="number" placeholder="5"/>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" onclick="closeModal();showToast('Producto guardado','success')">Guardar</button>
      </div>
    `
  },
};

function openModal(type) {
  const form = modalForms[type];
  if (!form) return;
  document.getElementById('modal-title').textContent = form.title;
  document.getElementById('modal-body').innerHTML = form.html;
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function saveTransaction() {
  const amount = parseFloat(document.getElementById('f-amount')?.value || 0);
  const desc   = document.getElementById('f-desc')?.value || '';
  const type   = document.getElementById('f-type')?.value || 'income';
  const cat    = document.getElementById('f-cat')?.value  || 'Otros';
  const date   = document.getElementById('f-date')?.value || new Date().toISOString().slice(0,10);

  if (!desc || amount <= 0) {
    showToast('Completa todos los campos requeridos', 'error');
    return;
  }

  const newTx = {
    id: AppData.transactions.length + 1,
    date, description: desc, category: cat,
    account: document.getElementById('f-account')?.value || 'Bancolombia Cte',
    type,
    amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
    icon: type === 'income' ? '📈' : '📉',
    status: 'completed'
  };

  AppData.transactions.unshift(newTx);
  closeModal();
  showToast('Transacción guardada correctamente', 'success');

  /* Re-render if on those views */
  if (viewInited['transacciones']) UI.renderTxTable();
  if (viewInited['dashboard'])     UI.renderTxDash();
}

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
let toastTimer;
function showToast(msg, type = 'info') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

/* ══════════════════════════════════════
   EXPORT
══════════════════════════════════════ */
function exportCSV() {
  const headers = ['Fecha', 'Descripción', 'Categoría', 'Cuenta', 'Tipo', 'Monto'];
  const rows = AppData.transactions.map(t =>
    [t.date, `"${t.description}"`, t.category, `"${t.account}"`, t.type === 'income' ? 'Ingreso' : 'Egreso', t.amount].join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'transacciones_accountiq.csv' });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('CSV exportado correctamente', 'success');
}

/* ══════════════════════════════════════
   CHIP TOGGLE (period / chart)
══════════════════════════════════════ */
document.querySelectorAll('.chip-group').forEach(group => {
  group.addEventListener('click', function(e) {
    if (!e.target.classList.contains('chip')) return;
    group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
  });
});

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  showView('dashboard', document.querySelector('.nav-item.active'));
});
