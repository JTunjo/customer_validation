# Velvet Greens — Customer Discovery Interview
## Validación de Propuesta de Valor

---

# Objetivo

Esta entrevista **NO busca validar un producto**, ni descubrir cuál propuesta "gusta más".

Busca entender **qué problema existe realmente en la vida de las personas** y cuál de tres hipótesis conecta con una necesidad emocional ya existente.

Las entrevistas deben buscar **evidencias, no opiniones**.

Por esta razón:

- No se debe intentar vender.
- No se debe explicar el producto.
- No se debe convencer al entrevistado.
- El entrevistador debe hablar poco y escuchar mucho.
- Se debe profundizar siempre con preguntas como:
    - ¿Por qué?
    - ¿Puedes contarme más?
    - ¿Qué pasó después?
    - ¿Eso te ocurre seguido?
    - ¿Cómo te hizo sentir?

---

# Público objetivo

Realizar entre **15 y 20 entrevistas**.

Perfil:

- Profesionales urbanos
- 25–45 años
- Consumen snacks durante el día
- Buscan opciones de mejor calidad
- Trabajan, estudian o emprenden
- Acostumbran tomar decisiones de compra por conveniencia y bienestar

---

# PASO 1 — Entrevista semi-estructurada

## Objetivo

Entender:

- Cómo transcurre su día
- Cuándo aparecen momentos difíciles
- Cómo los resuelven actualmente
- Qué rituales ya existen
- Qué emociones aparecen

No mencionar Velvet Greens.

No mencionar chocolate.

No mencionar mucuna.

No mencionar el producto.

---

## Bloque 1

### Cuéntame cómo es un día normal para ti.

Desde que te levantas hasta que termina.

(No intervenir.)

---

## Bloque 2

### ¿Hay algún momento del día en el que sientes que el ritmo cambia?

Follow-up

- ¿Qué pasa exactamente?
- ¿Cómo te sientes?
- ¿Con qué frecuencia ocurre?

---

## Bloque 3

### ¿Qué haces normalmente cuando eso pasa?

Follow-up

- ¿Siempre haces lo mismo?
- ¿Qué suele ayudarte más?

---

## Bloque 4

### ¿Qué suele acompañar ese momento?

Esperar primero respuestas abiertas.

Luego preguntar:

> ¿Hay algo que normalmente comes o tomas?

---

## Bloque 5

### ¿Qué te gusta de ese momento o ritual?

Follow-up

### ¿Qué cambiarías?

---

## Bloque 6

### Hipótesis A

¿Hay momentos en los que simplemente quieres darte un gusto?

Follow-up

¿Cómo eliges ese gusto?

---

### Hipótesis B

¿Existe algún pequeño momento o ritual que sientas que cambia completamente cómo continúa tu día?

Profundizar.

No sugerir respuestas.

---

# PASO 2 — Validación de Hipótesis

No explicar ninguna tarjeta.

Simplemente entregarla y dejar que el entrevistado la lea.

---

# TARJETA 1

## INDULGENCIA CONSCIENTE

### Un snack delicioso para esos momentos en los que quieres darte un gusto sintiéndote bien con tu elección.

Un pequeño bocado de chocolate elaborado para quienes disfrutan los pequeños placeres del día sin renunciar al bienestar.

Una experiencia que combina sabor, disfrute y una mejor forma de consentirte.

---

# TARJETA 2

## FEEL-GOOD RESET

### Un pequeño momento que puede cambiar cómo continúa tu día.

Un pequeño bocado de chocolate pensado para acompañar esas pausas en las que decides reconectar contigo antes de seguir.

Un pequeño reset que transforma un momento cotidiano en algo que vale la pena disfrutar.

---

# TARJETA 3

## TU MOMENTO

### Porque también está bien regalarte un momento para ti.

Un pequeño bocado de chocolate creado para acompañar esas pequeñas pausas que normalmente dejamos pasar.

Un recordatorio de que, a veces, volver a disfrutar un instante es exactamente lo que necesitábamos para seguir.

---

# Preguntas

1. ¿Cuál te llamó primero la atención?

2. ¿Cuál entendiste más rápido?

3. ¿Cuál te genera más curiosidad?

4. ¿Cuál probarías primero?

5. ¿Cuál comprarías?

6. ¿Cuál le contarías a un amigo?

7. ¿Cuál te parece más creíble?

