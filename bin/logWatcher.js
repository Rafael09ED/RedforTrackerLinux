import settings from '../config/settings.json';
import fs from 'fs';
import loadjson from "../bin/util/loadjson";
import chokidar from 'chokidar';
const {resolve} = require("path")
const { spawn } = require('child_process');


var watchers = [];

function watch_file(config){
    var cmd
    try {
        cmd = spawn("tail", ["-n0", "-f", resolve(config.path)]);
    } catch (ex) {
        console.warn(config.path + " could not be watched");
        return;
    }
    cmd.stdout.on("data", function(data) {
        process.stdout.write(data);
    });
    cmd.stderr.on("data", function(data) {
        process.stderr.write(data);
    });
    cmd.on("close", function(code) {
        console.error(`watch for file ${resolve(config.path)} closed all io with ${code}`);
    });
    cmd.on("exit", function(code) {
        console.error(`watch for file ${resolve(config.path)} exited with code ${code}`);
    });
    watchers.push({
        "process": cmd,
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

function on_exit(){
    watchers.forEach(config => {
        config.process.kill("SIGINT");
    })
}

process.on('SIGINT',on_exit);
process.on('exit',on_exit);

export default start