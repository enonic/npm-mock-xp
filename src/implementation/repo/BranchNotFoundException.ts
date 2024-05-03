import { BaseException } from '../exception/BaseException';


export const BRANCH_NOT_FOUND_EXCEPTION_CODE = 'branchNotFound';
export const BRANCH_NOT_FOUND_EXCEPTION_NAME = 'com.enonic.xp.repository.BranchNotFoundException'


export class BranchNotFoundException extends BaseException {
	constructor(branchName: string) {
		super(`Branch with id [${branchName}] not found`);

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, BranchNotFoundException);
		}

		this.name = BRANCH_NOT_FOUND_EXCEPTION_NAME;
	}

	public getCode(): string {
		return BRANCH_NOT_FOUND_EXCEPTION_CODE;
	}
}
