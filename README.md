# Shiori · Japón, Lore & Fer

Una web estática para consultar el viaje del 13 de octubre al 4 de noviembre.
React + TypeScript + Vite, React Router, Tailwind CSS y Leaflet. Sin backend,
cuentas ni base de datos.

Versión publicada: <https://bodomchild.github.io/shiori/>

## Ejecutar

Requiere Node **22.12 o superior dentro de 22 LTS**, o **24 LTS**, y npm 10+.
Verificado con Node **24.21.0** y npm **11.19.0** mediante instalación limpia
(`npm ci`) y build de producción. También se verificó con Node **22.19.0** y
npm **10.9.3**. No hace falta cambiar dependencias al pasar de Node 22 a 24.

```sh
npm ci
npm run dev
```

Abrir la dirección que indica Vite (por defecto `http://localhost:5173`).
Para probar desde el celular, conectar ambos dispositivos a la misma red y usar
la dirección `Network` que muestra Vite; Windows debe permitir el servidor en la
red privada. `npm install` también sirve para la primera instalación.

```sh
npm run typecheck
npm run build
npm run preview
```

El build genera `dist/`. Usa rutas con hash (`/#/osaka/14-10`) y rutas de assets
relativas para que funcione en alojamiento estático, incluso en una subcarpeta.
No requiere reglas de redirección. El workflow `.github/workflows/deploy.yml`
publica `dist/` en GitHub Pages después de cada push a `main`; también puede
ejecutarse manualmente desde la pestaña Actions del repositorio.

## Datos y uso

- `src/types/itinerary.ts`: modelo `Trip → City → Day → ItineraryStop`.
- `src/data/itinerary.ts`: representación propia de los **23 días del viaje**, con
  203 actividades extraídas de la copia local del documento fuente. El año es 2026.
  Incluye horarios, notas, opciones y coordenadas estáticas cuando se confirmó un
  lugar concreto. Los puntos todavía abiertos permanecen claramente indicados.
- `src/pages/`: viaje completo, días de una ciudad y cronograma del día.
- `src/components/`: selector de ciudad/día, mapa y lista de paradas.
- `src/dates.ts`: operaciones pequeñas con fechas, independientes de la zona
  horaria del teléfono. Todos los horarios de actividades son de Japón.

Tocar una actividad centra y resalta su marker. Tocar un marker selecciona y
muestra su actividad. «Ver todo el día» vuelve a encuadrar todas las paradas.
Al cambiar de día se reinicia la selección. El mapa muestra solo ese día.

Los tiles usan la capa raster Bright EN de OpenStreetMap Foundation Japan, con
etiquetas en inglés, y necesitan conexión. El MVP no tiene caché offline,
geolocalización ni cálculo de rutas. Las coordenadas están en orden `[latitud,
longitud]`, la duración en minutos y los horarios en formato `HH:mm`.

**El documento original «Viaje Japon» es estrictamente READ-ONLY.** Nunca debe
modificarse, sobrescribirse, reorganizarse ni borrarse. Si se agrega una copia
local, guardarla en `references/` (excluida de Git), usarla solo como fuente y
editar únicamente la representación propia en `src/data/itinerary.ts`.
La aplicación no accede a Google Drive ni sincroniza documentos.

Se guardó una copia local de referencia en `references/viaje-japon.txt`, junto
con la estructura y metadatos en `references/viaje-japon.source.json`. Estos
archivos no se publican en Git ni se incluyen en el build.

## Git

Repositorio inicializado en la rama `main`, con remoto SSH:

```text
git@github.com:bodomchild/shiori.git
```

Las dependencias directas se fijan en `package.json` y el árbol completo en
`package-lock.json`. Se excluyen `node_modules/`, `dist/`, archivos locales y
documentos de referencia mediante `.gitignore`.
