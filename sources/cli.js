#!/usr/bin/env node

import createReporter from './index';

let option = process.argv.slice(2)
const reporter = createReporter(option);

process.stdin
  .pipe(reporter)
  .pipe(process.stdout);

process.on('exit', status => {
  if (status === 1 || reporter.isFailed) process.exit(1);
});
