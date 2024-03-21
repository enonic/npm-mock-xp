import type {ConnectParams} from '@enonic-types/lib-node';
import type {CreateRepositoryParams} from '@enonic-types/lib-repo';
import type {
	LogLevel
} from './Log';
import type {
	// CreateRepoParams,
	Log as LogType,
} from '../types';
import type {App} from './App';
import type {Repos} from './Repo';


import {vol} from 'memfs';

import {ContentConnection} from './ContentConnection';
import {Log} from './Log';
import {Repo} from './Repo';
import {RepoConnection} from './RepoConnection';
import {RepositoryNotFoundException} from './repo/RepositoryNotFoundException';
import {setupSystemRepo} from './server/setupSystemRepo';
import {Version} from './Version';


export class Server {
	readonly applications: App[] = [];
	readonly version: string = '7.14.0';
	readonly indexWarnings: boolean = false;
	readonly vol = vol;
	readonly log: LogType = Log.createLogger({loglevel: 'info'});
	readonly repos: Repos = {};

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
		setupSystemRepo({server: this});
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
		const repoId = `com.enonic.cms.${projectId}`;
		return new ContentConnection({
			branch: this.getRepo(repoId).getBranch(branchId)
		});
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

	public getRepo(repoId: string): Repo {
		const repo = this.repos[repoId];
		if (!repo) {
			throw new RepositoryNotFoundException(`Repository with id [${repoId}] not found`);
		}
		return repo;
	}

	// public listRepos(): Repo[] {
	// 	return Object.values(this.repos);
	// }

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

} // class Server
