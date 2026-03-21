/* ═══════════════════════════════════════════════
   AccountIQ — Data Layer
   Datos de ejemplo y estado de la aplicación
═══════════════════════════════════════════════ */

const AppData = {

  transactions: [
    { id: 1, date: '2025-03-20', description: 'Cliente Acme Corp — Factura #1043', category: 'Ventas',     account: 'Bancolombia Cte', type: 'income',  amount:  3200, icon: '💼', status: 'completed' },
    { id: 2, date: '2025-03-20', description: 'Arriendo Oficina Centro',            category: 'Inmueble',   account: 'Bancolombia Cte', type: 'expense', amount: -1800, icon: '🏢', status: 'completed' },
    { id: 3, date: '2025-03-19', description: 'AWS — Infraestructura Servidores',   category: 'Tecnología', account: 'Bancolombia Cte', type: 'expense', amount:  -420, icon: '💻', status: 'completed' },
    { id: 4, date: '2025-03-19', description: 'Venta Producto Premium X',           category: 'Ventas',     account: 'Davivienda',       type: 'income',  amount:   890, icon: '📦', status: 'completed' },
    { id: 5, date: '2025-03-18', description: 'Google Ads — Campaña Q1',            category: 'Marketing',  account: 'Bancolombia Cte', type: 'expense', amount:  -650, icon: '📣', status: 'completed' },
    { id: 6, date: '2025-03-17', description: 'TechSolutions — Factura #1042',      category: 'Ventas',     account: 'Bancolombia Cte', type: 'income',  amount:  4800, icon: '💼', status: 'completed' },
    { id: 7, date: '2025-03-16', description: 'Nómina Marzo — 8 empleados',         category: 'Nómina',     account: 'Bancolombia Cte', type: 'expense', amount: -3600, icon: '👥', status: 'completed' },
    { id: 8, date: '2025-03-15', description: 'Stripe — Pagos Online',              category: 'Ventas',     account: 'Davivienda',       type: 'income',  amount:  1250, icon: '💳', status: 'completed' },
    { id: 9, date: '2025-03-14', description: 'Slack / Notion / Figma — SaaS',     category: 'Tecnología', account: 'Bancolombia Cte', type: 'expense', amount:  -280, icon: '🛠', status: 'completed' },
    { id:10, date: '2025-03-13', description: 'Inversiones SA — Consultoría',       category: 'Ventas',     account: 'Bancolombia Cte', type: 'income',  amount:  2400, icon: '📊', status: 'completed' },
  ],

  budgets: [
    { category: 'Operación',   icon: '💼', used: 3200, total: 4000, color: '#f5a623' },
    { category: 'Nómina',      icon: '👥', used: 5400, total: 6000, color: '#e8634f' },
    { category: 'Marketing',   icon: '📣', used:  850, total: 2000, color: '#3ec98a' },
    { category: 'Tecnología',  icon: '💻', used: 1100, total: 1500, color: '#5b8def' },
    { category: 'Arriendo',    icon: '🏢', used: 1800, total: 1800, color: '#e8634f' },
    { category: 'Ahorro Meta', icon: '💰', used: 5510, total: 8000, color: '#a78bfa' },
  ],

  invoices: [
    { id: '#1044', client: 'TechSolutions Ltda', date: '20 Mar 2025', due: '03 Abr 2025', concept: 'Desarrollo Software', amount: 4800, status: 'pending' },
    { id: '#1043', client: 'Acme Corp',          date: '18 Mar 2025', due: '01 Abr 2025', concept: 'Consultoría IT',     amount: 3200, status: 'paid'    },
    { id: '#1042', client: 'StartupXYZ',         date: '15 Mar 2025', due: '29 Mar 2025', concept: 'Diseño UX',          amount: 1200, status: 'overdue' },
    { id: '#1041', client: 'Inversiones SA',     date: '10 Mar 2025', due: '24 Mar 2025', concept: 'Análisis Financiero', amount: 6500, status: 'paid'    },
    { id: '#1040', client: 'GlobalTech',         date: '05 Mar 2025', due: '19 Mar 2025', concept: 'Soporte Mensual',    amount: 3800, status: 'paid'    },
    { id: '#1039', client: 'DataCorp',           date: '01 Mar 2025', due: '15 Mar 2025', concept: 'Migración datos',    amount: 2200, status: 'pending' },
  ],

  clients: [
    { name: 'Acme Corp',        email: 'admin@acmecorp.com',     phone: '+57 310 234 5678', city: 'Medellín',  total: 18400, status: 'active'   },
    { name: 'TechSolutions',    email: 'cfo@techsol.co',         phone: '+57 300 876 5432', city: 'Bogotá',    total: 12600, status: 'active'   },
    { name: 'Inversiones SA',   email: 'conta@inversas.com',     phone: '+57 315 654 3210', city: 'Cali',      total: 25800, status: 'active'   },
    { name: 'StartupXYZ',       email: 'ceo@startupxyz.io',      phone: '+57 312 111 2222', city: 'Medellín',  total:  4400, status: 'inactive' },
    { name: 'GlobalTech',       email: 'billing@globaltech.co',  phone: '+57 320 333 4444', city: 'Bogotá',    total:  9800, status: 'active'   },
    { name: 'DataCorp',         email: 'info@datacorp.com',      phone: '+57 316 555 6666', city: 'Barranquilla', total:  6200, status: 'active'},
  ],

  inventory: [
    { name: 'Licencia Software Pro', sku: 'SW-001', category: 'Software',  stock: 48,  price: 299,  status: 'ok'  },
    { name: 'Servidor Rack 2U',       sku: 'HW-012', category: 'Hardware',  stock:  3,  price: 4200, status: 'low' },
    { name: 'Pack Soporte Anual',     sku: 'SV-005', category: 'Servicios', stock: 120, price: 499,  status: 'ok'  },
    { name: 'Módulo ERP Básico',      sku: 'SW-003', category: 'Software',  stock: 22,  price: 1200, status: 'ok'  },
    { name: 'Switch 24 Puertos',      sku: 'HW-018', category: 'Hardware',  stock:  2,  price: 850,  status: 'low' },
    { name: 'Consultoría / Hora',     sku: 'SV-001', category: 'Servicios', stock: 200, price: 120,  status: 'ok'  },
  ],

  alerts: [
    { type: 'danger',  icon: '🚨', title: 'Nómina al 90% del presupuesto',         body: 'Riesgo de sobrepaso en ~8 días con la tendencia actual del gasto.' },
    { type: 'warn',    icon: '⚡', title: 'Predicción: flujo negativo semana 24 Mar', body: 'Modelo IA detecta posible déficit de $1,200. Considera diferir pago AWS.' },
    { type: 'info',    icon: '💡', title: 'Oportunidad de ahorro: $340/mes',         body: '3 suscripciones SaaS no utilizadas en los últimos 30 días detectadas.' },
    { type: 'warn',    icon: '📄', title: 'Factura #1042 vencida hace 5 días',       body: 'StartupXYZ — $1,200 pendientes. Enviar recordatorio automático.' },
    { type: 'success', icon: '📊', title: 'IA: tendencia positiva Q2',               body: 'Ingresos proyectados +22% para Q2 si se mantiene el crecimiento actual.' },
  ],

  aiRecommendations: [
    { type: 'success', tag: '💡 Optimización detectada', text: 'Refinanciar deuda actual puede ahorrar $340/mes en intereses con tasa actual del mercado.' },
    { type: 'warn',    tag: '⚡ Acción urgente',          text: 'Cobrar factura #1042 antes del 25 Mar para evitar flujo de caja negativo esa semana.' },
    { type: 'info',    tag: '📊 Tendencia detectada',     text: 'Temporada alta proyectada Jun–Ago (+35%). Considera escalar operaciones y equipo.' },
  ],

  /* Datos históricos para gráficas */
  cashflow: {
    labels: ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'],
    income:  [9800, 11200, 13400, 10100, 11880, 12850],
    expense: [7200,  8100,  9800,  6900,  7118,  7340],
    saving:  [2600,  3100,  3600,  3200,  4762,  5510],
  },

  prediction: {
    labels: ['Abr', 'May', 'Jun', 'Jul'],
    base:         [14200, 15800, 18200, 17400],
    optimistic:   [15400, 17200, 21000, 20100],
    conservative: [12800, 13900, 15800, 14900],
  },

  sparklines: {
    balance:  [42000, 43100, 44800, 45200, 46900, 48230],
    income:   [ 9800, 10400, 11200, 11000, 11880, 12850],
    expenses: [ 7200,  7600,  8100,  6900,  7118,  7340],
    savings:  [ 2600,  2800,  3100,  3200,  4762,  5510],
  },

  /* Estado local (session) */
  state: {
    currentView: 'dashboard',
  }
};
