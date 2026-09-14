# Shiori · Japón, Lore & Fer

Una web estática para consultar el viaje del 13 de octubre al 4 de noviembre.
React + TypeScript + Vite, React Router, Tailwind CSS y Leaflet. Sin backend,
cuentas ni base de datos.

## Ejecutar

Requiere Node **22.12 o superior dentro de 22 LTS**, o **24 LTS**, y npm 10+.
Verificado con Node **22.19.0** y npm **10.9.3**. Esa instalación es compatible;
conviene mantener Node 22 actualizado al último parche de su rama LTS.
No hace falta actualizar npm por separado ni usar la última versión mayor.

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
No requiere reglas de redirección. No hay ningún despliegue configurado.

## Datos y uso

- `src/types/itinerary.ts`: modelo `Trip → City → Day → ItineraryStop`.
- `src/data/itinerary.ts`: representación propia del viaje. **Solo Osaka 14/10 y
  Kioto 18/10 tienen actividades mock**, con coordenadas y horarios aproximados.
  El año **2026 es provisional**. El resto de las fechas muestra un estado vacío.
- `src/pages/`: viaje completo, días de una ciudad y cronograma del día.
- `src/components/`: selector de ciudad/día, mapa y lista de paradas.
- `src/dates.ts`: operaciones pequeñas con fechas, independientes de la zona
  horaria del teléfono. Todos los horarios de actividades son de Japón.

Tocar una actividad centra y resalta su marker. Tocar un marker selecciona y
muestra su actividad. «Ver todo el día» vuelve a encuadrar todas las paradas.
Al cambiar de día se reinicia la selección. El mapa muestra solo ese día.

Los tiles usan OpenStreetMap y necesitan conexión. El MVP no tiene caché offline,
geolocalización ni cálculo de rutas. Las coordenadas están en orden `[latitud,
longitud]`, la duración en minutos y los horarios en formato `HH:mm`.

**El documento original «Viaje Japon» es estrictamente READ-ONLY.** Nunca debe
modificarse, sobrescribirse, reorganizarse ni borrarse. Si se agrega una copia
local, guardarla en `references/` (excluida de Git), usarla solo como fuente y
editar únicamente la representación propia en `src/data/itinerary.ts`.
La aplicación no accede a Google Drive ni sincroniza documentos.

## Git

Repositorio inicializado en la rama `main`, con remoto SSH:

```text
git@github.com:bodomchild/shiori.git
```

Las dependencias directas se fijan en `package.json` y el árbol completo en
`package-lock.json`. Se excluyen `node_modules/`, `dist/`, archivos locales y
documentos de referencia mediante `.gitignore`.
