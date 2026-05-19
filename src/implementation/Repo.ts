import type {Repository} from '@enonic-types/lib-repo';
import type {Log} from '../types'
import type {Server} from './Server';


import {lpad} from '@enonic/js-utils/string/lpad';
import {Branch} from './Branch';
import {BranchAlreadyExistException} from './repo/BranchAlreadyExistException';
import {BranchNotFoundException} from './repo/BranchNotFoundException';


interface Branches {
	[key: string]: Branch
}

export interface Repos {
	[key: string]: Repo
}

export class Repo {
	private _highest_id: number = 1; // root node uses 0 and it's versionKey uses 1
	// #id: string; // Private identifiers are only available when targeting ECMAScript 2015 and higher.
	readonly branches: Branches;
	readonly id: string;
	readonly server: Server;
	readonly transient: boolean;
	readonly log: Log;

	constructor({
		id,
		server,
		transient = false,
	}: {
		id: string
		server: Server
		transient?: boolean
	}) {
		this.id = id;
		this.server = server;
		this.log = this.server.log;
		this.transient = transient;
		this.branches = {
			'master': new Branch({
				branchId: 'master',
				repo: this
			})
		};
	}

	public createBranch(branchId: string): Branch {
		if (this.branches[branchId]) {
			throw new BranchAlreadyExistException(this.branches[branchId]);
		}
		this.branches[branchId] = new Branch({
			branchId,
			repo: this
		});
		//return { id: branchId };
		return this.branches[branchId]
	}

	public deleteBranch(branchId: string): true {
		if (!this.branches[branchId]) {
			throw new BranchNotFoundException(branchId);
		}
		delete this.branches[branchId];
		return true;
	}

	// public get id(): string { // jsc.target should be es5 or upper to use getter / setter
	// public id(): string {
	// 	return this.id;
	// }

	generateId(): string {
		this._highest_id += 1;
		return `00000000-0000-4000-8000-${lpad(this._highest_id,12,'0')}`;
	}

	get(): Repository {
		return {
			id: this.id,
			branches: Object.keys(this.branches),
			transient: this.transient,
		};
	}

	getBranch(branchId: string): Branch {
		const branchObj = this.branches[branchId];
		if (!branchObj) {
			throw new Error(`getBranch: No branch with branchId:${branchId}`);
		}
		return branchObj;
	}

	// TODO refresh() {}

} // class Repo
