import type {
	Application,
	ByteSource,
} from '@enonic-types/lib-app';


import {vol} from 'memfs';
import {dirname} from 'path';
import {Asset} from './app/Asset';
import {Controller} from './app/Controller';
import {Resource} from './app/Resource';


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
	readonly vol = vol;

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
		this.vol.fromJSON({}, '/');
	}

	public addAsset({
		data,
		path
	}: {
		data: ByteSource|string
		path: string
	}) {
		if (!this.vol.existsSync(Asset.path)) {
			this.vol.mkdirSync(Asset.path)
		}
		this.vol.writeFileSync(Asset.prefixPath(path), data.toString())
		return this; // Chainable
	}

	public addController({
		data,
		path
	}: {
		data: ByteSource|string
		path: string
	}) {
		const absPath = path.startsWith('/') ? path : `/${path}`;

		const parent = dirname(absPath);
		if (!this.vol.existsSync(parent)) {
			this.vol.mkdirSync(parent, {recursive: true});
		}

		new Controller({ // Will throw if path is invalid
			app: this,
			path: absPath,
		});
		this.vol.writeFileSync(absPath, data.toString())
		return this; // Chainable
	}

	public addResource({
		data,
		path
	}: {
		data: ByteSource|string
		path: string
	}) {
		const absPath = path.startsWith('/') ? path : `/${path}`;

		const parent = dirname(absPath);
		if (!this.vol.existsSync(parent)) {
			this.vol.mkdirSync(parent, {recursive: true});
		}

		this.vol.writeFileSync(absPath, data.toString());
		return this; // Chainable
	}

	public getAsset(path: string) {
		return new Asset({
			app: this,
			path,
		});
	}

	public getController(path: string) {
		return new Controller({
			app: this,
			path,
		});
	}

	public getResource(path: string) {
		return new Resource({
			app: this,
			path,
		});
	}
} // class ServerApp
