import type {Reference as ReferenceInterface} from '@enonic-types/lib-value';


export class Reference implements ReferenceInterface {
	private nodeId: string

	constructor(value: string) {
		this.nodeId = value;
	}

	public getNodeId(): string {
		return this.nodeId;
	}

	public toString(): string {
		return this.nodeId;
	}
}
