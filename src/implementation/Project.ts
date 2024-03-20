import type {RepositorySettings} from '../types';
import type {Server} from './Server';


import {Repo} from './Repo';
import {Branch} from './Branch';
import {ContentConnection} from './ContentConnection';


export class Project {
	readonly connection: ContentConnection;
	readonly branch: Branch;
	readonly repositoryId: string;
	// readonly repo: ServerRepo;
	readonly server: Server;

	constructor({
		branch = 'draft',
		projectName,
		server,
		settings = {}
	}: {
		branch?: 'draft' | 'master'
		projectName: string
		server: Server
		settings?: RepositorySettings
	}) {
		this.repositoryId = `com.enonic.cms.${projectName}`;
		this.server = server;
		const repo = new Repo({
			id: this.repositoryId,
			server,
			settings
		});
		const branchObj = new Branch({
			branchId: branch,
			repo
		});
		this.connection = new ContentConnection({
			branch: branchObj
		});
	}
}
