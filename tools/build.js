const esbuild = require('esbuild');
const { copyFileSync, mkdirSync, existsSync } = require('fs');
const path = require('path');

async function build() {
    console.log('🚀 Memulai Advanced Bundling dengan esbuild...');

    try {
        // 1. Pastikan folder bundle bersih
        if (existsSync('bundle')) {
            console.log('🧹 Membersihkan folder bundle lama...');
            const files = require('fs').readdirSync('bundle');
            for (const file of files) {
                require('fs').rmSync(path.join('bundle', file), { recursive: true, force: true });
            }
        } else {
            mkdirSync('bundle');
        }

        // 2. Jalankan esbuild
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
                // Library opsional knex yang tidak kita gunakan
                'sqlite3',
                'better-sqlite3',
                'tedious',
                'oracledb',
                'pg-native',
                'pg-query-stream',
                'mysql',
                // Library opsional pm2/blessed yang tidak krusial
                'term.js',
                'pty.js',
                'fsevents',
                'v8-profiler-next',
                'cpu-features',
                'pm2-deploy'
            ],
            // Mengatasi masalah dynamic require yang sering ada di library node lama
            mainFields: ['module', 'main'],
            define: {
                'process.env.NODE_ENV': '"production"'
            },
            logLevel: 'info',
        });

        // 3. Salin binary uWS yang dibutuhkan
        console.log('📦 Menyalin binary uWebSockets.js...');
        copyFileSync(
            'node_modules/uWebSockets.js/uws_linux_x64_127.node',
            'bundle/uws_linux_x64_127.node'
        );
        
        // 4. Salin file konfigurasi
        console.log('📄 Menyalin file konfigurasi (.env)...');
        if (existsSync('.env.example')) {
            copyFileSync('.env.example', 'bundle/.env.example');
        }
        if (existsSync('.env')) {
            copyFileSync('.env', 'bundle/.env');
        }

        // 5. Salin folder configurations
        console.log('📂 Menyalin folder configurations...');
        if (!existsSync('bundle/configurations')) {
            mkdirSync('bundle/configurations');
        }
        if (existsSync('configurations/pds-pusher-manager.sql')) {
            copyFileSync('configurations/pds-pusher-manager.sql', 'bundle/configurations/pds-pusher-manager.sql');
        }
        if (existsSync('configurations/config.json')) {
            copyFileSync('configurations/config.json', 'bundle/configurations/config.json');
        }

        // 6. Salin folder docs
        console.log('📂 Menyalin folder docs...');
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

        // 7. Buat script runner
        console.log('📜 Membuat script runner (run-pds-server.sh)...');
        const { writeFileSync, chmodSync } = require('fs');
        const runnerPath = path.join('bundle', 'run-pds-server.sh');
        writeFileSync(runnerPath, '#!/usr/bin/env bash\nnode --no-deprecation pulse-server-js start\n');
        chmodSync(runnerPath, '755'); // Agar bisa langsung di-execute

        console.log('✨ Build berhasil! Cek folder /bundle');

    } catch (e) {
        console.error('❌ Build gagal:', e);
        process.exit(1);
    }
}

build();
