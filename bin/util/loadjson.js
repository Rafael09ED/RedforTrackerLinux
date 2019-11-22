import fs from 'fs';

export default function loadjson(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) 
                reject(err);
            else
                resolve(JSON.parse(data));
        })
    });
}