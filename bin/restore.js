const { spawn } = require('child_process');
const { resolve } = require("path");
const fs = require('fs');
const colors = require('colors/safe');
var readline = require('readline');
import settings from '../config/settings.json';


export default function load(){
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    rl.on('line', function (data) {
        const args = data.split(/\s+/);
        if (args.length > 1 && args[0] == "restore"){
            const tar_name = args[1];
            const path = resolve(settings.backup.path + tar_name);

            if (!fs.existsSync(path)) {
                console.log("archive does not exist!");
                return;
            }

            const cmd = spawn("tar", ["-C", "/", "-zxvf", path]);
            cmd.on("exit", (code) => {
                if (!code)
                    console.log(colors.green(`Archive ${tar_name} restored!`));
                else
                    console.error(colors.red(`Error restoring ${tar_name}`));
            }); 
        }
    });
}