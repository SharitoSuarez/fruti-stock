// ===== Login y registro (requisitos 3 y 6) =====
if (getSesion()) location.href = 'app.html';   // si ya hay sesión, entra directo

const mensaje = (txt, tipo = 'danger') =>
  document.getElementById('mensaje').innerHTML = `<div class="alert alert-${tipo}">${esc(txt)}</div>`;

// LOGIN: consulta GET /usuarios?usuario=..&clave=.. ; si devuelve 1 registro, las credenciales son válidas
document.getElementById('formLogin').addEventListener('submit', async e => {
  e.preventDefault();
  const u = encodeURIComponent(lUsuario.value.trim()), c = encodeURIComponent(lClave.value);
  try {
    const lista = await pedir(`/usuarios?usuario=${u}&clave=${c}`);
    if (lista.length === 1) { setSesion(lista[0]); location.href = 'app.html'; }
    else mensaje('Usuario o contraseña incorrectos.');
  } catch { mensaje('No hay conexión con el servidor. Inicia JSON Server (npm start).'); }
});

// REGISTRO: verifica que el usuario no exista y hace POST /usuarios con rol "usuario" (perfil global)
document.getElementById('formRegistro').addEventListener('submit', async e => {
  e.preventDefault();
  const usuario = rUsuario.value.trim();
  try {
    const existe = await pedir(`/usuarios?usuario=${encodeURIComponent(usuario)}`);
    if (existe.length) return mensaje('Ese nombre de usuario ya está en uso.');
    await pedir('/usuarios', { method: 'POST', body: JSON.stringify({
      nombre: rNombre.value.trim(), email: rEmail.value.trim(), usuario, clave: rClave.value, rol: 'usuario' }) });
    e.target.reset();
    mensaje('Cuenta creada. Ya puedes ingresar.', 'success');
    document.querySelector('[data-bs-target="#tabLogin"]').click();
  } catch { mensaje('No hay conexión con el servidor. Inicia JSON Server (npm start).'); }
});
