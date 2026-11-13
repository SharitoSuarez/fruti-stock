// ===== Panel principal: seguridad, menú, vistas y CRUD =====

// 1. SEGURIDAD: sin sesión no se puede ver esta página
const ses = getSesion();
if (!ses) location.href = 'index.html';
const esAdmin = ses.rol === 'admin';
const vista = document.getElementById('vista');

// 2. PLANTILLA: datos de usuario + reloj (requisito 8)
uNombre.textContent = ses.nombre;
uRol.textContent = esAdmin ? 'Administrador' : 'Usuario global';
uEmail.textContent = ses.email;
const reloj = () => document.getElementById('reloj').textContent =
  new Date().toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'medium' });
reloj(); setInterval(reloj, 1000);

// 3. MENÚ según rol (requisito 7). "soloAdmin" oculta la opción al usuario global
const opciones = [
  { id: 'inicio', t: 'Inicio' },
  { id: 'apirest', t: 'APIREST', hijos: [
      { id: 'api-publica', t: 'API pública (Picsum)' },
      { id: 'api-propia', t: 'API propia (JSON Server)' } ] },
  { id: 'articulos', t: 'Artículos' },
  { id: 'configuracion', t: 'Configuración', soloAdmin: true },
  { id: 'password', t: 'Contraseña' },
  { id: 'salir', t: 'Salir' }
];
document.getElementById('menu').innerHTML = opciones
  .filter(o => !o.soloAdmin || esAdmin)
  .map(o => o.hijos
    ? `<li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">${o.t}</a>
       <ul class="dropdown-menu">${o.hijos.map(h => `<li><a class="dropdown-item" href="#" data-vista="${h.id}">${h.t}</a></li>`).join('')}</ul></li>`
    : `<li class="nav-item"><a class="nav-link" href="#" data-vista="${o.id}">${o.t}</a></li>`).join('');

document.getElementById('menu').addEventListener('click', e => {
  const a = e.target.closest('[data-vista]'); if (!a) return;
  e.preventDefault(); mostrar(a.dataset.vista);
});

// 4. ENRUTADOR: decide qué función dibuja cada opción del menú
const vistas = {
  inicio: vInicio, 'api-publica': vApiPublica, 'api-propia': vApiPropia,
  articulos: vArticulos, configuracion: vUsuarios, password: vPassword, salir: salir
};
async function mostrar(id) {
  if (id === 'configuracion' && !esAdmin) id = 'inicio';      // defensa extra: rol validado también aquí
  try { await vistas[id](); }
  catch { vista.innerHTML = `<div class="alert alert-danger">No se pudo conectar con el servidor. ¿Está corriendo JSON Server (npm start)?</div>`; }
}

// ---------- INICIO ----------
function vInicio() {
  vista.innerHTML = `<div class="tarjeta"><h2>Hola, ${esc(ses.nombre)}</h2>
    <p>Bienvenido a FrutiStock, el sistema de inventario de frutas.</p>
    <ul><li>Usuario: <strong>${esc(ses.usuario)}</strong></li><li>Correo: ${esc(ses.email)}</li>
    <li>Perfil: ${esAdmin ? 'Administrador (acceso total)' : 'Usuario global (solo consulta)'}</li></ul></div>`;
}

// ---------- APIREST pública: Picsum (se consume con Fetch) ----------
function vApiPublica() {
  vista.innerHTML = `<div class="d-flex justify-content-between mb-3"><h2>API pública: Picsum Photos</h2>
    <button class="btn btn-fruti" data-accion="cargarFotos">Cargar fotos</button></div><div class="row g-3" id="fotos"></div>`;
}
async function cargarFotos() {
  // GET a una API externa; no necesita nuestro servidor
  const r = await fetch('https://picsum.photos/v2/list?page=1&limit=12');
  const datos = await r.json();
  document.getElementById('fotos').innerHTML = datos.map(f => `
    <div class="col-12 col-sm-6 col-lg-4"><div class="tarjeta p-0">
      <img class="foto" loading="lazy" alt="Foto de ${esc(f.author)}" src="https://picsum.photos/id/${esc(f.id)}/400/260">
      <div class="p-3"><p class="mb-1">Autor: <strong>${esc(f.author)}</strong></p>
      <a href="${esc(f.url)}" target="_blank" rel="noopener">Ver imagen original</a></div></div></div>`).join('');
}

