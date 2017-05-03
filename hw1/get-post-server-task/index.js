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

const url = require('url');
const fs = require('fs');
const mime = require('mime');
const HttpStatus = require('http-status-codes');
const ErrorCode = require('./utils/ErrorCode');
const sendFile = require('./utils/sendFile');

const server = require('http').createServer((req, res) => {

    const pathname = decodeURI(url.parse(req.url).pathname);

    switch (req.method) {
        case 'GET':
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

            const names = pathname.split('/');

            if (names.length !== 2) {
                res.statusCode = HttpStatus.BAD_REQUEST;
                res.end(HttpStatus.getStatusText(HttpStatus.BAD_REQUEST));
                return;
            }

            console.log('--- names[1]', names[1]);
            const filePath = `${__dirname}/files/${names[1]}`;

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
