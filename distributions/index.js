'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _diff = require('diff');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _duplexer = require('duplexer');

var _duplexer2 = _interopRequireDefault(_duplexer);

var _figures = require('figures');

var _figures2 = _interopRequireDefault(_figures);

var _through2 = require('through2');

var _through22 = _interopRequireDefault(_through2);

var _tapParser = require('tap-parser');

var _tapParser2 = _interopRequireDefault(_tapParser);

var _prettyMs = require('pretty-ms');

var _prettyMs2 = _interopRequireDefault(_prettyMs);

var _jsondiffpatch = require('jsondiffpatch');

var _jsondiffpatch2 = _interopRequireDefault(_jsondiffpatch);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var createReporter = function createReporter(options_file) {
  var output = (0, _through22['default'])();
  var p = (0, _tapParser2['default'])();
  var stream = (0, _duplexer2['default'])(p, output);
  var startedAt = Date.now();
  var defaults = {
    indent: '  ',
    diff_length: 7,
    success_emoji: '🤟 ',
    failure_emoji: '💀 ',
    success_color: _chalk2['default'].blue,
    failure_color: _chalk2['default'].red,
    bright_color: _chalk2['default'].white,
    dim_color: _chalk2['default'].dim,
    title_color: _chalk2['default'].black.bold,
    bold_color: _chalk2['default'].black.bold,
    attention_color: _chalk2['default'].gray
  };

  console.log(_util2['default'].inspect(options_file, { colors: true }));
  console.log(_util2['default'].inspect(defaults, { colors: true }));

  var process_options_file = function process_options_file(options_file) {
    // get json options from file
    // update default options with json options
    // try setting colors catch and set default
  };

  var println = function println() {
    var input = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var indentLevel = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

    var indent = '';

    for (var i = 0; i < indentLevel; ++i) {
      indent += defaults.indent;
    }

    input.split('\n').forEach(function (line) {
      output.push('' + indent + line);
      output.push('\n');
    });
  };

  var handleTest = function handleTest(name) {
    println();
    println(defaults.title_color(name), 1);
  };

  var handleAssertSuccess = function handleAssertSuccess(assert) {
    var name = assert.name;

    println(defaults.success_color(defaults.success_emoji) + '  ' + defaults.success_color(name), 2);
  };

  var toString = function toString(arg) {
    return Object.prototype.toString.call(arg).slice(8, -1).toLowerCase();
  };

  var JSONize = function JSONize(str) {
    return str
    // wrap keys without quote with valid double quote
    .replace(/([\$\w]+)\s*:/g, function (_, $1) {
      return '"' + $1 + '":';
    })
    // replacing single quote wrapped ones to double quote
    .replace(/'([^']+)'/g, function (_, $1) {
      return '"' + $1 + '"';
    });
  };

  var handleAssertFailure = function handleAssertFailure(assert) {
    var name = assert.name;

    var writeDiff = function writeDiff(_ref) {
      var value = _ref.value;
      var added = _ref.added;
      var removed = _ref.removed;

      var style = defaults.bright_color;
      if (added) style = defaults.success_color.inverse;
      if (removed) style = defaults.failure_color.inverse;
      return value.replace(/(^\s*)(.*)/g, function (m, one, two) {
        return one + style(two);
      });
    };

    var _assert$diag = assert.diag;
    var at = _assert$diag.at;
    var actual = _assert$diag.actual;
    var expected = _assert$diag.expected;

    var expected_type = toString(expected);

    if (expected_type !== 'array') {
      try {
        // the assert event only returns strings which is broken so this
        // handles converting strings into objects
        if (expected.indexOf('{') > -1) {
          actual = JSON.stringify(JSON.parse(JSONize(actual)), null, 2);
          expected = JSON.stringify(JSON.parse(JSONize(expected)), null, 2);
        }
      } catch (e) {
        try {
          actual = JSON.stringify(eval('(' + actual + ')'), null, 2);
          expected = JSON.stringify(eval('(' + expected + ')'), null, 2);
        } catch (e) {
          // do nothing because it wasn't a valid json object
        }
      }

      expected_type = toString(expected);
    }

    println(defaults.failure_color(defaults.failure_emoji) + '  ' + defaults.failure_color(name) + ' at ' + _chalk2['default'].black(at), 2);

    if (expected_type === 'object') {
      var delta = _jsondiffpatch2['default'].diff(actual[failed_test_number], expected[failed_test_number]);
      var _output = _jsondiffpatch2['default'].formatters.console.format(delta);
      println(_output, 4);
    } else if (expected_type === 'array') {
      var compared = (0, _diff.diffJson)(actual, expected).map(writeDiff).join('');

      println(compared, 4);
    } else if (expected === 'undefined' && actual === 'undefined') {
      ;
    } else if (expected_type === 'string') {
      var compared = (0, _diff.diffWordsWithSpace)(actual, expected).map(writeDiff).join('');

      if (actual.length > defaults.diff_length) println(actual, 4);
      println(compared, 4);
      if (expected.length > defaults.diff_length) println(expected, 4);
    } else {
      println(defaults.failure_color.inverse(actual) + defaults.success_color.inverse(expected), 4);
    }
  };

  var handleComplete = function handleComplete(result) {
    var finishedAt = Date.now();

    println();
    println(defaults.success_color(defaults.success_emoji + ' passed: ' + result.pass + '  ') + defaults.failure_color(defaults.failure_emoji + ' failed: ' + (result.fail || 0) + '  ') + defaults.bold_color('of ' + result.count + ' tests  ') + defaults.dim_color('(' + (0, _prettyMs2['default'])(finishedAt - startedAt) + ')'));
    println();

    if (result.ok) {
      println(defaults.success_color(defaults.success_emoji + ' All of ' + result.count + ' tests passed!'));
    } else {
      println(defaults.failure_color(defaults.failure_emoji + ' ' + (result.fail || 0) + ' of ' + result.count + ' tests failed.'));
      stream.isFailed = true;
    }

    println();
  };

  p.on('comment', function (comment) {
    var trimmed = comment.replace('# ', '').trim();

    if (/^tests\s+[0-9]+$/.test(trimmed)) return;
    if (/^pass\s+[0-9]+$/.test(trimmed)) return;
    if (/^fail\s+[0-9]+$/.test(trimmed)) return;
    if (/^ok$/.test(trimmed)) return;

    handleTest(trimmed);
  });

  p.on('assert', function (assert) {
    if (assert.ok) return handleAssertSuccess(assert);

    return handleAssertFailure(assert);
  });

  p.on('complete', handleComplete);

  p.on('child', function (child) {
    ;
  });

  p.on('extra', function (extra) {
    println(defaults.attention_color(('' + extra).replace(/\n$/, '')), 4);
  });

  return stream;
};

exports['default'] = createReporter;
module.exports = exports['default'];