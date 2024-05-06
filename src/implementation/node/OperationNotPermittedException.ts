import {RuntimeException} from '../exception/RuntimeException';


export const OPERATION_NOT_PERMITTED_EXCEPTION_NAME = 'com.enonic.xp.node.OperationNotPermittedException';


export class OperationNotPermittedException extends RuntimeException {
	constructor(message: string) {
		super(message);

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, OperationNotPermittedException);
		}

		this.name = OPERATION_NOT_PERMITTED_EXCEPTION_NAME;
	}
}
