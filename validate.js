const main = require('./main');
const path = require('path');
const fs = require('fs');
const utility = require('./utility');

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