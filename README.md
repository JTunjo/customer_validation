# Velvet Greens — Customer Discovery App

Aplicación ligera para registrar entrevistas de Customer Discovery desde
tablet/iPad o celular. Guía toda la entrevista pantalla por pantalla: el
entrevistador nunca tiene que pensar "qué sigue" ni "dónde escribo".

Construida según `customer_discovery.md` (Paso 1: entrevista semi-estructurada,
Paso 2: validación de tres hipótesis con tarjetas + preguntas comparativas).

## Estructura del repositorio

```
/
├── apps/
│   ├── interview-app/        # Frontend: Vite + JS vanilla (app de entrevistas)
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.js       # Controlador: enruta pantallas, guarda, navega
│   │       ├── style.css     # Estilo neutro (blanco/negro/gris), tipografía grande
│   │       ├── data/flow.js  # TODAS las preguntas, tarjetas y preguntas comparativas
│   │       └── lib/
│   │           ├── store.js  # Autosave en localStorage + recuperación
│   │           ├── api.js    # Llamadas al backend
│   │           └── config.js # URL del backend (editar tras desplegar Apps Script)
│   │
│   └── analytics-dashboard/  # Frontend: panel de solo lectura con la analítica
│       ├── index.html
│       └── src/
│           ├── main.js       # Hipótesis por encuesta, ranking, matriz, wordcloud
│           ├── style.css
│           └── lib/
│               ├── api.js    # Llama a action=analytics
│               └── config.js # Misma URL del backend
│
├── backend/
│   └── apps-script/
│       └── Code.gs           # Backend: Google Apps Script -> Google Sheets
│
├── .github/workflows/deploy.yml  # Publica automáticamente en GitHub Pages
│
└── docs/
    └── DEPLOY.md              # Guía paso a paso de despliegue (backend + frontend)
```

## Cómo funciona el flujo

1. **Pantalla de inicio**: datos del entrevistador/entrevistado, fecha automática.
2. **Modo entrevista**: una pregunta por pantalla (Bloques 1–6), textarea grande,
   pistas de seguimiento visibles para el entrevistador, sin menú ni distracciones.
3. **Tarjetas**: se muestran las 3 hipótesis una por una, sin poder retroceder.
4. **Preguntas comparativas**: las 9 preguntas de PASO 2, cada una en su pantalla,
   con selección de tarjeta + "¿Por qué?".
5. **Guardado**: al terminar, se envía todo al backend y queda registrado como
   una fila nueva (plana, sin estructuras anidadas) en Google Sheets.

Cada respuesta se autoguarda en el dispositivo (`localStorage`) apenas se escribe,
así que si el navegador se cierra a mitad de entrevista, al volver a abrir la
app se recupera exactamente donde se quedó.

## Analítica

`apps/analytics-dashboard` es un panel de solo lectura que consume
`action=analytics` del backend y muestra: hipótesis ganadora y score por
encuesta, resultados globales por hipótesis, ranking (score promedio,
desviación estándar y % de encuestas válidas ≥65%), la matriz de resultados
por pregunta y un wordcloud por hipótesis ganadora (a partir de la columna
manual `key_terms` en la hoja `Interviews`). Se puede filtrar toda la
analítica por la columna manual `method` (ej. Presencial/Virtual). Ver
`docs/DEPLOY.md` sección 7.

## Próximos pasos

Ver `docs/DEPLOY.md` para desplegar el backend (Apps Script) y el frontend
(GitHub Pages) paso a paso.
