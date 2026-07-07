// Modelo de datos de la entrevista.
// Cada entrada representa UNA pantalla que el entrevistador verá.
// El orden de este arreglo es el orden real en que se mostrarán las pantallas.
// Todo texto viene directo de la especificación (customer_discovery.md).

export const QUESTION_STEPS = [
  // ---------- PASO 1 — Entrevista semi-estructurada ----------
  {
    id: "b1_dia_normal",
    type: "question",
    block: "Bloque 1",
    question: "Cuéntame cómo es un día normal para ti.",
    hint: "Desde que te levantas hasta que termina.",
    note: "No intervenir.",
  },
  {
    id: "b2_ritmo_cambia",
    type: "question",
    block: "Bloque 2",
    question: "¿Hay algún momento del día en el que sientes que el ritmo cambia?",
    followups: ["¿Qué pasa exactamente?", "¿Cómo te sientes?", "¿Con qué frecuencia ocurre?"],
  },
  {
    id: "b3_que_haces",
    type: "question",
    block: "Bloque 3",
    question: "¿Qué haces normalmente cuando eso pasa?",
    followups: ["¿Siempre haces lo mismo?", "¿Qué suele ayudarte más?"],
  },
  {
    id: "b4_acompana_abierta",
    type: "question",
    block: "Bloque 4",
    question: "¿Qué suele acompañar ese momento?",
    note: "Esperar primero respuesta abierta.",
  },
  {
    id: "b4_come_o_toma",
    type: "question",
    block: "Bloque 4",
    question: "¿Hay algo que normalmente comes o tomas?",
  },
  {
    id: "b5_que_gusta",
    type: "question",
    block: "Bloque 5",
    question: "¿Qué te gusta de ese momento o ritual?",
  },
  {
    id: "b5_que_cambiarias",
    type: "question",
    block: "Bloque 5",
    question: "¿Qué cambiarías?",
  },
  {
    id: "b6_hipotesis_a",
    type: "question",
    block: "Bloque 6 · Hipótesis A",
    question: "¿Hay momentos en los que simplemente quieres darte un gusto?",
    followups: ["¿Cómo eliges ese gusto?"],
  },
  {
    id: "b6_hipotesis_b",
    type: "question",
    block: "Bloque 6 · Hipótesis B",
    question: "¿Existe algún pequeño momento o ritual que sientas que cambia completamente cómo continúa tu día?",
    note: "Profundizar. No sugerir respuestas.",
  },
];

// ---------- PASO 2 — Validación de Hipótesis: guion antes de las tarjetas ----------
// Verbatim que el entrevistador lee en voz alta al entrevistado, tal cual está
// escrito, antes de mostrar la primera tarjeta.
export const CARD_INTRO = {
  id: "card_intro",
  type: "intro",
  title: "Antes de mostrar las tarjetas",
  paragraphs: [
    "A continuación, encontrarás 3 tarjetas que describen distintas posibles ideas de producto. Te las voy a mostrar una por una y te pido que las leas con tranquilidad, tomándote el tiempo que necesites.",
    "Para las preguntas que siguen debes responder con lo que sientas de forma natural y espontánea; no hay respuestas correctas ni incorrectas.",
    'Ten en cuenta que las tres ideas son igual de válidas, así que no te preocupes por elegir la que "debería" gustarte más — lo que más nos ayuda es tu reacción honesta.',
  ],
};

// ---------- PASO 2 — Validación de Hipótesis: Tarjetas ----------
export const CARDS = [
  {
    id: "tarjeta_1",
    label: "Tarjeta 1",
    title: "INDULGENCIA CONSCIENTE",
    subtitle: "Un snack delicioso para esos momentos en los que quieres darte un gusto sintiéndote bien con tu elección.",
    body: "Un pequeño bocado de chocolate elaborado para quienes disfrutan los pequeños placeres del día sin renunciar al bienestar.\n\nUna experiencia que combina sabor, disfrute y una mejor forma de consentirte.",
  },
  {
    id: "tarjeta_2",
    label: "Tarjeta 2",
    title: "FEEL-GOOD RESET",
    subtitle: "Un pequeño momento que puede cambiar cómo continúa tu día.",
    body: "Un pequeño bocado de chocolate pensado para acompañar esas pausas en las que decides reconectar contigo antes de seguir.\n\nUn pequeño reset que transforma un momento cotidiano en algo que vale la pena disfrutar.",
  },
  {
    id: "tarjeta_3",
    label: "Tarjeta 3",
    title: "TU MOMENTO",
    subtitle: "Porque también está bien regalarte un momento para ti.",
    body: "Un pequeño bocado de chocolate creado para acompañar esas pequeñas pausas que normalmente dejamos pasar.\n\nUn recordatorio de que, a veces, volver a disfrutar un instante es exactamente lo que necesitábamos para seguir.",
  },
];

// ---------- Preguntas comparativas ----------
// type "choice": radio (Tarjeta 1/2/3) + "¿Por qué?"
// type "choice_with_none": radio (Tarjeta 1/2/3/Ninguna) + "¿Por qué?"
export const COMPARATIVE_STEPS = [
  { id: "c1", type: "choice", question: "¿Cuál te llamó primero la atención?" },
  { id: "c2", type: "choice", question: "¿Cuál entendiste más rápido?" },
  { id: "c3", type: "choice", question: "¿Cuál te genera más curiosidad?" },
  { id: "c4", type: "choice", question: "¿Cuál probarías primero?" },
  { id: "c5", type: "choice", question: "¿Cuál comprarías?" },
  { id: "c6", type: "choice", question: "¿Cuál le contarías a un amigo?" },
  { id: "c7", type: "choice", question: "¿Cuál te parece más creíble?" },
  {
    id: "c8",
    type: "choice_with_none",
    question: "¿Hay alguna que te haya sonado demasiado buena para ser verdad?",
  },
  {
    id: "c9",
    type: "choice",
    question:
      "Si solo una de estas tres ideas pudiera existir, ¿cuál te daría más tristeza que desapareciera?",
    reasonLabel: "¿Por qué?",
  },
];

export const CARD_OPTIONS = CARDS.map((c) => ({ value: c.id, label: `${c.label} — ${c.title}` }));
