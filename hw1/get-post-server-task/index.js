/**
 ЗАДАЧА
 Написать HTTP-сервер для загрузки и получения файлов с использованием ПОТОКОВ
 - Все файлы находятся в директории files
 - Структура файлов НЕ вложенная.

 - Виды запросов к серверу
 GET /file.ext: image.png, text.txt, video.mp4
 - выдаёт файл file.ext из директории files,

 POST /file.ext
 - пишет всё тело запроса в файл files/file.ext и выдаёт ОК
 - если файл уже есть, то выдаёт ошибку 409
 - при превышении файлом размера 1MB выдаёт ошибку 413

 DELETE /file
 - удаляет файл
 - выводит 200 OK
 - если файла нет, то ошибка 404

 Вместо file может быть любое имя файла.
 Так как поддиректорий нет, то при наличии / или .. в пути сервер должен выдавать ошибку 400.

 - Сервер должен корректно обрабатывать ошибки "файл не найден" и другие (ошибка чтения файла)
 - index.html или curl для тестирования

 */

// Пример простого сервера в качестве основы

'use strict';

// core
const url = require('url');
const fs = require('fs');
const path = require('path');
const http = require('http');
// deps
const mime = require('mime');
const HttpStatus = require('http-status-codes');
// custom
const ErrorCode = require('./utils/ErrorCode');
const sendFile = require('./utils/sendFile');

const FILE_ROOT = path.join(__dirname, 'files/');

const server = http.createServer((req, res) => {

    let pathname;

    try {
        pathname = decodeURIComponent(url.parse(req.url).pathname);
    } catch (error) {
        res.statusCode = HttpStatus.BAD_REQUEST;
        res.end(HttpStatus.getStatusText(HttpStatus.BAD_REQUEST));
        return;
    }

    switch (req.method) {
        case 'GET':
            // 0 byte
            if (~pathname.indexOf('\0')) {
                res.statusCode = HttpStatus.BAD_REQUEST;
                res.end(HttpStatus.getStatusText(HttpStatus.BAD_REQUEST));
                return;
            }

            if (pathname == '/') {
                const file = new fs.ReadStream(`${__dirname}/public/index.html`);
                res.setHeader('Content-Type', 'text/html;charset=utf-8');
                sendFile(file, res);
                return;
            }

            if (pathname == '/favicon.ico') {
                res.writeHead(HttpStatus.OK, {'Content-Type': 'image/x-icon'});
                res.end();
                return;
            }

            const filePath = path.join(FILE_ROOT, pathname);

            if (filePath.indexOf(FILE_ROOT) !== 0) {
                res.statusCode = HttpStatus.NOT_FOUND;
                res.end(HttpStatus.getStatusText(HttpStatus.NOT_FOUND));
                return;
            }

            fs.open(filePath, 'r', (err, fd) => {
                if (err) {
                    if (err.code === ErrorCode.ENOENT) {
                        res.statusCode = HttpStatus.BAD_REQUEST;
                        res.end(HttpStatus.getStatusText(HttpStatus.BAD_REQUEST));
                        console.error(err);
                        return;
                    }

                    res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                    res.end(HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR));
                    // [ВОПРОС] а как правильно ловить дальше?
                    console.error(err);
                    throw err;
                }

                res.setHeader('Content-Type', mime.lookup(filePath));
                const file = new fs.ReadStream(filePath);
                sendFile(file, res);
                return;
            });
            break;

        default:
            res.statusCode = HttpStatus.NOT_IMPLEMENTED;
            res.end(HttpStatus.getStatusText(HttpStatus.NOT_IMPLEMENTED));
    }

});

server.listen(3000);
