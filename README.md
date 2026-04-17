ACTIVIDAD OBLIGATORIA N.° 1
 Programación de Aplicaciones Web II
Punto 1 — Diagrama de flujo - ver archivo "Diagrama de flujo" en este repositorio . 
 



 Punto 2 — Arquitectura y selección de librerías

2.a — Módulos nativos de Node.js a utilizar
La aplicación se desarrolla usando módulos nativos de Node.js, lo que permite construir un servidor sin dependencias externas para la lógica principal. A continuación se describen los módulos usados,  funciones y su justificación.

Módulo http
Propósito general
El módulo http nos permite crear un servidor web  que sea capaz de recibir peticiones HTTP y enviar respuestas.
 Funciones usadas
•	http.createServer((req, res) => {}): crea el servidor y maneja las peticiones entrantes. 
•	server.listen(PORT): inicia el servidor en un puerto deeseado. 
•	res.writeHead(status, headers): define el código de estado y encabezados HTTP. 
•	res.write() / res.end():le envía contenido al cliente y finaliza la respuesta. 
 Justificación
Se eligió este módulo porque permite implementar un servidor web sin frameworks, lo cual cumple el objetivo  de poder entender el funcionamiento  del protocolo HTTP.

 Módulo fs (File System)
Propósito general
Permite interactuar con el sistema de archivos del sistema operativo.
Funciones utilizadas
•	fs.readFile(): lee archivos como noticias.txt o archivos estáticos. 
•	fs.appendFile(): agrega nuevas noticias al final del archivo sin sobrescribir el contenido. 

 Justificación
Se usa este módulo para tener persistencia de datos mediante archivos de texto, y evitar el uso de bases de datos y simplificando la lógica del proyecto.

Módulo url
Propósito general
Permite analizar URLs entrantes y extraer información estructurada como rutas y parámetros.
 Funciones / propiedades utilizadas
•	new URL(req.url, base): crea un objeto URL para su análisis. 
•	pathname: obtiene la ruta del recurso solicitado. 
•	searchParams.get('id'): obtiene  los parámetros enviados por query string. 
Justificación
Se usa  para poder manejar rutas dinámicas como /noticia?id=3, lo que permite generar contenido dinámico en base a parámetros enviados por el usuario.

Módulo path
Propósito general
Facilita el uso de rutas de archivos de forma segura y compatible con distintos sistemas operativos.
Funciones utilizadas
•	path.join(): construye rutas válidas para acceder a archivos dentro del proyecto. 
Justificación
Se usa  para servir archivos estáticos de forma correcta desde /public , evitando errores en rutas absolutas o relativas.

 2.b — Paquetes de npm 
La aplicación usa  un paquete de npm para la gestión de tipos MIME, lo que permite que el servidor indique de forma correctael tipo de contenido de cada archivo enviado al navegador.


 Paquete utilizado: mime-types
 Instalación: npm install mime-types

 Versión utilizada : mime-types@3.0.2

 Método principal utilizado:

Función:
mime.lookup(path)

 Firma:
lookup(filename: string): string | false

 Descripción
Este método recibe la ruta o nombre de un archivo y devuelve su tipo MIME que corresponda (por ejemplo text/css, image/png, text/html).
 Si no puede determinar el tipo, devuelve false.

 Justificación de uso
Se eligió mime-types porque detecta automáticamente el tipo de archivo según su extensión, sin necesidad de armar una tabla manual. Esto hace que el servidor sea más fácil de mantener y reduce errores al servir archivos estáticos. Además, funciona directamente con CommonJS, el sistema de módulos que usa Node.js, sin necesitar ninguna configuración extra.
 Conclusión:
La arquitectura del proyecto se basa en módulos nativos de Node.js para el manejo del servidor, archivos y rutas, que lo complementan con un paquete de npm (mime-types) para mejorar la gestión de archivos estáticos. Esta combinación permite una implementación simple de un servidor web completo sin frameworks externos.




 Punto 3 — Explicación de la implementación

