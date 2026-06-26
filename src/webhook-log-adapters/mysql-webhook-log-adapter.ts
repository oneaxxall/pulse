import { SqlWebhookLogAdapter } from './sql-webhook-log-adapter';
import { Server } from '../server';

/**
 * Adapter webhook log untuk MySQL.
 */
export class MysqlWebhookLogAdapter extends SqlWebhookLogAdapter {
    constructor(protected server: Server) {
        super(server);
    }

    protected knexClientName(): string {
        return this.server.options.manager.mysql.useMysql2 ? 'mysql2' : 'mysql';
    }

    protected knexConnectionDetails(): { [key: string]: any } {
        return { ...this.server.options.database.mysql };
    }

    protected knexVersion(): string {
        return this.server.options.manager.mysql.version as string;
    }

    protected supportsPooling(): boolean {
        return true;
    }
}