8. ¿Hay alguna que te haya sonado demasiado buena para ser verdad?

9. Si solo una de estas tres ideas pudiera existir, ¿cuál te daría más tristeza que desapareciera? ¿Por qué?

---

# Qué buscamos descubrir

Más allá de cuál "gusta más", buscamos identificar cuál hipótesis conecta con una necesidad ya existente.

Hipótesis 1

La persona compra una mejor indulgencia.

Hipótesis 2

La persona compra un pequeño reset emocional.

Hipótesis 3

La persona compra el permiso de regalarse un momento para sí mismo.

El objetivo final es descubrir cuál representa mejor el verdadero motivo de compra.

---

# Especificación WebApp para Registro de Entrevistas

## Objetivo

Construir una aplicación extremadamente ligera para registrar entrevistas de Customer Discovery desde computador o celular.

Debe minimizar la carga cognitiva del entrevistador.

El entrevistador nunca debe preguntarse:

- ¿Qué sigue?
- ¿Dónde escribo?
- ¿Qué pregunta viene?

La aplicación guía toda la entrevista.

---

# Stack

## Frontend

- HTML
- CSS
- Vanilla Javascript
- Vite
- Github Pages

Repositorio único (Monorepo)

---

## Backend

Google Apps Script

Responsabilidades:

- recibir respuestas
- escribir en Google Sheets
- devolver ID de entrevista
- manejar CORS

API REST simple.

---

## Base de datos

Google Sheets

Una fila = una entrevista.

Cada columna = una pregunta.

Ejemplo:

| Timestamp | Entrevistador | Edad | Profesión | Q1 | Q2 | Q3 | ... |

No guardar estructuras anidadas.

Todo plano.

Facilita análisis posterior.

---

# Flujo de la aplicación

## Pantalla 1

Nueva entrevista

Campos:

- Nombre entrevistador
- Ciudad
- Edad
- Profesión
- Fecha (automática)

Botón

Comenzar

---

## Pantalla 2

Modo entrevista

Solo mostrar:

Título del bloque

Pregunta actual

Caja de texto grande

Botón

Siguiente

Botón

Atrás (regresa a la pregunta anterior ya respondida, por si se presiona
"Siguiente" sin querer).

Nada más.

Sin menú.

Sin barra lateral.

---

Cada pregunta ocupa toda la pantalla.

---

## Pantalla 3

Tarjetas

Mostrar una tarjeta por vez.

Botón

Siguiente

Botón

Atrás (permite corregir un "Siguiente" presionado sin querer; las tarjetas
físicas ya están en manos del entrevistado, así que no hay riesgo de sesgo al
poder retroceder en la pantalla).

---

## Pantalla 4

Preguntas comparativas

Una pregunta por pantalla.

Si la respuesta implica elegir una tarjeta:

Radio buttons

○ Tarjeta 1

○ Tarjeta 2

○ Tarjeta 3

Debajo

¿Por qué?

Textarea grande.

---

## Pantalla final

Confirmación

Guardar entrevista

Mostrar

Entrevista registrada correctamente.

Botón

Nueva entrevista.

---

# UX

Prioridades

- Máxima legibilidad
- Muy pocos colores
- Tipografía grande
- Responsive
- Navegación lineal
- Sin scroll innecesario
- Autosave local cada respuesta
- Recuperación en caso de cerrar el navegador
- Confirmación visual después de guardar

---

# Organización del repositorio

```
/
├── apps
│   └── interview-app
│
├── packages
│   ├── ui
│   ├── api
│   └── shared
│
├── docs
│
└── README.md
```

---

# Google Apps Script

Endpoints

POST

/api/interview/start

Devuelve

Interview ID

---

POST

/api/interview/save

Recibe

Todas las respuestas

Escribe una fila en Sheets.

---

GET

/api/health

Devuelve

OK

---

# Hoja de cálculo

Pestañas

## Interviews

Todas las respuestas

## Metadata

Configuración

Versión

Entrevistadores

---

# Extras recomendados

- Guardar automáticamente cada respuesta en LocalStorage.
- Atajos de teclado (Enter = siguiente).
- Indicador de progreso (Pregunta 6 de 15).
- Cronómetro opcional por entrevista.
- Exportación a CSV desde Google Sheets.
- Posibilidad futura de grabar audio asociado a cada entrevista (sin afectar el flujo actual).