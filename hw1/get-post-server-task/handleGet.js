'use strict';

// core
const fs = require('fs');
const path = require('path');
// deps
const mime = require('mime');
const HttpStatus = require('http-status-codes');
// custom
const {FILE_ROOT} = require('./config');
const ErrorCode = require('./utils/ErrorCode');
const sendFile = require('./utils/sendFile');


/**
 * Обработка GET-запроса
 * GET /file.ext: image.png, text.txt, video.mp4
 * - выдаёт файл file.ext из директории files,
 *
 * @param {string} pathname запрос
 * @param {http.ServerResponse} res ответ
 */
function handleGet(pathname, res) {
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
}

module.exports = handleGet;
