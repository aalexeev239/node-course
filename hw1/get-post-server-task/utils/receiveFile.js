'use strict';

// core
// const example = require('example');
// deps
const HttpStatus = require('http-status-codes');
// custom
const {LIMIT_FILE_SIZE} = require('../config');
const ErrorCode = require('./ErrorCode');

/**
 * Обработать получение файла
 * @param {string} filePath путь к файлу
 * @param {http.IncomingMessage} req запрос
 * @param {http.ServerResponse} res ответ
 */
function receiveFile(filePath, req, res) {
    if (req.headers['content-length'] > LIMIT_FILE_SIZE) {
        res.statusCode = HttpStatus.REQUEST_TOO_LONG;
        res.end(HttpStatus.getStatusText(HttpStatus.REQUEST_TOO_LONG));
    }

    let size = 0;
    const fileStream = fs.createWriteStream(filePath, {flags: 'wx'});

    req
        .on('data', (chunk) => {
            size += chunk.length;

            if (size > LIMIT_FILE_SIZE) {
                res.statusCode = HttpStatus.REQUEST_TOO_LONG;
                res.setHeader('Connection', 'close');
                res.end(HttpStatus.getStatusText(HttpStatus.REQUEST_TOO_LONG));
                fileStream.destroy();
                fs.unlink(filePath, (err) => {
                    console.error(err);
                });
            }
        })
        .on('close', () => {
            fileStream.destroy();
            fs.unlink(filePath, (err) => {
                console.error(err);
            });
        })
        .pipe(fileStream);

    fileStream
        .on('error', (err) => {
            if (err.code === ErrorCode.EEXIST) {
                res.statusCode = HttpStatus.CONFLICT;
                res.end(HttpStatus.getStatusText(HttpStatus.CONFLICT));
                return;
            }

            console.error(err);

            if (!res.headersSent) {
                res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                res.statusMessage = HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR);
                res.setHeader('Connection', 'close');
            }

            fs.unlink(filePath, (err) => {
                res.end();
            });
        })
        .on('close', () => {
            res.end(HttpStatus.getStatusText(HttpStatus.OK));
        });
}

module.exports = receiveFile;
