'use strict';

/**
 * @param {string} FILE_ROOT корневой путь
 * @param {string} pathname путь к файлу
 * @return {string|null} полный путь
 */
function getFilePath(FILE_ROOT, pathname) {
    const filePath = path.join(FILE_ROOT, pathname);

    if (filePath.indexOf(FILE_ROOT) !== 0) {
        return null;
    }

    return filePath;
}

module.exports = getFilePath;
