import type {
	ByteSource,
	Resource as ResourceInterface,
} from '@enonic-types/core';


import {App} from '../App';


// A resource is a file inside the an app.
export class Resource implements ResourceInterface {
	app: App;
	path: string;

	constructor({
		app,
		path,
	}: {
		app: App
		path: string
	}) {
		this.app = app;
		this.path = path.startsWith('/') ? path : `/${path}`;
	}

	public exists(): boolean {
		return this.app.vol.existsSync(this.path);
	}

	public getSize(): number {
		return this.app.vol.statSync(this.path).size;
	}

	public getStream(): ByteSource {
		// return this.app.vol.createReadStream(this.path, 'utf8') as unknown as ByteSource;
		return this.app.vol.readFileSync(this.path) as unknown as ByteSource
	}

	public getTimestamp(): number {
		return this.app.vol.statSync(this.path).mtimeMs;
	}
} // class Controller
