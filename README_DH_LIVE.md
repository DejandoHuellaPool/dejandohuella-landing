
# Integración EN VIVO para dejandohuella-landing

Este paquete añade **Historial reciente** y **Operaciones en vivo** a la landing con datos desde `/live/`.

## Archivos
- `dh-live.js` – Lógica de *polling* para `/live/last.json`, `/live/trades.jsonl` y refresco de imagen `/live/shots/latest.png`.
- `dh-live.css` – Ajustes móviles del historial (cabecera sticky + scroll horizontal).
- `snippet.html` – Bloque HTML listo para pegar donde quieras mostrar EN VIVO.

## Pasos
1. Copia `dh-live.js` y `dh-live.css` a la raíz del proyecto (o a `assets/` si prefieres; ajusta los paths del `<link>` y `<script>`).
2. Pega el contenido de `snippet.html` en tu `index.html` del repo, **debajo de “Solicitar información”** o donde lo necesites.
3. Asegúrate de exponer `/live/` en el server (Nginx recomendado):

   ```nginx
   location /live/ {
     alias  C:/RUTA/A/TuTerminal/MQL4/Files/live/;
     add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0";
     add_header Pragma "no-cache";
     add_header Expires "0";
   }
   ```

4. En el EA, escribe estos artefactos:
   - `MQL4/Files/live/last.json`
   - `MQL4/Files/live/trades.jsonl` (1 JSON por línea)
   - `MQL4/Files/live/shots/latest.png` (o `.jpg`; el script soporta ambos y agrega `?ts=`)

> El módulo acepta timestamps en `"YYYY.MM.DD HH:MM:SS"`, epoch (s o ms) o ISO.

## Verificación
- Abre `http://localhost:8080/live/last.json` → debe salir un JSON.
- Abre la landing → verás datos en vivo y la captura refrescando cada ~2.5s.
