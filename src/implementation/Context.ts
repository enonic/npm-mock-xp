import type {
	Context as ContextInterface,
	ContextAttributes,
	ContextParams,
	PrincipalKey,
} from '@enonic-types/lib-context';
import type {Auth} from './Auth';
import type {Server} from './Server';
import type {User} from './User';


import {
	ROLE_SYSTEM_ADMIN,
	USER_SYSTEM_ANONYMOUS,
	ROLE_SYSTEM_EVERYONE,
} from '../constants';


// Needs access to SystemRepo to get user and principals
export class Context implements ContextInterface {
	readonly attributes: ContextAttributes;
	readonly auth: Auth;
	readonly branch: ContextInterface['branch'];
	readonly repository: ContextInterface['repository'];
	readonly server: Server;

	public principals: ContextParams['principals'] = [];
	public user: User // Can be different than the logged in user

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
		branch?: ContextInterface['branch']
		repository?: ContextInterface['repository']
		server: Server

		// Optional
		attributes?: ContextInterface['attributes']
		principals?: ContextParams['principals']
		user?: ContextParams['user']
	}) {
		if (repository.startsWith('com.enonic.cms.') && !['draft', 'master'].includes(branch)) {
			throw new Error(`Invalid branch: ${branch} for repository: ${repository}!`);
		}
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
				this.addPrincipal(ROLE_SYSTEM_ADMIN);
			}
			([
				// ROLE_SYSTEM_AUTHENTICATED,
				ROLE_SYSTEM_EVERYONE,
				this.user.key
			] as PrincipalKey[]).forEach((principalKey) => {
				this.addPrincipal(principalKey);
			});
		} else {
			this.addPrincipal(USER_SYSTEM_ANONYMOUS);
		}
	} // constructor

	public addPrincipal(principal: PrincipalKey) {
		if (!this.principals.includes(principal)) {
			this.principals.push(principal);
		}
		return this;
	}

	public get(): ContextInterface {
		return {
			attributes: this.attributes,
			authInfo: {
				principals: this.principals,
				user: this.user || null,
			},
			branch: this.branch,
			repository: this.repository,
		};
	}

	// public setPrincipals(principals: PrincipalKey[]) {
	// 	this.principals = principals;
	// 	return this;
	// }

	// public setUser(user: User) {
	// 	this.user = user;
	// 	return this;
	// }

} // class Context
