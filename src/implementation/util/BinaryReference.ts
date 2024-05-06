import type {BinaryReference as BinaryReferenceInterface} from '@enonic-types/lib-value';


import {JavaString} from '../../java/String';


export class BinaryReference implements BinaryReferenceInterface {
	private value: string;

	public static from(value: string): BinaryReference {
		return new BinaryReference(value);
	}

	constructor(value: string) {
		if (!value) {
			throw new Error('BinaryReference must not be null or empty');
		}
		this.value = value;
	}

	public equals(o: object): boolean {
		return this == o || o instanceof BinaryReference && new JavaString(this.value).equals(o.value);
	}

	public hashCode(): number {
		return new JavaString(this.value).hashCode();
	}

	public toString(): string {
		return this.value;
	}
}
