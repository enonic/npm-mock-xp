import {NotFoundException} from '../exception/NotFoundException';


export const NODE_NOT_FOUND_EXCEPTION_NAME = 'com.enonic.xp.node.NodeNotFoundException';


export class NodeNotFoundException extends NotFoundException {
	constructor(message: string) {
		super(message);

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, NodeNotFoundException);
		}

		this.name = NODE_NOT_FOUND_EXCEPTION_NAME;
	}
}
