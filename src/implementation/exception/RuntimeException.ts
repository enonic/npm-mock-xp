export const RUNTIME_EXCEPTION_NAME = 'java.lang.RuntimeException';


export class RuntimeException extends Error {
	constructor(message?: string) {
		super(message || 'An unexpected error occurred.');

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, RuntimeException);
		}

		this.name = RUNTIME_EXCEPTION_NAME;
	}
}
