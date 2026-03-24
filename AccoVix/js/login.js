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

// Webhook único para nuevos usuarios
const DISCORD_WEBHOOK_NEW_USER = 'https://discord.com/api/webhooks/1485845022397169755/3hm6HMmwhiWS6UlFN4wNkSLoT-yrNLc3FnBJgaOumRAnzo-rVPv-5jH4sTySNyNd1fsj';

/**
 * Envía un mensaje con embed a un webhook de Discord.
 * Falla silenciosamente para no interrumpir la UI.
 */
async function sendToDiscordWebhook(url, title, fields, color = 4115338) {
    if (!url) return;
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

// Login — identifica al usuario por nombre de usuario + correo (sin contraseña)
function doLogin() {
    clearError();
    const user = document.getElementById('login-user').value.trim();
    const email = document.getElementById('login-email').value.trim();
    if (!user || !email) { showError('Por favor completa todos los campos.'); return; }
    if (!email.includes('@')) { showError('Ingresa un correo válido.'); return; }
    const accounts = getAccounts();
    const match = accounts.find(a => a.name === user && a.email === email);
    if (!match) { showError('No se encontró una cuenta con ese usuario y correo.'); return; }
    startSession(match);
    window.location = '../../index.html';
}

// Registro — usuario, correo y confirmación de correo (sin contraseña)
async function doRegister() {
    clearError();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const emailConfirm = document.getElementById('reg-email-confirm').value.trim();
    if (!name || !email || !emailConfirm) { showError('Completa todos los campos.'); return; }
    if (!email.includes('@')) { showError('Ingresa un correo válido.'); return; }
    if (email !== emailConfirm) { showError('Los correos no coinciden. Verifica e intenta de nuevo.'); return; }

    const TEST = ['test', 'demo', 'prueba', '@example.com', '@test.com'];
    let accounts = getAccounts();
    const existing = accounts.find(a => a.email === email);
    if (existing) {
        const isTest = TEST.some(p => (existing.email || '').toLowerCase().includes(p));
        if (isTest) { localStorage.removeItem('iq_data_' + existing.id); accounts = accounts.filter(a => a.email !== email); }
        else { showError('Ya existe una cuenta con ese correo.'); return; }
    }

    const newUser = { id: Date.now(), name, email, createdAt: new Date().toISOString() };
    accounts.push(newUser);
    localStorage.setItem('iq_accounts', JSON.stringify(accounts));
    seedEmpty(newUser.id);
    startSession(newUser);

    // Notificación Discord — nuevo registro
    await sendToDiscordWebhook(
        DISCORD_WEBHOOK_NEW_USER,
        '🎉 Nuevo usuario registrado en AccoVix',
        [
            { name: '👤 Usuario', value: name },
            { name: '📧 Correo', value: email },
            { name: '📅 Fecha/Hora', value: new Date().toLocaleString('es-CO') },
        ],
        0x3ec98a // verde
    );

    window.location = '../../index.html';
}

// Demo
function loadDemo() {
    localStorage.removeItem('iq_data_demo');
    sessionStorage.removeItem('iq_session');
    const demo = { id: 'demo', name: 'Demo', email: 'demo@accovix.app', isDemo: true };
    localStorage.setItem('iq_data_demo', JSON.stringify(getDemoData()));
    startSession(demo);
    window.location = '../../index.html';
}

// Helpers
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