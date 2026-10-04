# ValidaciÃ³n local â€” 3 de octubre de 2026

## ImplementaciÃ³n de la revisiÃ³n de experiencia

- Encuesta: borrador de sesiÃ³n validado, descarte, confirmaciÃ³n de horas, mensajes junto a campos pendientes, consentimiento renovado y recuperaciÃ³n del mismo UUID/payload tras recarga. Se simulÃ³ un envÃ­o recibido por el servidor con respuesta de red perdida; el reintento no duplicÃ³ el registro.
- Quiz: avance manual por defecto, preferencia automÃ¡tica explÃ­cita, encabezado compacto, ayuda bajo el intento y celebraciones cada tres aciertos consecutivos o en la Ãºltima respuesta. Se consolidaron sus ajustes en quiz-experience.css. En 390 Ã— 844 px, la acciÃ³n inicial queda entre 778 y 828 px; tras seleccionar, entre 794 y 844 px. Las preguntas mÃ¡s largas y pantallas mÃ¡s bajas pueden requerir desplazamiento.
- Inicio: intenciÃ³n diaria cerca del encabezado, acciÃ³n secundaria hacia ese hÃ¡bito, siguiente paso solo al retomar y tres tarjetas inferiores equilibradas. Ilustraciones WebP de 480/800/1254 px: 30734/66644/130256 bytes frente a 743956 bytes del original. Las pÃ¡ginas se cargan por separado; el paquete JS inicial pasÃ³ de unos 425,5 KB a 377,7 KB, sin comprimir. No se midiÃ³ rendimiento de usuarios reales.
- AdministraciÃ³n: anÃ¡lisis filtrado de hÃ¡bitos, utilidad y cinco preguntas con menos aciertos; versiones de cuestionario, CSV original, CSV legible ES/EN y diccionario protegido. La migraciÃ³n conserva registros existentes y excluye versiones desconocidas del anÃ¡lisis por pregunta.
- 27 pruebas del servidor aprobadas, incluida migraciÃ³n de la base anterior y anÃ¡lisis/exportaciÃ³n filtrados. Se comprobaron 118 casos de frontend en varias ejecuciones de escritorio y mÃ³vil emulado: los cuatro casos que fallaron por nuevas etiquetas y auditorÃ­a durante la transiciÃ³n de tema se corrigieron; otros cuatro de temporizadores requirieron esperar carga diferida y avanzar el reloj simulado. Las repeticiones independientes pasaron. Las auditorÃ­as finales de quiz y pÃ¡ginas revisadas en ambos temas tambiÃ©n pasaron.
- Se probaron nueve anchos entre 320 y 1920 px, navegaciÃ³n, recuperaciÃ³n, idiomas, actividades, exportaciÃ³n y controles tÃ¡ctiles. No se usÃ³ hardware fÃ­sico ni lectores de pantalla.
- Copia y restauraciÃ³n con integridad y contenido comprobados en datos de prueba. Se guardÃ³ una copia previa de la base local en backups/pre-refinement-2026-10-03.sqlite3 (cero respuestas). La nueva versiÃ³n estÃ¡ activa en puerto 8000; salud 200, ruta profunda 200 y diccionario sin autenticaciÃ³n 401.
- CompilaciÃ³n y formato correctos. Los datos ficticios permanecen en tmp/refinement-data. El aviso de deprecaciÃ³n de Starlette/httpx no causa fallos.
- Se intentÃ³ leer los diez enlaces de YouTube; la herramienta devolviÃ³ limitaciÃ³n o error en todos. No se certifica disponibilidad, reproducciÃ³n ni subtÃ­tulos. Docker no estÃ¡ disponible en el equipo; dominio, HTTPS, proxy y despliegue siguen sin verificar. El cierre editorial y estos pasos estÃ¡n en PUBLICATION-CHECKLIST.md.

## Mejora de la experiencia del quiz final

