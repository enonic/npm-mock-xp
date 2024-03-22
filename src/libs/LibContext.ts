// When you run code inside XP without wrapping it with LibContext.run, there is
// still a context, and that context differs upon which Java Service is
// "executing" that code.
// TODO: It should NOT be possible to run a test without setting a context first!
// A context is sorta like a global, but since globalThis doesn' quite work with
// jest, it has to exist somewhere else.
/*

A controller is a file inside an app.
It can be called in different contexts.
Lets say the "default" context is set on the Server instance.

*/

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

	// 1. Can be used around nodeConnect, to set principals, user and attributes
	// Once the nodeConnection is created it shouldn't be possible to affect it,
	// but I haven't verified that inside XP.
	// 2. Can be used around ANY libContent function.
	// 3. Should NOT affect ANY libPortal function.
	//
	// Must be able to change active ContentConnection in Project
	public run<T>(context: ContextParams, callback: () => T): T {
		// TODO get currrent context

		const res = callback()
		// TODO restore context
		return res;
	}
}