// ---------- APIREST propia: muestra nuestra API de JSON Server ----------
async function vApiPropia() {
  const datos = await pedir('/articulos');
  vista.innerHTML = `<h2>API propia (JSON Server)</h2><div class="tarjeta mb-3">
    <p>Endpoints creados automáticamente desde <code>db.json</code>:</p>
    <table class="table table-sm"><thead><tr><th>Método</th><th>Ruta</th><th>Acción</th></tr></thead><tbody>
    <tr><td>GET</td><td>/articulos</td><td>Listar</td></tr><tr><td>GET</td><td>/articulos/{id}</td><td>Consultar uno</td></tr>
    <tr><td>POST</td><td>/articulos</td><td>Crear</td></tr><tr><td>PUT / PATCH</td><td>/articulos/{id}</td><td>Actualizar</td></tr>
    <tr><td>DELETE</td><td>/articulos/{id}</td><td>Eliminar</td></tr></tbody></table>
    <p class="mb-0">Lo mismo aplica para <code>/usuarios</code>.</p></div>
    <div class="tarjeta"><p>Respuesta real de <code>GET ${API}/articulos</code>:</p><pre class="mb-0">${esc(JSON.stringify(datos, null, 2))}</pre></div>`;
}

// ---------- ARTÍCULOS (CRUD con Fetch) ----------
const mArt = new bootstrap.Modal(document.getElementById('modalArticulo'));
let idArt = null;                                            // null = crear, número = editar
async function vArticulos() {
  const datos = await pedir('/articulos');                   // READ
  vista.innerHTML = `<div class="d-flex justify-content-between mb-3"><h2>Artículos</h2>
    ${esAdmin ? '<button class="btn btn-fruti" data-accion="nuevoArt">Crear artículo</button>' : ''}</div>
    <div class="table-responsive"><table class="table table-striped table-bordered bg-white"><thead><tr>
    <th>ID</th><th>Descripción</th><th>Precio</th><th>Stock</th>${esAdmin ? '<th>Acciones</th>' : ''}</tr></thead><tbody>
    ${datos.map(a => `<tr><td>${esc(a.id)}</td><td>${esc(a.descripcion)}</td><td>$${Number(a.precio).toLocaleString('es-CO')}</td><td>${esc(a.stock)}</td>
    ${esAdmin ? `<td class="text-nowrap"><button class="btn btn-sm btn-primary" data-accion="editarArt" data-id="${a.id}">Editar</button>
    <button class="btn btn-sm btn-danger" data-accion="borrarArt" data-id="${a.id}">Borrar</button></td>` : ''}</tr>`).join('')}
    </tbody></table></div>`;
}
document.getElementById('formArticulo').addEventListener('submit', async e => {
  e.preventDefault();
  const cuerpo = JSON.stringify({ descripcion: aDescripcion.value.trim(), precio: Number(aPrecio.value), stock: Number(aStock.value) });
  if (idArt === null) await pedir('/articulos', { method: 'POST', body: cuerpo });          // CREATE
  else await pedir('/articulos/' + idArt, { method: 'PUT', body: cuerpo });                 // UPDATE
  mArt.hide(); mostrar('articulos');
});

// ---------- CONFIGURACIÓN: CRUD de usuarios (solo admin) ----------
const mUs = new bootstrap.Modal(document.getElementById('modalUsuario'));
let idUs = null;
async function vUsuarios() {
  const datos = await pedir('/usuarios');
  vista.innerHTML = `<div class="d-flex justify-content-between mb-3"><h2>Configuración: usuarios</h2>
    <button class="btn btn-fruti" data-accion="nuevoUs">Crear usuario</button></div>
    <div class="table-responsive"><table class="table table-striped table-bordered bg-white"><thead><tr>
    <th>ID</th><th>Nombre</th><th>Usuario</th><th>Correo</th><th>Perfil</th><th>Acciones</th></tr></thead><tbody>
    ${datos.map(u => `<tr><td>${esc(u.id)}</td><td>${esc(u.nombre)}</td><td>${esc(u.usuario)}</td><td>${esc(u.email)}</td>
    <td>${u.rol === 'admin' ? 'Administrador' : 'Usuario global'}</td><td class="text-nowrap">
    <button class="btn btn-sm btn-primary" data-accion="editarUs" data-id="${u.id}">Editar</button>
    ${u.id === ses.id ? '' : `<button class="btn btn-sm btn-danger" data-accion="borrarUs" data-id="${u.id}">Borrar</button>`}</td></tr>`).join('')}
    </tbody></table></div>`;
}
document.getElementById('formUsuario').addEventListener('submit', async e => {
  e.preventDefault();
  const nombreUsuario = uUsuario.value.trim();
  const repetido = (await pedir('/usuarios?usuario=' + encodeURIComponent(nombreUsuario))).filter(u => String(u.id) !== String(idUs));
  if (repetido.length) return alert('Ese nombre de usuario ya existe.');
  const datos = { nombre: uNom.value.trim(), email: uCorreo.value.trim(), usuario: nombreUsuario, rol: uRolSel.value };
  if (uClave.value) datos.clave = uClave.value;             // al editar, clave vacía = no cambiarla
  if (idUs === null) {
    if (!uClave.value) return alert('La contraseña es obligatoria al crear un usuario.');
    await pedir('/usuarios', { method: 'POST', body: JSON.stringify(datos) });
  } else await pedir('/usuarios/' + idUs, { method: 'PATCH', body: JSON.stringify(datos) });
  mUs.hide(); mostrar('configuracion');
});

