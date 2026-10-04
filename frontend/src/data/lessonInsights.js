/**
 * Differentiator content: myth, context + 24h challenge per lesson.
 * Every claim maps to a source already cited in credits (AAO, OSHA, NIST,
 * CISA, Stothart 2015, CDC, UNBC, Google/Apple/LeechBlock).
 * Editorial review and source verification remain required (ES/EN).
 */
export const insightsBySlug = {
  "regla-20-20-20": {
    myth: {
      es: "Mito: «Si uso la regla 20-20-20 nunca tendré fatiga visual».",
      en: "Myth: “The 20-20-20 rule guarantees no eye strain.”",
    },
    mythTruth: {
      es: "Realidad: es una pausa barata y razonable que recomienda la AAO, pero la evidencia de su eficacia aún es limitada (encuesta en Indian J. Ophthalmol., 2023). No sustituye graduación ni consulta.",
      en: "Reality: a cheap, sensible break recommended by the AAO, but effectiveness evidence is still limited (Indian J. Ophthalmol. survey, 2023). It replaces neither prescription nor care.",
    },
    fact: {
      es: "la luz de una pantalla en uso normal nunca ha demostrado causar enfermedad ocular; la AAO no recomienda gafas con filtro azul por falta de evidencia.",
      en: "normal screen light has never been shown to cause eye disease; the AAO does not recommend blue-filter glasses for lack of evidence.",
    },
    challenge: {
      es: "Reto 24 h: programa 3 pausas de 20 segundos mirando a 6 metros. Marca cómo sientes tus ojos antes y después.",
      en: "24-hour challenge: schedule three 20-second breaks looking 6 metres away. Note how your eyes feel before and after.",
    },
    source: "AAO · 2021",
  },
  "configuracion-dispositivo": {
    myth: {
      es: "Mito: «El modo oscuro protege mi vista».",
      en: "Myth: “Dark mode protects my eyes.”",
    },
    mythTruth: {
      es: "Realidad: es una preferencia de comodidad según la luz ambiental. Lo que más reduce esfuerzo es distancia (~63 cm), contraste y evitar reflejos.",
      en: "Reality: a comfort preference for your lighting. Distance (~25 in), contrast and glare control matter more.",
    },
    fact: {
      es: "la AAO sugiere mirar ligeramente hacia abajo, a un brazo de distancia, y descansar con lágrimas artificiales si hay sequedad.",
      en: "the AAO suggests a slightly downward gaze at arm's length, plus artificial tears for dryness.",
    },
    challenge: {
      es: "Reto 24 h: sube el contraste un punto y elimina un reflejo de tu pantalla. Prueba claro/oscuro según tu luz.",
      en: "24-hour challenge: raise contrast one notch and remove one screen glare. Try light/dark for your light.",
    },
    source: "AAO · 2021",
  },
  "espacio-ergonomico": {
    myth: {
      es: "Mito: «Existe una postura perfecta que debes mantener 8 horas».",
      en: "Myth: “One perfect posture holds for 8 hours.”",
    },
    mythTruth: {
      es: "Realidad: OSHA propone listas de ajuste (pies, espalda, hombros, pantalla frontal), no un diagnóstico. La mejor postura es la que cambias durante el día.",
      en: "Reality: OSHA offers fitting checklists — not a diagnosis. The best posture is the one you change through the day.",
    },
    fact: {
      es: "borde superior a la altura de los ojos o debajo, teclado y ratón cerca, muñecas alineadas.",
      en: "top edge at or below eye level, keyboard and mouse close, wrists neutral.",
    },
    challenge: {
      es: "Reto 24 h: ajusta una sola cosa (altura de pantalla o apoyo de pies) y camina 2 minutos cada hora.",
      en: "24-hour challenge: fix one thing (screen height or foot support) and walk 2 minutes each hour.",
    },
    source: "OSHA · eTools",
  },
  "pausa-activa": {
    myth: {
      es: "Mito: «Si duele, es que funciona».",
      en: "Myth: “If it hurts, it works.”",
    },
    mythTruth: {
      es: "Realidad: estas pausas son ideas suaves, no rehabilitación. Respira normal, sin rebotes; detente ante dolor, mareo u hormigueo.",
      en: "Reality: gentle break ideas, not rehab. Breathe normally, no bouncing; stop with pain, dizziness or tingling.",
    },
    fact: {
      es: "alternar sentarse con moverse y cambiar de postura reduce rigidez mejor que una sola ‘postura correcta’.",
      en: "alternating sitting with moving and changing position beats holding one “correct” posture.",
    },
    challenge: {
      es: "Reto 24 h: completa la secuencia guiada una vez (30 + 30 + 60 s) sin forzar rangos.",
      en: "24-hour challenge: run the guided sequence once (30 + 30 + 60 s) without forcing range.",
    },
    source: "OSHA · eTools",
  },
  "autenticacion-segura": {
    myth: {
      es: "Mito: «Con símbolos raros mi contraseña ya es segura».",
      en: "Myth: “Weird symbols make any password safe.”",
    },
    mythTruth: {
      es: "Realidad: NIST SP 800-63B-4 exige 15+ caracteres si la contraseña va sola (8+ si es parte de MFA), hasta 64, y lista de bloqueo de claves filtradas. Longitud + unicidad + gestor + MFA.",
      en: "Reality: NIST SP 800-63B-4 requires 15+ chars password-only (8+ inside MFA), up to 64, plus a blocklist of breached passwords. Length + uniqueness + manager + MFA.",
    },
    fact: {
      es: "una frase larga poco previsible supera a una corta ‘compleja’; prioriza passkeys resistentes al phishing cuando existan.",
      en: "a long, unpredictable passphrase beats a short “complex” one; prefer phishing-resistant passkeys where available.",
    },
    challenge: {
      es: "Reto 24 h: activa MFA en tu cuenta más importante y guarda una frase única en un gestor.",
      en: "24-hour challenge: turn on MFA for your most important account and store one unique passphrase in a manager.",
    },
    source: "NIST SP 800-63B-4 · 2025",
  },
  "detectar-phishing": {
    myth: {
      es: "Mito: «Si tiene logo y buena ortografía, es legítimo».",
      en: "Myth: “Logo plus good spelling means legitimate.”",
    },
    mythTruth: {
      es: "Realidad: CISA pide verificar remitente y destino real, abrir la web por tu cuenta y reportar. Ni el candado HTTPS ni el diseño prueban seguridad.",
      en: "Reality: CISA says check sender and real link target, open the site yourself, report it. Neither HTTPS padlock nor design proves safety.",
    },
    fact: {
      es: "urgencia + amenaza + pedido de códigos o pagos por correo son las 3 señales que más se repiten en phishing.",
      en: "urgency + threats + requests for codes or payments by email are the most repeated phishing signals.",
    },
    challenge: {
      es: "Reto 24 h: reenvía un sospechoso a tu mesa de ayuda sin clicar y comprueba el remitente real.",
      en: "24-hour challenge: forward one suspect to your help desk without clicking and inspect the real sender.",
    },
    source: "CISA · Report Phishing",
  },
  pomodoro: {
    myth: {
      es: "Mito: «Más pomodoros = más aprendizaje garantizado».",
      en: "Myth: “More pomodoros guarantee more learning.”",
    },
    mythTruth: {
      es: "Realidad: la técnica organiza el estudio (p. ej. 25/5 como punto de partida, pausa larga tras varios bloques). No promete aprender más ni sirve igual a todos.",
      en: "Reality: the technique structures study (e.g. 25/5 as a start, long break after several blocks). No guaranteed learning gain; not one-size-fits-all.",
    },
    fact: {
      es: "elegir UNA tarea concreta antes de iniciar el reloj es el paso que más sostiene el enfoque.",
      en: "choosing ONE concrete task before starting the clock best sustains focus.",
    },
    challenge: {
      es: "Reto 24 h: haz 2 bloques de 25/5 con una sola tarea escrita en papel antes de empezar.",
      en: "24-hour challenge: run two 25/5 blocks with a single task written on paper first.",
    },
    source: "UNBC · Academic Success",
  },
  "menos-distracciones": {
    myth: {
      es: "Mito: «Instalo un bloqueador y listo».",
      en: "Myth: “Install a blocker and forget it.”",
    },
    mythTruth: {
      es: "Realidad: revisa permisos, compatibilidad y que no bloquee recursos académicos ni contactos clave. Empieza con una franja de estudio.",
      en: "Reality: review permissions, compatibility and access to study resources and key contacts. Start with one study window.",
    },
    fact: {
      es: "temporizadores Android, Tiempo de uso iOS y LeechBlock NG añaden fricción útil, pero cambian de nombre/opciones por versión.",
      en: "Android timers, iOS Screen Time and LeechBlock NG add useful friction, but names/options change by version.",
    },
    challenge: {
      es: "Reto 24 h: silencia una app tragatiempo solo durante tu primera hora de estudio.",
      en: "24-hour challenge: mute one time-sink app for your first study hour only.",
    },
    source: "Google · Apple · LeechBlock",
  },
  notificaciones: {
    myth: {
      es: "Mito: «El bucle de dopamina me está dañando el cerebro».",
      en: "Myth: “A dopamine loop is damaging my brain.”",
    },
    mythTruth: {
      es: "Realidad: ‘bucle de dopamina’ es una simplificación popular, no un diagnóstico. Stothart et al. (2015) mostraron que UNA notificación sola ya degrada atención sostenida, comparable a usar el móvil.",
      en: "Reality: “dopamine loop” is pop simplification, not a diagnosis. Stothart et al. (2015) showed ONE notification alone degrades sustained attention, like active phone use.",
    },
    fact: {
      es: "en la tarea SART (pulsar ante cada número menos el 3), avisados fallaron más por divagación y ‘carga prospectiva’ (‘revisarlo luego’). Sin mirar el móvil.",
      en: "on the SART task (press for every number except 3), notified participants failed more from mind-wandering and ‘check-it-later’ load — without touching the phone.",
    },
    challenge: {
      es: "Reto 24 h: deja el móvil en otra habitación en tu próximo bloque de estudio y permite solo excepciones clave.",
      en: "24-hour challenge: leave your phone in another room for your next study block; allow only key exceptions.",
    },
    source: "Stothart et al. · 2015",
  },
  "rutina-sueno": {
    myth: {
      es: "Mito: «El fin de semana recupero todo el sueño».",
      en: "Myth: “Weekends repay all sleep debt.”",
    },
    mythTruth: {
      es: "Realidad: el CDC recomienda horarios regulares y apagar pantallas 30+ min antes de dormir. Nuestra hora de desconexión es rutina práctica, no umbral médico.",
      en: "Reality: the CDC recommends regular times and screens off 30+ min before bed. Our one-hour wind-down is a practical routine, not a medical threshold.",
    },
    fact: {
      es: "preparar mañana + luz tenue + actividad tranquila sin pantalla sostiene más que buscar ‘la noche perfecta’.",
      en: "prepping tomorrow + dim light + calm screen-free activity beats chasing “one perfect night.”",
    },
    challenge: {
      es: "Reto 24 h: acuéstate a la misma hora ±30 min y deja el teléfono fuera de alcance 60 min antes.",
      en: "24-hour challenge: keep bedtime within ±30 min and park your phone out of reach 60 min before.",
    },
    source: "CDC · About Sleep",
  },
};

