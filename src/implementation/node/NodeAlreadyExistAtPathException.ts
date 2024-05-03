import {RuntimeException} from '../exception/RuntimeException';
import {Branch} from '../Branch';


export const NODE_ALREADY_EXIST_AT_PATH_EXCEPTION_NAME = 'com.enonic.xp.node.NodeAlreadyExistAtPathException';

export declare type NodePath = string;
export declare type RepositoryId = string;


export class NodeAlreadyExistAtPathException extends RuntimeException {
	branch: Branch;
	node: NodePath;
	repositoryId: RepositoryId;

	private static buildMessage(nodePath: NodePath, repositoryId: RepositoryId, branch: Branch): string {
		let message = `Node already exists at path ${nodePath}`;
		if (repositoryId) {
			message += ` repository: ${repositoryId}`;
		}
		if (branch) {
			message += ` branch: ${branch.id}`;
		}
		return message;
	}

	constructor(nodePath: NodePath, repositoryId?: RepositoryId, branch?: Branch) {
		if (arguments.length === 1) { // deprecated
			super(nodePath);
		} else {
			super(NodeAlreadyExistAtPathException.buildMessage( nodePath, repositoryId, branch ));
		}
		this.node = nodePath;
		this.repositoryId = repositoryId;
		this.branch = branch;

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, NodeAlreadyExistAtPathException);
		}

		this.name = NODE_ALREADY_EXIST_AT_PATH_EXCEPTION_NAME;
	}

	public getBranch(): Branch {
		return this.branch;
	}

	public getNode(): NodePath {
		return this.node;
	}

	public getRepositoryId(): RepositoryId {
		return this.repositoryId;
	}

}
