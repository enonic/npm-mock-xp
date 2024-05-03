import { RuntimeException } from './RuntimeException';


export const BASE_EXCEPTION_NAME = 'com.enonic.xp.exception.BaseException';


export class BaseException extends RuntimeException {
	constructor(message?: string) {
		super(message || 'An unexpected error occurred.');

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, BaseException);
		}

		this.name = BASE_EXCEPTION_NAME;
	}
}
