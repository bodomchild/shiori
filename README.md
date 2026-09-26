# Shiori · Japón, Lore & Fer

Una web estática para consultar el viaje del 13 de octubre al 4 de noviembre.
React + TypeScript + Vite, React Router, Tailwind CSS, Leaflet y Firebase. El
itinerario sigue siendo una SPA estática. La galería privada usa Firebase
Authentication, Cloud Storage, Firestore y pequeñas Cloud Functions para poder
crecer a miles de fotos y preparar descargas por ciudad.

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
- `src/photos/`: subida, miniaturas, paginación, índice y exportaciones.
- `functions/`: backend de indexación y generación de ZIP por ciudad.
- `storage.rules` y `firestore.rules`: acceso limitado a las dos cuentas
  autorizadas.

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

Antes de cada subida se guarda una copia temporal en IndexedDB. La app procesa
y sube como máximo dos fotos en paralelo, de modo que una selección grande no
quede completa en memoria. Si se pierde la conexión, conserva lo pendiente en
ese navegador y reintenta al volver a estar online. El original admite hasta
30 MB y no se modifica. Se generan una miniatura de hasta 512 KB para la grilla
y una vista previa de hasta 2 MB para el visor. El original solo se descarga
cuando se toca «Descargar original». Durante una selección múltiple se muestra
cuántas fotos están activas, pendientes, guardadas o con error y el resultado
final del lote.

Los objetos se guardan en:

```text
trips/japan-2026/photos/{cityId}/{photoId}/original
trips/japan-2026/photos/{cityId}/{photoId}/thumbnail.jpg
trips/japan-2026/photos/{cityId}/{photoId}/preview.jpg
```

Cloud Storage sigue siendo la fuente definitiva. Firestore guarda un índice
reconstruible con el orden, las rutas y el tamaño. La galería lee 20 fotos por
página de forma predeterminada; puede cambiarse a 50 o 100 y la preferencia se
guarda localmente. Obtiene el total sin recorrer todo el bucket y sin retrasar la
consulta de fotos. La migración inicial de Storage a Firestore ya se completó;
no se comprueba al abrir la galería. Las Cloud Functions mantienen el índice
ante futuras subidas y borrados.

Todas las miniaturas de cada página empiezan a cargarse al recibir sus datos,
sin esperar al scroll. Cada foto reemplaza su propio placeholder cuando termina,
sin esperar al resto. Se guardan en Cache Storage porque sus rutas son inmutables;
una caché en memoria de hasta 32 MB evita releer los mismos archivos al navegar.
Al borrar una foto también se elimina su copia local.

Firestore guarda los datos consultados en una caché persistente: al volver a una
ciudad se muestran primero las fotos conocidas y se actualizan desde el servidor
en segundo plano. Una actualización conserva la grilla visible. Los conteos y
los botones de descarga no dependen de esa actualización. La caché no convierte
la aplicación en una PWA y no garantiza que todo el viaje esté disponible sin
conexión. Solo las dos cuentas habilitadas pueden abrir la galería local.

Las fotos nuevas se ordenan desde la captura más reciente. La app lee la fecha
EXIF cuando está disponible y usa la fecha del archivo o de subida como respaldo;
las fotos anteriores continúan funcionando con su fecha de subida.

`storage.rules` limita el acceso a los UID declarados, valida ciudad, tipo,
tamaño y metadatos, no permite sobrescribir archivos y limita el borrado a las
cuentas autorizadas. `firestore.rules` protege el índice y permite que cada
persona lea solamente las exportaciones que pidió. Al borrar una foto, la
aplicación elimina original, miniatura, vista previa e índice; la política de
Soft Delete del bucket permite recuperar los archivos durante 30 días.

Los botones «Descargar ciudad» y «Descargar todo» crean un ZIP por ciudad. Si una
ciudad supera 4 GB o 500 fotos, se divide como `fotos-tokyo-1.zip`,
`fotos-tokyo-2.zip`, etc. Las tareas leen los originales directamente desde
Storage y escriben las partes en el bucket temporal
`shiori-japan-2026-exports`. La app muestra el avance y enlaces temporales cuando
termina. El bucket debe borrar automáticamente sus objetos a las 48 horas.

Para firmar esos enlaces, la cuenta de ejecución
`836274225500-compute@developer.gserviceaccount.com` necesita el rol **Creador de
tokens de cuenta de servicio** (`roles/iam.serviceAccountTokenCreator`). Puede
concederse desde IAM a esa misma cuenta; no hace públicos los ZIP ni las fotos.

Para desarrollar y verificar toda la galería:

```sh
npm run test:storage
npm run test:firestore
npm run test:gallery
cd functions
npm ci
npm run build
```

Las funciones se ejecutan en Node 22, que es el runtime estable admitido por
Cloud Functions. La web puede desarrollarse con Node 24; por eso npm muestra una
advertencia de `engines` al instalar `functions/` localmente, pero el código se
compila correctamente. Las dependencias del backend están fijadas en
`functions/package-lock.json`.

Después de configurar Firestore y el bucket temporal, publicar con:

```sh
npx firebase-tools@15.30.1 deploy --only firestore,storage,functions
```

`@firebase/rules-unit-testing` es solamente una dependencia de desarrollo y no
se incluye en el JavaScript que recibe el navegador. La CLI se ejecuta
puntualmente con la versión fijada para evitar cambios inesperados.

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
