// ===== Utilidades compartidas por index.html y app.html =====
const API = 'http://localhost:3000';           // dirección de JSON Server

const getSesion = () => JSON.parse(localStorage.getItem('sesion') || 'null');
const setSesion = u => localStorage.setItem('sesion',
  JSON.stringify({ id: u.id, nombre: u.nombre, usuario: u.usuario, email: u.email, rol: u.rol })); // nunca guardamos la clave

// Escapa texto para evitar inyección de HTML al usar innerHTML
const esc = s => String(s ?? '').replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Envoltorio de fetch: agrega Content-Type JSON (obligatorio para POST/PUT/PATCH en JSON Server)
async function pedir(ruta, opciones = {}) {
  const r = await fetch(API + ruta, { headers: { 'Content-Type': 'application/json' }, ...opciones });
  if (!r.ok) throw new Error('Error HTTP ' + r.status);   // fetch NO falla solo con 404/500, lo hacemos nosotros
  return r.json();
}
