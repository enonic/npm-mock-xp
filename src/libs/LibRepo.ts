import type {
	BranchResult,
	CreateBranchParams,
	CreateRepositoryParams,
	DeleteBranchParams,
	// GetRepositoryBinaryParams,
	// ModifyRepositoryParams,
	RefreshParams,
	Repository,
} from '@enonic-types/lib-repo';


import {Server} from '../implementation/Server';


export class LibRepo {
	private server: Server;

	constructor({
		server
	}: {
		server: Server
	}) {
		this.server = server;
	}

	public create({
		id,
		// rootChildOrder,
		// rootPermissions,
		settings,
	}: CreateRepositoryParams): Repository {
		this.server.createRepo({
			id,
			// rootChildOrder,
			// rootPermissions,
			settings
		})
		return this.server.getRepo(id).get();
	}

	public createBranch(params: CreateBranchParams): BranchResult {
		const branch = this.server.getRepo(params.repoId).createBranch(params.branchId);
		return {
			id: branch.id
		};
	}

	// TODO public delete(id: string): boolean {

	// }

	public deleteBranch({
		branchId,
		repoId
	}: DeleteBranchParams): BranchResult {
		if (this.server.getRepo(repoId).deleteBranch(branchId)) {
			return {
				id: branchId
			};
		};
	}

	public get(id: string): Repository | null {
		try {
			return this.server.getRepo(id).get();
		} catch (e) {
			this.server.log.debug('Error getting repository', e);
			return null;
		}
	}

	// TODO public getBinary(params: GetRepositoryBinaryParams): object {

	// }

	public list(): Repository[] {
		return Object.keys(this.server.repos).map((id) => this.server.repos[id].get());
	}

	// TODO public modify(params: ModifyRepositoryParams): Repository {

	// }

	public refresh(_params: RefreshParams): void {
		// no-op
	}
} // class LibRepo
