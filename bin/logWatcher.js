import settings from '../config/settings.json';
import fs from 'fs';
import loadjson from "../bin/util/loadjson";
import chokidar from 'chokidar';
const { resolve } = require("path")
const { spawn } = require('child_process');
const colors = require('colors/safe');


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
                console.log(colors.blue(`Match from file ${resolve(config.path)}:`));
            process.stdout.write(output);
        }
    });
    cmd.stderr.on("data", (data) => {
        process.stderr.write(colors.red(data));
    });
    cmd.on("close", (code) => {
        console.error(colors.yellow(`watch for file ${resolve(config.path)} closed all io with ${code}`));
    });
    cmd.on("exit", (code) => {
        console.error(colors.yellow(`watch for file ${resolve(config.path)} exited with code ${code}`));
    });

 
    watchers.push(process_config);
}

function start(){
    console.log("Starting Log Watcher....");

    const log_path = settings.watchers.logs_path
    fs.readdir(log_path, function (err, files) {
        if (err) throw err;
        files.forEach(file => {
            loadjson(log_path + file)
                .then(config => {
                    if (config.disabled) return;
                    console.log("loading " + log_path + file);
                    config.files.forEach(watch_file)
                })
        })
    });
}


export default start