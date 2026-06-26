const esbuild = require('esbuild');
const { copyFileSync, mkdirSync, existsSync } = require('fs');
const path = require('path');

async function build() {
    console.log('🚀 Starting Advanced Bundling with esbuild...');

    try {
        // 1. Ensure the bundle folder is clean
        if (existsSync('bundle')) {
            console.log('🧹 Cleaning up old bundle folder...');
            const files = require('fs').readdirSync('bundle');
            for (const file of files) {
                require('fs').rmSync(path.join('bundle', file), { recursive: true, force: true });
            }
        } else {
            mkdirSync('bundle');
        }

        // 2. Run esbuild
        await esbuild.build({
            entryPoints: ['src/cli/index.ts'],
            bundle: true,
            minify: true,
            keepNames: true,
            platform: 'node',
            target: 'node22',
            outfile: 'bundle/pulse-server-js',
            alias: {
                'uWebSockets.js': './src/lib/uws.js'
            },
            external: [
                './uws_linux_x64_127.node',
                // Optional knex drivers we don't use
                'sqlite3',
                'better-sqlite3',
                'tedious',
                'oracledb',
                'pg-native',
                'pg-query-stream',
                'mysql',
                // Optional pm2/blessed libraries that are not critical
                'term.js',
                'pty.js',
                'fsevents',
                'v8-profiler-next',
                'cpu-features',
                'pm2-deploy'
            ],
            // Handle dynamic require commonly found in older node libraries
            mainFields: ['module', 'main'],
            define: {
                'process.env.NODE_ENV': '"production"'
            },
            logLevel: 'info',
        });

        // 3. Copy required uWS binary
        console.log('📦 Copying uWebSockets.js binary...');
        copyFileSync(
            'node_modules/uWebSockets.js/uws_linux_x64_127.node',
            'bundle/uws_linux_x64_127.node'
        );
        
        // 4. Copy configuration files
        console.log('📄 Copying configuration files (.env)...');
        if (existsSync('.env.example')) {
            copyFileSync('.env.example', 'bundle/.env.example');
        }
        if (existsSync('.env')) {
            copyFileSync('.env', 'bundle/.env');
        }

        // 5. Copy configurations folder
        console.log('📂 Copying configurations folder...');
        if (!existsSync('bundle/configurations')) {
            mkdirSync('bundle/configurations');
        }
        if (existsSync('configurations/pds-pusher-manager.sql')) {
            copyFileSync('configurations/pds-pusher-manager.sql', 'bundle/configurations/pds-pusher-manager.sql');
        }
        if (existsSync('configurations/config.json')) {
            copyFileSync('configurations/config.json', 'bundle/configurations/config.json');
        }

        // 6. Copy docs folder
        console.log('📂 Copying docs folder...');
        if (!existsSync('bundle/docs')) {
            mkdirSync('bundle/docs');
        }
        if (existsSync('docs/PRODUCTION.md')) {
            copyFileSync('docs/PRODUCTION.md', 'bundle/docs/PRODUCTION.md');
        }
        if (existsSync('docs/HOW_TO_TEST.md')) {
            copyFileSync('docs/HOW_TO_TEST.md', 'bundle/docs/HOW_TO_TEST.md');
        }
        if (existsSync('docs/DATA_MEMORI.md')) {
            copyFileSync('docs/DATA_MEMORI.md', 'bundle/docs/DATA_MEMORI.md');
        }
        if (existsSync('docs/WEBHOOKS.md')) {
            copyFileSync('docs/WEBHOOKS.md', 'bundle/docs/WEBHOOKS.md');
        }

        // 7. Create runner script
        console.log('📜 Creating runner script (run-pulse-server.sh)...');
        const { writeFileSync, chmodSync } = require('fs');
        const runnerPath = path.join('bundle', 'run-pulse-server.sh');
        writeFileSync(runnerPath, '#!/usr/bin/env bash\nnode --no-deprecation pulse-server-js start\n');
        chmodSync(runnerPath, '755'); // Make it executable

        console.log('✨ Build successful! Check the /bundle folder');

    } catch (e) {
        console.error('❌ Build failed:', e);
        process.exit(1);
    }
}

build();
