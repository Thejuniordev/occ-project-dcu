const utility = require('./utility');
const ko = require('knockout/build/output/knockout-latest.debug.js');
var specials = ',"\'`{}()/:[\\]'; // These characters have special meaning to the parser and must not appear in the middle of a token, except as part of a string.
// Create the actual regular expression by or-ing the following regex strings. The order is important.
var bindingToken = RegExp([
  // These match strings, either with double quotes, single quotes, or backticks
  '"(?:\\\\.|[^"])*"',
  "'(?:\\\\.|[^'])*'",
  "`(?:\\\\.|[^`])*`",
  // Match C style comments
  "/\\*(?:[^*]|\\*+[^*/])*\\*+/",
  // Match C++ style comments
  "//.*\n",
  // Match a regular expression (text enclosed by slashes), but will also match sets of divisions
  // as a regular expression (this is handled by the parsing loop below).
  '/(?:\\\\.|[^/])+/\w*',
  // Match text (at least two characters) that does not contain any of the above special characters,
  // although some of the special characters are allowed to start it (all but the colon and comma).
  // The text can contain spaces, but leading or trailing spaces are skipped.
  '[^\\s:,/][^' + specials + ']*[^\\s' + specials + ']',
  // Match any non-space character not matched already. This will match colons and commas, since they're
  // not matched by "everyThingElse", but will also match any other single character that wasn't already
  // matched (for example: in "a: 1, b: 2", each of the non-space characters will be matched by oneNotSpace).
  '[^\\s]'
].join('|'), 'g');

// Match end of previous token to determine whether a slash is a division or regex.
var divisionLookBehind = /[\])"'A-Za-z0-9_$]+$/;
var keywordRegexLookBehind = {
  'in': 1,
  'return': 1,
  'typeof': 1
};
var commentNodesHaveTextProperty = false;
var matchedEndCommentDataKey = "__ko_matchedEndComment__"
var startCommentRegex = commentNodesHaveTextProperty ? /^<!--\s*ko(?:\s+([\s\S]+))?\s*-->$/ : /^\s*ko(?:\s+([\s\S]+))?\s*$/;
var endCommentRegex = commentNodesHaveTextProperty ? /^<!--\s*\/ko\s*-->$/ : /^\s*\/ko\s*$/;
var htmlTagsWithOptionallyClosingChildren = {
  'ul': true,
  'ol': true
};

function parseObjectLiteral(objectLiteralString) {
  // Trim leading and trailing spaces from the string
  var str = stringTrim(objectLiteralString);

  // Trim braces '{' surrounding the whole object literal
  if (str.charCodeAt(0) === 123) str = str.slice(1, -1);

  // Add a newline to correctly match a C++ style comment at the end of the string and
  // add a comma so that we don't need a separate code block to deal with the last item
  str += "\n,";

  // Split into tokens
  var result = [],
    toks = str.match(bindingToken),
    key, values = [],
    depth = 0;

  if (toks.length > 1) {
    for (var i = 0, tok; tok = toks[i]; ++i) {
      var c = tok.charCodeAt(0);
      // A comma signals the end of a key/value pair if depth is zero
      if (c === 44) { // ","
        if (depth <= 0) {
          result.push((key && values.length) ? {
            key: key,
            value: values.join('')
          } : {
              'unknown': key || values.join('')
            });
          key = depth = 0;
          values = [];
          continue;
        }
        // Simply skip the colon that separates the name and value
      } else if (c === 58) { // ":"
        if (!depth && !key && values.length === 1) {
          key = values.pop();
          continue;
        }
        // Comments: skip them
      } else if (c === 47 && tok.length > 1 && (tok.charCodeAt(1) === 47 || tok.charCodeAt(1) === 42)) { // "//" or "/*"
        continue;
        // A set of slashes is initially matched as a regular expression, but could be division
      } else if (c === 47 && i && tok.length > 1) { // "/"
        // Look at the end of the previous token to determine if the slash is actually division
        var match = toks[i - 1].match(divisionLookBehind);
        if (match && !keywordRegexLookBehind[match[0]]) {
          // The slash is actually a division punctuator; re-parse the remainder of the string (not including the slash)
          str = str.substr(str.indexOf(tok) + 1);
          toks = str.match(bindingToken);
          i = -1;
          // Continue with just the slash
          tok = '/';
        }
        // Increment depth for parentheses, braces, and brackets so that interior commas are ignored
      } else if (c === 40 || c === 123 || c === 91) { // '(', '{', '['
        ++depth;
      } else if (c === 41 || c === 125 || c === 93) { // ')', '}', ']'
        --depth;
        // The key will be the first token; if it's a string, trim the quotes
      } else if (!key && !values.length && (c === 34 || c === 39)) { // '"', "'"
        tok = tok.slice(1, -1);
      }
      values.push(tok);
    }
    if (depth > 0) {
      throw Error("Unbalanced parentheses, braces, or brackets");
    }
  }
  return result;
}