Bloque A — Servidor HTTP y routing
La aplicación se hizo utilizando el módulo nativo http de Node.js mediante la función http.createServer(). Esta función permite crear un servidor que recibe dos parámetros principales: la petición (req) y la respuesta (res).
Para identificar qué recurso está solicitando el usuario, se analiza la URL de la petición utilizando el módulo url. A partir de req.url se extrae la ruta (pathname), lo que permite saber  qué funcionalidad ejecutar.
El enrutamiento se aplica mediante condicionales (if/else if), donde cada ruta corresponde a una acción, por ejemplo:
•	/ → listado de noticias
•	/public/... → archivos estáticos (incluyendo el formulario) 
•	/noticia → vista de detalle 
•	/agregar → procesamiento de POST 

Asi, el servidor actúa como un enrutador básico sin necesidad de frameworks externos.

 Bloque B — Servicio de archivos estáticos con caché
Para mejorar el rendimiento del servidor, se usa un sistema de caché en memoria usando  un objeto JavaScript:
let cache = {};
Cuando se solicita un archivo estático (CSS, imágenes, etc.), el servidor primero verifica si ese archivo ya fue cargado previamente en memoria.
•	Si el archivo está en caché : se devuelve directamente sin acceder al disco. 
•	Si no está : se lee desde el sistema de archivos (fs.readFile) y luego se almacena en caché para futuras solicitudes. 
Además, se utiliza el paquete mime-types para determinar automáticamente el tipo de contenido del archivo según su extensión. Esto permite enviar el header correcto Content-Type, asegurando que el navegador interprete de forma corrcta el recurso (por ejemplo, CSS, imágenes o HTML).



 Bloque C — Captura de datos POST
Los datos que son  enviados desde formularios HTML mediante el método POST no llegan de forma inmediata ni completa. En Node.js, estos datos se reciben en forma de fragmentos o “chunks”. Esto es por el modelo asincrónico y no bloqueante de Node.
Para manejar este flujo, se utilizan eventos del objeto req:
•	req.on('data', chunk): se ejecuta cada vez que llega un fragmento de datos. 
•	req.on('end', ...): se ejecuta cuando se recibió toda  la información.
Cada fragmento se concatena en una variable (body) hasta completar el mensaje.
Una vez que se recibe  el cuerpo completo, se utiliza URLSearchParams para parsear los datos del formulario y acceder a los valores enviados, por ejemplo:
•	titulo 
•	contenido 
Esto nos permite procesar formularios HTML sin necesidad de frameworks.
Este proceso sigue  el flujo:
 recepción de chunks → ensamblado → parseo de datos.

Bloque D — Parámetros GET
Para acceder a información enviada por URL (query parameters), como por ejemplo:
/noticia?id=3
se usa  el módulo url junto con URLSearchParams o parsedUrl.query para parsear la dirección.
El valor del parámetro id se obtiene mediante:
parsedUrl.query.id
Este valor se utiliza luego como índice o referencia para buscar la noticia que corresponde  dentro de la estructura de datos en memoria (array generado desde el archivo).
De esta forma, el servidor puede generar contenido dinámico dependiendo del parámetro recibido en la URL.



Bloque E — Persistencia en archivo de texto
La persistencia de datos se aplica  mediante el módulo fs de Node.js, utilizando un archivo de texto (noticias.txt) como almacenamiento simple.
•	Para agregar nuevas noticias usamos fs.appendFile(), que permite escribir al final del archivo sin sobrescribir el contenido existente. 
•	Para mostrar las noticias, se utiliza fs.readFile(), que lee todo el archivo y lo procesa línea por línea. 
Cada línea del archivo representa una noticia con el formato:
titulo|contenido
Despues , estos datos se transforman en estructuras utilizables dentro del programa (objetos), permitiendo generar el listado dinámico en la página principal.

