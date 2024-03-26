import type {
	Context as ContextInterface,
	ContextParams,
} from '@enonic-types/lib-context';

import {Server} from '../implementation/Server';

// When you run code inside XP without wrapping it with LibContext.run, there is
// still a context, and that context differs upon which Java Service is
// "executing" that code.
export class LibContext {
	readonly server: Server;

	constructor({
		server
	}: {
		server: Server
	}) {
		this.server = server;
	}

	public get(): ContextInterface {
		return this.server.context.get();
	}

	// 1. Can be used around nodeConnect, to set principals, user and attributes
	// Once the nodeConnection is created it shouldn't be possible to affect it,
	// but I haven't verified that inside XP.
	// 2. Can be used around ANY libContent function.
	// 3. Should NOT affect ANY libPortal function.
	public run<T>(context: ContextParams, callback: () => T): T {
		const serverContext = this.server.context;
		this.server.setContext(context);
		const res = callback()
		this.server.context = serverContext;
		return res;
	}
}
