# Plan de evolución de Bienestar Digital

Plan original: 24 de septiembre de 2026. Actualización: 30 de septiembre de 2026.

## Estado de ejecución

Implementados: recuperación del quiz con validación de versión y corrección en servidor; sesión de práctica persistente y control flotante; resolución de sesiones simultáneas; carga independiente de quiz/créditos; reinicio confirmado del recorrido; secuencia de pausas activas; repaso de errores en quiz y phishing; resultados por módulo y vínculo con lección exacta; resumen local borrable; fuentes locales con licencias; imagen principal optimizada; superficies y coreografía separadas; controles de lectura/concentración; pausa accesible de carrusel y cancelación de transiciones obsoletas.

Pendientes reales: revisión editorial completa de fuentes/traducciones/autoría, aprobación de los cuatro videos, pruebas con dispositivos físicos y lectores de pantalla, medición de uso real, despliegue HTTPS y validación Docker. El motor de Docker no estaba disponible en la comprobación anterior. La consolidación completa del CSS histórico y avisos sonoros opcionales quedan como evolución; no bloquean los flujos actuales.

Las secciones siguientes conservan el diagnóstico inicial y los criterios del plan; no representan fallos aún presentes. Consulta VALIDATION.md para la evidencia final.

## Objetivo

Completar el recorrido de aprendizaje y práctica, con identidad visual propia, continuidad y una respuesta clara a cada acción. Conservar el fondo sólido, la paleta lila/salvia y las ilustraciones aprobadas. El vidrio debe aportar profundidad sin reducir la lectura.

## Punto de partida comprobado

- React y FastAPI, cinco módulos, diez lecciones, quiz y créditos; sin cuentas ni base de datos.
- Ya existen retorno a la última lección, progreso local, selector de lecciones en móvil, preferencias/checklists persistentes y estados de temporizador.
- El quiz tiene corrección en servidor, confeti, avance a los tres segundos, opción de seguir leyendo y reintento del resultado. Se corrigió la duplicación de elementos al cambiar de pregunta.
- La última ejecución registrada de Playwright terminó aprobada: 48 casos entre escritorio y móvil. El backend pasó 14 pruebas durante la revisión anterior. Esto no acredita aún dispositivos físicos, todos los navegadores ni rendimiento en hardware modesto.
- El quiz no conserva un intento al recargar o abandonar la ruta. Los temporizadores se desmontan al cambiar de lección.
- La carga inicial depende simultáneamente de módulos, quiz y créditos: un fallo de cualquiera bloquea toda la aplicación.
- `glass.css` acumula 3166 líneas. Hace falta consolidar reglas antes de seguir añadiendo capas de estilos.
- Faltan revisión editorial, autoría final y cuatro videos aprobados. README y VALIDATION necesitan actualizarse para reflejar los cambios recientes.

## Entrega 1 — Continuidad y recuperación

Prioridad máxima. Completar lo que sucede al recargar, salir, volver y fallar una petición.

| Proceso | Cambio propuesto | Condición de aceptación |
| --- | --- | --- |
| Quiz interrumpido | Guardar respuestas e índice localmente, con versión de contenido; ofrecer continuar o empezar de nuevo | Recargar en cualquier pregunta conserva el intento; la API vuelve a validar la corrección; una versión incompatible no mezcla preguntas |
| Temporizador activo | Mantener una sola sesión a nivel de aplicación y mostrar un control compacto al navegar | Cambiar de módulo conserva fase y tiempo; iniciar otra sesión exige resolver explícitamente la anterior |
| Pestaña suspendida | Definir recuperación de reloj y pausa real | Volver no cuenta descansos no realizados ni reproduce alertas acumuladas |
| Progreso | Estados pendiente, en curso y completada; permitir deshacer y reiniciar con confirmación | Ninguna lección se completa por visitarla; reiniciar explica qué se borrará |
| Almacenamiento | Versionar y validar datos, tolerar almacenamiento bloqueado y coordinar pestañas | No hay errores con datos dañados; no se promete guardado si falló; nunca se guardan contraseñas |
| API | Cargar módulos al entrar; quiz/créditos cuando se necesitan; errores y reintentos locales | Una caída de créditos no impide estudiar; una respuesta fallida no borra trabajo ni duplica envíos |

## Entrega 2 — Recorrido y actividades completos

Cada lección tendrá una secuencia reconocible: objetivo breve, explicación, práctica, resultado y siguiente acción. Evitar repetir etiquetas que no orienten al usuario.

- **Inicio:** priorizar continuar o elegir una práctica; mostrar lo realizado y el siguiente paso sin añadir paneles decorativos.
- **Lectura:** acceso directo a la práctica en móvil, navegación anterior/siguiente con contexto y opción de lectura más cómoda.
- **Salud visual:** inicio/pausa/descanso inequívocos; al terminar, indicar qué hacer; señal sonora opcional y desactivada por defecto.
- **Ergonomía:** cada punto debe explicar cómo revisarlo; cierre con ajustes pendientes, sin convertir el checklist en diagnóstico.
- **Pausa activa:** secuencia guiada con inicio, tiempo por ejercicio, omitir, pausa y cierre; selección individual disponible.
- **Seguridad:** explicación contextual de cada señal del medidor; en phishing, señalar los indicios del mensaje tras responder y permitir repetir errores.
- **Pomodoro:** configuración validada, resumen de la sesión y transición explícita entre foco y descanso; no contar productividad por dejar un reloj abierto.
- **Distracciones y notificaciones:** instrucciones concretas por plataforma, resultado vacío útil en filtros y cierre que convierta la simulación en una acción práctica.
- **Sueño:** resumen de rutina y hora de desconexión listo para consultar; permitir editar sin rehacer el checklist.

