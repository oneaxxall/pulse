import { App } from '../app';
import { BaseAppManager } from './base-app-manager';
import { Log } from '../log';
import { Server } from '../server';

export class ArrayAppManager extends BaseAppManager {
    /**
     * Create a new app manager instance.
     */
    constructor(protected server: Server) {
        super();
    }

    /**
     * Initialize the app manager.
     */
    init(): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Find an app by given ID.
     */
    findById(id: string): Promise<App|null> {
        return new Promise(resolve => {
            let app = this.server.options.manager.array.apps.find(
				(app) => app.id == id
			);

            if (typeof app !== 'undefined') {
                resolve(new App(app, this.server));
            } else {
                if (this.server.options.debug) {
                    Log.error(`App ID belum diset: ${id}`);
                }

                resolve(null);
            }
        });
    }

    /**
     * Find an app by given key.
     */
    findByKey(key: string): Promise<App|null> {
        return new Promise(resolve => {
            let app = this.server.options.manager.array.apps.find(
				(app) => app.key == key
			);

            if (typeof app !== 'undefined') {
                resolve(new App(app, this.server));
            } else {
                if (this.server.options.debug) {
                    Log.error(`App key belum diset: ${key}`);
                }

                resolve(null);
            }
        });
    }
}
