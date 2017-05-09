'use strict';

// core
// deps
const HttpStatus = require('http-status-codes');
// custom
const {FILE_ROOT} = require('./config');
const getFilePath = require('./utils/getFilePath');
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
        sendFile(`${__dirname}/public/index.html`, res);
        return;
    }

    if (pathname == '/favicon.ico') {
        res.writeHead(HttpStatus.OK, {'Content-Type': 'image/x-icon'});
        res.end();
        return;
    }

    const filePath = getFilePath(FILE_ROOT, pathname);

    if (!filePath) {
        res.statusCode = HttpStatus.NOT_FOUND;
        res.end(HttpStatus.getStatusText(HttpStatus.NOT_FOUND));
        return;
    }

    sendFile(filePath, res);
}

module.exports = handleGet;
