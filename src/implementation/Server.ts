/*

1. Jest has problems with stale globalThis :(
2. Using this introduces a lot of complexity with bind and doesn't support fat
   arrow function syntax :(
3. So perhaps using classes is the best way to go.

The global "app" object should be readonly.
The global "log" object should be readonly.

Let's say we wan't to test a controller:

The controller needs to access quite a few things:
* request (passed to the controller, must somehow reach assetUrl and imageUrl)
* contentId (must somehow reach getContent)
* portal.getContent() - repoId - branch - contentId - content
* portal.assetUrl(assetPath) - request - App.Resource
* portal.imageUrl(imageId) - request(Project, Branch) - ImageContent

In a "cluster" each "cluster node" run one instance of the Enonic XP "server".
The "server" has many repo.

Legend:
	oneToOne -
	oneToMany <
	oneToTwo <2
	manyToMany ><

Relationships:
	Server < Repo < Branch < Node
	Server < Repo <2 Branch(draft, master) < Content
	Server < App < Controller < Request
	Request - Project - Repo
	Request - Branch
	Portal - Project - Branch

One Node may contain the id of another Node, but there is no direct reference.
One Content may contain the id of another Content, but there is no direct reference.

Challenges:

Testing controller.get(request):
* All module functions that is run when calling controller.get(request), must be
	mocked and the mocks must have access to all the needed data.
* All the data that is not passed in, must be available to the mocks somehow.

Considering portal.getContent():
* Where can it get contentId from? I guess the instance of portal can have it.
An instance of portal can have only one app, one repoBranch.
I would assume repo and branch stays the same, but currentContentId changes between test.
*/

import type {
	LogLevel
} from './Log';
import type {
	BranchConfig,
	CreateBranchParams,
	CreateRepoParams,
	Log as LogType,
	RepoLib,
	RepositoryConfig,
} from '../types';
import type {App} from './App';
import type {Repos} from './Repo';


import {vol} from 'memfs';
import {Log} from './Log';
import {Repo} from './Repo';
import {RepositoryNotFoundException} from './repo/RepositoryNotFoundException';
import {Version} from './Version';


export class Server {
	readonly applications: App[] = [];
	readonly version: string = '7.14.0';
	readonly indexWarnings: boolean = false;
	readonly vol = vol;

	readonly log: LogType = Log.createLogger({loglevel: 'info'});

	readonly repo: RepoLib = {
		create: ({
			id,
			// rootChildOrder,
			// rootPermissions,
			settings
		}: CreateRepoParams): RepositoryConfig => {
			const repo = new Repo({
				id,
				server: this,
				// rootPermissions,
				settings
			});
			this.repos[id] = repo;
			return repo.get();
		},

		createBranch: ({
			branchId,
			repoId
		}: CreateBranchParams): BranchConfig => {
			const repo = this.repos[repoId];
			if (!repo) {
				throw new RepositoryNotFoundException(`Repository with id [${repoId}] not found`);
			}
			return repo.createBranch(branchId);
		},

		// TODO delete()

		// TODO deleteBranch()

		get: (repoId: string): RepositoryConfig => {
			const repo = this.repos[repoId];
			if (!repo) {
				throw new RepositoryNotFoundException(`Repository with id [${repoId}] not found`);
			}
			return repo.get();
		},

		list: (): RepositoryConfig[] => {
			return Object.keys(this.repos).map(repoId => this.repo.get(repoId));
		}

		// TODO refresh()
	} // repo

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
	} // constructor

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
