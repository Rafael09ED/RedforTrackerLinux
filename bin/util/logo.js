var fs = require('fs');

function print() {
    fs.readFile('./bin/util/logo.txt', (err, data) => {
        if (err) throw err;
        process.stdout.write(data + "\n");
    });
}

export default print;