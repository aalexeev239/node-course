'use strict';

const path = require('path');

/**
 * @param {string} fileRoot корневой путь
 * @param {string} pathname путь к файлу
 * @return {string|null} полный путь
 */
function getFilePath(fileRoot, pathname) {
    const filePath = path.join(fileRoot, pathname);

    if (filePath.indexOf(fileRoot) !== 0) {
        return null;
    }

    return filePath;
}

module.exports = getFilePath;
