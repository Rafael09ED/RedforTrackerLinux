import settings from '../config/settings.json';
import fs from 'fs';
import loadjson from "../bin/util/loadjson";
import chokidar from 'chokidar';
const { resolve } = require("path")
const { spawn } = require('child_process');
const colors = require('colors/safe');


var watchers = [];

function evalute_regex(patterns){
    if (!patterns) return null;
    return patterns.map(regex_string => new RegExp(regex_string));
}

function evaluate_log_output(data, regex_list){
    if (regex_list == null) return data;
    for (let regex of regex_list){
        if (regex.exec(data)) return data;
    }
    return null;
}

function initialize_tail(absolute_path, config){
    var cmd;
    try {
        cmd = spawn("tail", ["-n0", "-f", absolute_path]);
    } catch (ex) {
        console.warn(absolute_path + " could not be watched");
        return;
    }
    
    const regex_list = evalute_regex(config.patterns);

    cmd.stdout.on("data", (data) => {
        const output = evaluate_log_output(data, regex_list);
        if (output) {
            if (config.print_header)
                console.log(colors.blue(`Match from file ${absolute_path}:`));
            process.stdout.write(output);
        }
    });
    cmd.stderr.on("data", (data) => {
        process.stderr.write(data);
    });
    cmd.on("close", (code) => {
        console.error(colors.yellow(`watch for file ${absolute_path} closed all io with ${code}`));
    });
    cmd.on("exit", (code) => {
        console.error(colors.yellow(`watch for file ${absolute_path} exited with code ${code}`));
    }); 

    return cmd;
}

function watch_file(config){
    const index = watchers.length;
    const path = resolve(config.path);

    const watcher = chokidar.watch(path, {
        persistent: true,
        ignoreInitial: true
    });
    watcher
        .on('add', path => {
            console.log(colors.yellow(`File ${path} was created!`));
            watchers[index].process.kill(2);
            watchers[index].process = initialize_tail(path, config);
        })
        .on('unlink', path => console.log(colors.red(`File ${path} was deleted!`)));

    var process_config = {
        "path": path,
        "process": initialize_tail(path, config),
        "watcher": watcher,
        "config": config,
    };

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
                    process.stdout.write("loading " + log_path + file + " ...   ");
                    config.files.forEach(watch_file);
                    console.log("done");
                })
        })
    });
}


export default start