// The following element types will not be recursed into during binding.
var bindingDoesNotRecurseIntoElementTypes = {
  // Don't want bindings that operate on text nodes to mutate <script> and <textarea> contents,
  // because it's unexpected and a potential XSS issue.
  // Also bindings should not operate on <template> elements since this breaks in Internet Explorer
  // and because such elements' contents are always intended to be bound in a different context
  // from where they appear in the document.
  'script': true,
  'textarea': true,
  'template': true
};

function applyBindingsToNodeAndDescendantsInternal(nodeVerified, fName) {

  var isElement = (nodeVerified.nodeType);
  if (isElement) // Workaround IE <= 8 HTML parsing weirdness
    normaliseVirtualElementDomStructure(nodeVerified);
  // Perf optimisation: Apply bindings only if...
  // (1) We need to store the binding info for the node (all element nodes)
  // (2) It might have bindings (e.g., it has a data-bind attribute, or it's a marker for a containerless template)
  //var shouldApplyBindings = isElement || ko.bindingProvider['instance']['nodeHasBindings'](nodeVerified);
  //if (isElement)
  //    bindingContextForDescendants = applyBindingsToNodeInternal(nodeVerified, null)['bindingContextForDescendants'];
  if (!bindingDoesNotRecurseIntoElementTypes[tagNameLower(nodeVerified)]) {
    applyBindingsToDescendantsInternal(nodeVerified, fName);
  }
}

function applyBindingsToDescendantsInternal(elementOrVirtualElement, fName) {
  var nextInQueue = firstChild(elementOrVirtualElement);

  if (nextInQueue) {
    var currentChild;

    // Preprocessing allows a binding provider to mutate a node before bindings are applied to it. For example it's
    // possible to insert new siblings after it, and/or replace the node with a different one. This can be used to
    // implement custom binding syntaxes, such as {{ value }} for string interpolation, or custom element types that
    // trigger insertion of <template> contents at that point in the document.
    try {
      while (currentChild = nextInQueue) {
        nextInQueue = nextSibling(currentChild);
      }
      // Reset nextInQueue for the next loop
      nextInQueue = firstChild(elementOrVirtualElement);

      while (currentChild = nextInQueue) {
        // Keep a record of the next child *before* applying bindings, in case the binding removes the current child from its position
        nextInQueue = nextSibling(currentChild);
        applyBindingsToNodeAndDescendantsInternal(currentChild, fName);
      }
    } catch (e) {
      utility.commentsCount++;
      utility.log(fName, e.message);
    }
  }
}

function normaliseVirtualElementDomStructure(elementVerified) {
  // Workaround for https://github.com/SteveSanderson/knockout/issues/155
  // (IE <= 8 or IE 9 quirks mode parses your HTML weirdly, treating closing </li> tags as if they don't exist, thereby moving comment nodes
  // that are direct descendants of <ul> into the preceding <li>)
  if (!htmlTagsWithOptionallyClosingChildren[tagNameLower(elementVerified)])
    return;

  // Scan immediate children to see if they contain unbalanced comment tags. If they do, those comment tags
  // must be intended to appear *after* that child, so move them there.
  var childNode = elementVerified.firstChild;
  if (childNode) {
    do {
      if (childNode.nodeType === 1) {
        var unbalancedTags = getUnbalancedChildTags(childNode);
        if (unbalancedTags) {
          // Fix up the DOM by moving the unbalanced tags to where they most likely were intended to be placed - *after* the child
          var nodeToInsertBefore = childNode.nextSibling;
          for (var i = 0; i < unbalancedTags.length; i++) {
            if (nodeToInsertBefore)
              elementVerified.insertBefore(unbalancedTags[i], nodeToInsertBefore);
            else
              elementVerified.appendChild(unbalancedTags[i]);
          }
        }
      }
    } while (childNode = childNode.nextSibling);
  }
}

function tagNameLower(element) {
  // For HTML elements, tagName will always be upper case; for XHTML elements, it'll be lower case.
  // Possible future optimization: If we know it's an element from an XHTML document (not HTML),
  // we don't need to do the .toLowerCase() as it will always be lower case anyway.
  return element && element.tagName && element.tagName.toLowerCase();
}

