#!/usr/bin/env node

require('dotenv').config();
const program = require('commander');
const { setup } = require('./src/setup');
const { dev } = require('./src/dev');
const { occEnv } = require('./src/occEnv');
const { dcu } = require('./src/dcu');
const { ccw } = require('./src/ccw');

const main = require('./main');
const path = require('path');
const fs = require('fs');
const utility = require('./utility');

// Occ DCU

program
  .version(require('./package.json').version)
  .description('An application to help you with your daily OCC development.')
  .option('-s, --start', 'start the environment setup')
  .option('-d, --dev', 'start watcher + Browsersync')
  .option('-c, --create <type>', 'create widget or element [widget|element]')
  .option('-r, --refresh <path>', 'refresh path')
  .option('-p, --putAll <path>', 'upload the entire path')
  .option('-t, --put <file>', 'upload the entire path')
  .option('-e, --env <operation>', 'start the environment manager [change|config|current]')
  .option('-s, --transfer <path>', 'transfer widgets between current and target environment')
  .option('-g, --grab', 'start grab on the current environment.')
  .parse(process.argv);

if (program.start) {
  setup.start();
} else {
  if (occEnv.validate()) {
    if (program.dev) {
      dev.start();
    }
    
    if(program.grab) {
      dcu.grab();
    }

    if(program.put) {
      dcu.put(program.put);
    }
    
    if (program.refresh) {
      dcu.refresh(program.refresh);
    }
    
    if (program.putAll) {
      dcu.putAll(program.putAll);
    }
    
    if (program.transfer) {
      dcu.transfer(program.transfer);
    }
    
    if (program.create) {
      switch (program.create) {
        case 'widget':
          ccw.createWidget();
          break;
        case 'element':
          ccw.createElement();
          break;
      }
    }
    
    if (program.env) {
      switch (program.env) {
        case 'config':
          occEnv.config();
          break;
        case 'change':
          occEnv.change();
          break;
        case 'current':
          const {
            env, url, appKey
          } = occEnv.get();
          console.log(`Environment: ${env}\nURL: ${url}\nKEY: ${appKey}`);
          break;
      }
    }
  } else {
    console.log('You need to start the project first, run occ -s to start project');
  }
}

// Validate OCC Widgets
let myArgs = process.argv.slice(2);

let config = {};
config.parenthesis = false;
config.comments = false;
config.warnings = false;
config.grepFindings = false;

const directoryPath = myArgs[1] ? myArgs[1] : path.join(__dirname, "test");

myArgs.forEach(argument => {

	if (argument === "validate") {
		config.parenthesis = true;
		config.comments = true;
		config.grepFindings = true;
	}
	if (argument === "validateDataBinds") {
		config.parenthesis = true;
	}
	if (argument === "validateKOControlFlow") {
		config.comments = true;
	}
	if (argument === "logWarnings") {
		config.warnings = true;
	}
	if (argument === "grepAllJs") {
		config.grepFindings = true;
	}
	if (argument === "help") {
		printHelpText();
		process.exit(0);
	}

});

function printHelpText() {
	console.log("npm run-script <task> <arguments> ");
	console.log("--------------------------------------------------------------------------------------");
	console.log("Options:");
	console.log("--------------------------------------------------------------------------------------");
	console.log("task\t\t\t\tvalidate | validateDataBinds | validateKOControlFlow | grepAllJs | help");
	console.log("\tvalidate\t\t\tScans recursively through given directory path for templates with file pattern *.template / template.txt and lists all breakages templates issues and usage of deprecated API");
	console.log("\tvalidateDataBinds\t\tScans through all template files and list down all errors with unbalanced parenthesis.");
	console.log("\tvalidateKOControlFlow\t\tScans through all template files and list down all errors with unmatched <ko> tags");
	console.log("\tgrepAllJs\t\t\tScans through all JS files and list down all matches of search strings / API as specified in config.json");
	console.log("\thelp\t\t\t\tPrints the syntax / usage of script and available tasks");
	console.log("arguments\t\t\t<directory path> | logWarnings");
	console.log("\t<directory path>\t\tParent directory path which contains all widgets, global elements.");
	console.log("\tlogWarnings\t\t\tLogs any warning during directory scan");
	console.log("--------------------------------------------------------------------------------------");

}

const scanDirectoryAndValidate = (dirPath) => {
	fs.readdirSync(dirPath).forEach(function (file) {
		let fName = path.join(dirPath, file);
		config.fileName = fName;
		if (fs.statSync(fName).isDirectory()) {
			scanDirectoryAndValidate(fName);
		} else {
			if (file.includes('.template') || file.includes('template.txt')) {
				main.validate(fs.readFileSync(fName, 'utf8'), config);
			} else if (file.endsWith('.js')) {
				if (config.grepFindings)
					main.grepJS(fs.readFileSync(fName, 'utf8'), config);
			}
		}
	});
};

scanDirectoryAndValidate(directoryPath);

console.log("     --------------------------------   ");
console.log("                    SUMMARY             ");
console.log("     --------------------------------   ");
if (config.parenthesis)
	console.log("      Total data-bind errors : " + utility.parenthesisCount);
if (config.comments)
	console.log("  Total KOControlFlow errors : " + utility.commentsCount);
if (config.warnings)
	console.log("                    Warnings : " + utility.warningsCount);
if (config.grepFindings)
	console.log("       Deprecated API usages : " + utility.grepCount);
console.log('\n---------------------------------------------------------\n');