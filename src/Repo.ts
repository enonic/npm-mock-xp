import type {Log} from './globals.d'
import type {
	BranchConfig,
	RepositorySettings
} from './repo/index.d';
import type {JavaBridge} from './JavaBridge';

import {Branch} from './Branch';
import {BranchAlreadyExistException} from './repo/BranchAlreadyExistException';


interface Branches {
	[key :string] :Branch
}


export class Repo {
	//#id :string; // Private identifiers are only available when targeting ECMAScript 2015 and higher.
	private _id :string;

	private _branches :Branches;
	private _javaBridge :JavaBridge;
	//rootChildOrder
	//rootPermissions
	private _settings :RepositorySettings;
	readonly log :Log;

	constructor({
		id,
		javaBridge,
		settings = {}
	} :{
		id :string
		javaBridge :JavaBridge
		settings? :RepositorySettings
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

	public createBranch(branchId :string) :BranchConfig {
		if (this._branches[branchId]) {
			throw new BranchAlreadyExistException(`Branch [{${branchId}}] already exists`);
		}
		this._branches[branchId] = new Branch({
			branchId,
			repo: this
		});
		return { id: branchId };
	}

	//public get id() :string { // jsc.target should be es5 or upper to use getter / setter
	public id() :string {
		return this._id;
	}

	get() {
		return {
			id: this._id,
			branches: Object.keys(this._branches),
			settings: this._settings
		};
	}

	getBranch(branchId :string) :Branch {
		const branchObj = this._branches[branchId];
		if (!branchObj) {
			throw new Error(`getBranch: No branch with branchId:${branchId}`);
		}
		return branchObj;
	}
} // class Repo
