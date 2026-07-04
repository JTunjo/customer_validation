# Guía de despliegue — Velvet Greens Customer Discovery

Dos partes independientes: **backend** (Google Apps Script + Sheets) y **frontend** (GitHub Pages).
Despliega primero el backend porque el frontend necesita su URL.

---

## 1. Backend — Google Apps Script + Sheets

1. Crea una **Google Sheet nueva** (vacía). Abre la URL y copia el ID:
   `https://docs.google.com/spreadsheets/d/`**`ESTE_ES_EL_ID`**`/edit`

2. En esa misma Sheet: **Extensiones → Apps Script**.

3. Borra el contenido de `Code.gs` que abre por defecto y pega **todo** el contenido de
   `backend/apps-script/Code.gs` de este proyecto.

4. En la línea `const SHEET_ID = "PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEET";`
   reemplaza el texto por el ID que copiaste en el paso 1.

5. (Opcional pero recomendado) En el editor de Apps Script, selecciona la función
   `setup` en el desplegable de funciones y presiona **Ejecutar**. Esto crea de una
   vez las pestañas `Interviews` y `Metadata` vacías. La primera vez te pedirá
   autorizar permisos — es tu propio script sobre tu propia Sheet, es seguro aceptar.

6. **Implementar → Nueva implementación**:
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
   - Presiona **Implementar** y autoriza si te lo vuelve a pedir.

7. Copia la **URL que termina en `/exec`**. Esa es la URL de tu API.

8. Prueba que funciona pegando en el navegador:
   `TU_URL/exec?action=health` → debería responder `OK`.

> Si más adelante editas `Code.gs`, tienes que crear una **nueva implementación**
> (o "Gestionar implementaciones → Editar → Nueva versión") para que los cambios
> se reflejen en la URL pública.

---

## 2. Conectar el frontend con el backend

Edita `apps/interview-app/src/lib/config.js` y reemplaza:

```js
export const API_URL = "https://script.google.com/macros/s/REEMPLAZA_ESTO/exec";
```

por la URL `/exec` que copiaste en el paso 7 de arriba.

---

## 3. Probar localmente antes de desplegar (opcional)

```bash
cd apps/interview-app
npm install
npm run dev
```

Abre la URL que muestra la terminal desde el navegador de tu tablet
(si está en la misma red Wi-Fi, usa la IP local que Vite muestra con `--host`):

```bash
npm run dev -- --host
```

---

## 4. Frontend — GitHub Pages

### Opción A — Automático con GitHub Actions (recomendado, ya incluido)

1. Crea un repositorio nuevo en GitHub y sube este proyecto completo:

   ```bash
   cd velvet-greens-discovery
   git init
   git add .
   git commit -m "Velvet Greens - Customer Discovery app"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```

2. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

3. El workflow `.github/workflows/deploy.yml` ya incluido se ejecuta automáticamente
   en cada push a `main` y publica `apps/interview-app` en GitHub Pages
   (calcula el `base` correcto usando el nombre de tu repo, no hay que tocar nada).

4. Después de unos minutos, tu app estará en:
   `https://TU_USUARIO.github.io/TU_REPO/`

### Opción B — Manual (si prefieres no usar Actions)

```bash
cd apps/interview-app
VITE_BASE="/TU_REPO/" npm run build
npx gh-pages -d dist
```

---

## 5. Usar en tablet / iPad

- Abre la URL de GitHub Pages en Safari o Chrome del iPad.
- **Agregar a pantalla de inicio** (Safari → compartir → "Agregar a inicio") para que
  abra en modo app, sin barra del navegador — ayuda mucho a la sensación de
  "modo entrevista" sin distracciones.
- Funciona igual en celular si en algún momento es más rápido usarlo ahí.

---

## 6. Dónde quedan los datos

Cada entrevista guardada aparece como **una fila nueva** en la pestaña `Interviews`
de tu Google Sheet. Las columnas se crean solas la primera vez y se van agregando
si el flujo de preguntas cambia en el futuro — no hay que tocar la Sheet a mano.

Para exportar a CSV: `Archivo → Descargar → Valores separados por comas (.csv)`.
