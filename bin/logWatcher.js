import settings from '../config/settings.json';
import fs from 'fs';
import loadjson from "../bin/util/loadjson";
import chokidar from 'chokidar';
const { resolve } = require("path")
const { spawn } = require('child_process');


var watchers = [];

function evalute_regex(config){
    if (!config.patterns) return null;
    return config.patterns.map(regex_string => new RegExp(regex_string));
}

function evaluate_log_output(data, config){
    if (config.regex == null) return data;
    for (let regex of config.regex){
        if (regex.exec(data)) return data;
    }
    return null;
}

function watch_file(config){
    var cmd
    try {
        cmd = spawn("tail", ["-n0", "-f", resolve(config.path)]);
    } catch (ex) {
        console.warn(config.path + " could not be watched");
        return;
    }
    var process_config = {
        "process": cmd,
        "config": config,
        "regex": evalute_regex(config)
    };
    cmd.stdout.on("data", (data) => {
        const output = evaluate_log_output(data, process_config);
        if (output) {
            if (config.print_header)
                console.log(`Match from file ${resolve(config.path)}:`);
            process.stdout.write(output);
        }
    });
    cmd.stderr.on("data", (data) => {
        process.stderr.write(data);
    });
    cmd.on("close", (code) => {
        console.error(`watch for file ${resolve(config.path)} closed all io with ${code}`);
    });
    cmd.on("exit", (code) => {
        console.error(`watch for file ${resolve(config.path)} exited with code ${code}`);
    });

 
    watchers.push(process_config);
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