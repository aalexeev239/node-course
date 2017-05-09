'use strict';

// core
const fs = require('fs');
// deps
const mime = require('mime');
const HttpStatus = require('http-status-codes');
// custom
const ErrorCode = require('./ErrorCode');

/**
 * Передача файлов
 * @param {string} filepath путь к файлу
 * @param {http.ServerResponse} res ответ сервера
 */
function sendFile(filepath, res) {
    let fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);

    fileStream
        .on('error', (err) => {
            if (err.code === ErrorCode.ENOENT) {
                res.statusCode = HttpStatus.NOT_FOUND;
                res.end(HttpStatus.getStatusText(HttpStatus.NOT_FOUND));
                return;
            }

            console.error(err);

            if (!res.headersSent) {
                res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                res.end(HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR));
            } else {
                res.end();
            }
        })
        .on('open', () => {
            res.setHeader('Content-Type', mime.lookup(filepath));
        });

    res
        .on('close', () => {
            fileStream.destroy();
        });
}

module.exports = sendFile;
