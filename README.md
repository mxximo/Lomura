# Bienestar Digital

Web educativa bilingüe con cinco módulos, diez lecciones, actividades, videoteca, quiz, encuesta anónima y panel administrativo. React/Vite y FastAPI se sirven juntos en un solo dominio. SQLite conserva las respuestas.

## Abrir en este equipo

```powershell
.\scripts\serve.ps1
```

Abre http://127.0.0.1:8000. El script carga `backend/.env`, sin sustituir variables del entorno ya definidas. La contraseña local del panel está en ese archivo privado, excluido del repositorio. El entorno comprobado está en `.venv-release`: el antiguo `.venv` apuntaba a otro equipo.

Para una instalación nueva, con Python 3.12+ y Node compatible con Vite:

```powershell
python -m venv .venv-release
.\.venv-release\Scripts\python -m pip install -r backend\requirements-dev.txt
npm --prefix frontend ci
npm --prefix frontend run build
Copy-Item backend/.env.example backend/.env
```

Define `ADMIN_PASSWORD` con una contraseña propia de al menos 12 caracteres. El acceso administrativo queda deshabilitado si falta. No hay una contraseña pública por defecto. XAMPP y MySQL no son necesarios; abrir el HTML con file:// no funciona porque requiere su API.

Para desarrollo, inicia la API y ejecuta `npm --prefix frontend run dev` en otra terminal. Vite conecta `/api` al puerto 8000.

## Rutas

| Ruta | Función |
| --- | --- |
| `/` | Recorrido, progreso y accesos a recursos |
| `/learn/:slug` | Diez lecciones con prácticas y videos |
| `/videos` | Diez videos, filtrados por módulo |
| `/quiz` | Corrección inmediata, repaso y resultado guardado |
| `/survey` | Encuesta anónima con consentimiento y comprobante |
| `/credits` | Fuentes y atribuciones |
| `/admin` | Acceso protegido, métricas, filtros, paginación y CSV |

La interfaz conserva ES/EN, temas claro y oscuro, preferencias de lectura, modo concentración, foco de teclado y movimiento reducido. Las animaciones no ocultan contenido antes de que el usuario llegue a él.

El inicio ofrece un hábito diario junto al recorrido. La ilustración tiene versiones WebP de 480, 800 y 1254 px (aproximadamente 31, 67 y 130 KB). Las páginas de lecciones, quiz, encuesta, videoteca, créditos y administración se cargan por separado.

El quiz comienza con avance manual; la preferencia permite habilitar avance automático a los tres segundos de una respuesta correcta. Celebra hitos de tres aciertos consecutivos y la última respuesta. La ayuda y privacidad quedan en un desplegable bajo el intento.

La encuesta mantiene un borrador en sessionStorage dentro de la pestaña. Al recuperarlo pide de nuevo consentimiento; confirmar el número inicial de horas es obligatorio (mover el deslizador también lo confirma). El borrador se puede descartar y se elimina tras un envío confirmado. Un reintento sin cambios conserva su UUID y el payload, incluso después de recargar, para evitar duplicados si se perdió la respuesta de red.

## Videos del documento

Se integraron los diez enlaces de TALLER2-PARA PAGINA MULTIMEDIA.docx. Ergonomía tiene dos videos. Pomodoro no tiene un enlace específico en el documento y no se inventó uno. YouTube se conecta solo al pulsar reproducir; cada video incluye un enlace externo si la inserción está bloqueada.

No se pudo confirmar automáticamente la disponibilidad, el permiso de inserción ni los subtítulos de YouTube. Hay que reproducir los diez enlaces antes de publicar. La autoría, fechas y títulos originales pendientes de revisión permanecen señalados en los JSON de créditos. Los textos de las tarjetas identifican el tema de la lección, no pretenden ser títulos verificados del autor del video.

## Almacenamiento y panel

