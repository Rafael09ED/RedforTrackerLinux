import chokidar from 'chokidar';
import loadjson from "../bin/util/loadjson";
import settings from '../config/settings.json';
const { resolve } = require("path")
import fs from 'fs';
const colors = require('colors/safe');


var watchers = [];

function watch_dir(config){
    const index = watchers.length;
    var path = resolve(config.path);
    if (config.path.charAt(config.path.length - 1) == '/')
        path = path + '/';
        
    const watcher = chokidar.watch(path, {
        persistent: true,
        ignoreInitial: true
    });

    watcher
        .on('add', path => console.log(colors.yellow(`File ${path} was created!`)))
        .on('change', path => console.log(colors.yellow(`File ${path} was chanaged`)))
        .on('unlink', path => console.log(colors.red(`File ${path} was deleted!`))) 
        .on('addDir', path => console.log(colors.yellow(`Directory ${path} was created`)))
        .on('unlinkDir', path => console.log(colors.red(`Directory ${path} was deleted!`)));

    var process_config = {
        "path": path,
        "watcher": watcher,
        "config": config,
    };
    console.log("watching", path)
    watchers.push(process_config);
}


function start() {
    console.log("Starting Dir Watcher....");
    const dir_configs_path = settings.watchers.dir_watcher_path
    fs.readdir(dir_configs_path, function (err, files) {
        if (err) throw err;
        files.forEach(file => {
            loadjson(dir_configs_path + file)
                .then(config => {
                    if (config.disabled) return;
                    process.stdout.write("loading " + dir_configs_path + file + " ...   ");
                    config.dirs.forEach(watch_dir);
                    console.log("done");
                })
        })
    });
}

export default start;