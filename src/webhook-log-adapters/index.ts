import { Server } from '../server';
import { WebhookLogAdapterInterface } from './webhook-log-adapter-interface';
import { MysqlWebhookLogAdapter } from './mysql-webhook-log-adapter';
import { PostgresWebhookLogAdapter } from './postgres-webhook-log-adapter';

/**
 * Factory untuk membuat instance adapter webhook log yang sesuai
 * berdasarkan driver manager yang dikonfigurasi.
 */
export class WebhookLogAdapter {
    /**
     * Buat adapter yang sesuai berdasarkan manager driver.
     * Mengembalikan null jika driver tidak didukung untuk DB logging.
     */
    static make(server: Server): WebhookLogAdapterInterface | null {
        const driver = server.options.manager.driver;

        if (driver === 'mysql') {
            return new MysqlWebhookLogAdapter(server);
        }

        if (driver === 'postgres') {
            return new PostgresWebhookLogAdapter(server);
        }

        // Driver 'array' atau lainnya tidak memiliki koneksi DB — skip.
        return null;
    }
}

export { WebhookLogAdapterInterface } from './webhook-log-adapter-interface';
export { SqlWebhookLogAdapter } from './sql-webhook-log-adapter';
export { MysqlWebhookLogAdapter } from './mysql-webhook-log-adapter';
export { PostgresWebhookLogAdapter } from './postgres-webhook-log-adapter';