El progreso y las preferencias quedan en el navegador. Con `DATABASE_URL`, las encuestas enviadas y los quizzes completos se guardan en PostgreSQL, en el esquema privado `lumora`. Sin esa variable, el desarrollo local utiliza `responses.sqlite3`, dentro de `backend/storage` o de `DATA_DIR`. En Render se exige PostgreSQL para evitar perder datos al reiniciar. No se solicitan nombres ni correos. El comentario es opcional y recomienda evitar información personal.

La encuesta guarda horas de pantalla, pausas, desconexión antes de dormir, utilidad, hábito elegido, comentario y consentimiento. El quiz guarda las opciones elegidas y el puntaje calculado por el servidor. Las correcciones individuales y los repasos parciales no crean registros.

Cada envío tiene un UUID: repetir exactamente el mismo envío devuelve el mismo comprobante; reutilizar su ID con datos diferentes devuelve 409. El borrador del quiz conserva también su ID al retomarlo.

La administración usa sesiones de ocho horas, cookie HttpOnly y SameSite Strict, con Secure sobre HTTPS. Solo se guardan hashes de los tokens. Cambiar ADMIN_PASSWORD invalida las sesiones existentes. El acceso limita cinco intentos por dirección en cinco minutos. Panel y exportación usan no-store. La administración requiere el mismo origen que la API.

Los filtros usan fechas UTC. Las tarjetas muestran fechas en la zona del navegador. Hay veinte respuestas por página; el CSV descarga todos los registros del filtro aplicado. El archivo usa UTF-8 con BOM, separador punto y coma, fecha UTC y columnas q1–q10 con las opciones del quiz. Escapa texto que Excel podría interpretar como fórmulas. Los valores internos de hábitos se conservan en inglés para analizar datos de ambos idiomas de forma consistente.

El panel añade distribución de hábitos y utilidad, y las cinco preguntas con menor proporción de aciertos. Estos valores respetan el filtro aplicado y cuentan envíos, no personas distintas. Los quizzes tienen una versión calculada a partir de su contenido; los registros anteriores sin versión se conservan como legacy y se excluyen del desglose por pregunta. Encuesta: survey-v1. La migración de SQLite añade esta columna conservando los registros.

Además del CSV original hay un CSV legible en ES/EN y un diccionario descargable. El CSV original mantiene sus columnas y añade questionnaire_version al final. Los códigos de opciones de quizzes antiguos se conservan en el CSV legible cuando no se puede garantizar su correspondencia con el contenido actual.

### Copias verificadas y recuperación

Desde la raíz del proyecto:

```powershell
.\.venv-release\Scripts\python.exe scripts/data_backup.py backup --data-dir backend/storage --output backups/respuestas-2026-10-03.sqlite3
.\.venv-release\Scripts\python.exe scripts/data_backup.py restore --snapshot backups/respuestas-2026-10-03.sqlite3 --target-dir backups/recuperado-2026-10-03
```

La copia usa la API de backup de SQLite y comprueba integridad. La restauración exige un directorio nuevo o vacío y nunca sustituye la base activa. Comprueba el archivo recuperado, detén el servicio y configura DATA_DIR hacia ese directorio antes de arrancarlo. Protege las copias con el mismo control de acceso que los datos originales. La copia y restauración se probaron con datos ficticios; la programación y destino externo de respaldos corresponden al hosting elegido.

## Despliegue

```powershell
docker build -t digital-wellbeing:1.1 .
docker run --rm --name digital-wellbeing -p 8080:8000 --env-file backend/.env -v wellbeing-data:/app/storage digital-wellbeing:1.1
```

El contenedor compila React y sirve la API, recursos y rutas profundas como usuario sin privilegios. Para Render gratuito configura PostgreSQL mediante `DATABASE_URL`; pasos en [DEPLOY-RENDER.md](DEPLOY-RENDER.md). Si eliges SQLite en otro hosting, configura un volumen persistente en `/app/storage`: sin él, sustituir el contenedor pierde los datos. SQLite está pensado para un único servicio; varias réplicas independientes necesitan PostgreSQL compartido.

