import type {RepositorySettings} from '@enonic-types/lib-repo';
import type {Repo} from './Repo';
import type {Server} from './Server';


import {ContentConnection} from './ContentConnection';


export class Project {
	// readonly branch: Branch;
	readonly repositoryId: string;
	readonly repo: Repo;
	readonly server: Server;

	// Can be changed by LibContext.run
	public connection: ContentConnection;

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
		this.repo = server.createRepo({
			id: this.repositoryId,
			settings
		});
		const masterBranch = this.repo.getBranch('master');
		const draftBranch = this.repo.createBranch('draft');
		this.connection = new ContentConnection({
			branch: branch === 'master' ? masterBranch : draftBranch,
		});
	}
}
