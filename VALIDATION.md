# Validación local — 3 de octubre de 2026

## Implementación de la revisión de experiencia

- Encuesta: borrador de sesión validado, descarte, confirmación de horas, mensajes junto a campos pendientes, consentimiento renovado y recuperación del mismo UUID/payload tras recarga. Se simuló un envío recibido por el servidor con respuesta de red perdida; el reintento no duplicó el registro.
- Quiz: avance manual por defecto, preferencia automática explícita, encabezado compacto, ayuda bajo el intento y celebraciones cada tres aciertos consecutivos o en la última respuesta. Se consolidaron sus ajustes en quiz-experience.css. En 390 × 844 px, la acción inicial queda entre 778 y 828 px; tras seleccionar, entre 794 y 844 px. Las preguntas más largas y pantallas más bajas pueden requerir desplazamiento.
- Inicio: intención diaria cerca del encabezado, acción secundaria hacia ese hábito, siguiente paso solo al retomar y tres tarjetas inferiores equilibradas. Ilustraciones WebP de 480/800/1254 px: 30734/66644/130256 bytes frente a 743956 bytes del original. Las páginas se cargan por separado; el paquete JS inicial pasó de unos 425,5 KB a 377,7 KB, sin comprimir. No se midió rendimiento de usuarios reales.
- Administración: análisis filtrado de hábitos, utilidad y cinco preguntas con menos aciertos; versiones de cuestionario, CSV original, CSV legible ES/EN y diccionario protegido. La migración conserva registros existentes y excluye versiones desconocidas del análisis por pregunta.
- 27 pruebas del servidor aprobadas, incluida migración de la base anterior y análisis/exportación filtrados. Se comprobaron 118 casos de frontend en varias ejecuciones de escritorio y móvil emulado: los cuatro casos que fallaron por nuevas etiquetas y auditoría durante la transición de tema se corrigieron; otros cuatro de temporizadores requirieron esperar carga diferida y avanzar el reloj simulado. Las repeticiones independientes pasaron. Las auditorías finales de quiz y páginas revisadas en ambos temas también pasaron.
- Se probaron nueve anchos entre 320 y 1920 px, navegación, recuperación, idiomas, actividades, exportación y controles táctiles. No se usó hardware físico ni lectores de pantalla.
- Copia y restauración con integridad y contenido comprobados en datos de prueba. Se guardó una copia previa de la base local en backups/pre-refinement-2026-10-03.sqlite3 (cero respuestas). La nueva versión está activa en puerto 8000; salud 200, ruta profunda 200 y diccionario sin autenticación 401.
- Compilación y formato correctos. Los datos ficticios permanecen en tmp/refinement-data. El aviso de deprecación de Starlette/httpx no causa fallos.
- Se intentó leer los diez enlaces de YouTube; la herramienta devolvió limitación o error en todos. No se certifica disponibilidad, reproducción ni subtítulos. Docker no está disponible en el equipo; dominio, HTTPS, proxy y despliegue siguen sin verificar. El cierre editorial y estos pasos están en PUBLICATION-CHECKLIST.md.

## Mejora de la experiencia del quiz final

- Se renovaron la lectura de preguntas, selección de opciones, estados de respuesta, progreso por pregunta y distribución táctil. El foco acompaña cada pregunta y el resultado, respetando la preferencia de movimiento reducido.
- El resultado presenta un indicador circular, aciertos por módulo, una recomendación hacia la primera lección que necesita repaso y acceso a práctica de errores, encuesta y nuevo intento. El puntaje accesible es estable durante la animación visual.
- Los intentos retomados reconstruyen el progreso con respuestas verificadas por el servidor. La práctica parcial indica que solo los quizzes completos se almacenan en el servidor.
- 24 casos del quiz comprobados en escritorio y móvil emulado: calificación, guardado, reintento de red, recuperación, idioma, avance automático, pausa y repaso. Tres casos requirieron repetir la ejecución por una colisión entre directorios de trazas de dos procesos de Playwright; la repetición independiente pasó.
- Auditorías automáticas WCAG sin infracciones en los estados revisados de feedback oscuro y resultados claros/oscuros, incluyendo 320 px. Tres matrices adicionales comprobaron las 16 rutas a 320, 600 y 1440 px. Capturas de pregunta y resultado inspeccionadas visualmente.
- Compilación de producción y formato correctos. Datos de estas pruebas aislados en tmp/quiz-experience-data; no se alteró la base real. No se probó hardware móvil físico.

La versión compilada se sirve en http://127.0.0.1:8000 mediante FastAPI, con frontend y API en el mismo origen. La contraseña local se conserva exclusivamente en backend/.env, fuera del repositorio. La base real no contiene encuestas ni quizzes de prueba.

## Comprobaciones

- Compilación de producción correcta y formato Prettier correcto.
- Servidor: 25 pruebas aprobadas. Incluyen validación, guardado persistente, idempotencia, autenticación, cierre de sesión, cambio de contraseña, límites de acceso, cookie Secure en HTTPS, paginación y CSV con acentos y protección contra fórmulas.
- Recorrido existente: 90 pruebas de navegador aprobadas en Chromium de escritorio y móvil emulado. Incluyen las diez lecciones, idiomas, quiz, prácticas, continuidad de temporizadores, almacenamiento bloqueado, errores de red, teclado y anchos de 320 a 1920 píxeles.
- Funciones nuevas: 8 pruebas de navegador para encuesta → panel → CSV, videoteca, inserción solo al reproducir, filtros, lectura en ambos temas, quiz oscuro con comprobante y vista de temas con retorno del foco.
- Axe: recorrido original y nuevas páginas en temas claro/oscuro; panel autenticado con detalles abiertos; feedback y resultados del quiz oscuro. No equivale a certificación de accesibilidad.
- Inspección visual de inicio, encuesta, videoteca y panel en escritorio/móvil, además de ambos temas. Capturas locales en artifacts/release-*.png.
- Comprobación adicional de controles de navegación a 320 píxeles en /videos, /survey y /admin.
- Configuración local: acceso administrativo y cierre de sesión comprobados, cero registros reales.

