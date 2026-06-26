import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { Server } from './server';
import { WebhookLogAdapter, WebhookLogAdapterInterface } from './webhook-log-adapters';

export interface WebhookLogEntry {
    timestamp: string;
    status: 'success' | 'failed';
    appKey: string;
    webhookUrl: string;
    eventTypes: string[];
    payloadSize: number;
    responseStatus: number | null;
    durationMs: number;
    error: string | null;
}

export class WebhookLogger {
    /**
     * Whether file logging is enabled.
     */
    private enabled: boolean;

    /**
     * Whether DB logging is enabled.
     */
    private dbEnabled: boolean;

    /**
     * Absolute path to the log directory.
     */
    private logDir: string;

    /**
     * Database adapter for inserting webhook logs.
     * Null if DB logging is disabled or driver not supported.
     */
    private dbAdapter: WebhookLogAdapterInterface | null = null;

    /**
     * Initialize the WebhookLogger.
     */
    constructor(protected server: Server) {
        this.enabled   = server.options.webhooks.logs.enabled;
        this.dbEnabled = server.options.webhooks.logs.dbEnabled;
        this.logDir    = resolve(process.cwd(), server.options.webhooks.logs.dir);

        if (this.enabled) {
            this.ensureLogDir();
        }

        if (this.dbEnabled) {
            this.dbAdapter = WebhookLogAdapter.make(server);

            if (!this.dbAdapter && server.options.debug) {
                console.warn('[WebhookLogger] DB logging diaktifkan tapi driver tidak didukung (hanya mysql/postgres). DB logging dinonaktifkan.');
            }
        }
    }

    /**
     * Write a webhook log entry to file and/or database.
     */
    write(entry: WebhookLogEntry): void {
        // Tulis ke file log
        if (this.enabled) {
            try {
                const filePath = join(this.logDir, this.getLogFileName());
                const line     = JSON.stringify(entry) + '\n';

                appendFileSync(filePath, line, { encoding: 'utf8' });
            } catch (err) {
                // Fail silently — logging should never break the main flow.
                if (this.server.options.debug) {
                    console.error('[WebhookLogger] Gagal menulis log file:', err);
                }
            }
        }

        // Insert ke database
        if (this.dbEnabled && this.dbAdapter) {
            this.dbAdapter.insert(entry).catch(() => {
                // Error sudah ditangani di dalam adapter (fail silently).
            });
        }
    }

    /**
     * Build a success log entry.
     */
    buildSuccessEntry(
        appKey: string,
        webhookUrl: string,
        eventTypes: string[],
        payloadSize: number,
        responseStatus: number,
        durationMs: number,
    ): WebhookLogEntry {
        return {
            timestamp: new Date().toISOString(),
            status: 'success',
            appKey,
            webhookUrl,
            eventTypes,
            payloadSize,
            responseStatus,
            durationMs,
            error: null,
        };
    }

    /**
     * Build a failed log entry.
     */
    buildFailedEntry(
        appKey: string,
        webhookUrl: string,
        eventTypes: string[],
        payloadSize: number,
        durationMs: number,
        error: string,
    ): WebhookLogEntry {
        return {
            timestamp: new Date().toISOString(),
            status: 'failed',
            appKey,
            webhookUrl,
            eventTypes,
            payloadSize,
            responseStatus: null,
            durationMs,
            error,
        };
    }

    /**
     * Get the log file name for today (rotated daily).
     * Format: webhook-YYYY-MM-DD.log
     */
    private getLogFileName(): string {
        const now    = new Date();
        const year   = now.getFullYear();
        const month  = String(now.getMonth() + 1).padStart(2, '0');
        const day    = String(now.getDate()).padStart(2, '0');

        return `webhook-${year}-${month}-${day}.log`;
    }

    /**
     * Ensure the log directory exists, create it recursively if not.
     */
    private ensureLogDir(): void {
        if (!existsSync(this.logDir)) {
            mkdirSync(this.logDir, { recursive: true });
        }
    }
}