- Se renovaron la lectura de preguntas, selecciÃ³n de opciones, estados de respuesta, progreso por pregunta y distribuciÃ³n tÃ¡ctil. El foco acompaÃ±a cada pregunta y el resultado, respetando la preferencia de movimiento reducido.
- El resultado presenta un indicador circular, aciertos por mÃ³dulo, una recomendaciÃ³n hacia la primera lecciÃ³n que necesita repaso y acceso a prÃ¡ctica de errores, encuesta y nuevo intento. El puntaje accesible es estable durante la animaciÃ³n visual.
- Los intentos retomados reconstruyen el progreso con respuestas verificadas por el servidor. La prÃ¡ctica parcial indica que solo los quizzes completos se almacenan en el servidor.
- 24 casos del quiz comprobados en escritorio y mÃ³vil emulado: calificaciÃ³n, guardado, reintento de red, recuperaciÃ³n, idioma, avance automÃ¡tico, pausa y repaso. Tres casos requirieron repetir la ejecuciÃ³n por una colisiÃ³n entre directorios de trazas de dos procesos de Playwright; la repeticiÃ³n independiente pasÃ³.
- AuditorÃ­as automÃ¡ticas WCAG sin infracciones en los estados revisados de feedback oscuro y resultados claros/oscuros, incluyendo 320 px. Tres matrices adicionales comprobaron las 16 rutas a 320, 600 y 1440 px. Capturas de pregunta y resultado inspeccionadas visualmente.
- CompilaciÃ³n de producciÃ³n y formato correctos. Datos de estas pruebas aislados en tmp/quiz-experience-data; no se alterÃ³ la base real. No se probÃ³ hardware mÃ³vil fÃ­sico.

La versiÃ³n compilada se sirve en http://127.0.0.1:8000 mediante FastAPI, con frontend y API en el mismo origen. La contraseÃ±a local se conserva exclusivamente en backend/.env, fuera del repositorio. La base real no contiene encuestas ni quizzes de prueba.

## Comprobaciones

- CompilaciÃ³n de producciÃ³n correcta y formato Prettier correcto.
- Servidor: 25 pruebas aprobadas. Incluyen validaciÃ³n, guardado persistente, idempotencia, autenticaciÃ³n, cierre de sesiÃ³n, cambio de contraseÃ±a, lÃ­mites de acceso, cookie Secure en HTTPS, paginaciÃ³n y CSV con acentos y protecciÃ³n contra fÃ³rmulas.
- Recorrido existente: 90 pruebas de navegador aprobadas en Chromium de escritorio y mÃ³vil emulado. Incluyen las diez lecciones, idiomas, quiz, prÃ¡cticas, continuidad de temporizadores, almacenamiento bloqueado, errores de red, teclado y anchos de 320 a 1920 pÃ­xeles.
- Funciones nuevas: 8 pruebas de navegador para encuesta â†’ panel â†’ CSV, videoteca, inserciÃ³n solo al reproducir, filtros, lectura en ambos temas, quiz oscuro con comprobante y vista de temas con retorno del foco.
- Axe: recorrido original y nuevas pÃ¡ginas en temas claro/oscuro; panel autenticado con detalles abiertos; feedback y resultados del quiz oscuro. No equivale a certificaciÃ³n de accesibilidad.
- InspecciÃ³n visual de inicio, encuesta, videoteca y panel en escritorio/mÃ³vil, ademÃ¡s de ambos temas. Capturas locales en artifacts/release-*.png.
- ComprobaciÃ³n adicional de controles de navegaciÃ³n a 320 pÃ­xeles en /videos, /survey y /admin.
- ConfiguraciÃ³n local: acceso administrativo y cierre de sesiÃ³n comprobados, cero registros reales.

## Datos y despliegue

- Los quizzes completos y las encuestas se guardan en SQLite; las correcciones individuales y repasos parciales no crean registros.
- Cada envÃ­o tiene un UUID para reintentar sin duplicarlo. El quiz conserva ese ID al retomar el borrador.
- La descarga abarca todos los registros del filtro aplicado, con UTF-8 BOM, separador punto y coma y fechas UTC.
- El contenedor dispone de /app/storage con permisos para su usuario. Debe montarse en disco persistente antes de publicar.
- Los datos ficticios de pruebas estÃ¡n en tmp/release-test-data y no pertenecen a la base real.

## LÃ­mites de verificaciÃ³n