Modelo asincrónico de Node.js
Node.js usa  un modelo de ejecución asincrónico y no bloqueante, lo que significa que las operaciones de entrada/salida (como lectura de archivos o recepción de datos HTTP) no paran  la ejecución del programa.
En este proyecto, esto se ve  en:
•	fs.readFile() y fs.appendFile(), que funcionan mediante callbacks. 
•	Los eventos req.on('data') y req.on('end'), que manejan la llegada progresiva de datos. 
Gracias a este modelo, el servidor puede seguir atendiendo múltiples solicitudes mientras espera que se completen operaciones de disco o red, mejorando la eficiencia.

 Conclusión
La app  combina el uso de módulos nativos de Node.js con un paquete externo (mime-types) para construir un servidor web completo. Se aplican conceptos clave como asincronía, manejo de eventos, procesamiento de datos HTTP y persistencia, logrando una aplicación funcional sin el uso de frameworks externos.



ENLACE EDITABLE DEL DIAGRAMA DE FLUJO : 
https://viewer.diagrams.net/?tags=%7B%7D&lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&dark=auto#R%3Cmxfile%3E%3Cdiagram%20name%3D%22P%C3%A1gina-1%22%20id%3D%22ccb_8ntT2Dz8FDNc4CCh%22%3E7V1bc6M4Fv41rkpvlV3ijh87t%2B7Z7XRnJz21009bMsg2G4xogRNnfv1KAowRuINjCbAnL4kRF4E%2BnaNz18i4Wm0%2BERgv77CPwpEO%2FM3IuB7puuOY9C9reMkaNMtys5YFCfy8rWx4CP5CeSPIW9eBj5LKhSnGYRrE1UYPRxHy0kobJAQ%2FVy%2Bb47DaawwXqNbw4MGw3vqfwE%2BXWaurO2X7ZxQslkXPmj3Nzsyg97ggeB3l%2FUU4QtmZFSwek39jsoQ%2Bft7pz7gZGVcE4zT7tdpcoZANazFi2X23e85uX5mgKG1zwwo8fUbw5XL%2B%2Feqf38AfzgvcfBtr%2BXcgvzZA5XPzpiR9KcaLXf6QH2KSLvECRzC8KVsv%2BZgg1jWgR%2BU1XzCOaaNGG%2F%2BH0vQlnwtwnWLatExXYX6W9k5e%2FmT3T6zi8Ef%2BOH5wvakcveRH%2BeyBZIHSX3y4sUWATmqEV4g%2Bg95HUAjT4Kk6FjCfXYvtddtb73FAR0kHOSUYTg52TghjC1QfkeA18VB%2BVwkW%2FbHzGmUTh%2FAAOIu51gpO%2FiqvDVHXsHcCiyugks0WZagYbUiqOnLPyyBFDzHkAD1TplsdpXkQhlc4xITfa%2FgQuXOPticpwY9o54ztuWg235LFEwzXeX8JIk%2BITMIgSVF0YQAAPuTXIJKijcinKnAsd3ihnY%2Flc8k3tWIaFsOvCVShgf0IVgb%2F4PmvSZz%2F5hmyPftI%2BjoKHXOIdPAlRAvI3gqlgReMrozRpRHR48%2Ffv993RRBTVfRgDXHETUAnAviK6Z%2BbiEp0KaGCkaqhdvXqUFtAGe%2FRJfIe%2Bwx5j9Mn77GHSAlrEk7oGyXogqCfE3pEl2AwHuk2XLHOolkS89vskL7ypR880Z%2BLdKdpjrmYU36C%2FXONixPjhAP9kV6ggXiT3ZafLx6ENpT6qMYC7qm6EsEV4pSig59rxAY964UOeNZRtXPa3PBKDU0z8tqtb6B9p4H27Srtb%2FlqoZaKcp%2B02aW5Emnf6YX2N0H6587vHyUboEcl4bODA%2Ble03sVOmSy5V6hKeH4sXOmGRrFrFzrVY509gO4w8uXeDVbJwfz8fl8rnuNfNy3Z7ZlN%2FHx0ZU%2Bury9Y8Ljx2mKmTQD7r89fB8Zt2%2FibW6dt7mCBGlUWduWHcoXIQ2J9FPIvcMnoJaEYO1BsxtCKIZzWFJNiBD5ipk2BZOLD2OV4ss8mRAE%2FdsgZIJLlHc6STfpgbKLJAHErFKppnWlfNimTCrtx%2BDb8TKnwMpoVtB27W7NjNovIO%2BPG3xCESKQG1TuvtB%2FfhDxdVJbBR7O1R1l%2FMFHKQw5b%2FB3GERdwQINOlejDqaOnbQyG1UnmCN6F6SxE9eRyU70d3byBnaiAeeV1UM1P9GHyE%2B4XM0I4xYuCFpAMiqoRD7BaUAQs01lC7ghleJ6cd0NUE81zF7F88E6%2FgJyk6R0BDysWED%2FHSU4pIRJr6GvjpiVcRBLqWV1JZkbUvXnc%2FRJ6sfGYhxHpIP0SsrXoad7KPRynXjc%2F4n5Smrc0tEaAoWKwq5Cx50lk0L78dyps3BpvS6hulSxqBdsWo6z1SsTbOce7dKknjObJIZRI3srIy%2FHXvZAxuVSAqOk%2BAqm2O%2BcCxn%2FGfuQPF6QxeyCshM6WKD49yH7z85Q6SA72P3x4UMj%2B8xM%2F%2F9eZ7Z%2F9oB1ytgpi2a93eGY2XdUGWnM3i%2BESVLn27R57aMxQUmMowSNZ9hns2FGEHwcP2PiJ4x7MhQShsI4wmQFGcwhgn4QLcYj61KbOCPruuGVy7eKj%2BLibdwUVSZuKPPA6ocEsr7GKPR3%2FWnXpNgXVzL008d0i08FnRKsLi1KpllVeuyODdR6O334fZXZs8rcbFiwLuuDrTCFMZsvM%2FuM1U3LToMSMfjvty7pzOKL2a%2B%2BTIJmcviaZuvK1jSpTr3eQwpdY5cHjsEE6O4rbJAf3SMS0AFF5MC1C%2FSquNjnhJ1tO4dIF0fB1qs1yJAZyGf0Yq2TITp8JAS%2B7FwQM5Eg2S9Z2K4oWWgCFNkTm%2B92QPPdXcklhVh0wqCr9qNMeyXKdibazgP%2BPOgtERVNtp4NKqCUSr8KdwoVZoJ5wO21WefKLbUacCZWTSTaBjZt3SlWlYKVZXiZMo21xrQXWh2enm%2F2q%2BdPW9F3xy6YndhCxU7SL4g7SCHxlsETi4nK0%2BuDhEVIDcAXI3pL1QUemTLt%2FebfIo6xDXn3m%2FbZLi6x8%2BX7hhDu88zt5kxRURWub4kJ6OoISKbNoB8COnKu7tFQhFwwV8y5Vaxj2FIZW9%2F2ACWp6b16QM1BJoiughWahBg%2FruMLtEmL9FBlkghh4VprL8DMGpwGMW4Ilb777e6mH6nE%2BLVUMlWWA2W6bSYH%2Fby0OgOaJkgVfV4vqDpV8iYYBouIHnq0R7Y0Md0vpapf%2BDE%2FsQp8v4GwGd1mSPNXoIgGf8EZf0fQNMXYyLwFIKMOkICPLmS%2FbN1P8vFppUCcLD6lp4ePwkYWXlPBseEaHeFVEO554pW71Oh7RYuSB97G61kYeJzcSidW5aJ%2FyALWqQJrm10RojXIFKQFT0Fion6ZgwRZ%2BpFarT5IeCTQbuZRMgh1fnu8tdbphY1P%2FoxoVYLmNEn969uq1jQQrClyYiFsSpm6aLUSe08TnodAkWBj6m4Fnlo9OXnwtCp1cJrwdEY9StnbGWsGyujHMKsAOcpC%2B60zVgyU0Y8lmMqc0gUov27BGWsCyujHFgwftThOefC0kudPEx5l9GOL1R0NZfDo5wtPZ9RT8wTIg0dmMJlt1YA9EV%2FMwcFkAv1oheG3XTSZ5YIJsHTb0CzHnZqO0fywzhw%2Fg6zB2hS6xLI%2F2V8fcruFNEPIeLGGxOdJUcytwLousqX2GEPUmD1Ef0FZYEN%2B%2FZRDKH%2Fw0QkymECL8iaiFLOnVn7jkyY79F7szVA8t%2BNq744ukesXY3RWnl6n12gzp5XK0TVD%2FuP3Lw%2BIRYDdQwJXyQVL%2BFQbdXaNPOzzaFLCufIqxlvzdGPF3iaD9Zuq%2Fcqzddt1pi%2BW4ANiDb6pqUybdWQGeTh%2F%2B%2FVhOqlGFbtippVqTi61qnOvcB5a1lk%2BnJpoVTJrViXVcA40DjHl0vB1ug7xKKu%2BzjZFQFHgY9XpBFSZ92GN%2B6vMJtBbZBPQq4R0gqk90VUxbVc7J1ldteh2bDWYfczefcUoo3jjLFeq0N5PCtgbWP2gyhNoWkGK%2BwL6FC8QrsxSbf1OghOueuqKVhox%2BEG1mDDQbMNKukJmUssyFt5W%2FvT1pAUNmF05Mpz3MJTDHRkaEEVqZZ4MtxVNnC4%2BLeqBy4GwtkGAEIo3VRaa6b4H4r0FHyCuRsoym90z5oEKARIqdKsMVnHPOJoIp3yThqx6oRyohCh0V1it1EWhFx39GqcMgWK7b70KWbKEMbtutVmwHc8n8xA%2Fe0tI0klCxc%2F0v%2FoeWEVPgIVc32yS9lx9ZtiN0t5vUeAFZRY4L9ftM8nvDag07VHz6ua8yupZTXWFuFDqWAURTNkAq4KG1zED3%2F414ml4eTZBt9seNvm5gcATRZaoTGyftiroV2BGr2KbsYSYQrcSYK1hHu9Uj6rcuFNWqhHmkg2yB0Pi5bqyxp6ac0Qw0Y36jEAanRNO04yY2o4BG2fEFYzTNeeceYVWpS479ESHmdlp8xiNmtjK3gBFfj9ZJpaonnS29e60lXpyzvNwnkxgHFPoy3Ilne0hS4co4bvI862VsiCfbrZga5qFNf%2BvMAtrTkR5s7CVhvW%2BvB25vBlC9k1tmzV5gLbSyAYMaAN6fPP1LuGqFR1WJ420SpY6LbgykvRRwrNIG0MnO8DQ0TrDsFU%2B1Wlh2DnJifU0FXLIVhaRAcOV0Rdb7a54zAWThL6%2F0BdSBM02yHUbjl5EqyrYHDjv6oTTD7p0Zx5TtHjaa31UDbSKWBkwGTZwTQPoOWUS5AcEeYw0q9UzurCliDtA1t3REmE8dftY4%2BIHOkZMm1ajSBxNnUeATo%2Fzg8zqHjIh5kOdF1QDMmN6rTrUA87OOGqB09UscPSQYGZN2p77xIjgDjPnh3Hzfw%3D%3D%3C%2Fdiagram%3E%3C%2Fmxfile%3E
