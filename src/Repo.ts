import type {
	BranchConfig,
	Log,
	RepositorySettings
} from './types/index.d'
import type {JavaBridge} from './JavaBridge';


import {lpad} from '@enonic/js-utils/string/lpad';
import {Branch} from './Branch';
import {BranchAlreadyExistException} from './repo/BranchAlreadyExistException';


interface Branches {
	[key: string]: Branch
}


export class Repo {
	//#id: string; // Private identifiers are only available when targeting ECMAScript 2015 and higher.
	private _branches: Branches;
	private _highest_id: number = 1;
	private _id: string;
	private _javaBridge: JavaBridge;
	//rootChildOrder
	//rootPermissions
	private _settings: RepositorySettings;
	readonly log: Log;

	constructor({
		id,
		javaBridge,
		settings = {}
	}: {
		id: string
		javaBridge: JavaBridge
		settings?: RepositorySettings
	}) {
		//console.debug('javaBridge.constructor.name',javaBridge.constructor.name);
		this._id = id;
		this._javaBridge = javaBridge;
		this.log = this._javaBridge.log;
		//this.log.debug('in Repo constructor');
		this._settings = settings;
		this._branches = {
			'master': new Branch({
				branchId: 'master',
				repo: this
			})
		};
	}

	public createBranch(branchId: string): BranchConfig {
		if (this._branches[branchId]) {
			throw new BranchAlreadyExistException(`Branch [{${branchId}}] already exists`);
		}
		this._branches[branchId] = new Branch({
			branchId,
			repo: this
		});
		return { id: branchId };
	}

	//public get id(): string { // jsc.target should be es5 or upper to use getter / setter
	public id(): string {
		return this._id;
	}

	generateId(): string {
		this._highest_id += 1;
		return `00000000-0000-4000-8000-${lpad(this._highest_id,12,'0')}`;
	}

	get() {
		return {
			id: this._id,
			branches: Object.keys(this._branches),
			settings: this._settings
		};
	}

	getBranch(branchId: string): Branch {
		const branchObj = this._branches[branchId];
		if (!branchObj) {
			throw new Error(`getBranch: No branch with branchId:${branchId}`);
		}
		return branchObj;
	}

	//refresh() {}
} // class Repo
