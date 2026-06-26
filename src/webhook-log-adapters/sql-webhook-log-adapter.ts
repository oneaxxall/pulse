import { Knex, knex } from 'knex';
import { Log } from '../log';
import { Server } from '../server';
import { WebhookLogEntry } from '../webhook-logger';
import { WebhookLogAdapterInterface } from './webhook-log-adapter-interface';

/**
 * Abstract base class untuk SQL-based webhook log adapter.
 * Menggunakan Knex agar bisa dipakai oleh MySQL maupun Postgres.
 */
export abstract class SqlWebhookLogAdapter implements WebhookLogAdapterInterface {
    /**
     * Koneksi Knex ke database.
     */
    protected connection: Knex;

    /**
     * Buat instance baru.
     */
    constructor(protected server: Server) {
        let knexConfig: any = {
            client: this.knexClientName(),
            connection: this.knexConnectionDetails(),
            version: this.knexVersion(),
        };

        if (this.supportsPooling() && server.options.databasePooling.enabled) {
            knexConfig = {
                ...knexConfig,
                pool: {
                    min: server.options.databasePooling.min,
                    max: server.options.databasePooling.max,
                },
            };
        }

        this.connection = knex(knexConfig);
    }

    /**
     * Insert satu entry log webhook ke tabel pusher_webhook_logs.
     */
    insert(entry: WebhookLogEntry): Promise<void> {
        return this.connection(this.webhookLogsTableName())
            .insert({
                app_key:         entry.appKey,
                webhook_url:     entry.webhookUrl,
                status:          entry.status,
                event_types:     JSON.stringify(entry.eventTypes),
                payload_size:    entry.payloadSize,
                response_status: entry.responseStatus,
                duration_ms:     entry.durationMs,
                error:           entry.error,
                created_at:      new Date(entry.timestamp),
            })
            .then(() => {
                if (this.server.options.debug) {
                    Log.webhookSenderTitle(`📝 Webhook log tersimpan ke DB [${entry.status}] → ${entry.webhookUrl}`);
                }
            })
            .catch(err => {
                // Fail silently — DB logging tidak boleh mengganggu alur utama.
                if (this.server.options.debug) {
                    Log.error(`[WebhookLogAdapter] Gagal insert ke DB: ${err?.message}`);
                }
            });
    }

    /**
     * Disconnect dari database.
     */
    disconnect(): Promise<void> {
        return this.connection.destroy();
    }

    /**
     * Nama tabel log webhook.
     */
    protected webhookLogsTableName(): string {
        return 'pusher_webhook_logs';
    }

    /**
     * Nama client Knex (mysql2 / pg).
     */
    protected abstract knexClientName(): string;

    /**
     * Detail koneksi database.
     */
    protected abstract knexConnectionDetails(): { [key: string]: any };

    /**
     * Versi database untuk Knex.
     */
    protected abstract knexVersion(): string;

    /**
     * Apakah driver ini mendukung connection pooling.
     */
    protected abstract supportsPooling(): boolean;
}
