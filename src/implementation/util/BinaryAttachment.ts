import type {
	ByteSource,
	BinaryAttachment as BinaryAttachmentInterface,
} from '@enonic-types/lib-value';


import {BinaryReference} from './BinaryReference';


export class BinaryAttachment implements BinaryAttachmentInterface {
	private byteSource: ByteSource;
	private reference: BinaryReference;

	constructor(reference: string, byteSource: ByteSource) {
		this.reference = new BinaryReference(reference);
		this.byteSource = byteSource;
	}

	public getReference(): BinaryReference {
		return this.reference;
	}

	public getByteSource(): ByteSource {
		return this.byteSource;
	}
}
