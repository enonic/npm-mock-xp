export class RepositoryNotFoundException extends Error {
	constructor(message: string) {
		super(message);

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, RepositoryNotFoundException);
		}

		this.name = 'com.enonic.xp.repository.RepositoryNotFoundException';
	}
}