El Dockerfile está preparado, pero el contenedor no se ha ejecutado aquí. No se ha contratado hosting ni publicado un dominio. Después de desplegar, verifica `/api/health`, una ruta profunda, `/admin`, una encuesta y su exportación.

| Variable | Uso |
| --- | --- |
| ADMIN_PASSWORD | Contraseña privada, mínimo 12 caracteres |
| DATABASE_URL | URI PostgreSQL privada; Supabase Session pooler en puerto 5432 |
| DATA_DIR | Directorio persistente de SQLite; Docker: /app/storage |
| PORT | Puerto del contenedor, 8000 por defecto |
| FRONTEND_DIST | Ubicación opcional del frontend compilado |
| ALLOWED_ORIGINS | Orígenes CORS exactos; por defecto localhost:5173 y 127.0.0.1:5173 |
| VITE_API_URL | Vacía para frontend y API en el mismo dominio |

No copies `backend/.env` al frontend ni al repositorio. `.dockerignore` excluye datos y credenciales locales. Para SQLite haz copias con su API de backup o con el servicio detenido; para PostgreSQL usa `pg_dump`. La carpeta local de datos nunca se sirve públicamente.

## API y pruebas

- GET `/api/modules`, `/api/quiz`, `/api/credits`: contenido.
- POST `/api/quiz/submit`: corrección sin almacenamiento.
- POST `/api/quiz/complete`: intento completo, UUID, idioma y comprobante.
- POST `/api/surveys`: encuesta validada y consentimiento.
- POST `/api/admin/login`, `/api/admin/logout`: sesiones.
- GET `/api/admin/responses`: registros, métricas y paginación.
- GET `/api/admin/export`: descarga protegida.
- `/api/docs`: contrato OpenAPI.

```powershell
.\.venv-release\Scripts\python -m pytest -c backend/pytest.ini backend/tests -q
```

Las pruebas del servidor usan datos temporales. Para Playwright inicia otra API en puerto 8001, `ADMIN_PASSWORD=test-only-long-password` y DATA_DIR en una carpeta de prueba. Desde frontend:

```powershell
$env:TEST_BASE_URL="http://127.0.0.1:8001"
npx playwright install chromium
npm run test:e2e
```

No ejecutes las pruebas de encuesta en producción: crean respuestas ficticias. La inspección con axe complementa la revisión visual y no sustituye una auditoría con lector de pantalla. Antes de publicar completa la revisión académica y bibliográfica marcada en los JSON. Las prácticas no sustituyen atención médica.

Las diez lecciones usan fotografías de Pexels alojadas en `frontend/public/media/photos/`, con variantes WebP de 480 y 960 px y textos alternativos bilingües. Autores, enlaces y licencia se conservan en `sources.json` y en `backend/app/data/credits.json`. Los SVG anteriores permanecen disponibles como material histórico; `scripts/build-lesson-art.cjs` regenera esas ilustraciones, no las fotografías activas.

La marca pública es Lumora: «Encuentra tu equilibrio digital». Su símbolo vectorial está en `frontend/public/media/lumora.svg`. Ejecuta `node scripts/build-brand-icons.cjs` desde la raíz para generar favicon SVG, ICO de 16/32/48 px e icono móvil de 180 px; requiere las dependencias de desarrollo del frontend y Chromium de Playwright.

Los comentarios de la portada (`/#comments`) se guardan en la misma base de datos y quedan pendientes hasta su aprobación. En `/admin`, la sección «Comentarios de la comunidad» permite publicar, retirar y exportar todos los comentarios a CSV. El formulario solicita consentimiento y admite alias opcional, con límite de cinco mensajes por hora y protección contra reintentos duplicados. No se publican mensajes de ejemplo.