## Datos y despliegue

- Los quizzes completos y las encuestas se guardan en SQLite; las correcciones individuales y repasos parciales no crean registros.
- Cada envío tiene un UUID para reintentar sin duplicarlo. El quiz conserva ese ID al retomar el borrador.
- La descarga abarca todos los registros del filtro aplicado, con UTF-8 BOM, separador punto y coma y fechas UTC.
- El contenedor dispone de /app/storage con permisos para su usuario. Debe montarse en disco persistente antes de publicar.
- Los datos ficticios de pruebas están en tmp/release-test-data y no pertenecen a la base real.

## Límites de verificación

- No se ha publicado un dominio ni verificado un hosting o HTTPS de producción.
- El Dockerfile fue actualizado para persistencia; no se construyó ni ejecutó Docker en esta sesión.
- Los diez enlaces de YouTube se integraron desde el documento; la lectura automática de YouTube fue bloqueada. Hay que comprobar reproducción, subtítulos y permisos de inserción antes de publicar. El test del iframe comprueba el enlace correcto y el consentimiento, no la reproducción remota real.
- Las fuentes, atribuciones y revisión académica señaladas en los JSON conservan sus marcas de revisión. Los enlaces aportados no constituyen una aprobación editorial.
- No se midieron Core Web Vitals de usuarios reales ni se probó hardware físico o lectores de pantalla.
- Starlette emite un aviso de deprecación sobre el TestClient/httpx usado por las pruebas; no hubo fallos del servidor.

Comandos, configuración y operación en README.md.

## PostgreSQL para Render

- Soporte PostgreSQL mediante DATABASE_URL, conexión remota cifrada y tablas en el esquema lumora. SQLite permanece para desarrollo local.
- Render rechaza envíos y health checks si no hay DATABASE_URL. Una conexión fallida devuelve 503 sin almacenar en SQLite ni revelar credenciales.
- GitHub Actions ejecutó la compilación del frontend y 43 pruebas aprobadas con SQLite y PostgreSQL 17 real; una prueba de migración de archivo SQLite se omite para PostgreSQL. Resultado: https://github.com/mxximo/Lomura/actions/runs/37173257738.
- Verificados envío de encuesta, quiz completo, reintentos sin duplicación, conflictos de UUID, sesiones, límites de acceso, filtros, paginación, métricas y CSV sobre ambos motores.
- La cuenta Supabase del usuario y su conexión desde Render todavía no están configuradas. La imagen Docker no se construyó en esta comprobación. Pasos de conexión y comprobación de persistencia tras reinicio en DEPLOY-RENDER.md.

## Revisión móvil y créditos

Actualización del 3 de octubre de 2026:

- 24 pruebas de diseño adaptable y flujos móviles aprobadas: las 16 rutas se revisaron a 320, 360, 390, 430, 600, 768, 1024, 1440 y 1920 píxeles; también navegación horizontal y texto ampliado.
- Encuesta enviada, video insertado y panel autenticado con detalle de respuesta comprobados a 320 píxeles. Se ajustaron textarea a 16 px, lectura de lecciones, controles táctiles, filtros, métricas, paginación y detalles administrativos.
- 6 pruebas adicionales de créditos, teclado y accesibilidad del recorrido aprobadas en escritorio y móvil emulado.
- Créditos: se conservan 37 referencias (15 fuentes, 11 ilustraciones, 10 videos y una entrada de tipografías). Se presentan en cuatro grupos desplegables, uno abierto a la vez, con citas copiables. La nota de autoría pasa al final y se corrigió la afirmación desactualizada sobre videos no seleccionados.
- Verificación adicional de créditos abiertos en inglés y tema oscuro a 320 píxeles. Se corrigió el contraste del fondo de las citas.
- Compilación final correcta. Las pruebas siguen usando datos separados de la base real. Las comprobaciones de pantalla son emulaciones de Chromium; no se usó un teléfono físico.

## Ilustraciones de lecciones

- Diez SVG originales renovados con paleta compartida, escenas más detalladas y textos alternativos bilingües. Archivos de aproximadamente 2.5–4.4 KB, sin dependencias de imágenes externas.
- Ergonomía representa respaldo y apoyo lumbar, pies en el suelo, antebrazos alineados y borde superior de pantalla ligeramente debajo de la mirada; referencias OSHA conservadas en los créditos.
- XML de los diez SVG válido. Compilación Vite y 27 pruebas del backend aprobadas.
- Tres matrices de 16 rutas aprobadas a 320, 390 y 1440 píxeles. Comprobadas las diez imágenes en ambos temas, a 320 y 1440 píxeles: cargan, mantienen proporción y permanecen dentro de la pantalla (40 comprobaciones).
- Revisión visual de la colección completa y de ergonomía integrada en la lección. Capturas en `artifacts/lesson-art-v2-contact-sheet.png` y `artifacts/ergonomics-{light,dark}-{320,1440}.png`. Se utilizó Chromium emulado.
