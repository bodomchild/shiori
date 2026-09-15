# Shiori · Japón, Lore & Fer

Una web estática para consultar el viaje del 13 de octubre al 4 de noviembre.
React + TypeScript + Vite, React Router, Tailwind CSS, Leaflet y Firebase. No
hay backend propio ni base de datos. Firebase Authentication y Cloud Storage se
usan exclusivamente para la galería privada del viaje.

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
- `src/storage.ts`: preferencias locales para el último día abierto y las
  actividades realizadas.
- `src/firebase.ts`: configuración pública de la aplicación web de Firebase.
- `src/auth/`: sesión de Google utilizada para proteger las fotos.
- `storage.rules`: reglas de Cloud Storage, cerradas por defecto hasta registrar
  las dos cuentas autorizadas.

Tocar una actividad centra y resalta su marker. Tocar un marker selecciona y
muestra su actividad. «Ver todo el día» vuelve a encuadrar todas las paradas.
Al cambiar de día se reinicia la selección. El mapa muestra solo ese día. Las
paradas con coordenadas pueden abrirse en Google Maps mediante una URL universal,
sin API ni credenciales.

El último día abierto y las actividades realizadas se guardan en `localStorage`.
Se conservan al cerrar el navegador y pueden restablecerse por día. Son datos del
navegador y dispositivo actual: no se sincronizan entre teléfonos.

La ruta `/#/photos` permite que Lore y Fer ingresen con Google. Cada ciudad tiene
su propia galería y también puede abrirse desde sus días. Las fotos se asocian
solamente por `cityId`; no se vinculan a fechas ni actividades.

Antes de cada subida se guarda una copia temporal en IndexedDB. La app genera
una vista previa JPEG y sube como máximo dos fotos en paralelo. Si se pierde la
conexión, conserva lo pendiente en ese navegador y reintenta al volver a estar
online. El original admite hasta 30 MB y no se modifica. La vista previa admite
hasta 2 MB. Cloud Storage es la fuente definitiva una vez confirmada la subida.

Los objetos se guardan en:

```text
trips/japan-2026/photos/{cityId}/{photoId}/original
trips/japan-2026/photos/{cityId}/{photoId}/preview.jpg
```

`storage.rules` limita el acceso a los UID declarados, valida ciudad, tipo,
tamaño y metadatos, y no permite sobrescribir ni borrar desde la aplicación.
Después de agregar o modificar los UID, probar y publicar las reglas con:

```sh
npm run test:storage
npx firebase-tools@15.30.1 deploy --only storage
```

`@firebase/rules-unit-testing` es solamente una dependencia de desarrollo y no
se incluye en el JavaScript que recibe el navegador. Para evitar instalar cientos
de paquetes permanentes, la CLI se ejecutará puntualmente con la versión fijada:

```sh
npx firebase-tools@15.30.1 deploy --only storage
```

`cors.json` habilita la lectura autenticada de imágenes desde GitHub Pages y los
dos orígenes locales de desarrollo. Se aplica una vez al bucket con Google Cloud
CLI. También se recomienda conservar durante 30 días los objetos borrados desde
la consola o herramientas administrativas:

```sh
gcloud storage buckets update gs://shiori-japan-2026.firebasestorage.app --cors-file=cors.json
gcloud storage buckets update gs://shiori-japan-2026.firebasestorage.app --soft-delete-duration=30d
```

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
