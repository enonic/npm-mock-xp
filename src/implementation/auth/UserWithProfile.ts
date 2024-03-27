import type {
	UserWithProfile as UserWithProfileInterface,
} from '@enonic-types/lib-auth';
import type {UserConstructorParams} from './User';


import {User} from './User';


export declare interface UserWithProfileConstructorParams extends UserConstructorParams {
	profile?: Record<string, unknown>
}


export class UserWithProfile extends User implements UserWithProfileInterface {
	// Extend UserWithProfile
	profile?: Record<string, unknown>;

	constructor({
		// User
		displayName,
		key,
		modifiedTime,
		email,
		idProvider,
		login,
		disabled = false,
		// Extensions
		profile
	}: UserWithProfileConstructorParams) {
		super({
			displayName,
			key,
			modifiedTime,
			email,
			idProvider,
			login,
			disabled
		});
		if (profile) {
			this.profile = profile;
		}
	}
}
