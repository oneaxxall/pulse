import { Cli } from './cli';

let yargs = require('yargs')
    .usage('Usage: pds-pusher-server <command> [options]')
    .command('start', 'Untuk memulai server.', yargs => {
        return yargs.option('config', { describe: 'Path config json file. (optional)'});
    }, (argv) => Cli.start(argv))
    .demandCommand(1, 'Command tidak valid.')
    .help('help')
    .alias('help', 'h');

yargs.$0 = '';

let argv = yargs.argv;
