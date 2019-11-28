import settings from '../config/settings.json';
import moment from 'moment';
import fs from 'fs';


var write = process.stdout.write;
var error = process.stderr.write;

var setPath = null;

function getNowPath() {
    return settings.logging.master.prefex + moment().format("YYYY-mm-dd_HH-MM-SS");
}

function getDefaultPath() {
    if (!setPath) 
        setPath = getNowPath();
    return setPath;
}

function logConsoleToFile(path=getDefaultPath()){
    process.stdout.write = function(...args){
        fs.appendFile(settings.logs.path + getDefaultPath(), args[0], (error) => {});
        write.apply(process.stdout, args);
    }
    process.stderr.write = function(...args){
        fs.appendFile(settings.logs.path + getDefaultPath(), args[0], (error) => {});
        write.apply(process.stderr, args);
    }
}

export default logConsoleToFile;
export { getDefaultPath }