import type {
	CreateUserParams,
	LoginParams,
	UserKey,
} from '@enonic-types/lib-auth';
import type {
	ContextAttributes,
	ContextUserParams,
	PrincipalKey,
} from '@enonic-types/lib-context';
import type {
	ConnectParams,
	CreateNodeParams,
	ModifyNodeParams,
} from '@enonic-types/lib-node';
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
import type {Branch} from './Branch';
import type {Repos} from './Repo';


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
	public userKey?: UserKey | undefined
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
		this.createRepo({
			id: SYSTEM_REPO
		});
		this.systemRepoConnection = this.connect({
			branchId: 'master',
			repoId: SYSTEM_REPO
		});
		this.auth = new Auth({
			server: this
		});
		setupSystemRepo({server: this});
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
		return new ContentConnection({
			branch: this.getBranch({
				branchId,
				repoId: Project.repoIdFromProjectName(projectId)
			})
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

	// This can't be chainable or there is no way to get the created node,
	// since we need to know the createdNode._id to get it later.
	public createNode<NodeData = unknown>({
		branchId,
		repoId,
		node
	}: {
		branchId: string
		node: CreateNodeParams<NodeData>
		repoId: string
	}) {
		return this.connect({
			branchId,
			repoId
		}).create<NodeData>(node);
	}

	public createRepo({
		id,
		// rootChildOrder,
		// rootPermissions,
		settings
	}: CreateRepositoryParams): Server {
		const repo = new Repo({
			id,
			server: this,
			// rootPermissions,
			settings
		});
		this.repos[id] = repo;
		// return repo;
		return this; // Chainable
	}

	public createProject({
		projectName,
		settings = {}
	}: {
		projectName: string
		settings?: RepositorySettings
	}): Server {
		if (!projectName) {
			throw new Error('Server: createProject: No projectName provided!');
		}

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

	public createUser(params: Omit<CreateUserParams, 'idProvider'> & {
		idProvider?: string
		password?: string
		profile?: Record<string, unknown>
	}): Server {
		this.auth.createUser(params);
		return this; // Chainable
	}

	public deleteRepo({
		repoId
	}: {
		repoId:string
	}): Server {
		// TODO throw new RepositoryExeption( "No allowed to delete repository [" + repositoryId + "]" );
		if (!this.repos[repoId]) {
			throw new RepositoryNotFoundException(repoId);
		}
		delete this.repos[repoId];
		return this; // Chainable
	}

	public getBranch({
		branchId,
		repoId,
	}: {
		branchId: string
		repoId: string
	}): Branch {
		return this.getRepo(repoId).getBranch(branchId);
	}

	public getNode<T = Node>({
		branchId,
		key,
		repoId,
	}: {
		branchId: string
		key: string
		repoId: string
	}) {
		return this.connect({
			branchId,
			repoId
		})._getSingle<T>(key);
	}

	public getProject(projectName: string): Project {
		if (!projectName) {
			throw new Error('Server: getProject: No projectName provided!');
		}
		const project = this.projects[projectName];
		if (!project) {
			throw new Error(`Server: getProject: Project ${projectName} not found!`);
			// TODO Perhaps just return null?
		}
		return project;
	}

	public getRepo(repoId: string): Repo {
		const repo = this.repos[repoId];
		if (!repo) {
			throw new RepositoryNotFoundException(repoId);
		}
		return repo;
	}

	install(app: App): Server {
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

	public login(params: LoginParams): Server {
		this.auth.login(params);
		return this; // Chainable
	}

	public logout(): Server {
		this.auth.logout();
		return this; // Chainable
	}

	public modifyNode<NodeData = Record<string, unknown>>({
		branchId,
		editor,
		key,
		repoId,
	}: {
		branchId: string
		editor: ModifyNodeParams<NodeData>['editor']
		key: string
		repoId: string
	}) {
		this.connect({
			branchId,
			repoId
		}).modify<NodeData>({
			editor,
			key,
		});
		return this; // Can be chainable, since key is known
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
	}): Server {
		if (!user) {
			const currentUser = this.auth.getUser();
			if (currentUser) {
				user = {
					idProvider: currentUser.idProvider,
					login: currentUser.login,
				};
			}
		}
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

	public su(): Server {
		this.login({
			idProvider: 'system',
			// password: '',
			user: 'su',
		});
		return this; // Chainable
	}

} // class Server