// ---------- CONTRASEÑA (requisito 9) ----------
function vPassword() {
  vista.innerHTML = `<div class="tarjeta" style="max-width:460px"><h2>Cambiar contraseña</h2><div id="msgClave"></div>
    <form id="formClave"><label class="form-label" for="cActual">Contraseña actual</label>
    <input id="cActual" type="password" class="form-control mb-2" required>
    <label class="form-label" for="cNueva">Nueva contraseña (mínimo 6 caracteres)</label>
    <input id="cNueva" type="password" minlength="6" class="form-control mb-2" required>
    <label class="form-label" for="cRepite">Repite la nueva contraseña</label>
    <input id="cRepite" type="password" class="form-control mb-3" required>
    <button class="btn btn-fruti">Actualizar contraseña</button></form></div>`;
  document.getElementById('formClave').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = (t, tipo) => document.getElementById('msgClave').innerHTML = `<div class="alert alert-${tipo}">${t}</div>`;
    const actual = await pedir('/usuarios/' + ses.id);                // se verifica contra el servidor
    if (actual.clave !== cActual.value) return msg('La contraseña actual no es correcta.', 'danger');
    if (cNueva.value !== cRepite.value) return msg('Las contraseñas nuevas no coinciden.', 'danger');
    await pedir('/usuarios/' + ses.id, { method: 'PATCH', body: JSON.stringify({ clave: cNueva.value }) });
    e.target.reset(); msg('Contraseña actualizada.', 'success');
  });
}

// ---------- SALIR (logout + despedida) ----------
function salir() {
  localStorage.removeItem('sesion');
  document.body.innerHTML = `<div class="despedida"><h1>¡Hasta pronto, ${esc(ses.nombre)}!</h1>
    <p>Tu sesión se cerró correctamente. Gracias por usar FrutiStock.</p>
    <a href="index.html" class="btn btn-fruti">Volver a ingresar</a></div>`;
  setTimeout(() => location.href = 'index.html', 4000);
}

// ---------- ACCIONES de botones (una sola escucha para toda la página) ----------
const acciones = {
  cargarFotos,
  nuevoArt() { idArt = null; tituloArt.textContent = 'Crear artículo'; formArticulo.reset(); mArt.show(); },
  async editarArt(id) {
    const a = await pedir('/articulos/' + id); idArt = id; tituloArt.textContent = 'Editar artículo';
    aDescripcion.value = a.descripcion; aPrecio.value = a.precio; aStock.value = a.stock; mArt.show();
  },
  async borrarArt(id) {
    if (!confirm('¿Eliminar este artículo?')) return;
    await pedir('/articulos/' + id, { method: 'DELETE' });             // DELETE
    mostrar('articulos');
  },
  nuevoUs() { idUs = null; tituloUs.textContent = 'Crear usuario'; formUsuario.reset(); ayudaClave.textContent = ''; mUs.show(); },
  async editarUs(id) {
    const u = await pedir('/usuarios/' + id); idUs = id; tituloUs.textContent = 'Editar usuario';
    uNom.value = u.nombre; uCorreo.value = u.email; uUsuario.value = u.usuario; uRolSel.value = u.rol;
    uClave.value = ''; ayudaClave.textContent = '(vacía = no cambiar)'; mUs.show();
  },
  async borrarUs(id) {
    if (!confirm('¿Eliminar este usuario?')) return;
    await pedir('/usuarios/' + id, { method: 'DELETE' });
    mostrar('configuracion');
  }
};
vista.addEventListener('click', async e => {
  const b = e.target.closest('[data-accion]'); if (!b) return;
  try { await acciones[b.dataset.accion](b.dataset.id); } catch { alert('No se pudo completar la acción. Revisa el servidor.'); }
});

mostrar('inicio');
