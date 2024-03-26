import type {
	LoginParams,
} from '@enonic-types/lib-auth';
import type {
	ContextAttributes,
	ContextUserParams,
	PrincipalKey,
} from '@enonic-types/lib-context';
import type {ConnectParams} from '@enonic-types/lib-node';
import type {
	CreateRepositoryParams,
	RepositorySettings,
} from '@enonic-types/lib-repo';
import type {
	LogLevel
} from './Log';
import type {
	// CreateRepoParams,
	Log as LogType,
} from '../types';
import type {App} from './App';
import type {Repos} from './Repo';
import type {User} from './User';


import {vol} from 'memfs';

import {
	ROLE_SYSTEM_EVERYONE,
	SYSTEM_REPO,
	USER_SYSTEM_ANONYMOUS,
} from '../constants';
import {Auth} from './Auth';
import {ContentConnection} from './ContentConnection';
import {Context} from './Context';
import {Log} from './Log';
import {Project} from './Project';
import {Repo} from './Repo';
import {RepoConnection} from './RepoConnection';
import {RepositoryNotFoundException} from './repo/RepositoryNotFoundException';
import {setupSystemRepo} from './server/setupSystemRepo';
import {Version} from './Version';


export class Server {
	readonly applications: App[] = [];
	readonly auth: Auth;
	readonly indexWarnings: boolean = false;
	readonly log: LogType = Log.createLogger({loglevel: 'info'});
	readonly projects: Record<string, Project> = {};
	readonly repos: Repos = {};
	readonly systemRepoConnection: RepoConnection;
	readonly version: string = '7.14.0';
	readonly vol = vol;

	// At some point these should live somewhere else, but this simplification
	// is fine for now:
	public user?: User | undefined
	public context: Context

	constructor({
		indexWarnings = false,
		log,
		loglevel,
		version,
	}: {
		indexWarnings?: boolean
		log?: LogType,
		loglevel?: LogLevel
		version?: string
	} = {}) {
		if (indexWarnings) {
			this.indexWarnings = indexWarnings;
		}
		if (log) {
			this.log = log;
		} else if (loglevel) {
			this.log = Log.createLogger({loglevel});
		}
		if (version) {
			this.version = version;
		}
		this.vol.fromJSON({}, '/');
		this.systemRepoConnection = setupSystemRepo({server: this});
		this.auth = new Auth({
			server: this
		});
		this.context = new Context({
			branch: 'master',
			repository: SYSTEM_REPO,
			server: this,
			principals: [
				USER_SYSTEM_ANONYMOUS,
				ROLE_SYSTEM_EVERYONE
			],
		});
	} // constructor

	public connect({
		repoId,
		branchId// ,
		// user,
		// principals
	}: {
		repoId: ConnectParams['repoId']
		branchId: ConnectParams['branch']
		principals?: ConnectParams['principals']
		user?: ConnectParams['user']
	}): RepoConnection {
		if (!repoId) {
			throw new Error('connect: No repoId provided!');
		}
		if(!branchId) {
			throw new Error('connect: No branchId provided!');
		}
		const repo = this.getRepo(repoId);
		const branch = repo.getBranch(branchId);
		return new RepoConnection({
			branch
		});
	}

	public contentConnect({
		branchId,
		projectId,
	}: {
		branchId: string
		projectId: string
	}): ContentConnection {
		if (!projectId) {
			throw new Error('Server: contentConnect: No projectId provided!');
		}
		if(!branchId) {
			throw new Error('Server: contentConnect: No branchId provided!');
		}
		const repoId = `com.enonic.cms.${projectId}`;
		const repo = this.getRepo(repoId);
		const branch = repo.getBranch(branchId);
		return new ContentConnection({
			branch
		});
	}

	public createBranch({
		branchId,
		repoId
	}: {
		branchId: string
		repoId: string
	}) {
		return this.getRepo(repoId).createBranch(branchId);
	}

	public createRepo({
		id,
		// rootChildOrder,
		// rootPermissions,
		settings
	}: CreateRepositoryParams): Repo {
		const repo = new Repo({
			id,
			server: this,
			// rootPermissions,
			settings
		});
		this.repos[id] = repo;
		return repo;
	}

	public createProject({
		projectName,
		settings = {}
	}: {
		projectName: string
		settings?: RepositorySettings
	}) {
		if (this.projects[projectName]) {
			// TODO Compare settings and throw if different
			this.log.info(`Project ${projectName} already exists.`);
			return this; // Chainable
		}
		this.projects[projectName] = new Project({
			projectName,
			server: this,
			settings
		});
		return this; // Chainable
	}

	// public getProject(projectName: string): Project {
	// 	const project = this.projects[projectName];
	// 	if (!project) {
	// 		throw new Error(`Project ${projectName} not found!`);
	// 		// TODO Perhaps just return null?
	// 	}
	// 	return project;
	// }

	public getRepo(repoId: string): Repo {
		const repo = this.repos[repoId];
		if (!repo) {
			throw new RepositoryNotFoundException(`Repository with id [${repoId}] not found`);
		}
		return repo;
	}

	install(app: App) {
		const systemVersion = new Version(this.version);

		if (app.minSystemVersion && systemVersion.lessThan(new Version(app.minSystemVersion))) {
			throw new Error(`System version ${this.version} is lower than App minSystemVersion ${app.minSystemVersion}!`);
		}

		if (app.maxSystemVersion && systemVersion.greaterThan(new Version(app.maxSystemVersion))) {
			throw new Error(`System version ${this.version} is higher than App maxSystemVersion ${app.maxSystemVersion}!`);
		}

		const index = this.applications.findIndex(a => a.key === app.key);

		if (index !== -1) {
			this.log.info(`Application ${app.key} already installed, replacing it.`);
			this.applications[index] = app;
		} else {
			this.applications.push(app);
			this.log.debug(`Application ${app.key} installed.`);
		}

		return this; // Chainable
	} // install

	public listRepos(): Repo[] {
		return Object.values(this.repos);
	}

	public login(params: LoginParams) {
		this.auth.login(params);
		return this; // Chainable
	}

	public logout() {
		this.auth.logout();
		return this; // Chainable
	}

	public setContext({
		attributes,
		principals,
		projectName,
		branch = projectName ? 'draft' : 'master',
		repository = `com.enonic.cms.${projectName}`,
		idProvider = 'system',
		login,
		user = login
			? {login, idProvider}
			: this.user
				? {
					idProvider: this.user.idProvider,
					login: this.user.login,
				}
				: undefined,
	}: {
		attributes?: ContextAttributes
		branch?: string
		idProvider?: string
		login?: string
		principals?: PrincipalKey[]
		projectName?: string
		repository?: string
		user?: ContextUserParams
	}) {
		this.context = new Context({
			attributes,
			branch,
			principals,
			repository,
			server: this,
			user: user,
		});
		return this; // Chainable
	}

	public su() {
		this.login({
			idProvider: 'system',
			// password: '',
			user: 'su',
		});
		return this; // Chainable
	}

} // class Server
