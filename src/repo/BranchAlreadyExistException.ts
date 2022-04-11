export class BranchAlreadyExistException extends Error {
	constructor(message: string) {
		super(message);

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, BranchAlreadyExistException);
		}

		this.name = 'com.enonic.xp.repo.impl.repository.BranchAlreadyExistException';
	}
}
