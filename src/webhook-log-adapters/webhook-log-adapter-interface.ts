import { WebhookLogEntry } from '../webhook-logger';

/**
 * Interface untuk adapter penyimpanan log webhook ke database.
 */
export interface WebhookLogAdapterInterface {
    /**
     * Insert satu entry log webhook ke dalam database.
     */
    insert(entry: WebhookLogEntry): Promise<void>;

    /**
     * Disconnect dari database.
     */
    disconnect(): Promise<void>;
}
