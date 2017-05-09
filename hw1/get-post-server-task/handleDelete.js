'use strict';

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

    const filePath = path.join(FILE_ROOT, pathname);
}

module.exports = handleDelete;
