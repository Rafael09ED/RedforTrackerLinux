import settings from './config/settings.json';
import moment from 'moment';

var cl = console.log
var setPath = null;

function getNowPath() {
    return settings.logging.master.prefex + moment().format("YYYY-mm-dd_HH-MM-SS")
}

function getDefaultPath() {
    if (!setPath) 
        setPath = getNowPath()
    return setPath;
}

function logConsoleToFile(path=getDefaultPath()){
    console.log = function(...args){
        
        cl.apply(console, args);
    }
}

export { logConsoleToFile, getDefaultPath }