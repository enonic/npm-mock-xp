import type {
	// Context,
	ContextParams,
} from '@enonic-types/lib-context';

import {Server} from '../implementation/Server';


export class LibContext {
	readonly server: Server;

	constructor({
		server
	}: {
		server: Server
	}) {
		this.server = server;
	}

	// public get(): Context {
	// 	return {}
	// }

	public run<T>(_context: ContextParams, callback: () => T): T {
		const res = callback()
		return res;
	}
}
