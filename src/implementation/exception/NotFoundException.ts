import {BaseException} from './BaseException';


export const NOT_FOUND_EXCEPTION_NAME = 'com.enonic.xp.exception.NotFoundException';


export class NotFoundException extends BaseException {
	constructor(message: string) {
		super(message);

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, NotFoundException);
		}

		this.name = NOT_FOUND_EXCEPTION_NAME;
	}
}
