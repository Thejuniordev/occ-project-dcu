const helper = require('./helper');
const utility = require('./utility');
const config = require('./config');
const JSDOM = require('jsdom').JSDOM;

let grepStrings = config.grepStrings || [];

const validate = (template, config) => {

  if (validateEmptyString(template)) {
    if (config.warnings) {
      utility.warningsCount++;
      utility.log(config.fileName, "Warning : Empty template!");
    }
    return;
  }
  var dom = new JSDOM("<body>" + template + "</body>", { includeNodeLocations: true });
  var htmlDoc = dom.window.document;
  checkForScriptTags(htmlDoc, config);
  global.dom = dom;

  if (config.parenthesis) {
    let result = checkForDataBindErrors(htmlDoc);
    if (result) {
      utility.log(config.fileName, result);
    }
  }
  if (config.comments) {
    validateForClosingComments(htmlDoc, config.fileName);
  }

}

const grepJS = (template, config) => {
  grepStrings.forEach(grepString => {
    if (template.includes(grepString)) {
      utility.grepCount++;
      utility.log(config.fileName, "Usage of " + grepString + " found. Please refer to the documentation for more deatils.");
    }
  });
}

const validateEmptyString = (template) => {
  return template === "";
}

const validateForClosingComments = (htmlDoc, fName) => {
  helper.applyBindingsToNodeAndDescendantsInternal(htmlDoc.documentElement, fName);
}

const checkForScriptTags = (htmlDoc, config) => {
  var scriptTags = htmlDoc.getElementsByTagName('script');
  for (let i = 0; i < scriptTags.length; i++) {
    if (scriptTags[i].getAttribute('type') === "text/html") {
      global.scriptId = scriptTags[i].getAttribute('id');
      var scriptDom = new JSDOM("<body>" + scriptTags[i].text + "</body>", { includeNodeLocations: true });
      var scriptHtmlDoc = scriptDom.window.document;
      if (config.parenthesis) {
        let result = checkForDataBindErrors(scriptHtmlDoc);
        if (result) {
          utility.log(config.fileName, result);
        }
      }
      if (config.comments) {
        validateForClosingComments(scriptHtmlDoc, config.fileName);
      }
      global.scriptId = null;
    }
  }
}

const checkForDataBindErrors = (input) => {
  var result = "";
  var items = input.getElementsByTagName("*");
  for (var i = 0; i < items.length; i++) {
    if (items[i].hasAttribute("data-bind")) {
      try {
        helper.parseObjectLiteral(items[i].getAttribute("data-bind"));
      } catch (e) {
        utility.parenthesisCount++;
        if (!global.scriptId) {
          result += e + " at Line: " + global.dom.nodeLocation(items[i]).startLine + " Column: " + global.dom.nodeLocation(items[i]).startCol + '\n';
        } else {
          result += e + " for an element in the script tag with id: " + global.scriptId + '\n';
        }
      }
    }
  }
  return result;
}

module.exports = {
  validate: validate,
  grepJS: grepJS
}
