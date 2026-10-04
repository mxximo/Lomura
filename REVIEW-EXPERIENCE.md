# Revisión de experiencia y preparación para publicar

Fecha: 3 de octubre de 2026. Versión local en http://127.0.0.1:8000.

Actualización tras la autorización: se implementaron borrador de encuesta con reintento idempotente y consentimiento renovado, confirmación de horas, quiz compacto con ritmo manual, jerarquía del inicio, ilustración adaptable, carga diferida de páginas, análisis administrativo, CSV legible, diccionario y versión de cuestionario. También se añadió y probó copia/restauración de SQLite. Los resultados y límites están en VALIDATION.md; los pendientes editoriales y de producción están en PUBLICATION-CHECKLIST.md. Las secciones siguientes conservan el diagnóstico previo como referencia.

La identidad visual es consistente: fondos cálidos, verde y violeta, ilustraciones y buen contraste. La siguiente mejora debería reducir fricción y dar más dirección al recorrido. Añadir más efectos por sí solo no resolvería los puntos encontrados.

## Evidencia de esta revisión

Se inspeccionaron el código, el contenido, la configuración de despliegue y seis rutas en Chromium a 390 × 844 y 1440 × 844 píxeles. Se revisaron capturas del inicio en ambos tamaños. Las auditorías automáticas WCAG 2 A/AA y 2.1 AA no encontraron infracciones en esos doce estados iniciales; tampoco hubo desbordamiento horizontal. Esto no cubre todos los estados interactivos, lectores de pantalla ni teléfonos físicos.

| Ruta | Longitud en móvil de 390 px | Observación |
| --- | --- | --- |
| Inicio | 6,2 pantallas | 27 enlaces/botones visibles en el contenido completo; varios accesos conducen al mismo siguiente paso. |
| Lección 20-20-20 | 4,3 pantallas | El botón Iniciar está a 3030 px del comienzo. Existe un enlace para saltar a la práctica. |
| Videoteca | 6,9 pantallas | Diez videos con acciones repetidas; hay filtro por módulo. |
| Quiz | 1,7 pantallas | Comprobar respuesta comienza a 1110 px; no entra en la primera pantalla de 844 px. |
| Encuesta | 3 pantallas | Enviar comienza a 2195 px. El texto de prueba desaparece al recargar. |
| Administración | 1,2 pantallas | Se revisó visualmente el acceso; el panel autenticado se evaluó por código y las pruebas anteriores. |

Las medidas incluyen el pie de página. La longitud no es un fallo por sí misma: sirve para localizar dónde queda cada acción. Los valores describen esta emulación, no tasas de abandono reales.

## Mejoras prioritarias

### 1. Encuesta: conservar el trabajo del usuario

**Hallazgo confirmado:** se rellenó el comentario y se recargó la página; quedó vacío en ambos tamaños. Survey.jsx mantiene las respuestas solo en memoria. El quiz sí dispone de recuperación.

**Propuesta:** guardar temporalmente un borrador en la sesión del navegador, ofrecer continuar o descartar y borrarlo al enviar correctamente. No marcar automáticamente el consentimiento al restaurar. Mostrar la validación junto a la pregunta y llevar el foco al primer campo pendiente. Mantener el ID del envío para los reintentos de red.

**Criterio de aceptación:** un envío fallido, recarga o navegación de vuelta conservan las respuestas dentro de la sesión; un envío confirmado elimina el borrador y no crea duplicados.

### 2. Quiz: llevar la interacción más arriba y dar tiempo para aprender

**Hallazgo confirmado:** el encabezado, la explicación, privacidad, preferencia de ritmo, tema, progreso y ánimo preceden a las opciones. El botón queda por debajo de la primera pantalla en móvil y escritorio de 844 px de altura. El avance correcto sigue siendo automático a los tres segundos.

**Propuesta:** compactar el encabezado durante el intento, agrupar las ayudas y poner pregunta, opciones y acción en el centro de la experiencia. Usar avance manual por defecto para permitir leer la explicación; conservar el avance automático como preferencia explícita. Celebrar hitos o el resultado para dar más valor a la celebración.

**Criterio de aceptación:** la primera opción aparece sin una larga introducción; en preguntas cortas, la acción requiere menos desplazamiento; la explicación permanece hasta que el usuario decide continuar. Mantener teclado, movimiento reducido, recuperación y guardado.

