import { BaseException } from '../exception/BaseException';
import { Branch } from "../Branch";


export const BRANCH_ALREADY_EXIST_EXCEPTION_CODE = 'branchAlreadyExists';
export const BRANCH_ALREADY_EXIST_EXCEPTION_NAME = 'com.enonic.xp.repo.impl.repository.BranchAlreadyExistException';


export class BranchAlreadyExistException extends BaseException {
	branch: Branch;

	constructor(branch: Branch) {
		super(`Branch [${branch.id}] already exists`);
		this.branch = branch;

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, BranchAlreadyExistException);
		}

		this.name = BRANCH_ALREADY_EXIST_EXCEPTION_NAME;
	}

	public getBranch(): Branch {
		return this.branch;
	}

	public getCode(): string {
		return BRANCH_ALREADY_EXIST_EXCEPTION_CODE;
	}
}
