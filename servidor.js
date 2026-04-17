const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const mime = require('mime-types');

const PORT = 3000;
let cache = {};

//  leer noticias desde public/noticias.txt
function leerNoticias(callback) {
    const filePath = path.join(__dirname, 'public', 'noticias.txt');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return callback([]);

        const noticias = data
            .split('\n')
            .filter(Boolean)
            .map((linea, i) => {
                const [titulo, contenido] = linea.split('|');
                return { id: i, titulo, contenido };
            });

        callback(noticias);
    });
}

//  guardar noticia en public/noticias.txt
function guardarNoticia(titulo, contenido, callback) {
    const filePath = path.join(__dirname, 'public', 'noticias.txt');
    const nueva = `${titulo}|${contenido}\n`;

    fs.appendFile(filePath, nueva, (err) => {
        if (err) return callback(err);
        callback(null);
    });
}

//  archivos estáticos con caché + MIME
function servirEstatico(filePath, res) {
    const contentType = mime.lookup(filePath) || 'text/plain';

    if (cache[filePath]) {
        res.writeHead(200, { 'Content-Type': contentType });
        return res.end(cache[filePath]);
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            return res.end('Archivo no encontrado');
        }

        cache[filePath] = data;

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

//  SERVIDOR
http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // 🏠 HOME (listado dinámico)
    if (pathname === '/' && req.method === 'GET') {
        leerNoticias((noticias) => {
            let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Noticias</title>
                <link rel="stylesheet" href="/public/estilos.css">
            </head>
            <body>
                <h1>Noticias</h1>
                <a href="/public/formulario.html">Nueva noticia</a>
                <ul>
            `;

            if (noticias.length === 0) {
                html += `<p>No hay noticias</p>`;
            } else {
                noticias.forEach(n => {
                    html += `<li><a href="/noticia?id=${n.id}">${n.titulo}</a></li>`;
                });
            }

            html += `
                </ul>
            </body>
            </html>
            `;

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        });
    }

    //  DETALLE NOTICIA
    else if (pathname === '/noticia' && req.method === 'GET') {
        const id = parsedUrl.query.id;

        leerNoticias((noticias) => {
            const noticia = noticias[id];

            if (!noticia) {
                res.writeHead(404);
                return res.end('Noticia no encontrada');
            }

            const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${noticia.titulo}</title>
                <link rel="stylesheet" href="/public/estilos.css">
            </head>
            <body>
                <h1>${noticia.titulo}</h1>
                <p>${noticia.contenido}</p>
                <a href="/">Volver</a>
            </body>
            </html>
            `;

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        });
    }

    //  POST AGREGAR NOTICIA
    else if (pathname === '/agregar' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const datos = new URLSearchParams(body);
            const titulo = datos.get('titulo');
            const contenido = datos.get('contenido');

            if (!titulo || !contenido) {
                res.writeHead(400);
                return res.end('Datos incompletos');
            }

            guardarNoticia(titulo, contenido, (err) => {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error al guardar');
                }

                res.writeHead(302, { Location: '/' });
                res.end();
            });
        });
    }

    //  ARCHIVOS ESTÁTICOS (/public)
    else if (pathname.startsWith('/public')) {
        const filePath = path.join(__dirname, pathname);
        servirEstatico(filePath, res);
    }

    //  404
    else {
        res.writeHead(404);
        res.end('Ruta no encontrada');
    }

}).listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});