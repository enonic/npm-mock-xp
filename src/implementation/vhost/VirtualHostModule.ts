import { toStr } from '@enonic/js-utils';
import { Server } from '../Server';
import type { VirtualHost } from './VirtualHost';

export class VirtualHostModule {
	private server: Server;

	public isEnabled: boolean = false;
	public virtualHosts: VirtualHost[] = [];

	constructor({
			server
	}: {
		server: Server
	}) {
		this.server = server;
	}

	add(virtualHost: VirtualHost) {
		this.server.log.debug('Adding virtualHost:%s', toStr(virtualHost));
		this.virtualHosts.push(virtualHost);
	}

	enable() {
		this.server.log.debug('Enabling virtalhost mappings');
		this.isEnabled = true;
	}
}
