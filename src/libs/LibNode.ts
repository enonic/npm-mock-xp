import type {
	ConnectParams,
	// MultiRepoConnection,
	// MultiRepoConnectParams,
	RepoConnection,
} from '@enonic-types/lib-node';


import {Server} from '../implementation/Server';


export class LibNode {
	private server: Server;

	constructor({
		server
	}: {
		server: Server
	}) {
		this.server = server;
	}

	public connect({
		repoId,
		branch,
		// principals,
		// user
	}: ConnectParams): RepoConnection {
		if (!repoId) {
			throw new Error('No repo with id');
		}
		if(!branch) {
			throw new Error('No branch with branchId');
		}
		return this.server.connect({
			repoId,
			branchId: branch
		}) as unknown as RepoConnection;
	}

	// TODO public multiRepoConnect(params: MultiRepoConnectParams): MultiRepoConnection {}
} // class LibNode