export const homeFacts = [
  {
    stat: { value: 63.9, suffix: "%" },
    quote: {
      es: "En Colombia, la mayoría de los hogares ya tenía internet en 2023.",
      en: "In Colombia, most households already had internet in 2023.",
    },
    detail: {
      es: "70,5 % en cabeceras y 41,4 % en zona rural: la red te acompaña a casi todas partes, también a tu mesa de estudio.",
      en: "70.5% in urban centres and 41.4% in rural areas: the net follows you almost everywhere, including your study desk.",
    },
    source: "DANE · ECV 2023",
  },
  {
    quote: {
      es: "Una sola notificación, sin mirar el móvil, ya degrada tu atención como usarlo activamente.",
      en: "One notification — without touching your phone — already degrades attention like actively using it.",
    },
    detail: {
      es: "Tarea SART: pulsar ante cada número menos el 3. Avisados fallaron más por divagación mental.",
      en: "SART task: press for every number except 3. Notified participants failed more from mind-wandering.",
    },
    source: "Stothart et al. (2015) · JEP:HPP",
  },
  {
    quote: {
      es: "NIST 2025: 15 caracteres mínimo si tu contraseña va sola; 8 si es parte de MFA.",
      en: "NIST 2025: 15 characters minimum password-only; 8 inside MFA.",
    },
    detail: {
      es: "Longitud + unicidad + gestor + MFA. Una frase larga supera a una corta ‘compleja’.",
      en: "Length + uniqueness + manager + MFA. A long phrase beats a short “complex” one.",
    },
    source: "NIST SP 800-63B-4",
  },
  {
    quote: {
      es: "La luz normal de tu pantalla nunca ha demostrado causar enfermedad ocular.",
      en: "Normal screen light has never been shown to cause eye disease.",
    },
    detail: {
      es: "Por eso la AAO no recomienda gafas anti-luz azul: falta evidencia. Pausas y distancia sí ayudan.",
      en: "So the AAO does not recommend blue-light glasses: evidence is lacking. Breaks and distance help.",
    },
    source: "AAO · 2021",
  },
  {
    quote: {
      es: "El CDC pide pantallas apagadas 30+ min antes de dormir; aquí proponemos 1 h como rutina, no como diagnóstico.",
      en: "CDC asks for screens off 30+ min before bed; we suggest 1 h as routine, not diagnosis.",
    },
    detail: {
      es: "Regularidad + luz tenue + preparar mañana > una noche perfecta aislada.",
      en: "Regularity + dim light + prepping tomorrow > one isolated perfect night.",
    },
    source: "CDC · About Sleep",
  },
  {
    quote: {
      es: "Ni el logo, ni la ortografía, ni el candado HTTPS prueban que un correo sea legítimo.",
      en: "Neither logo, spelling nor HTTPS padlock proves an email is legitimate.",
    },
    detail: {
      es: "Urgencia + códigos + pagos = verifica por un canal conocido y reporta (CISA).",
      en: "Urgency + codes + payments = verify via a known channel and report (CISA).",
    },
    source: "CISA · Report Phishing",
  },
];
