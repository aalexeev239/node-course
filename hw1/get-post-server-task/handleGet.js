'use strict';

const HttpStatus = require('http-status-codes');

/**
 * Обработка GET-запроса
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
}

module.exports = handleGet;
