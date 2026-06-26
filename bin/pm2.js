#! /usr/bin/env node

const { Cli } = require('./../dist/cli/cli');

process.title = 'pds-pusher-server';

Cli.startWithPm2();
