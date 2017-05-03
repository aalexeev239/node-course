function sendFile(file, res) {
    file.pipe(res);

    file.on('error', function (err) {
        res.statusCode = 500;
        res.end("Server Error");
        console.error(err);
    });

    file
        .on('data', (chunk) => {
            console.log('--- chunk', chunk.length);
        })
        .on('open', () => {
            console.log("open");
        })
        .on('close', () => {
            console.log("close");
        });

    res.on('close', () => {
        file.destroy();
    });
}

module.exports = sendFile;
