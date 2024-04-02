import type {
	ByteSource,
	ResourceKey
} from '@enonic-types/lib-io';
import type {App} from '../implementation/App';
import type {Resource} from '../implementation/app/Resource';

import {isString} from '@enonic/js-utils/value/isString'

export class LibIo {
	private app: App;

	constructor({
		app
	}: {
		app: App
	}) {
		this.app = app;
	}

	public getMimeType(name: string): string {
		const parts = name.split('.');
		const ext = parts[parts.length - 1];
		switch (ext) {
			case 'css':
				return 'text/css';
			case 'ico':
				return 'image/x-icon';
			case 'jpg':
				return 'image/jpeg';
			case 'js':
				return 'application/javascript';
			case 'json':
				return 'application/json';
			case 'gif':
				return 'image/gif';
			case 'html':
				return 'text/html';
			case 'png':
				return 'image/png';
			case 'svg':
				return 'image/svg+xml';
			case 'txt':
				return 'text/plain';
			case 'xml':
				return 'application/xml';
			default:
				return 'application/octet-stream';
		}
	}

	public getResource(key: string | ResourceKey): Resource {
		return this.app.getResource(isString(key) ? key : key.getPath());
	}

	public getSize(stream: ByteSource): number {
		return (stream as unknown as Buffer).length;
	}

	public newStream(text: string): ByteSource {
		return Buffer.from(text) as unknown as ByteSource;
	}

	public processLines(stream: ByteSource, func: (value: string) => void): void {
		stream.toString().split('\n').forEach(func);
	}

	public readLines(stream: ByteSource): string[] {
		return stream.toString().split('\n');
	}

	public readText(stream: ByteSource): string {
		return stream.toString();
	}
}
