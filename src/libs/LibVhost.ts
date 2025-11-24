import type { VirtualHosts } from '@enonic-types/lib-vhost';
import { Server } from '../implementation/Server';

export type { VirtualHosts } from '@enonic-types/lib-vhost';

export class LibVhost {
	private server: Server;

	constructor({
			server
	}: {
		server: Server
	}) {
		this.server = server;
	}

	isEnabled(): boolean {
		return this.server.vhost.isEnabled;
	}

	list(): VirtualHosts {
		return {
			vhosts: this.server.vhost.virtualHosts,
		};
	}
}
