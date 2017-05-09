'use strict';

// core
const fs = require('fs');
// deps
const HttpStatus = require('http-status-codes');
// custom
const {FILE_ROOT} = require('./config');
const getFilePath = require('./utils/getFilePath');
const ErrorCode = require('./utils/ErrorCode');

/**
 * DELETE /file
 * - удаляет файл
 * - выводит 200 OK
 * - если файла нет, то ошибка 404
 * @param {string} pathname путь к файлу
 * @param {http.IncomingMessage} req запрос
 * @param {http.ServerResponse} res ответ
 */
function handleDelete(pathname, req, res) {

    console.log('--- pathname', pathname);

    const filePath = getFilePath(FILE_ROOT, pathname);

    if (!filePath) {
        res.statusCode = HttpStatus.BAD_REQUEST;
        res.end(HttpStatus.getStatusText(HttpStatus.BAD_REQUEST));
        return;
    }

    fs.unlink(filePath, (err) => {
        if (err) {
            if (err.code === ErrorCode.ENOENT) {
                res.statusCode = HttpStatus.NOT_FOUND;
                res.end(HttpStatus.getStatusText(HttpStatus.NOT_FOUND));
                return;
            }

            console.error(err);
            res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            res.end(HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR));
            return;
        }

        res.statusCode = HttpStatus.OK;
        res.end(HttpStatus.getStatusText(HttpStatus.OK));
    });


}

module.exports = handleDelete;
