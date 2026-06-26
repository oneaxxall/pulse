import { readFileSync } from 'fs';
import { Log } from '..';
import { Server } from './../server';
import { envVariables } from '../types/env-variables';

export class Cli {
	/**
	 * The server to run.
	 */
	public server: Server;

	protected prefix : string;

	/**
	 * Allowed environment variables.
	 *
	 * @type {any}
	 */
	public envVariables: { [key: string]: string } = envVariables;

	/**
	 * Create new CLI instance.
	 */
	constructor(protected pm2 = false) {
		this.server = new Server();
		this.server.pm2 = pm2;
		this.prefix = 'PULSE_';
	}

	/**
	 * Debug the options if debug is on 
	 */
	protected debugOptions() : void {
		if ( this.isDebugEnabled() ) {
			console.log(this.server.options);
		}
	}

	/**
	 * Checking debug is enabled 
	 */
	protected isDebugEnabled() : boolean
	{	
		const value = this.server.getOption('debug');
		if ( value > 1 ) return true;

		return false;
	}

	/**
	 * Inject the .env vars into options if they exist.
	 */
	protected overwriteOptionsFromEnv(): void {

		require("dotenv").config();

		for (let envVar in this.envVariables) {
			let defaultValue = null;
			let prefix    	 = this.prefix;
			let prefName  	 = `${prefix}${envVar}`;
			let value     	 = process.env[prefName] || defaultValue;
			let optionKey 	 = this.envVariables[envVar.replace(this.prefix, "")];

			if ( optionKey === 'database.mysql.password' 
			&& value === null ) {
				value = '';
			}

			if (value !== null) {
				let json = null;

				if (typeof value === "string") {
					try {
						json = JSON.parse(value);
					} catch (e) {
						json = null;
					}

					if (json !== null && typeof json !== 'number') {
						value = json;
					}
				}

				let settingObject = {};
				settingObject[optionKey] = optionKey === 'debug' ? Number(value) : value;

				this.server.setOptions(settingObject);
			}
		}

		this.debugOptions();
	}

	/**
	 * Inject the variables from a config file.
	 */
	protected overwriteOptionsFromConfig(path?: string): void {
		if (!path) {
			return;
		}

		try {
			let config = JSON.parse(readFileSync(path, { encoding: "utf-8" }));

			for (let optionKey in config) {
				let value = config[optionKey];
				let settingObject = {};

				settingObject[optionKey] = value;

				this.server.setOptions(settingObject);
			}
		} catch (e) {
			Log.errorTitle(
				"Mohon check config file JSON, mungkin ada kesalahan peletakan comma."
			);
		}
	}

	/**
	 * Start the server.
	 */
	static async start(cliArgs: any): Promise<any> {
		return new Cli().start(cliArgs);
	}

	/**
	 * Start the server with PM2 support.
	 */
	static async startWithPm2(cliArgs: any): Promise<any> {
		return new Cli(true).start(cliArgs);
	}

	/**
	 * Start the server.
	 */
	async start(cliArgs: any): Promise<any> {
		this.overwriteOptionsFromConfig(cliArgs ? cliArgs.config : null);
		this.overwriteOptionsFromEnv();

		const handleFailure = () => {
			this.server.stop().then(() => {
				process.exit();
			});
		};

		process.on("SIGINT", handleFailure);
		process.on("SIGHUP", handleFailure);
		process.on("SIGTERM", handleFailure);

		process.on("uncaughtException", (err, origin) => {
			Log.error("process uncaughtException");
			Log.error({ err, origin });
			handleFailure();
		});

		return this.server.start();
	}
}
