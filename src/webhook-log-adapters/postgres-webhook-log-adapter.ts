import { SqlWebhookLogAdapter } from './sql-webhook-log-adapter';
import { Server } from '../server';

/**
 * Adapter webhook log untuk PostgreSQL.
 */
export class PostgresWebhookLogAdapter extends SqlWebhookLogAdapter {
    constructor(protected server: Server) {
        super(server);
    }

    protected knexClientName(): string {
        return 'pg';
    }

    protected knexConnectionDetails(): { [key: string]: any } {
        return { ...this.server.options.database.postgres };
    }

    protected knexVersion(): string {
        return this.server.options.manager.postgres.version as string;
    }

    protected supportsPooling(): boolean {
        return true;
    }
}
