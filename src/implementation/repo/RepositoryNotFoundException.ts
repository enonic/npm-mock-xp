import { BaseException } from '../exception/BaseException';


export const REPOSITORY_NOT_FOUND_EXCEPTION_CODE = 'repositoryNotFound';
export const REPOSITORY_NOT_FOUND_EXCEPTION_NAME = 'com.enonic.xp.repository.RepositoryNotFoundException';


export class RepositoryNotFoundException extends BaseException {
	constructor(repoId: string) {
		super(`Repository with id [${repoId}] not found`);

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, RepositoryNotFoundException);
		}

		this.name = REPOSITORY_NOT_FOUND_EXCEPTION_NAME;
	}

	public getCode(): string {
		return REPOSITORY_NOT_FOUND_EXCEPTION_CODE;
	}
}
