import type {RepositorySettings} from '@enonic-types/lib-repo';
import type {Repo} from './Repo';
import type {Server} from './Server';


export class Project {
	readonly repo: Repo;
	readonly server: Server;

	public static repoPrefix = 'com.enonic.cms.';

	public static projectNameFromRepoId(repoId: string) {
		return repoId.replace(Project.repoPrefix, '');
	}

	public static repoIdFromProjectName(projectName: string) {
		return `${Project.repoPrefix}${projectName}`;
	}

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
		const repoId = Project.repoIdFromProjectName(projectName);
		server.createRepo({
			id: repoId,
			settings
		});
		this.repo = server.getRepo(repoId);
		// this.repo.getBranch('master');
		this.repo.createBranch('draft');
	}
}
