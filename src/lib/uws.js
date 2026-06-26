try {
    module.exports = require('./uws_linux_x64_127.node');
} catch (e) {
    console.error('❌ Gagal memuat binary uWebSockets.js. Pastikan file uws_linux_x64_127.node ada di folder yang sama.');
    process.exit(1);
}