### 3. Inicio: una dirección clara y mejor composición

**Hallazgo confirmado:** conviven Comenzar, Explorar, Recorrido guiado, Concentrarse en los temas, Tu siguiente paso, cinco tarjetas y una intención diaria. En escritorio, cuatro tarjetas inferiores dentro de una cuadrícula de tres columnas dejan el recordatorio solo en otra fila y un gran espacio lateral vacío.

**Propuesta:** hacer de Comenzar/Continuar la acción dominante; ofrecer Elegir un hábito como segunda alternativa. Agrupar accesos complementarios, acercar la intención diaria al inicio y equilibrar la cuadrícula inferior. Mantener disponibles todos los temas y la encuesta.

**Criterio de aceptación:** el visitante identifica qué hacer primero; el usuario que regresa reconoce dónde continuar; la fila inferior se ve equilibrada en escritorio y compacta en móvil.

### 4. Rendimiento móvil: reducir la carga inicial

**Hallazgo confirmado:** hero-premium.webp pesa 743956 bytes (aproximadamente 744 KB); el paquete JavaScript compilado tiene 425528 bytes y CSS 110407 bytes, antes de compresión de transferencia. App.jsx importa todas las páginas directamente, incluyendo administración. main.jsx acumula once capas de estilos.

**Propuesta:** servir tamaños adecuados de la ilustración con srcset/sizes, dividir páginas con carga diferida y consolidar estilos de componentes para reducir reglas que se sobrescriben. Mantener la imagen principal prioritaria y la reserva de dimensiones.

**Criterio de aceptación:** menor descarga inicial sin pérdida visual ni cambio brusco del diseño. Medir antes y después con el mismo perfil de red y dispositivo; esta revisión no permite afirmar que la web sea lenta en producción.

### 5. Datos: que administración ayude a interpretar

**Hallazgo confirmado por código:** el panel tiene conteos de encuestas/quizzes y promedio del quiz. El CSV usa identificadores q1–q10 y códigos de opciones/hábitos; no incorpora un diccionario ni resultados por tema. El indicador de horas del inicio usa 0–16, mientras que la encuesta usa 0–24 y ambos arrancan en 6.

**Propuesta:** añadir distribución de hábitos, utilidad de la experiencia y preguntas que más cuesta responder. Ofrecer exportación legible junto al formato de análisis actual, con diccionario y versión del cuestionario. Clarificar que cada registro es un envío, no necesariamente un usuario distinto. Unificar la pregunta de horas y exigir confirmación del valor para no confundir el valor inicial con una respuesta deliberada.

**Criterio de aceptación:** el administrador interpreta un archivo sin consultar el código; las estadísticas respetan los mismos filtros de la exportación. No vincular encuesta y quiz para inferir personas sin una necesidad explícita.

### 6. Cierre editorial y despliegue

**Pendientes documentados:** fuentes y videos conservan marcas de revisión. No se ha confirmado la reproducción real ni los subtítulos de los diez videos. El contenedor y el dominio de producción no se han probado. Las copias de respaldo se explican en README, pero no existe en el proyecto un procedimiento automatizado de copia y restauración.

**Propuesta:** reproducir cada video y comprobar títulos, subtítulos y permiso de inserción; cerrar la revisión de contenidos; probar el contenedor con volumen persistente, HTTPS, envío, exportación y restauración de una copia. Confirmar el funcionamiento de cookies y límite de acceso detrás del proxy elegido. Añadir metadatos de enlace compartido cuando se conozca el dominio.

**Criterio de aceptación:** un reinicio conserva respuestas, una copia permite recuperarlas y una encuesta enviada en el dominio definitivo aparece en la exportación protegida.

## Orden recomendado

Primero, continuidad de la encuesta y ritmo/compactación del quiz. Después, jerarquía del inicio y carga inicial. Luego, lectura de datos y validación de publicación. La revisión editorial y de videos puede avanzar junto a las mejoras de interfaz.

Los hallazgos visuales son juicio de diseño apoyado por las capturas; no sustituyen observar a usuarios reales. Sería útil ver a tres personas completar una lección, el quiz y la encuesta sin instrucciones adicionales y registrar dónde dudan.

Evidencias locales: artifacts/review-experience.json, capturas artifacts/review-*.png y script reproducible tmp/review-experience.cjs. Esta revisión no cambió la aplicación ni envió respuestas al servidor.
