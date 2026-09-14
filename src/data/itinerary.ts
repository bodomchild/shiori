import type { Trip } from '../types/itinerary';

// Representación local del itinerario, extraída de una copia de lectura de
// “Viaje Japon”. La aplicación nunca accede ni escribe en el documento original.
// Las coordenadas son referencias estáticas para el mapa; no definen rutas.
export const itinerary: Trip = {
  "name": "Japón · Lore & Fer",
  "cities": [
    {
      "id": "osaka",
      "name": "Osaka",
      "startDate": "2026-10-13",
      "endDate": "2026-10-16",
      "days": [
        {
          "date": "2026-10-13",
          "title": "Llegada a Japón",
          "notes": "Ingreso por Kansai, traslado a Osaka y descanso. Los tiempos de migraciones y la conexión con el tren deben confirmarse; son los horarios del documento.",
          "stops": [
            {
              "id": "osaka-10-13-01-llegada-al-aeropuerto-internacional-de-kan",
              "name": "Llegada al Aeropuerto Internacional de Kansai (KIX)",
              "coordinates": [
                34.43055556,
                135.23027778
              ],
              "startTime": "21:00",
              "category": "traslado",
              "notes": "Control migratorio, equipaje y aduana. La fuente prevé entre 40 y 90 minutos para estos trámites.",
              "optional": false
            },
            {
              "id": "osaka-10-13-02-compra-o-retiro-de-servicios",
              "name": "Compra o retiro de servicios",
              "coordinates": [
                34.43055556,
                135.23027778
              ],
              "startTime": "21:50",
              "category": "visita",
              "notes": "En el aeropuerto: SIM si corresponde, carga de ICOCA, cajero, agua y algo para comer.",
              "optional": false
            },
            {
              "id": "osaka-10-13-03-nankai-limited-express-rapi-t",
              "name": "Nankai Limited Express Rapi:t",
              "coordinates": [
                34.43055556,
                135.23027778
              ],
              "startTime": "22:01",
              "category": "traslado",
              "notes": "Kansai → Namba en Nankai Rapi:t. Duración indicada: 47 minutos. Confirmar el servicio y el margen después de migraciones.",
              "optional": false
            },
            {
              "id": "osaka-10-13-04-check-in-en-el-hotel-diamond",
              "name": "Check-in en el Hotel Diamond",
              "startTime": "23:00",
              "category": "traslado",
              "notes": "Instalarse en el Hotel Diamond y preparar lo necesario para mañana.",
              "optional": false
            },
            {
              "id": "osaka-10-13-05-cena-ligera",
              "name": "Cena ligera",
              "startTime": "23:30",
              "category": "comida",
              "notes": "Si tienen hambre: konbini o una comida sencilla cerca del alojamiento.",
              "optional": true
            },
            {
              "id": "osaka-10-13-06-descanso",
              "name": "Descanso",
              "startTime": "00:00",
              "category": "descanso",
              "notes": "Medianoche del 14/10: cierre de la jornada de llegada. Descansar y adaptarse al cambio horario.",
              "optional": false
            }
          ]
        },
        {
          "date": "2026-10-14",
          "title": "Castillo, Kuromon y Shinsekai",
          "stops": [
            {
              "id": "osaka-10-14-01-desayuno",
              "name": "Desayuno",
              "startTime": "08:00",
              "category": "comida",
              "notes": "Desayuno tranquilo. Tiempo indicado: 30 minutos.",
              "optional": false
            },
            {
              "id": "osaka-10-14-02-castillo-de-osaka",
              "name": "Castillo de Osaka",
              "coordinates": [
                34.68722222,
                135.52583333
              ],
              "startTime": "09:00",
              "category": "visita",
              "notes": "Recorrer el castillo y conocer su historia. La fuente recomienda entre 2 y 3 horas.",
              "optional": false
            },
            {
              "id": "osaka-10-14-03-parque-del-castillo-de-osaka",
              "name": "Parque del Castillo de Osaka",
              "coordinates": [
                34.687378,
                135.525844
              ],
              "startTime": "11:45",
              "category": "visita",
              "notes": "Pasear por los jardines del castillo durante 30–45 minutos; no hace falta recorrer todo el parque.",
              "optional": false
            },
            {
              "id": "osaka-10-14-04-almuerzo",
              "name": "Almuerzo",
              "startTime": "12:45",
              "category": "comida",
              "notes": "Restaurante en la zona o hacia Namba: udon, tempura, tonkatsu o curry.",
              "optional": false
            },
            {
              "id": "osaka-10-14-05-mercado-kuromon-ichiba",
              "name": "Mercado Kuromon Ichiba",
              "coordinates": [
                34.6649578,
                135.506985
              ],
              "startTime": "14:00",
              "category": "visita",
              "notes": "Compartir pequeñas degustaciones: wagyu, vieiras, mochi, fruta y mariscos. Recorrido de aproximadamente 90 minutos.",
              "optional": false
            },
            {
              "id": "osaka-10-14-06-shinsekai",
              "name": "Shinsekai",
              "coordinates": [
                34.65222222,
                135.50611111
              ],
              "startTime": "17:00",
              "category": "visita",
              "notes": "Calles retro, restaurantes tradicionales y máquinas recreativas. Recorrido de unas 2 horas.",
              "optional": false
            },
            {
              "id": "osaka-10-14-07-cena",
              "name": "Cena",
              "coordinates": [
                34.65222222,
                135.50611111
              ],
              "startTime": "19:00",
              "category": "comida",
              "notes": "Probar kushikatsu en Shinsekai. Elegir el restaurante en el momento.",
              "optional": false
            },
            {
              "id": "osaka-10-14-08-paseo-nocturno",
              "name": "Paseo nocturno",
              "coordinates": [
                34.65222222,
                135.50611111
              ],
              "startTime": "20:30",
              "category": "visita",
              "notes": "Volver a caminar por las calles iluminadas de Shinsekai después de cenar.",
              "optional": false
            }
          ]
        },
        {
          "date": "2026-10-15",
          "title": "Excursión a Nara",
          "stops": [
            {
              "id": "osaka-10-15-01-desayuno",
              "name": "Desayuno",
              "startTime": "07:30",
              "category": "comida",
              "notes": "Desayunar temprano para aprovechar el día. Tiempo indicado: 30 minutos.",
              "optional": false
            },
            {
              "id": "osaka-10-15-02-salida-hacia-nara",
              "name": "Salida hacia Nara",
              "startTime": "08:15",
              "category": "traslado",
              "notes": "Tren Osaka → Nara. La fuente estima 40–60 minutos según la línea; confirmar el trayecto.",
              "optional": false
            },
            {
              "id": "osaka-10-15-03-parque-de-nara",
              "name": "Parque de Nara",
              "coordinates": [
                34.685,
                135.85
              ],
              "startTime": "09:45",
              "category": "visita",
              "notes": "Paseo entre jardines y ciervos. Usar solo las galletas autorizadas y mantener distancia. Unos 90 minutos.",
              "optional": false
            },
            {
              "id": "osaka-10-15-04-todai-ji",
              "name": "Tōdai-ji",
              "coordinates": [
                34.68916667,
                135.83972222
              ],
              "startTime": "11:30",
              "category": "visita",
              "notes": "Visitar el Gran Buda y el templo. Tiempo recomendado: 1 hora.",
              "optional": false
            },
            {
              "id": "osaka-10-15-05-almuerzo",
              "name": "Almuerzo",
              "startTime": "12:45",
              "category": "comida",
              "notes": "Comer cerca del parque: udon, soba, katsudon o bento.",
              "optional": false
            },
            {
              "id": "osaka-10-15-06-santuario-kasuga-taisha",
              "name": "Santuario Kasuga Taisha",
              "coordinates": [
                34.68138889,
                135.84833333
              ],
              "startTime": "14:00",
              "category": "visita",
              "notes": "Caminar por el sendero de linternas de piedra y el entorno boscoso. Aproximadamente 1 hora.",
              "optional": false
            },
            {
              "id": "osaka-10-15-07-mochi-recien-hecho-en-nakatanido",
              "name": "Mochi recién hecho en Nakatanidō",
              "coordinates": [
                34.6819,
                135.8284
              ],
              "startTime": "15:30",
              "category": "comida",
              "notes": "Probar mochi en Nakatanidō; si coincide, observar la demostración de elaboración.",
              "optional": false
            },
            {
              "id": "osaka-10-15-08-calle-comercial-higashimuki",
              "name": "Calle comercial Higashimuki",
              "coordinates": [
                34.6834,
                135.8279
              ],
              "startTime": "16:00",
              "category": "visita",
              "notes": "Recorrer la calle comercial si queda tiempo antes del tren.",
              "optional": true
            },
            {
              "id": "osaka-10-15-09-regreso-a-osaka",
              "name": "Regreso a Osaka",
              "startTime": "17:00",
              "category": "traslado",
              "notes": "Volver de Nara a Osaka; servicio de tren por confirmar.",
              "optional": false
            },
            {
              "id": "osaka-10-15-10-cena-en-osaka",
              "name": "Cena en Osaka",
              "startTime": "18:30",
              "category": "comida",
              "notes": "Yakiniku, izakaya o sushi en cinta, según las ganas.",
              "optional": false
            },
            {
              "id": "osaka-10-15-11-noche-libre",
              "name": "Noche libre",
              "startTime": "20:00",
              "category": "descanso",
              "notes": "Elegir entre Dotonbori, Namba, Don Quijote o descanso temprano.",
              "optional": true
            },
            {
              "id": "osaka-10-15-12-regreso-al-alojamiento",
              "name": "Regreso al alojamiento",
              "startTime": "21:30",
              "category": "traslado",
              "notes": "Volver al alojamiento y preparar el día siguiente.",
              "optional": false
            }
          ]
        },
        {
          "date": "2026-10-16",
          "title": "Universal Studios Japan",
          "notes": "Plan flexible dentro del parque. Confirmar apertura, entradas con horario, atracciones operativas y espectáculo nocturno en la programación de USJ.",
          "stops": [
            {
              "id": "osaka-10-16-01-desayuno",
              "name": "Desayuno",
              "startTime": "06:30",
              "category": "comida",
              "notes": "Desayunar temprano, llevar agua y calzado cómodo.",
              "optional": false
            },
            {
              "id": "osaka-10-16-02-salida-hacia-universal-studios-japan",
              "name": "Salida hacia Universal Studios Japan",
              "coordinates": [
                34.66472222,
                135.43305556
              ],
              "startTime": "07:15",
              "category": "traslado",
              "notes": "Tren hasta Universal City Station y caminata a la entrada. Consultar la app oficial de USJ.",
              "optional": false
            },
            {
              "id": "osaka-10-16-03-llegada-a-la-entrada",
              "name": "Llegada a la entrada",
              "coordinates": [
                34.66472222,
                135.43305556
              ],
              "startTime": "08:00",
              "category": "traslado",
              "notes": "Llegar antes de la apertura indicada para reducir las filas.",
              "optional": false
            },
            {
              "id": "osaka-10-16-04-super-nintendo-world-prioridad-maxima",
              "name": "Super Nintendo World (prioridad máxima)",
              "coordinates": [
                34.66472222,
                135.43305556
              ],
              "startTime": "08:30",
              "category": "visita",
              "notes": "Prioridad máxima: Mario Kart y, si la espera lo permite, Yoshi. Revisar si hace falta Entry Ticket. Bloque de 2–3 horas.",
              "optional": false
            },
            {
              "id": "osaka-10-16-05-the-wizarding-world-of-harry-potter",
              "name": "The Wizarding World of Harry Potter",
              "coordinates": [
                34.66472222,
                135.43305556
              ],
              "startTime": "11:00",
              "category": "visita",
              "notes": "Zona de Hogwarts y Hogsmeade. Priorizar Harry Potter and the Forbidden Journey según la espera.",
              "optional": false
            },
            {
              "id": "osaka-10-16-06-almuerzo",
              "name": "Almuerzo",
              "coordinates": [
                34.66472222,
                135.43305556
              ],
              "startTime": "12:30",
              "category": "comida",
              "notes": "Almorzar dentro del parque antes de las filas más largas.",
              "optional": false
            },
            {
              "id": "osaka-10-16-07-jurassic-park",
              "name": "Jurassic Park",
              "coordinates": [
                34.66472222,
                135.43305556
              ],
              "startTime": "13:30",
              "category": "visita",
              "notes": "Jurassic Park – The Ride, si funciona; Flying Dinosaur solo si tienen ganas de una montaña rusa intensa.",
              "optional": false
            },
            {
              "id": "osaka-10-16-08-minion-park",
              "name": "Minion Park",
              "coordinates": [
                34.66472222,
                135.43305556
              ],
              "startTime": "15:00",
              "category": "visita",
              "notes": "Recorrer Minion Park y subir a una atracción si la espera es corta.",
              "optional": false
            },
            {
              "id": "osaka-10-16-09-tiempo-flexible",
              "name": "Tiempo flexible",
              "coordinates": [
                34.66472222,
                135.43305556
              ],
              "startTime": "16:00",
              "category": "visita",
              "notes": "Repetir una favorita, aprovechar filas cortas o hacer compras.",
              "optional": false
            },
            {
              "id": "osaka-10-16-10-merienda",
              "name": "Merienda",
              "coordinates": [
                34.66472222,
                135.43305556
              ],
              "startTime": "17:30",
              "category": "comida",
              "notes": "Pausa con algún snack o bebida temática.",
              "optional": false
            },
            {
              "id": "osaka-10-16-11-ultimas-atracciones",
              "name": "Últimas atracciones",
              "coordinates": [
                34.66472222,
                135.43305556
              ],
              "startTime": "18:30",
              "category": "visita",
              "notes": "Consultar los tiempos de espera y aprovechar las últimas atracciones.",
              "optional": false
            },
            {
              "id": "osaka-10-16-12-espectaculo-nocturno-si-esta-programado",
              "name": "Espectáculo nocturno (si está programado)",
              "coordinates": [
                34.66472222,
                135.43305556
              ],
              "startTime": "20:00",
              "category": "visita",
              "notes": "Solo si hay desfile o espectáculo programado para la fecha.",
              "optional": true
            },
            {
              "id": "osaka-10-16-13-regreso-al-hotel",
              "name": "Regreso al hotel",
              "coordinates": [
                34.66472222,
                135.43305556
              ],
              "startTime": "21:00",
              "category": "traslado",
              "notes": "Regresar en tren y preparar el equipaje para Kioto.",
              "optional": false
            }
          ]
        }
      ]
    },
    {
      "id": "kyoto",
      "name": "Kioto",
      "startDate": "2026-10-17",
      "endDate": "2026-10-20",
      "days": [
        {
          "date": "2026-10-17",
          "title": "Llegada a Kioto y paseo por Gion",
          "stops": [
            {
              "id": "kyoto-10-17-01-desayuno-y-check-out-en-osaka",
              "name": "Desayuno y check-out en Osaka",
              "startTime": "08:30",
              "category": "comida",
              "notes": "Desayunar y preparar el equipaje antes de dejar Osaka.",
              "optional": false
            },
            {
              "id": "kyoto-10-17-02-viaje-hacia-kioto",
              "name": "Viaje hacia Kioto",
              "startTime": "09:30",
              "category": "traslado",
              "notes": "Osaka → Kioto. Duración indicada: 30–40 minutos, según el servicio elegido.",
              "optional": false
            },
            {
              "id": "kyoto-10-17-03-llegada-y-check-in",
              "name": "Llegada y check-in",
              "startTime": "10:30",
              "category": "traslado",
              "notes": "Hostel Kiyamachi. Dejar las valijas en recepción si todavía no está disponible la habitación.",
              "optional": false
            },
            {
              "id": "kyoto-10-17-04-almuerzo",
              "name": "Almuerzo",
              "startTime": "11:30",
              "category": "comida",
              "notes": "Almuerzo antes de empezar el recorrido de la tarde.",
              "optional": false
            },
            {
              "id": "kyoto-10-17-05-parque-maruyama",
              "name": "Parque Maruyama",
              "coordinates": [
                35.00333333,
                135.78138889
              ],
              "startTime": "13:00",
              "category": "visita",
              "notes": "Caminar por el parque. Tiempo recomendado: 1 hora.",
              "optional": false
            },
            {
              "id": "kyoto-10-17-06-santuario-yasaka",
              "name": "Santuario Yasaka",
              "coordinates": [
                35.00361111,
                135.77861111
              ],
              "startTime": "14:30",
              "category": "visita",
              "notes": "Visitar el santuario junto al parque y continuar hacia Gion.",
              "optional": false
            },
            {
              "id": "kyoto-10-17-07-gion",
              "name": "Gion",
              "coordinates": [
                35.003496,
                135.775051
              ],
              "startTime": "15:30",
              "category": "visita",
              "notes": "Calles tradicionales, tiendas y casas de té. Respetar la distancia y las restricciones de fotografía.",
              "optional": false
            },
            {
              "id": "kyoto-10-17-08-calle-hanamikoji",
              "name": "Calle Hanamikoji",
              "coordinates": [
                35.0017,
                135.7751
              ],
              "startTime": "16:30",
              "category": "visita",
              "notes": "Recorrer Hanamikoji y su arquitectura tradicional.",
              "optional": false
            },
            {
              "id": "kyoto-10-17-09-palacio-imperial-de-kioto",
              "name": "Palacio Imperial de Kioto",
              "coordinates": [
                35.02527778,
                135.76222222
              ],
              "startTime": "17:30",
              "category": "visita",
              "notes": "Jardines exteriores si quedan tiempo y energía; también están previstos para el 20/10.",
              "optional": true
            },
            {
              "id": "kyoto-10-17-10-calle-pontocho",
              "name": "Calle Pontocho",
              "coordinates": [
                35.007969,
                135.771111
              ],
              "startTime": "18:30",
              "category": "visita",
              "notes": "Cruzar al callejón de Pontocho y disfrutar del ambiente al atardecer.",
              "optional": false
            },
            {
              "id": "kyoto-10-17-11-cena",
              "name": "Cena",
              "coordinates": [
                35.007969,
                135.771111
              ],
              "startTime": "19:30",
              "category": "comida",
              "notes": "Kaiseki, yakitori, tempura o soba. Si es posible, elegir vistas al río Kamo.",
              "optional": false
            },
            {
              "id": "kyoto-10-17-12-paseo-nocturno-junto-al-rio-kamo",
              "name": "Paseo nocturno junto al río Kamo",
              "coordinates": [
                35.007969,
                135.771111
              ],
              "startTime": "21:00",
              "category": "visita",
              "notes": "Pasear por la ribera del río Kamo antes de regresar al alojamiento.",
              "optional": false
            }
          ]
        },
        {
          "date": "2026-10-18",
          "title": "Fushimi Inari y Kiyomizu-dera en kimono",
          "notes": "Falta elegir la tienda de kimono y confirmar apertura, reserva y lugar de devolución. El peinado es opcional.",
          "stops": [
            {
              "id": "kyoto-10-18-01-desayuno-ligero",
              "name": "Desayuno ligero",
              "startTime": "06:30",
              "category": "comida",
              "notes": "Desayunar temprano para llegar antes de las multitudes.",
              "optional": false
            },
            {
              "id": "kyoto-10-18-02-llegada-a-fushimi-inari",
              "name": "Llegada a Fushimi Inari",
              "coordinates": [
                34.96722222,
                135.77277778
              ],
              "startTime": "07:15",
              "category": "traslado",
              "notes": "Llegar a la zona de Fushimi Inari y dirigirse a la tienda de alquiler.",
              "optional": false
            },
            {
              "id": "kyoto-10-18-03-alquiler-de-kimono",
              "name": "Alquiler de kimono",
              "coordinates": [
                34.96722222,
                135.77277778
              ],
              "startTime": "07:30",
              "category": "visita",
              "notes": "Elegir kimono y, opcionalmente, peinado. La preparación suele llevar 45–60 minutos.",
              "optional": false
            },
            {
              "id": "kyoto-10-18-04-santuario-fushimi-inari-taisha",
              "name": "Santuario Fushimi Inari Taisha",
              "coordinates": [
                34.96722222,
                135.77277778
              ],
              "startTime": "08:30",
              "category": "visita",
              "notes": "Recorrer los torii y sacar fotos con la luz de la mañana. Tiempo recomendado: 2 horas.",
              "optional": false
            },
            {
              "id": "kyoto-10-18-05-traslado-hacia-higashiyama",
              "name": "Traslado hacia Higashiyama",
              "startTime": "10:45",
              "category": "traslado",
              "notes": "Taxi o tren hacia Higashiyama; conservar el kimono para las fotografías.",
              "optional": false
            },
            {
              "id": "kyoto-10-18-06-ninenzaka-y-sannenzaka",
              "name": "Ninenzaka y Sannenzaka",
              "coordinates": [
                34.9971,
                135.7802
              ],
              "startTime": "11:15",
              "category": "visita",
              "notes": "Calles empedradas, casas tradicionales, artesanías, dulces y pequeñas cafeterías.",
              "optional": false
            },
            {
              "id": "kyoto-10-18-07-templo-kiyomizu-dera",
              "name": "Templo Kiyomizu-dera",
              "coordinates": [
                34.995,
                135.785
              ],
              "startTime": "12:15",
              "category": "visita",
              "notes": "Visitar el templo y su terraza. Tiempo recomendado: 90 minutos.",
              "optional": false
            },
            {
              "id": "kyoto-10-18-08-almuerzo",
              "name": "Almuerzo",
              "coordinates": [
                34.995,
                135.785
              ],
              "startTime": "14:00",
              "category": "comida",
              "notes": "Udon, soba, tempura o donburi en la zona.",
              "optional": false
            },
            {
              "id": "kyoto-10-18-09-devolucion-del-kimono",
              "name": "Devolución del kimono",
              "coordinates": [
                34.995,
                135.785
              ],
              "startTime": "15:00",
              "category": "visita",
              "notes": "Confirmar con la tienda si se puede devolver en otra sucursal y hasta qué hora.",
              "optional": false
            },
            {
              "id": "kyoto-10-18-10-tiempo-libre",
              "name": "Tiempo libre",
              "coordinates": [
                34.9971,
                135.7802
              ],
              "startTime": "16:00",
              "category": "descanso",
              "notes": "Casa de té, recuerdos, dulces o un paseo tranquilo por Higashiyama.",
              "optional": false
            },
            {
              "id": "kyoto-10-18-11-cena",
              "name": "Cena",
              "coordinates": [
                34.9971,
                135.7802
              ],
              "startTime": "18:00",
              "category": "comida",
              "notes": "Cena tranquila cerca del alojamiento.",
              "optional": false
            }
          ]
        },
        {
          "date": "2026-10-19",
          "title": "Arashiyama: bambú, río y monos",
          "stops": [
            {
              "id": "kyoto-10-19-01-desayuno",
              "name": "Desayuno",
              "startTime": "07:30",
              "category": "comida",
              "notes": "Desayunar temprano. La fuente estima 30–40 minutos desde el centro hasta Arashiyama.",
              "optional": false
            },
            {
              "id": "kyoto-10-19-02-bosque-de-bambu-de-arashiyama",
              "name": "Bosque de Bambú de Arashiyama",
              "coordinates": [
                35.0168,
                135.6716
              ],
              "startTime": "08:30",
              "category": "visita",
              "notes": "Recorrer el bosque antes de las multitudes. Aproximadamente 45 minutos.",
              "optional": false
            },
            {
              "id": "kyoto-10-19-03-templo-tenryu-ji",
              "name": "Templo Tenryū-ji",
              "coordinates": [
                35.01596389,
                135.67377222
              ],
              "startTime": "09:30",
              "category": "visita",
              "notes": "Visitar el templo y su jardín. Tiempo recomendado: 1 hora.",
              "optional": false
            },
            {
              "id": "kyoto-10-19-04-puente-togetsukyo",
              "name": "Puente Togetsukyō",
              "coordinates": [
                35.0136,
                135.6778
              ],
              "startTime": "10:45",
              "category": "visita",
              "notes": "Caminar por el puente Togetsukyo y la ribera del Katsura.",
              "optional": false
            },
            {
              "id": "kyoto-10-19-05-alquiler-de-bicicletas",
              "name": "Alquiler de bicicletas",
              "coordinates": [
                35.0136,
                135.6778
              ],
              "startTime": "11:30",
              "category": "visita",
              "notes": "Si acompaña el clima: bicicleta para descubrir calles y senderos. Tiempo indicado: 2 horas; se superpone con el almuerzo de las 13:00.",
              "optional": true
            },
            {
              "id": "kyoto-10-19-06-almuerzo",
              "name": "Almuerzo",
              "coordinates": [
                35.0136,
                135.6778
              ],
              "startTime": "13:00",
              "category": "comida",
              "notes": "Soba, udon, tempura o curry en Arashiyama.",
              "optional": false
            },
            {
              "id": "kyoto-10-19-07-parque-de-monos-iwatayama",
              "name": "Parque de Monos Iwatayama",
              "coordinates": [
                35.008938,
                135.674681
              ],
              "startTime": "14:30",
              "category": "visita",
              "notes": "Subida de 20–30 minutos y mirador. Bloque recomendado: 2 horas. Se puede omitir para un día más relajado.",
              "optional": true
            },
            {
              "id": "kyoto-10-19-08-paseo-junto-al-rio-katsura",
              "name": "Paseo junto al río Katsura",
              "coordinates": [
                35.0136,
                135.6778
              ],
              "startTime": "17:00",
              "category": "visita",
              "notes": "Último paseo por la ribera del Katsura antes de volver.",
              "optional": false
            },
            {
              "id": "kyoto-10-19-09-regreso-al-centro-de-kioto",
              "name": "Regreso al centro de Kioto",
              "startTime": "18:00",
              "category": "traslado",
              "notes": "Regreso al centro de Kioto.",
              "optional": false
            },
            {
              "id": "kyoto-10-19-10-cena",
              "name": "Cena",
              "startTime": "19:30",
              "category": "comida",
              "notes": "Izakaya, yakitori, ramen o yakiniku.",
              "optional": false
            }
          ]
        },
        {
          "date": "2026-10-20",
          "title": "Kioto imperial y ceremonia del té",
          "notes": "La ceremonia del té requiere elegir un lugar y reservar. Mantener los horarios de esta jornada como aproximados.",
          "stops": [
            {
              "id": "kyoto-10-20-01-desayuno",
              "name": "Desayuno",
              "startTime": "08:30",
              "category": "comida",
              "notes": "Desayuno tranquilo antes de salir.",
              "optional": false
            },
            {
              "id": "kyoto-10-20-02-castillo-nijo",
              "name": "Castillo Nijō",
              "coordinates": [
                35.01416667,
                135.7475
              ],
              "startTime": "09:30",
              "category": "visita",
              "notes": "Palacio Ninomaru, pisos ruiseñor, jardines, murallas y fosos. Tiempo recomendado: 2 horas.",
              "optional": false
            },
            {
              "id": "kyoto-10-20-03-almuerzo",
              "name": "Almuerzo",
              "startTime": "12:00",
              "category": "comida",
              "notes": "Tempura, tonkatsu, soba o curry.",
              "optional": false
            },
            {
              "id": "kyoto-10-20-04-palacio-imperial-de-kioto",
              "name": "Palacio Imperial de Kioto",
              "coordinates": [
                35.02527778,
                135.76222222
              ],
              "startTime": "13:30",
              "category": "visita",
              "notes": "Recorrer jardines y senderos del recinto imperial. Aproximadamente 90 minutos.",
              "optional": false
            },
            {
              "id": "kyoto-10-20-05-ceremonia-del-te-tradicional",
              "name": "Ceremonia del Té Tradicional",
              "startTime": "15:30",
              "category": "visita",
              "notes": "Ceremonia de chanoyu con matcha y wagashi. Duración indicada: 45–60 minutos; establecimiento por elegir.",
              "optional": false
            },
            {
              "id": "kyoto-10-20-06-tiempo-libre",
              "name": "Tiempo libre",
              "startTime": "17:00",
              "category": "descanso",
              "notes": "Artesanías o un último paseo por las calles cercanas.",
              "optional": false
            },
            {
              "id": "kyoto-10-20-07-cena-de-despedida",
              "name": "Cena de despedida",
              "startTime": "19:00",
              "category": "comida",
              "notes": "Cena tradicional: sukiyaki, shabu-shabu, kaiseki, yakiniku o unagi.",
              "optional": false
            },
            {
              "id": "kyoto-10-20-08-regreso-al-alojamiento",
              "name": "Regreso al alojamiento",
              "startTime": "20:30",
              "category": "traslado",
              "notes": "Volver al alojamiento y preparar el equipaje para Kanazawa.",
              "optional": false
            }
          ]
        }
      ]
    },
    {
      "id": "kanazawa",
      "name": "Kanazawa",
      "startDate": "2026-10-21",
      "endDate": "2026-10-22",
      "days": [
        {
          "date": "2026-10-21",
          "title": "Mercado, jardines y casas de té",
          "notes": "La fuente indica salir de Kioto a las 08:00 y llegar a las 10:15. Confirmar los trenes, combinaciones y el equipaje antes del viaje.",
          "stops": [
            {
              "id": "kanazawa-10-21-01-salida-desde-kioto",
              "name": "Salida desde Kioto",
              "startTime": "08:00",
              "category": "traslado",
              "notes": "Viaje Kioto → Kanazawa. La fuente menciona Thunderbird y unas 2 horas; la combinación exacta queda por verificar.",
              "optional": false
            },
            {
              "id": "kanazawa-10-21-02-llegada-a-la-estacion-de-kanazawa",
              "name": "Llegada a la Estación de Kanazawa",
              "coordinates": [
                36.578269,
                136.647762
              ],
              "startTime": "10:15",
              "category": "traslado",
              "notes": "Admirar la Puerta Tsuzumi de la estación. Tiempo recomendado: 20 minutos. Consignas o alojamiento para las valijas.",
              "optional": false
            },
            {
              "id": "kanazawa-10-21-03-mercado-omicho",
              "name": "Mercado Omichō",
              "coordinates": [
                36.5717309,
                136.6559877
              ],
              "startTime": "10:45",
              "category": "visita",
              "notes": "Pescado, marisco, fruta y dulces; aprovechar para un almuerzo temprano. Aproximadamente 90 minutos.",
              "optional": false
            },
            {
              "id": "kanazawa-10-21-04-jardin-kenroku-en",
              "name": "Jardín Kenroku-en",
              "coordinates": [
                36.561944,
                136.6625
              ],
              "startTime": "12:30",
              "category": "visita",
              "notes": "Estanques, puentes, senderos y casas de té. Tiempo recomendado: 2 horas.",
              "optional": false
            },
            {
              "id": "kanazawa-10-21-05-castillo-de-kanazawa",
              "name": "Castillo de Kanazawa",
              "coordinates": [
                36.5631,
                136.6594
              ],
              "startTime": "14:45",
              "category": "visita",
              "notes": "Visita opcional junto al jardín si alcanza el tiempo. La fuente recomienda 45–60 minutos.",
              "optional": true
            },
            {
              "id": "kanazawa-10-21-06-distrito-higashi-chaya",
              "name": "Distrito Higashi Chaya",
              "coordinates": [
                36.5725559,
                136.6666756
              ],
              "startTime": "16:00",
              "category": "visita",
              "notes": "Calles de casas de té, artesanías y helado con pan de oro. Recorrido de unas 2 horas.",
              "optional": false
            },
            {
              "id": "kanazawa-10-21-07-cena",
              "name": "Cena",
              "startTime": "19:30",
              "category": "comida",
              "notes": "Sushi, kaisen-don, jibuni o ramen.",
              "optional": false
            }
          ]
        },
        {
          "date": "2026-10-22",
          "title": "Samuráis y taller de pan de oro",
          "notes": "Falta elegir y reservar el taller de pan de oro.",
          "stops": [
            {
              "id": "kanazawa-10-22-01-desayuno",
              "name": "Desayuno",
              "startTime": "08:30",
              "category": "comida",
              "notes": "Desayuno antes de salir.",
              "optional": false
            },
            {
              "id": "kanazawa-10-22-02-barrio-samurai-de-nagamachi",
              "name": "Barrio Samurái de Nagamachi",
              "coordinates": [
                36.565,
                136.651
              ],
              "startTime": "09:30",
              "category": "visita",
              "notes": "Calles, muros de barro y canales del barrio samurái. Aproximadamente 1 hora.",
              "optional": false
            },
            {
              "id": "kanazawa-10-22-03-residencia-nomura-ke",
              "name": "Residencia Nomura-ke",
              "coordinates": [
                36.5640834,
                136.6499971
              ],
              "startTime": "10:30",
              "category": "visita",
              "notes": "Visitar la residencia Nomura-ke y su jardín. Tiempo recomendado: 1 hora.",
              "optional": false
            },
            {
              "id": "kanazawa-10-22-04-almuerzo",
              "name": "Almuerzo",
              "startTime": "12:00",
              "category": "comida",
              "notes": "Sushi, kaisen-don, curry o udon.",
              "optional": false
            },
            {
              "id": "kanazawa-10-22-05-taller-de-pan-de-oro",
              "name": "Taller de Pan de Oro",
              "startTime": "13:30",
              "category": "visita",
              "notes": "Decorar un objeto con pan de oro. Duración aproximada: 1 hora; taller por confirmar.",
              "optional": false
            },
            {
              "id": "kanazawa-10-22-06-tiempo-libre",
              "name": "Tiempo libre",
              "startTime": "15:00",
              "category": "descanso",
              "notes": "Volver a Omicho, visitar una cafetería, comprar recuerdos o caminar por el centro.",
              "optional": false
            },
            {
              "id": "kanazawa-10-22-07-regreso-al-alojamiento",
              "name": "Regreso al alojamiento",
              "startTime": "17:00",
              "category": "traslado",
              "notes": "Preparar el equipaje para Kawaguchiko.",
              "optional": false
            },
            {
              "id": "kanazawa-10-22-08-cena-de-despedida",
              "name": "Cena de despedida",
              "startTime": "19:00",
              "category": "comida",
              "notes": "Probar algún plato regional pendiente.",
              "optional": false
            }
          ]
        }
      ]
    },
    {
      "id": "kawaguchiko",
      "name": "Kawaguchiko",
      "startDate": "2026-10-23",
      "endDate": "2026-10-24",
      "days": [
        {
          "date": "2026-10-23",
          "title": "Kawaguchiko: la postal del Fuji",
          "notes": "Traslado largo: la fuente estima 5–6 horas por Tokio. Confirmar la combinación antes de salir; la visibilidad del Fuji depende del tiempo.",
          "stops": [
            {
              "id": "kawaguchiko-10-23-01-desayuno-y-check-out-en-kanazawa",
              "name": "Desayuno y check-out en Kanazawa",
              "startTime": "07:30",
              "category": "comida",
              "notes": "Desayunar y dejar el alojamiento de Kanazawa.",
              "optional": false
            },
            {
              "id": "kawaguchiko-10-23-02-salida-hacia-kawaguchiko",
              "name": "Salida hacia Kawaguchiko",
              "startTime": "08:30",
              "category": "traslado",
              "notes": "Shinkansen hasta Tokio y luego Fuji Excursion o autobús hacia Kawaguchiko, según la fuente. Comprar un ekiben para almorzar durante el viaje.",
              "optional": false
            },
            {
              "id": "kawaguchiko-10-23-03-llegada-a-kawaguchiko",
              "name": "Llegada a Kawaguchiko",
              "coordinates": [
                35.4982,
                138.7687
              ],
              "startTime": "14:30",
              "category": "traslado",
              "notes": "Check-in, dejar equipaje y descansar. Alojamiento por confirmar.",
              "optional": false
            },
            {
              "id": "kawaguchiko-10-23-04-parque-oishi",
              "name": "Parque Oishi",
              "coordinates": [
                35.52329,
                138.7465374
              ],
              "startTime": "15:30",
              "category": "visita",
              "notes": "Jardines florales y vistas del Fuji y el lago. Tiempo recomendado: 1 hora.",
              "optional": false
            },
            {
              "id": "kawaguchiko-10-23-05-paseo-por-la-orilla-del-lago-kawaguchi",
              "name": "Paseo por la orilla del Lago Kawaguchi",
              "coordinates": [
                35.519,
                138.755
              ],
              "startTime": "17:00",
              "category": "visita",
              "notes": "Paseo costero y fotos del Fuji si está despejado. Tramo concreto de la orilla por elegir.",
              "optional": false
            },
            {
              "id": "kawaguchiko-10-23-06-cena",
              "name": "Cena",
              "coordinates": [
                35.4982,
                138.7687
              ],
              "startTime": "18:30",
              "category": "comida",
              "notes": "Probar hōtō, tempura, wagyu local o soba.",
              "optional": false
            },
            {
              "id": "kawaguchiko-10-23-07-paseo-nocturno",
              "name": "Paseo nocturno",
              "coordinates": [
                35.4982,
                138.7687
              ],
              "startTime": "20:00",
              "category": "visita",
              "notes": "Caminar por el pueblo antes de volver al alojamiento.",
              "optional": false
            }
          ]
        },
        {
          "date": "2026-10-24",
          "title": "Chureito, lago Kawaguchi y Oshino Hakkai",
          "stops": [
            {
              "id": "kawaguchiko-10-24-01-desayuno",
              "name": "Desayuno",
              "startTime": "07:00",
              "category": "comida",
              "notes": "Salir temprano si está despejado para aprovechar la visibilidad del Fuji.",
              "optional": false
            },
            {
              "id": "kawaguchiko-10-24-02-pagoda-chureito",
              "name": "Pagoda Chureito",
              "coordinates": [
                35.5012871,
                138.8013556
              ],
              "startTime": "08:00",
              "category": "visita",
              "notes": "Subir al mirador de la pagoda: aproximadamente 400 escalones. Tiempo recomendado: 90 minutos.",
              "optional": false
            },
            {
              "id": "kawaguchiko-10-24-03-teleferico-mt-fuji-panoramic-ropeway",
              "name": "Teleférico Mt. Fuji Panoramic Ropeway",
              "coordinates": [
                35.5040802,
                138.7720526
              ],
              "startTime": "10:00",
              "category": "visita",
              "notes": "Teleférico panorámico hacia el monte Tenjo. Tiempo recomendado: 1 hora.",
              "optional": false
            },
            {
              "id": "kawaguchiko-10-24-04-paseo-por-el-lago-kawaguchi",
              "name": "Paseo por el Lago Kawaguchi",
              "coordinates": [
                35.519,
                138.755
              ],
              "startTime": "11:30",
              "category": "visita",
              "notes": "Recorrer la costa y detenerse en cafés. Alquilar bicicletas es una opción.",
              "optional": true
            },
            {
              "id": "kawaguchiko-10-24-05-almuerzo",
              "name": "Almuerzo",
              "coordinates": [
                35.519,
                138.755
              ],
              "startTime": "13:00",
              "category": "comida",
              "notes": "Soba, curry, tonkatsu o hōtō.",
              "optional": false
            },
            {
              "id": "kawaguchiko-10-24-06-oshino-hakkai",
              "name": "Oshino Hakkai",
              "coordinates": [
                35.460139,
                138.832889
              ],
              "startTime": "14:30",
              "category": "visita",
              "notes": "Visitar el pueblo y los ocho estanques. Aproximadamente 2 horas; llevar efectivo para pequeños comercios.",
              "optional": false
            },
            {
              "id": "kawaguchiko-10-24-07-regreso-a-kawaguchiko",
              "name": "Regreso a Kawaguchiko",
              "coordinates": [
                35.4982,
                138.7687
              ],
              "startTime": "17:30",
              "category": "traslado",
              "notes": "Volver a Kawaguchiko para descansar, recorrer el centro o comprar recuerdos.",
              "optional": false
            },
            {
              "id": "kawaguchiko-10-24-08-cena-de-despedida-de-la-region",
              "name": "Cena de despedida de la región",
              "coordinates": [
                35.4982,
                138.7687
              ],
              "startTime": "19:00",
              "category": "comida",
              "notes": "Restaurante con vistas al lago o taberna tradicional.",
              "optional": false
            }
          ]
        }
      ]
    },
    {
      "id": "hakone",
      "name": "Hakone",
      "startDate": "2026-10-25",
      "endDate": "2026-10-26",
      "days": [
        {
          "date": "2026-10-25",
          "title": "Hakone: volcán, lago Ashi y onsen",
          "notes": "Falta confirmar el ryokan, el trayecto desde Kawaguchiko, las estaciones del teleférico y el embarcadero. Los puntos del mapa son referencias de los lugares, no rutas.",
          "stops": [
            {
              "id": "hakone-10-25-01-desayuno-y-check-out",
              "name": "Desayuno y check-out",
              "startTime": "08:00",
              "category": "comida",
              "notes": "Desayunar y preparar el equipaje para el traslado.",
              "optional": false
            },
            {
              "id": "hakone-10-25-02-salida-hacia-hakone",
              "name": "Salida hacia Hakone",
              "startTime": "09:00",
              "category": "traslado",
              "notes": "Autobús o combinación de transporte público hacia Hakone. La fuente estima 2–2,5 horas; confirmar el recorrido.",
              "optional": false
            },
            {
              "id": "hakone-10-25-03-llegada-a-hakone",
              "name": "Llegada a Hakone",
              "startTime": "11:30",
              "category": "traslado",
              "notes": "Dejar el equipaje en el alojamiento o en lockers antes de recorrer.",
              "optional": false
            },
            {
              "id": "hakone-10-25-04-almuerzo",
              "name": "Almuerzo",
              "startTime": "12:00",
              "category": "comida",
              "notes": "Soba, curry, tempura o unagi.",
              "optional": false
            },
            {
              "id": "hakone-10-25-05-teleferico-de-hakone-hakone-ropeway",
              "name": "Teleférico de Hakone (Hakone Ropeway)",
              "coordinates": [
                35.24436111,
                139.01911111
              ],
              "startTime": "13:00",
              "category": "visita",
              "notes": "Recorrer el circuito en teleférico. Estación de embarque por confirmar.",
              "optional": false
            },
            {
              "id": "hakone-10-25-06-valle-de-owakudani",
              "name": "Valle de Owakudani",
              "coordinates": [
                35.241916,
                139.020667
              ],
              "startTime": "13:45",
              "category": "visita",
              "notes": "Zona volcánica y kuro tamago. Tiempo recomendado: 1 hora.",
              "optional": false
            },
            {
              "id": "hakone-10-25-07-crucero-por-el-lago-ashi",
              "name": "Crucero por el Lago Ashi",
              "coordinates": [
                35.2033,
                139.0042
              ],
              "startTime": "15:15",
              "category": "visita",
              "notes": "Barco turístico por el lago. Duración indicada: 30 minutos; embarcadero por confirmar.",
              "optional": false
            },
            {
              "id": "hakone-10-25-08-santuario-hakone",
              "name": "Santuario Hakone",
              "coordinates": [
                35.20388889,
                139.02555556
              ],
              "startTime": "16:00",
              "category": "visita",
              "notes": "Visitar el santuario y el torii junto al lago. Aproximadamente 45 minutos.",
              "optional": false
            },
            {
              "id": "hakone-10-25-09-check-in-en-el-ryokan",
              "name": "Check-in en el ryokan",
              "startTime": "17:30",
              "category": "traslado",
              "notes": "Instalarse en el ryokan y disfrutar del ambiente tradicional.",
              "optional": false
            },
            {
              "id": "hakone-10-25-10-onsen",
              "name": "Onsen",
              "startTime": "18:30",
              "category": "descanso",
              "notes": "Baño termal antes de cenar. La fuente propone dedicar al menos una hora.",
              "optional": false
            },
            {
              "id": "hakone-10-25-11-cena-kaiseki",
              "name": "Cena Kaiseki",
              "startTime": "19:30",
              "category": "comida",
              "notes": "Cena kaiseki; confirmar si está incluida en la reserva del ryokan.",
              "optional": false
            },
            {
              "id": "hakone-10-25-12-descanso",
              "name": "Descanso",
              "startTime": "21:30",
              "category": "descanso",
              "notes": "Descanso en el ryokan.",
              "optional": false
            }
          ]
        },
        {
          "date": "2026-10-26",
          "title": "Mañana en Hakone y llegada a Tokio",
          "notes": "Aunque la etapa de Tokio comienza el 27/10 en el resumen, la fuente ya programa el traslado y check-in el 26/10. Se conserva esa organización.",
          "stops": [
            {
              "id": "hakone-10-26-01-desayuno-tradicional-en-el-ryokan",
              "name": "Desayuno tradicional en el ryokan",
              "startTime": "07:30",
              "category": "comida",
              "notes": "Desayuno tradicional en el ryokan.",
              "optional": false
            },
            {
              "id": "hakone-10-26-02-ultimo-bano-en-el-onsen",
              "name": "Último baño en el onsen",
              "startTime": "09:00",
              "category": "descanso",
              "notes": "Último baño termal antes del check-out.",
              "optional": false
            },
            {
              "id": "hakone-10-26-03-check-out",
              "name": "Check-out",
              "startTime": "10:00",
              "category": "traslado",
              "notes": "Guardar el equipaje y dirigirse hacia el museo.",
              "optional": false
            },
            {
              "id": "hakone-10-26-04-museo-al-aire-libre-de-hakone-hakone-open-",
              "name": "Museo al Aire Libre de Hakone (Hakone Open-Air Museum)",
              "coordinates": [
                35.24472222,
                139.05138889
              ],
              "startTime": "10:30",
              "category": "visita",
              "notes": "Esculturas, jardines y pabellón Picasso. Tiempo recomendado: 2 horas.",
              "optional": false
            },
            {
              "id": "hakone-10-26-05-almuerzo",
              "name": "Almuerzo",
              "coordinates": [
                35.24472222,
                139.05138889
              ],
              "startTime": "13:00",
              "category": "comida",
              "notes": "Tonkatsu, curry, ramen o soba.",
              "optional": false
            },
            {
              "id": "hakone-10-26-06-salida-hacia-tokio",
              "name": "Salida hacia Tokio",
              "startTime": "14:30",
              "category": "traslado",
              "notes": "La fuente propone Hakone Tozan hasta Odawara y luego Shinkansen a Tokio. Duración estimada: 90 minutos; confirmar combinación.",
              "optional": false
            },
            {
              "id": "hakone-10-26-07-llegada-a-tokio",
              "name": "Llegada a Tokio",
              "startTime": "16:30",
              "category": "traslado",
              "notes": "Check-in y descanso en el alojamiento de Tokio. Confirmar reserva y dirección.",
              "optional": false
            },
            {
              "id": "hakone-10-26-08-primer-paseo-por-el-barrio",
              "name": "Primer paseo por el barrio",
              "startTime": "18:00",
              "category": "visita",
              "notes": "Paseo por el barrio del alojamiento, supermercado y compra de desayunos o snacks.",
              "optional": false
            },
            {
              "id": "hakone-10-26-09-cena",
              "name": "Cena",
              "startTime": "19:30",
              "category": "comida",
              "notes": "Cena sencilla: ramen, gyudon, katsudon o sushi en cinta.",
              "optional": false
            },
            {
              "id": "hakone-10-26-10-descanso",
              "name": "Descanso",
              "startTime": "21:00",
              "category": "descanso",
              "notes": "Descansar antes de comenzar los recorridos por Tokio.",
              "optional": false
            }
          ]
        }
      ]
    },
    {
      "id": "tokyo",
      "name": "Tokio",
      "startDate": "2026-10-27",
      "endDate": "2026-11-04",
      "days": [
        {
          "date": "2026-10-27",
          "title": "Kappabashi, Asakusa, Ueno y Akihabara",
          "stops": [
            {
              "id": "tokyo-10-27-01-kappabashi",
              "name": "Kappabashi",
              "coordinates": [
                35.71444444,
                139.78888889
              ],
              "startTime": "09:00",
              "category": "visita",
              "notes": "Recorrer Kappabashi. La fuente propone un taller de réplicas de comida japonesa; local y reserva por elegir.",
              "optional": false
            },
            {
              "id": "tokyo-10-27-02-senso-ji-asakusa",
              "name": "Sensō-ji + Asakusa",
              "coordinates": [
                35.71472222,
                139.79675
              ],
              "startTime": "11:00",
              "category": "visita",
              "notes": "Kaminarimon → Nakamise → Senso-ji → Asakusa Shrine y un paseo por las calles del barrio.",
              "optional": false
            },
            {
              "id": "tokyo-10-27-03-almuerzo",
              "name": "Almuerzo",
              "coordinates": [
                35.71472222,
                139.79675
              ],
              "startTime": "13:00",
              "category": "comida",
              "notes": "Comida tradicional y económica en Asakusa.",
              "optional": false
            },
            {
              "id": "tokyo-10-27-04-ueno",
              "name": "Ueno",
              "coordinates": [
                35.71222222,
                139.77111111
              ],
              "startTime": "14:00",
              "category": "visita",
              "notes": "Ameyoko, Ueno Park, pequeños santuarios y tiendas. Museo solo si aparece uno que les interese.",
              "optional": false
            },
            {
              "id": "tokyo-10-27-05-akihabara",
              "name": "Akihabara",
              "coordinates": [
                35.69833333,
                139.77305556
              ],
              "startTime": "17:00",
              "category": "visita",
              "notes": "Arcades, gachapon, anime, manga, segunda mano y electrónica. Reservar tiempo para jugar.",
              "optional": false
            },
            {
              "id": "tokyo-10-27-06-cena",
              "name": "Cena",
              "coordinates": [
                35.69833333,
                139.77305556
              ],
              "startTime": "20:00",
              "category": "comida",
              "notes": "Cena por Akihabara o Ueno.",
              "optional": false
            },
            {
              "id": "tokyo-10-27-07-karaoke",
              "name": "Karaoke 🎤",
              "coordinates": [
                35.69833333,
                139.77305556
              ],
              "startTime": "21:00",
              "category": "visita",
              "notes": "Karaoke y regreso al alojamiento en la zona Ueno/Matsugaya. Local por elegir.",
              "optional": false
            }
          ]
        },
        {
          "date": "2026-10-28",
          "title": "Harajuku, palillos y Shibuya",
          "notes": "Confirmar disponibilidad del taller de palillos para el 28/10. Shibuya Sky es opcional y no tiene horario fijado.",
          "stops": [
            {
              "id": "tokyo-10-28-01-meiji-jingu",
              "name": "Meiji Jingu",
              "coordinates": [
                35.67611111,
                139.69916667
              ],
              "startTime": "09:00",
              "category": "visita",
              "notes": "Pasear por el bosque y visitar el santuario. Tiempo indicado: 1–1,5 horas.",
              "optional": false
            },
            {
              "id": "tokyo-10-28-02-takeshita-street",
              "name": "Takeshita Street",
              "coordinates": [
                35.6685,
                139.7054
              ],
              "startTime": "10:30",
              "category": "visita",
              "notes": "Moda juvenil y tiendas kawaii. Hacerse fotos en purikura; la fuente menciona NOA Takeshita Street.",
              "optional": false
            },
            {
              "id": "tokyo-10-28-03-harajuku-lunch",
              "name": "Harajuku + lunch",
              "coordinates": [
                35.6685,
                139.7054
              ],
              "startTime": "12:00",
              "category": "comida",
              "notes": "Almorzar y caminar por Takeshita → Cat Street → Omotesando.",
              "optional": false
            },
            {
              "id": "tokyo-10-28-04-taller-de-palillos-japoneses",
              "name": "Taller de palillos japoneses",
              "coordinates": [
                35.66513,
                139.71248
              ],
              "startTime": "14:00",
              "category": "visita",
              "notes": "Ginza Natsuno Chopstick Craft Experience, en Omotesando: fabricar sus propios palillos. Aproximadamente 60 minutos; confirmar dirección y disponibilidad.",
              "optional": false
            },
            {
              "id": "tokyo-10-28-05-omotesando-cat-street",
              "name": "Omotesando / Cat Street",
              "coordinates": [
                35.66513,
                139.71248
              ],
              "startTime": "15:30",
              "category": "visita",
              "notes": "Tiendas pequeñas, vintage y diseño por Omotesando y Cat Street. Mirar primero y dejar compras para el final del viaje.",
              "optional": false
            },
            {
              "id": "tokyo-10-28-06-shibuya",
              "name": "Shibuya",
              "coordinates": [
                35.6595,
                139.70056
              ],
              "startTime": "17:00",
              "category": "visita",
              "notes": "Llegar caminando y cruzar Shibuya Scramble. Observar el movimiento y las pantallas.",
              "optional": false
            },
            {
              "id": "tokyo-10-28-07-shibuya-center-gai",
              "name": "Shibuya Center-Gai",
              "coordinates": [
                35.65981389,
                139.70015833
              ],
              "startTime": "18:00",
              "category": "visita",
              "notes": "Perderse un poco entre neones, tiendas, restaurantes y arcades de Center-Gai.",
              "optional": false
            },
            {
              "id": "tokyo-10-28-08-purikura-o-karaoke",
              "name": "Purikura o karaoke",
              "coordinates": [
                35.65981389,
                139.70015833
              ],
              "startTime": "19:00",
              "category": "visita",
              "notes": "Elegir purikura si no lo hicieron antes, o una hora de karaoke. Local por elegir.",
              "optional": true
            },
            {
              "id": "tokyo-10-28-09-cena-en-shibuya",
              "name": "Cena en Shibuya",
              "coordinates": [
                35.65981389,
                139.70015833
              ],
              "startTime": "20:30",
              "category": "comida",
              "notes": "Izakaya, yakitori, ramen, sushi o curry de precio moderado.",
              "optional": false
            }
          ]
        },
        {
          "date": "2026-10-29",
          "title": "Toyosu, teamLab y Odaiba",
          "notes": "Reservar teamLab Planets y comprobar horarios del mercado, Joypolis y Tokyo Aqua Symphony para la fecha. Son planes de la fuente, no reservas confirmadas.",
          "stops": [
            {
              "id": "tokyo-10-29-01-toyosu-market",
              "name": "Toyosu Market",
              "coordinates": [
                35.644167,
                139.783611
              ],
              "startTime": "08:00",
              "category": "visita",
              "notes": "Mercado, corredores de observación y Uogashi Yokocho. La subasta de atún es una alternativa mucho más temprana y requiere reserva.",
              "optional": false
            },
            {
              "id": "tokyo-10-29-02-desayuno-brunch",
              "name": "Desayuno / brunch",
              "coordinates": [
                35.644167,
                139.783611
              ],
              "startTime": "09:30",
              "category": "comida",
              "notes": "Desayuno o brunch dentro del mercado de Toyosu.",
              "optional": false
            },
            {
              "id": "tokyo-10-29-03-toyosu-senkyaku-banrai",
              "name": "Toyosu Senkyaku Banrai",
              "coordinates": [
                35.6454629,
                139.7836617
              ],
              "startTime": "10:30",
              "category": "visita",
              "notes": "Recorrer la zona de estilo Edo, comercios y dulces. La fuente propone también el baño termal para pies.",
              "optional": false
            },
            {
              "id": "tokyo-10-29-04-teamlab-planets",
              "name": "teamLab Planets",
              "coordinates": [
                35.64938,
                139.789728
              ],
              "startTime": "12:00",
              "category": "visita",
              "notes": "Arte digital inmersivo. Reservar con antelación. Tiempo indicado: aproximadamente 2 horas.",
              "optional": false
            },
            {
              "id": "tokyo-10-29-05-almuerzo",
              "name": "Almuerzo",
              "coordinates": [
                35.64938,
                139.789728
              ],
              "startTime": "14:30",
              "category": "comida",
              "notes": "Almuerzo sencillo en Toyosu antes de continuar a Odaiba.",
              "optional": false
            },
            {
              "id": "tokyo-10-29-06-yurikamome-odaiba",
              "name": "Yurikamome → Odaiba",
              "startTime": "15:30",
              "category": "traslado",
              "notes": "Traslado en Yurikamome con vistas de la bahía. Estaciones concretas por definir.",
              "optional": false
            },
            {
              "id": "tokyo-10-29-07-odaiba-marine-park",
              "name": "Odaiba Marine Park",
              "coordinates": [
                35.63,
                139.775
              ],
              "startTime": "16:00",
              "category": "visita",
              "notes": "Paseo marítimo, bahía, vistas del Rainbow Bridge y Estatua de la Libertad. Un rato de descanso.",
              "optional": false
            },
            {
              "id": "tokyo-10-29-08-tokyo-joypolis",
              "name": "Tokyo Joypolis",
              "coordinates": [
                35.6287179,
                139.7753038
              ],
              "startTime": "17:00",
              "category": "visita",
              "notes": "Atracciones indoor y videojuegos. Comparar el pase con entradas individuales y confirmar qué funciona.",
              "optional": true
            },
            {
              "id": "tokyo-10-29-09-tokyo-aqua-symphony",
              "name": "Tokyo Aqua Symphony",
              "coordinates": [
                35.63,
                139.775
              ],
              "startTime": "19:00",
              "category": "visita",
              "notes": "Espectáculo de fuentes previsto en el documento. Confirmar el programa de octubre en la web oficial.",
              "optional": false
            },
            {
              "id": "tokyo-10-29-10-rainbow-bridge-de-noche",
              "name": "Rainbow Bridge de noche",
              "coordinates": [
                35.63,
                139.775
              ],
              "startTime": "19:30",
              "category": "visita",
              "notes": "Disfrutar las vistas del puente iluminado desde Odaiba; no implica cruzar el puente.",
              "optional": false
            },
            {
              "id": "tokyo-10-29-11-cena",
              "name": "Cena",
              "coordinates": [
                35.63,
                139.775
              ],
              "startTime": "20:30",
              "category": "comida",
              "notes": "Elegir Aqua City/DiverCity o una izakaya al volver hacia Ueno/Asakusa.",
              "optional": false
            },
            {
              "id": "tokyo-10-29-12-regreso-al-hotel",
              "name": "Regreso al hotel",
              "startTime": "22:00",
              "category": "traslado",
              "notes": "Regresar al alojamiento y descansar.",
              "optional": false
            }
          ]
        },
        {
          "date": "2026-10-30",
          "title": "Yanaka, Nezu y una izakaya",
          "stops": [
            {
              "id": "tokyo-10-30-01-yanaka-ginza",
              "name": "Yanaka Ginza",
              "coordinates": [
                35.7276689,
                139.7653174
              ],
              "startTime": "09:00",
              "category": "visita",
              "notes": "Calle comercial de barrio. Desayunar con pequeños snacks: senbei, dango, croquetas, taiyaki y té.",
              "optional": false
            },
            {
              "id": "tokyo-10-30-02-yanaka-nezu",
              "name": "Yanaka / Nezu",
              "coordinates": [
                35.7276689,
                139.7653174
              ],
              "startTime": "10:30",
              "category": "visita",
              "notes": "Recorrer calles residenciales, pequeños templos, talleres y cafés de Yanaka y Nezu.",
              "optional": false
            },
            {
              "id": "tokyo-10-30-03-nezu-shrine",
              "name": "Nezu Shrine",
              "coordinates": [
                35.72027778,
                139.76083333
              ],
              "startTime": "11:30",
              "category": "visita",
              "notes": "Santuario con corredores de torii. Tiempo indicado: unos 45 minutos.",
              "optional": false
            },
            {
              "id": "tokyo-10-30-04-almuerzo",
              "name": "Almuerzo",
              "coordinates": [
                35.72027778,
                139.76083333
              ],
              "startTime": "14:00",
              "category": "comida",
              "notes": "Soba, udon, curry o menú japonés por Yanaka/Nezu.",
              "optional": false
            },
            {
              "id": "tokyo-10-30-05-ueno-pequenos-museos-o-artesania",
              "name": "Ueno / pequeños museos o artesanía",
              "coordinates": [
                35.7118,
                139.7717
              ],
              "startTime": "15:00",
              "category": "visita",
              "notes": "Bloque abierto: museo o artesanía. La fuente propone Shitamachi Museum como una posibilidad.",
              "optional": true
            },
            {
              "id": "tokyo-10-30-06-okachimachi",
              "name": "Okachimachi",
              "coordinates": [
                35.707327,
                139.774847
              ],
              "startTime": "16:30",
              "category": "visita",
              "notes": "Pasear y recorrer comercios en Okachimachi.",
              "optional": false
            },
            {
              "id": "tokyo-10-30-07-izakaya-experience",
              "name": "Izakaya experience",
              "coordinates": [
                35.707327,
                139.774847
              ],
              "startTime": "18:30",
              "category": "visita",
              "notes": "Elegir una izakaya pequeña y compartir yakitori, edamame, gyoza, tofu, karaage o pescado.",
              "optional": false
            },
            {
              "id": "tokyo-10-30-08-regreso-caminando-hacia-el-hotel",
              "name": "Regreso caminando hacia el hotel",
              "startTime": "20:30",
              "category": "traslado",
              "notes": "Volver caminando al hotel según el alojamiento elegido.",
              "optional": false
            }
          ]
        },
        {
          "date": "2026-10-31",
          "title": "Halloween en Ikebukuro y noche en Roppongi",
          "notes": "Confirmar fechas, accesos y programa de IKEHALO y Roppongi Art Night. El documento propone estos eventos para el 31/10; todavía no están verificados ni reservados.",
          "stops": [
            {
              "id": "tokyo-10-31-01-salir-de-hotel-prele-ikebukuro",
              "name": "Salir de HOTEL PRELE → Ikebukuro",
              "startTime": "09:00",
              "category": "traslado",
              "notes": "Salir de Hotel Prele, en Matsugaya, hacia Ikebukuro. Confirmar la dirección del alojamiento.",
              "optional": false
            },
            {
              "id": "tokyo-10-31-02-ikebukuro-halloween-cosplay-festival",
              "name": "Ikebukuro Halloween Cosplay Festival",
              "coordinates": [
                35.7305256,
                139.7176167
              ],
              "startTime": "10:00",
              "duration": 210,
              "category": "visita",
              "notes": "Cosplay, stands, escenario y Halloween Stamp Rally. Consultar la entrada para visitantes y pedir permiso antes de fotografiar.",
              "optional": false
            },
            {
              "id": "tokyo-10-31-03-desfile-de-cosplay",
              "name": "Desfile de cosplay",
              "coordinates": [
                35.7305256,
                139.7176167
              ],
              "startTime": "14:20",
              "category": "visita",
              "notes": "Desfile por Sunshine 60 Street hacia Brillia HALL. La fuente propone ubicarse 15–20 minutos antes; horario por confirmar.",
              "optional": false
            },
            {
              "id": "tokyo-10-31-04-comer-algo-seguir-recorriendo",
              "name": "Comer algo + seguir recorriendo",
              "coordinates": [
                35.7305256,
                139.7176167
              ],
              "startTime": "15:30",
              "duration": 60,
              "category": "visita",
              "notes": "Comida sencilla por Ikebukuro y últimos recorridos del evento.",
              "optional": false
            },
            {
              "id": "tokyo-10-31-05-nos-vamos-de-ikebukuro",
              "name": "Nos vamos de Ikebukuro",
              "startTime": "17:00",
              "category": "visita",
              "notes": "Dejar Ikebukuro y trasladarse hacia Roppongi.",
              "optional": false
            },
            {
              "id": "tokyo-10-31-06-roppongi-art-night",
              "name": "Roppongi Art Night",
              "coordinates": [
                35.66,
                139.73
              ],
              "startTime": "18:00",
              "duration": 180,
              "category": "visita",
              "notes": "Recorrer instalaciones y performances por Roppongi Hills, Tokyo Midtown y las calles. Confirmar que el festival coincida con esta fecha.",
              "optional": false
            },
            {
              "id": "tokyo-10-31-07-cena",
              "name": "Cena",
              "coordinates": [
                35.66,
                139.73
              ],
              "startTime": "21:00",
              "category": "comida",
              "notes": "Cenar después de recorrer Roppongi.",
              "optional": false
            }
          ]
        },
        {
          "date": "2026-11-01",
          "title": "Té y artesanía en Hamarikyu",
          "notes": "Confirmar fecha, entradas y sesiones del Tokyo Grand Tea Ceremony. La ikebana de 14:00–15:00 se superpone con la salida a Ginza de 14:30: elegir o ajustar ese bloque. Shinjuku vuelve a aparecer el 2/11.",
          "stops": [
            {
              "id": "tokyo-11-01-01-hamarikyu-gardens-y-tokyo-grand-tea-ceremo",
              "name": "Hamarikyu Gardens y Tokyo Grand Tea Ceremony",
              "coordinates": [
                35.66,
                139.762
              ],
              "startTime": "09:00",
              "category": "visita",
              "notes": "Salir hacia Hamarikyu. La fuente propone comprar allí las experiencias de té; verificar el sistema de venta para 2026.",
              "optional": false
            },
            {
              "id": "tokyo-11-01-02-english-language-nodate",
              "name": "English-language Nodate",
              "coordinates": [
                35.66,
                139.762
              ],
              "startTime": "10:00",
              "duration": 60,
              "category": "visita",
              "notes": "Ceremonia de té al aire libre en inglés. Confirmar sesión, duración real y entradas.",
              "optional": false
            },
            {
              "id": "tokyo-11-01-03-tsumami-zaiku",
              "name": "Tsumami-zaiku",
              "coordinates": [
                35.66,
                139.762
              ],
              "startTime": "11:15",
              "duration": 45,
              "category": "visita",
              "notes": "Taller de flores con pequeños trozos de tela. Confirmar disponibilidad.",
              "optional": false
            },
            {
              "id": "tokyo-11-01-04-hamarikyu",
              "name": "Hamarikyu",
              "coordinates": [
                35.66,
                139.762
              ],
              "startTime": "12:00",
              "duration": 60,
              "category": "visita",
              "notes": "Recorrer el jardín y las actividades del festival: Edo Sashimono y artes tradicionales.",
              "optional": false
            },
            {
              "id": "tokyo-11-01-05-almuerzo",
              "name": "Almuerzo",
              "coordinates": [
                35.66,
                139.762
              ],
              "startTime": "13:00",
              "duration": 60,
              "category": "comida",
              "notes": "Comida sencilla dentro o cerca de Hamarikyu.",
              "optional": false
            },
            {
              "id": "tokyo-11-01-06-ikebana-opcional",
              "name": "Ikebana opcional",
              "coordinates": [
                35.66,
                139.762
              ],
              "startTime": "14:00",
              "duration": 60,
              "category": "visita",
              "notes": "Experiencia de ikebana si tienen ganas. Alternativa a salir hacia Ginza a las 14:30.",
              "optional": true
            },
            {
              "id": "tokyo-11-01-07-ginza-tokyo-station",
              "name": "Ginza → Tokyo Station",
              "coordinates": [
                35.68083333,
                139.76694444
              ],
              "startTime": "14:30",
              "category": "visita",
              "notes": "Ginza → Tokyo Station → Marunouchi → exterior del Palacio Imperial. Ajustar la salida si hacen ikebana.",
              "optional": false
            },
            {
              "id": "tokyo-11-01-08-shinjuku",
              "name": "Shinjuku",
              "coordinates": [
                35.68972222,
                139.69222222
              ],
              "startTime": "17:00",
              "category": "visita",
              "notes": "Llegar al atardecer; la fuente propone el mirador del Gobierno Metropolitano y luego Kabukicho, Godzilla Road y Omoide Yokocho.",
              "optional": false
            },
            {
              "id": "tokyo-11-01-09-shinjuku-de-noche",
              "name": "Shinjuku de noche",
              "coordinates": [
                35.695,
                139.705
              ],
              "startTime": "19:00",
              "category": "visita",
              "notes": "Disfrutar de Shinjuku de noche. Esta zona también está prevista para mañana.",
              "optional": false
            }
          ]
        },
        {
          "date": "2026-11-02",
          "title": "Shinjuku, Your Name y Shin-Okubo",
          "notes": "El recorrido completo de Your Name excede el bloque de una hora de la fuente. Seleccionar los puntos que entren y mantener Suga Shrine como parada principal.",
          "stops": [
            {
              "id": "tokyo-11-02-01-hotel-shinjuku",
              "name": "Hotel → Shinjuku",
              "coordinates": [
                35.6896,
                139.7006
              ],
              "startTime": "09:00",
              "category": "traslado",
              "notes": "Salir del alojamiento hacia Shinjuku.",
              "optional": false
            },
            {
              "id": "tokyo-11-02-02-nishi-shinjuku-la-zona-de-rascacielos",
              "name": "Nishi-Shinjuku: la zona de rascacielos",
              "coordinates": [
                35.68972222,
                139.69222222
              ],
              "startTime": "09:30",
              "duration": 120,
              "category": "visita",
              "notes": "Gobierno Metropolitano y su mirador, rascacielos, Shinjuku Center Building y foto en la escultura LOVE.",
              "optional": false
            },
            {
              "id": "tokyo-11-02-03-ruta-breve-de-your-name",
              "name": "Ruta breve de Your Name",
              "coordinates": [
                35.6896,
                139.7006
              ],
              "startTime": "11:30",
              "duration": 60,
              "category": "visita",
              "notes": "Seleccionar puntos de Your Name: salida sur de Shinjuku, Southern Terrace, vistas del NTT Docomo Yoyogi Building y puente de Shinanomachi.",
              "optional": false
            },
            {
              "id": "tokyo-11-02-04-suga-shrine",
              "name": "Suga Shrine",
              "coordinates": [
                35.6852,
                139.7202
              ],
              "startTime": "12:30",
              "duration": 30,
              "category": "visita",
              "notes": "Visitar el santuario Suga y las escaleras del final de Your Name.",
              "optional": false
            },
            {
              "id": "tokyo-11-02-05-almuerzo-en-shin-okubo",
              "name": "Almuerzo en Shin-Okubo",
              "coordinates": [
                35.701063,
                139.700228
              ],
              "startTime": "13:00",
              "duration": 60,
              "category": "comida",
              "notes": "Comida coreana y paseo breve por Korea Town: tiendas, K-pop, cosmética y street food.",
              "optional": false
            },
            {
              "id": "tokyo-11-02-06-shinjuku-kabukicho",
              "name": "Shinjuku / Kabukicho",
              "coordinates": [
                35.695,
                139.705
              ],
              "startTime": "14:30",
              "duration": 150,
              "category": "visita",
              "notes": "Volver a Shinjuku: Godzilla Head, Godzilla Road, Kabukicho y Omoide Yokocho hacia el final de la tarde.",
              "optional": false
            },
            {
              "id": "tokyo-11-02-07-shinjuku-de-noche",
              "name": "Shinjuku de noche",
              "coordinates": [
                35.69388889,
                139.70472222
              ],
              "startTime": "17:00",
              "duration": 120,
              "category": "visita",
              "notes": "Golden Gai y Kabukicho iluminados. Comprobar que los bares acepten visitantes antes de entrar.",
              "optional": false
            },
            {
              "id": "tokyo-11-02-08-cena",
              "name": "Cena",
              "coordinates": [
                35.69388889,
                139.70472222
              ],
              "startTime": "19:00",
              "duration": 90,
              "category": "comida",
              "notes": "Cenar; después elegir entre seguir caminando, tomar algo o volver al hotel.",
              "optional": false
            }
          ]
        },
        {
          "date": "2026-11-03",
          "title": "Culture Day: Meiji Jingu y ramen",
          "notes": "Confirmar el programa del festival de Meiji Jingu y Tokyo Ramen Festa. La ceremonia de las 10:00 forma parte del bloque de 09:15–12:00, no es otra visita.",
          "stops": [
            {
              "id": "tokyo-11-03-01-hotel-meiji-jingu",
              "name": "Hotel → Meiji Jingu",
              "coordinates": [
                35.67611111,
                139.69916667
              ],
              "startTime": "08:30",
              "category": "traslado",
              "notes": "Salir del hotel hacia Meiji Jingu.",
              "optional": false
            },
            {
              "id": "tokyo-11-03-02-meiji-jingu-autumn-grand-festival",
              "name": "Meiji Jingu Autumn Grand Festival",
              "coordinates": [
                35.67611111,
                139.69916667
              ],
              "startTime": "09:15",
              "duration": 165,
              "category": "visita",
              "notes": "Recorrer el santuario y ubicarse para el festival. Confirmar los horarios de las actividades ecuestres y yabusame.",
              "optional": false
            },
            {
              "id": "tokyo-11-03-03-ceremonia-principal",
              "name": "Ceremonia principal",
              "coordinates": [
                35.67611111,
                139.69916667
              ],
              "startTime": "10:00",
              "category": "visita",
              "notes": "Ceremonia principal indicada en la fuente, dentro de la visita al festival. Horario por confirmar.",
              "optional": false
            },
            {
              "id": "tokyo-11-03-04-almuerzo",
              "name": "Almuerzo",
              "startTime": "12:00",
              "duration": 60,
              "category": "comida",
              "notes": "Almuerzo antes de continuar; dejar apetito si van a probar ramen después.",
              "optional": false
            },
            {
              "id": "tokyo-11-03-05-tokyo-ramen-festa",
              "name": "Tokyo Ramen Festa",
              "coordinates": [
                35.6251212,
                139.6623012
              ],
              "startTime": "13:30",
              "duration": 90,
              "category": "comida",
              "notes": "La fuente sitúa Tokyo Ramen Festa en Komazawa Olympic Park. Probar alguna especialidad regional; confirmar evento, fecha y entradas.",
              "optional": false
            },
            {
              "id": "tokyo-11-03-06-tarde-comodin",
              "name": "Tarde comodín",
              "startTime": "15:30",
              "duration": 150,
              "category": "descanso",
              "notes": "Sin reserva: evento cultural, exposición, algo pendiente o volver a un lugar favorito.",
              "optional": true
            },
            {
              "id": "tokyo-11-03-07-ultima-tarde-agradable-en-tokio",
              "name": "Última tarde agradable en Tokio",
              "startTime": "18:00",
              "duration": 120,
              "category": "visita",
              "notes": "Tramo abierto: Shibuya/Harajuku o regreso hacia Ueno/Asakusa, según dónde termine la tarde.",
              "optional": true
            },
            {
              "id": "tokyo-11-03-08-cena",
              "name": "Cena",
              "startTime": "20:00",
              "category": "comida",
              "notes": "Cenar y volver temprano: mañana hay check-out, compras y aeropuerto.",
              "optional": false
            }
          ]
        },
        {
          "date": "2026-11-04",
          "title": "Check-out, compras y aeropuerto",
          "notes": "La fuente solo indica que este día está reservado para check-out, compras y aeropuerto. Horarios, tiendas, equipaje, traslado y vuelo quedan por confirmar.",
          "stops": [
            {
              "id": "tokyo-11-04-01-check-out",
              "name": "Check-out",
              "category": "traslado",
              "notes": "Confirmar el horario del alojamiento y dónde guardar el equipaje.",
              "optional": false
            },
            {
              "id": "tokyo-11-04-02-compras-finales",
              "name": "Compras finales",
              "category": "visita",
              "notes": "Zona y horario todavía abiertos en el documento.",
              "optional": false
            },
            {
              "id": "tokyo-11-04-03-traslado-al-aeropuerto",
              "name": "Traslado al aeropuerto",
              "category": "traslado",
              "notes": "Aeropuerto, vuelo y medio de transporte por confirmar.",
              "optional": false
            }
          ]
        }
      ]
    }
  ]
};
