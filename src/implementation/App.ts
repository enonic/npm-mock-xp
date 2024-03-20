import type {
	Application
} from '@enonic-types/lib-app';


export declare type Config = Record<string, string | undefined>


export declare interface AppConstructorParams {
	config?: Config
	displayName?: Application['displayName']
	key: Application['key']
	maxSystemVersion?: Application['maxSystemVersion']
	minSystemVersion?: Application['minSystemVersion']
	version?: Application['version']
}

export class App {
	readonly displayName: Application['displayName'];
	readonly key: Application['key'];
	readonly maxSystemVersion: Application['maxSystemVersion'];
	readonly minSystemVersion: Application['minSystemVersion'];
	readonly version: Application['version'];

	public config: Config;

	constructor({
		config = {},
		displayName = null,
		maxSystemVersion = null,
		minSystemVersion = null,
		key,
		version = '1.0.0',
	}: AppConstructorParams) {
		this.config = config;
		this.displayName = displayName;
		this.maxSystemVersion = maxSystemVersion;
		this.minSystemVersion = minSystemVersion;
		this.key = key;
		this.version = version;
	}
} // class ServerApp
