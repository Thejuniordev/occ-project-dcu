let parenthesisCount = 0;
let commentsCount = 0;
let warningsCount = 0;
let grepCount = 0;

const log = (fileName, message) => {
  console.log("File : " + fileName.replace(__dirname, ""));
  console.log(message);
  console.log('\n---------------------------------------------------------\n');
}

module.exports = {
  parenthesisCount: parenthesisCount,
  commentsCount: commentsCount,
  warningsCount: warningsCount,
  grepCount: grepCount,
  log: log
}