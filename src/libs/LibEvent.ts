import type {
	EnonicEventData,
	ListenerParams,
	SendParams,
} from '@enonic-types/lib-event';


import {Server} from '../implementation/Server';


export class LibEvent {
	private server: Server;

	constructor({
		server
	}: {
		server: Server
	}) {
		this.server = server;
	}

	public listener<EventData extends object = EnonicEventData>({
		type,
		localOnly,
		callback
	}: ListenerParams<EventData>): void {
		this.server.log.debug('event.listener({ type:%s, localOnly:%s callback:%s})', type, localOnly, callback);
	}

	public send<EventData extends object = object>({
		type,
		distributed,
		data
	}: SendParams<EventData>): void {
		this.server.log.debug('event.send({ type:%s, distributed:%s data:%s})', type, distributed, data);
	}
} // class LibEvent