Aceptación: todas las actividades tienen entrada, acción, estado en curso, resultado y posibilidad de repetir; funcionan con teclado y en ambos idiomas.

## Entrega 3 — Quiz que ayude a aprender

- Resumen por módulo: qué se entendió y qué conviene repasar, además del puntaje.
- Asociar cada pregunta con su lección exacta; el enlace de repaso actual apunta a la primera lección del módulo.
- Repetir solamente preguntas falladas o repetir el quiz completo.
- Conservar un resumen local del último intento, con fecha y opción de borrado; explicar su alcance en preferencias.
- Ofrecer modo manual persistente para quien necesite leer con calma; mantener el avance automático aprobado por el usuario como opción predeterminada.
- Probar manual/automático simultáneos, red lenta, último envío fallido, cambio de idioma y navegación atrás.

Aceptación: ningún doble avance, resultados siempre corregidos por la API y acceso al repaso preciso. El confeti no intercepta clics ni persiste entre preguntas. La versión con movimiento reducido conserva toda la funcionalidad.

## Entrega 4 — Identidad visual y movimiento coherentes

Primero consolidar las reglas existentes; después refinar superficies y componentes.

- Definir variables únicas de color, tipografía, espaciado, bordes, sombras, transparencia y movimiento. Separar estilos de estructura, componentes y actividades.
- Tres tratamientos de superficie: fondo sólido; tarjetas de lectura estables; vidrio más visible en navegación, controles flotantes y paneles superpuestos.
- Mantener una tipografía de títulos y una de lectura; reservar monoespaciada para tiempos/datos. Cargar fuentes locales tras verificar su licencia.
- Dar a cada módulo un acento, ilustración y respuesta visual propios, conservando botones y navegación comunes.
- Iconos funcionales consistentes y etiquetas directas; eliminar indicadores decorativos sin significado.
- Cambio de lección con salida breve y entrada escalonada de título, lectura y actividad. La barra lateral conserva posición y contexto. La animación no bloquea la siguiente acción.
- Microinteracciones para pulsar, seleccionar, copiar, guardar y finalizar. Evitar movimientos permanentes, desenfoque del texto y animaciones simultáneas en contenedores anidados.
- Como punto de partida de diseño: controles 120–180 ms, paneles 220–320 ms y secuencias de contenido por debajo de 600 ms. Ajustar con pruebas, sin sumar demoras a cada clic.
- En móvil, priorizar acciones alcanzables y una columna legible; revisar también escritorio ancho, zoom del 200 % y textos largos en inglés.

Aceptación: no hay saltos de distribución ni texto ilegible durante las transiciones; cambiar rápidamente varias veces termina en la última lección elegida; movimiento reducido elimina las animaciones prescindibles.

## Entrega 5 — Contenido y publicación

- Revisar las diez lecciones, instrucciones, ejemplos y traducciones con el responsable editorial; resolver autoría, fuentes y fechas.
- Aprobar videos con licencia, subtítulos y alternativa textual. Mientras no existan, mantenerlos fuera del recorrido público.
- Retirar avisos de revisión únicamente al resolver los pendientes; conservar trazabilidad editorial fuera de la pantalla de aprendizaje.
- Actualizar README, evidencia de pruebas y política breve sobre datos locales y servicios externos.
- Preparar caché de recursos versionados, compresión en el servidor de publicación, páginas de error y diagnóstico operativo sin registrar contraseñas ni respuestas personales innecesarias.
- Validar el contenedor y el despliegue HTTPS real antes de presentarlo como listo para publicación.

Aceptación: no quedan enlaces ficticios ni bloques vacíos; cada recurso tiene procedencia; rutas profundas, recursos y API funcionan en el entorno de publicación.

## Entrega 6 — Medición y cierre

Esta validación acompaña cada entrega; no se pospone todo hasta el final.

- Mantener pruebas de las 13 rutas y añadir casos para las nuevas capacidades.
- Revisar teclado, foco, lector de pantalla, contraste, zoom y preferencia de movimiento reducido; Axe es solo una parte de la revisión.
- Comprobar Chromium, Firefox y WebKit, más al menos un móvil físico disponible.
- Medir carga y respuesta con red/CPU limitadas; optimizar imagen principal, fuentes y coste de blur según los resultados.
- Objetivos propuestos de rendimiento: LCP ≤ 2,5 s, CLS ≤ 0,1 e INP ≤ 200 ms. Son metas, no mediciones ya alcanzadas; el INP real requiere datos de uso suficientes.
- Ensayo corto con personas representativas: encontrar una lección, iniciar una práctica, volver a ella y completar/repasar un quiz sin explicación externa. Registrar dónde dudan.

## Orden y límites

Orden recomendado: continuidad → recorrido/actividades → quiz → consolidación visual → contenido/publicación. El trabajo editorial puede avanzar mientras se implementan los flujos. Las pruebas acompañan cada bloque.

Primera entrega concreta: recuperar quiz, conservar temporizador entre módulos y aislar fallos de carga. Es el bloque con más impacto en la sensación de producto completo.

Para una segunda etapa, considerar instalación/offline solo si el uso real lo justifica. El quiz necesita una decisión explícita: conservar corrección en servidor y esperar conexión, o diseñar un modo de práctica local diferenciado. No prometer corrección offline con el contrato actual.

Cuentas, sincronización entre dispositivos y panel editorial no son requisitos de esta fase. Si se necesitan, implican base de datos, autenticación, permisos, recuperación y operación; deben tratarse como un alcance aparte. Evitar añadirlos solo para aumentar el número de funciones.
