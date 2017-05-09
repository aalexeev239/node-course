'use strict';

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

// core
const url = require('url');
const http = require('http');
// deps
const HttpStatus = require('http-status-codes');
// custom
const handleGet = require('./handleGet');
const handlePost = require('./handlePost');
const handleDelete = require('./handleDelete');

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
            handleGet(pathname, res);
            break;

        case 'POST':
            handlePost(pathname, req, res);
            break;

        case 'DELETE':
            handleDelete(pathname, req, res);
            break;

        default:
            res.statusCode = HttpStatus.NOT_IMPLEMENTED;
            res.end(HttpStatus.getStatusText(HttpStatus.NOT_IMPLEMENTED));
    }
});

module.exports = server;
