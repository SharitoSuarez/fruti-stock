
# FrutiStock – Proyecto Corte 3
**Unidades Tecnológicas de Santander – Tecnología en Desarrollo de Sistemas Informáticos – Programación Web**

## Integrantes
- Estudiante 1 Sharol Daniela Suarez Cristancho
- Estudiante 2 Sara yulieth Ortiz Rico

## Temática
Sistema web de inventario de frutas con control de acceso por perfiles (administrador y usuario global).

## Objetivo general
Construir una aplicación web con HTML, Bootstrap y JavaScript que gestione usuarios y artículos consumiendo una API REST con Fetch.

## Objetivos específicos
- Implementar registro, login y cierre de sesión con dos perfiles.
- Construir una API REST propia con JSON Server (base de datos no relacional).
- Consumir una API REST pública (Picsum Photos) con Fetch.
- Implementar el CRUD de artículos y de usuarios.
- Permitir el cambio de contraseña del usuario.

## Justificación
Los pequeños comerciantes suelen llevar el inventario en papel o en hojas sueltas. Una aplicación web sencilla permite consultar y actualizar existencias desde cualquier navegador, y el control por perfiles evita que usuarios sin permiso modifiquen información.

## Requerimientos funcionales
| Código | Descripción |
|---|---|
| RF1 | Registro de usuarios (perfil "usuario global" por defecto). |
| RF2 | Login con usuario y clave; sesión guardada en localStorage. |
| RF3 | Menú: Inicio, APIREST, Artículos, Configuración, Contraseña y Salir. |
| RF4 | APIREST: consumo de API pública (Picsum) y visualización de la API propia. |
| RF5 | Artículos: listar para todos; crear, editar y borrar solo administrador. |
| RF6 | Configuración: CRUD de usuarios (solo administrador). |
| RF7 | Cambio de contraseña verificando la clave actual. |
| RF8 | Salir: cierra sesión y muestra mensaje de despedida. |
| RF9 | Encabezado con logo, datos del usuario, fecha y hora actual. |

## Requerimientos no funcionales
- RNF1 Interfaz responsive con Bootstrap 5.
- RNF2 Persistencia en JSON Server (`db.json`).
- RNF3 Ejecutable en cualquier equipo con Node.js 18 o superior.
- RNF4 Código comentado y separado en archivos (HTML, CSS, JS).
- RNF5 Texto de usuarios escapado antes de mostrarse (prevención de XSS).
- RNF6 Limitación conocida: las claves se guardan en texto plano por ser un proyecto académico; en producción se usaría hash y autenticación en el servidor.

## Estructura
```
proyecto-corte3/
├── backend/   db.json, package.json        (API REST con JSON Server)
└── frontend/  index.html, app.html, css/style.css, js/api.js, js/login.js, js/app.js
```

## Cómo ejecutar
1. Backend: `cd backend`, `npm install`, `npm start` (queda en http://localhost:3000).
2. Frontend: abrir `frontend/index.html` con Live Server de VS Code (o cualquier servidor estático).

Usuarios de prueba: `admin / admin123` (administrador) y `usuario / usuario123` (global).

## Documentación de las APIs
**API propia (JSON Server, http://localhost:3000)**
| Método | Ruta | Uso |
|---|---|---|
| GET | /usuarios, /articulos | Listar |
| GET | /usuarios/{id}, /articulos/{id} | Consultar uno |
| GET | /usuarios?usuario=x&clave=y | Login (filtro por parámetros de URL) |
| POST | /usuarios, /articulos | Crear (requiere `Content-Type: application/json`) |
| PUT / PATCH | /usuarios/{id}, /articulos/{id} | Reemplazar / modificar parcialmente |
| DELETE | /usuarios/{id}, /articulos/{id} | Eliminar |

**API pública:** `GET https://picsum.photos/v2/list?page=1&limit=12` devuelve `id, author, width, height, url, download_url`. (El endpoint `/list` usado en la guía de clase fue retirado; `/v2/list` es el vigente.)

## Cómo se conectan las partes
```
Navegador (index.html / app.html)
   │ fetch() ───────────► JSON Server :3000 ──► db.json  (usuarios, articulos)
   │ fetch() ───────────► picsum.photos (API pública)
   └ localStorage: guarda la sesión {id, nombre, usuario, email, rol}
```

## Fuentes
Guías de clase: "Cómo usar la API Fetch de JavaScript", "Instalar y configurar JSON Server"; ejemplo CRUD con Fetch del 20 de mayo; documentación de Bootstrap 5, JSON Server y Picsum Photos.
