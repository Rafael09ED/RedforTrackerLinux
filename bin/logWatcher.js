import settings from '../config/settings.json';
import fs from 'fs';
import loadjson from "../bin/util/loadjson";
import chokidar from 'chokidar';
import Tail from 'always-tail';

var watchers = [];

function watch_file(config){
    console.log(config)
    var tail = new Tail(config.path)
    tail.on("line", function(data) {
        console.log(data);
    });
    tail.on("error", function(error) {
        console.log('ERROR: ', error);
    });
    watchers.push({
        "tailer": tail,
        "config": config
    })
}

function start(){
    console.log("Starting Log Watcher....");

    const log_path = settings.watchers.logs_path
    fs.readdir(log_path, function (err, files) {
        if (err) throw err;
        files.forEach(file => {
            console.log(log_path + file);
            loadjson(log_path + file)
                .then(config => config.files)
                .then(configs_to_watch => {
                    configs_to_watch.forEach(watch_file)
                });
        })
    });
}

export default start