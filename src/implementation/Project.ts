import type {RepositorySettings} from '@enonic-types/lib-repo';
import type {Repo} from './Repo';
import type {Server} from './Server';


export class Project {
	readonly repo: Repo;
	readonly server: Server;

	constructor({
		projectName,
		server,
		settings = {}
	}: {
		projectName: string
		server: Server
		settings?: RepositorySettings
	}) {
		this.server = server;
		this.repo = server.createRepo({
			id: `com.enonic.cms.${projectName}`,
			settings
		});
		this.repo.getBranch('master');
		this.repo.createBranch('draft');
	}
}