- No se ha publicado un dominio ni verificado un hosting o HTTPS de producciÃ³n.
- El Dockerfile fue actualizado para persistencia; no se construyÃ³ ni ejecutÃ³ Docker en esta sesiÃ³n.
- Los diez enlaces de YouTube se integraron desde el documento; la lectura automÃ¡tica de YouTube fue bloqueada. Hay que comprobar reproducciÃ³n, subtÃ­tulos y permisos de inserciÃ³n antes de publicar. El test del iframe comprueba el enlace correcto y el consentimiento, no la reproducciÃ³n remota real.
- Las fuentes, atribuciones y revisiÃ³n acadÃ©mica seÃ±aladas en los JSON conservan sus marcas de revisiÃ³n. Los enlaces aportados no constituyen una aprobaciÃ³n editorial.
- No se midieron Core Web Vitals de usuarios reales ni se probÃ³ hardware fÃ­sico o lectores de pantalla.
- Starlette emite un aviso de deprecaciÃ³n sobre el TestClient/httpx usado por las pruebas; no hubo fallos del servidor.

Comandos, configuraciÃ³n y operaciÃ³n en README.md.

## PostgreSQL para Render

- Soporte PostgreSQL mediante DATABASE_URL, conexiÃ³n remota cifrada y tablas en el esquema lumora. SQLite permanece para desarrollo local.
- Render rechaza envÃ­os y health checks si no hay DATABASE_URL. Una conexiÃ³n fallida devuelve 503 sin almacenar en SQLite ni revelar credenciales.
- GitHub Actions ejecutÃ³ la compilaciÃ³n del frontend y 43 pruebas aprobadas con SQLite y PostgreSQL 17 real; una prueba de migraciÃ³n de archivo SQLite se omite para PostgreSQL. Resultado: https://github.com/mxximo/Lomura/actions/runs/37173257738.
- Verificados envÃ­o de encuesta, quiz completo, reintentos sin duplicaciÃ³n, conflictos de UUID, sesiones, lÃ­mites de acceso, filtros, paginaciÃ³n, mÃ©tricas y CSV sobre ambos motores.
- La cuenta Supabase del usuario y su conexiÃ³n desde Render todavÃ­a no estÃ¡n configuradas. La imagen Docker no se construyÃ³ en esta comprobaciÃ³n. Pasos de conexiÃ³n y comprobaciÃ³n de persistencia tras reinicio en DEPLOY-RENDER.md.

## RevisiÃ³n mÃ³vil y crÃ©ditos

ActualizaciÃ³n del 3 de octubre de 2026:

- 24 pruebas de diseÃ±o adaptable y flujos mÃ³viles aprobadas: las 16 rutas se revisaron a 320, 360, 390, 430, 600, 768, 1024, 1440 y 1920 pÃ­xeles; tambiÃ©n navegaciÃ³n horizontal y texto ampliado.
- Encuesta enviada, video insertado y panel autenticado con detalle de respuesta comprobados a 320 pÃ­xeles. Se ajustaron textarea a 16 px, lectura de lecciones, controles tÃ¡ctiles, filtros, mÃ©tricas, paginaciÃ³n y detalles administrativos.
- 6 pruebas adicionales de crÃ©ditos, teclado y accesibilidad del recorrido aprobadas en escritorio y mÃ³vil emulado.
- CrÃ©ditos: se conservan 37 referencias (15 fuentes, 11 ilustraciones, 10 videos y una entrada de tipografÃ­as). Se presentan en cuatro grupos desplegables, uno abierto a la vez, con citas copiables. La nota de autorÃ­a pasa al final y se corrigiÃ³ la afirmaciÃ³n desactualizada sobre videos no seleccionados.
- VerificaciÃ³n adicional de crÃ©ditos abiertos en inglÃ©s y tema oscuro a 320 pÃ­xeles. Se corrigiÃ³ el contraste del fondo de las citas.
- CompilaciÃ³n final correcta. Las pruebas siguen usando datos separados de la base real. Las comprobaciones de pantalla son emulaciones de Chromium; no se usÃ³ un telÃ©fono fÃ­sico.

## Ilustraciones de lecciones

