const HttpStatus = require('http-status-codes');
const {LIMIT_FILE_SIZE} = require('../config');

function sendFile(fileStream, res) {
    fileStream.pipe(res);

    fileStream.on('error', function (err) {
        res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        res.end(HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR));
        console.error(err);
        return;
    });

    let size = 0;

    fileStream
        .on('data', (chunk) => {
            size += chunk.length;
            if (size > LIMIT_FILE_SIZE) {
                fileStream.destroy();
                // [ВОПРОС]: прекрасно, а дальше что?
            }
        });

    res
        .on('close', () => {
            fileStream.destroy();
        });
}

module.exports = sendFile;