function firstChild(node) {
  if (!isStartComment(node)) {
    if (node.firstChild && isEndComment(node.firstChild)) {
      if (global.scriptId === null) {
        throw new Error("Error : Found invalid end comment, as the first child of element at Line: " + global.dom.nodeLocation(node).startLine + " Column: " + global.dom.nodeLocation(node).startCol);
      } else {
        throw new Error("Error : Found invalid end comment, as the first child of element in the script tag with id: " + global.scriptId);
      }
    }
    return node.firstChild;
  } else if (!node.nextSibling || isEndComment(node.nextSibling)) {
    return null;
  } else {
    return node.nextSibling;
  }
}

function isStartComment(node) {
  return (node.nodeType == 8) && startCommentRegex.test(commentNodesHaveTextProperty ? node.text : node.nodeValue);
}

function nextSibling(node) {
  if (isStartComment(node)) {
    node = getMatchingEndComment(node);
  }

  if (node.nextSibling && isEndComment(node.nextSibling)) {
    if (isUnmatchedEndComment(node.nextSibling)) {
      if (global.scriptId === null) {
        throw Error("Error : Found end comment without a matching opening comment at Line: " + global.dom.nodeLocation(node).startLine + " Column: " + global.dom.nodeLocation(node).startCol);
      } else {
        throw Error("Error : Found end comment without a matching opening comment for an element in the script tag with id: " + global.scriptId);
      }
    } else {
      return null;
    }
  } else {
    return node.nextSibling;
  }
}

function getUnbalancedChildTags(node) {
  // e.g., from <div>OK</div><!-- ko blah --><span>Another</span>, returns: <!-- ko blah --><span>Another</span>
  //       from <div>OK</div><!-- /ko --><!-- /ko -->,             returns: <!-- /ko --><!-- /ko -->
  var childNode = node.firstChild,
    captureRemaining = null;
  if (childNode) {
    do {
      if (captureRemaining) // We already hit an unbalanced node and are now just scooping up all subsequent nodes
        captureRemaining.push(childNode);
      else if (isStartComment(childNode)) {
        var matchingEndComment = getMatchingEndComment(childNode, /* allowUnbalanced: */ true);
        if (matchingEndComment) // It's a balanced tag, so skip immediately to the end of this virtual set
          childNode = matchingEndComment;
        else
          captureRemaining = [childNode]; // It's unbalanced, so start capturing from this point
      } else if (isEndComment(childNode)) {
        captureRemaining = [childNode]; // It's unbalanced (if it wasn't, we'd have skipped over it already), so start capturing
      }
    } while (childNode = childNode.nextSibling);
  }
  return captureRemaining;
}

function isEndComment(node) {
  return (node.nodeType == 8) && endCommentRegex.test(commentNodesHaveTextProperty ? node.text : node.nodeValue);
}

function getMatchingEndComment(startComment, allowUnbalanced) {
  var allVirtualChildren = getVirtualChildren(startComment, allowUnbalanced);
  if (allVirtualChildren) {
    if (allVirtualChildren.length > 0)
      return allVirtualChildren[allVirtualChildren.length - 1].nextSibling;
    return startComment.nextSibling;
  } else
    return null; // Must have no matching end comment, and allowUnbalanced is true
}

function getVirtualChildren(startComment, allowUnbalanced) {
  var currentNode = startComment;
  var depth = 1;
  var children = [];
  while (currentNode = currentNode.nextSibling) {
    if (isEndComment(currentNode)) {
      ko.utils.domData.set(currentNode, matchedEndCommentDataKey, true);
      depth--;
      if (depth === 0)
        return children;
    }

    children.push(currentNode);

    if (isStartComment(currentNode))
      depth++;
  }
  if (!allowUnbalanced) {
    if (global.scriptId === null) {
      throw new Error("Error : Cannot find closing comment tag to match the comment at Line: " + global.dom.nodeLocation(startComment).startLine + " Column: " + global.dom.nodeLocation(startComment).startCol /*+ startComment.nodeValue*/);
    } else {
      throw new Error("Error : Cannot find closing comment tag to match the comment for an element in the script tag with id: " + global.scriptId);
    }
  }
  return null;
}

function isUnmatchedEndComment(node) {
  return isEndComment(node) && !(ko.utils.domData.get(node, matchedEndCommentDataKey));
}

function stringTrim(string) {
  return string === null || string === undefined ? '' :
    string.trim ?
      string.trim() :
      string.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
}

module.exports = {
  parseObjectLiteral: parseObjectLiteral,
  applyBindingsToNodeAndDescendantsInternal: applyBindingsToNodeAndDescendantsInternal
}
