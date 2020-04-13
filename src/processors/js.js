global.fs = require('fs');
global.path = require('path');

const transpiler = require('transpiler');

function pre(text, filename) {
  return [{text: transpiler.transpileScript(text).transpiled, filename: filename}];
}

function post(messages, filename) {
  messages = messages[0].map(function (message) {
    if (message.line == 1) message.column -= 7;

    /*message.source = message.source;
    message.message = message.message;*/

    return message;
  }).filter(function (msg, i, msgs) {
    if (msg.ruleId == 'no-unreachable' && msgs.some(function (m) {
      return m.ruleId == 'emumud/no-closure-siblings' && m.line == msg.line;
    })) return false;

    if (msg.ruleId == 'no-undef' && msgs.some(function (m) {
      return m.ruleId == 'emumud/validate-subscript-syntax' && m.line == msg.line;
    })) return false;

    return true;
  }).sort(function (a, b) {
    return a.severity == b.severity ? 0 : a.severity > b.severity ? -1 : 1;
  });

  return messages;
}

exports.default = {
  preprocess: pre,
  postprocess: post
};

module.exports = exports['default'];