- Diez SVG originales renovados con paleta compartida, escenas mÃ¡s detalladas y textos alternativos bilingÃ¼es. Archivos de aproximadamente 2.5â€“4.4 KB, sin dependencias de imÃ¡genes externas.
- ErgonomÃ­a representa respaldo y apoyo lumbar, pies en el suelo, antebrazos alineados y borde superior de pantalla ligeramente debajo de la mirada; referencias OSHA conservadas en los crÃ©ditos.
- XML de los diez SVG vÃ¡lido. CompilaciÃ³n Vite y 27 pruebas del backend aprobadas.
- Tres matrices de 16 rutas aprobadas a 320, 390 y 1440 pÃ­xeles. Comprobadas las diez imÃ¡genes en ambos temas, a 320 y 1440 pÃ­xeles: cargan, mantienen proporciÃ³n y permanecen dentro de la pantalla (40 comprobaciones).
- RevisiÃ³n visual de la colecciÃ³n completa y de ergonomÃ­a integrada en la lecciÃ³n. Capturas en `artifacts/lesson-art-v2-contact-sheet.png` y `artifacts/ergonomics-{light,dark}-{320,1440}.png`. Se utilizÃ³ Chromium emulado.

## Identidad y experiencia de Lumora

- Portada con el lema elegido, firma de marca y datos de acceso; paleta ajustada al sÃ­mbolo de Lumora. Ilustraciones visibles en los cinco mÃ³dulos, tarjetas de video con mejor separaciÃ³n y menÃº mÃ³vil con icono de cierre explÃ­cito.
- CompilaciÃ³n Vite correcta. Diez pruebas de diseÃ±o adaptable cubren 16 rutas entre 320 y 1920 px, orientaciÃ³n horizontal y lectura ampliada. Siete comprobaciones adicionales cubren accesibilidad, recorrido con teclado, preferencias y ambos temas; otras dos en mÃ³vil emulado cubren menÃº y accesibilidad de seis rutas en ambos temas.
- Las auditorÃ­as automÃ¡ticas axe no detectaron infracciones en el alcance comprobado. Capturas en `artifacts/lumora-refresh-{light,dark}-{390,1440}.png`. No se usÃ³ hardware fÃ­sico.

## Navegación editorial y comentarios

- Cabecera continua con firma tipográfica, enlaces subrayados y menú móvil numerado. Los números decorativos no alteran los nombres accesibles; el enlace activo distingue los destinos de la portada.
- Comentarios bilingües persistentes con consentimiento, aprobación administrativa, paginación, protección de origen, límite por hora y reintentos por UUID. El panel permite publicar, retirar y descargar CSV protegido contra fórmulas.
- 24 pruebas Playwright aprobadas en escritorio y móvil emulado: rutas entre 320 y 1920 px, navegación ampliada, envío, moderación, exportación y retirada. Axe sin infracciones detectadas en formulario y menú a 320 px, en ambos temas.
- Backend: 34 pruebas locales aprobadas; 16 comprobaciones PostgreSQL requieren la base de integración de CI y se omiten localmente. Compilación Vite correcta. Capturas revisadas en `artifacts/editorial-{320,1440}.png`, `artifacts/editorial-menu-320.png` y `artifacts/comments-{320,1440}.png`.

## Fotografías de lecciones

- Diez fotografías obtenidas de Pexels sustituyen las ilustraciones de las lecciones, tarjetas y vistas previas de video. Fuentes y licencia consultadas el 3 de octubre de 2026; créditos existentes actualizados, sin añadir referencias duplicadas.
- Veinte archivos WebP de 480/960 px suman 465,546 bytes. Se sirven desde el proyecto con srcset, dimensiones estables y descripciones bilingües del encuadre real. El símbolo y la portada de Lumora se conservan.
- Comprobadas las diez imágenes a 320 y 1440 px en ambos temas (40 cargas sin desbordamiento). Tres matrices de 16 rutas aprobadas a 320, 390 y 1440 px. Backend: 34 pruebas locales aprobadas, 16 de PostgreSQL omitidas localmente. Compilación Vite correcta.
- Colección revisada en `artifacts/photos-final.jpg` y capturas de ergonomía en `artifacts/photo-ergonomics-{light,dark}-{320,1440}.png`. Fotografías de ambientación: las recomendaciones técnicas se mantienen en el texto y las actividades.
