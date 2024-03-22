import type {
	Context as ContextInterface,
	ContextAttributes,
	ContextParams,
	PrincipalKey,
} from '@enonic-types/lib-context';
import type {Auth} from './Auth';
import type {Project} from './Project';
import type {Server} from './Server';
import type {User} from './User';


import {ContentConnection} from './ContentConnection';


// Needs access to SystemRepo to get user and principals
export class Context implements ContextInterface {
	readonly attributes: ContextAttributes;
	readonly auth: Auth;
	readonly branch: ContextInterface['branch'];
	readonly principals: ContextParams['principals'] = [];
	readonly user: User
	readonly repository: ContextInterface['repository'];
	readonly server: Server;

	static runProject<T>({
		callback,
		contextParams,
		project
	}: {
		callback: () => T
		contextParams: ContextParams,
		project: Project
	}): T {
		const {
			attributes = {},
			branch,
			principals = [],
			repository,
			user
		} = contextParams;
		const context = new Context({
			attributes,
			branch,
			principals,
			repository,
			server: project.server,
			user
		});
		const currentConnection = project.connection;
		project.connection = new ContentConnection({
			branch: project.repo.getBranch(context.branch)
		});
		const res = callback();
		project.connection = currentConnection;
		return res;
	}

	constructor({
		branch,
		repository,
		// authInfo,
		attributes = {},
		principals = [],
		server,
		user,
	}: {
		// Required
		branch: ContextInterface['branch']
		repository: ContextInterface['repository']
		server: Server

		// Optional
		attributes?: ContextInterface['attributes']
		principals?: ContextParams['principals']
		user?: ContextParams['user']
	}) {
		this.server = server;
		this.auth = server.auth;

		this.branch = branch;
		this.repository = repository;
		this.attributes = {...attributes};
		this.principals = [...principals];
		if (user?.login) {
			const {
				idProvider = 'system',
				login
			} = user;
			this.user = this.auth.getUserByName({
				idProvider: idProvider || 'system',
				name: login
			});
			if (idProvider === 'system' && login === 'su') {
				this.principals.push('role:system.admin');
			}
			([
				// 'role:system.authenticated',
				'role:system.everyone',
				// TODO What about anonymous?
				this.user.key
			] as PrincipalKey[]).forEach((principalKey) => {
				if (!this.principals.includes(principalKey)) {
					this.principals.push(principalKey);
				}
			});
		}
	} // constructor

	public get(): ContextInterface {
		return {
			attributes: this.attributes,
			authInfo: {
				principals: this.principals,
				user: this.user,
			},
			branch: this.branch,
			repository: this.repository,
		};
	}

} // class Context
