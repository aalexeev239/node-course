'use strict';

// core
const fs = require('fs');
const path = require('path');
// deps
const HttpStatus = require('http-status-codes');
// custom
const {FILE_ROOT, LIMIT_FILE_SIZE} = require('./config');
const ErrorCode = require('./utils/ErrorCode');

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

    const filePath = path.join(FILE_ROOT, pathname);

    console.log('--- filepath', filePath);

    fs.open(filePath, 'wx', (err, fd) => {
        if (err) {
            if (err.code === ErrorCode.EEXIST) {
                res.statusCode = HttpStatus.CONFLICT;
                res.end(HttpStatus.getStatusText(HttpStatus.CONFLICT));
                console.error(`${pathname} already exists`);
                return;
            }

            throw err;
        }


        const fileStream = fs.createWriteStream(filePath);

        req.pipe(fileStream)
            .on('error', function (err) {
                res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                res.end(HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR));
                console.error(err);
                return;
            });

        let size = 0;
        let isSuccess = true;

        req
            .on('data', (chunk) => {
                size += chunk.length;

                if (size > LIMIT_FILE_SIZE) {
                    // [ВОПРОС] как правильно отписываться?
                    req.unpipe(fileStream);
                    isSuccess = false;
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                            res.end(HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR));
                            return;
                        }

                        res.statusCode = HttpStatus.REQUEST_TOO_LONG;
                        res.end(HttpStatus.getStatusText(HttpStatus.REQUEST_TOO_LONG));
                    });

                    return;
                }
            });

        req
            .on('end', () => {
                if (isSuccess) {
                    res.statusCode = HttpStatus.OK;
                    res.end(HttpStatus.getStatusText(HttpStatus.OK));
                }
            });
    });
}

module.exports = handlePost;
