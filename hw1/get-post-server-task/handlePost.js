'use strict';

// core
// deps
const HttpStatus = require('http-status-codes');
// custom
const {FILE_ROOT} = require('./config');
const getFilePath = require('./utils/getFilePath');
const receiveFile = require('./utils/receiveFile');

/**
 * Обработка POST-запроса
 * POST /file.ext
 * - пишет всё тело запроса в файл files/file.ext и выдаёт ОК
 * - если файл уже есть, то выдаёт ошибку 409
 * - при превышении файлом размера 1MB выдаёт ошибку 413
 *
 * @param {string} pathname путь к файлу
 * @param {http.IncomingMessage} req запрос
 * @param {http.ServerResponse} res ответ
 */
function handlePost(pathname, req, res) {
    pathname = pathname.indexOf('/') === 1 ? pathname.substr(1) : pathname;

    const filePath = getFilePath(FILE_ROOT, pathname);

    if (!pathname || !filePath) {
        res.statusCode = HttpStatus.BAD_REQUEST;
        res.end(HttpStatus.getStatusText(HttpStatus.BAD_REQUEST));
        return;
    }

    receiveFile(filePath, req, res);
}

module.exports = handlePost;
