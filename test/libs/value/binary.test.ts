import type {ByteSource} from '@enonic-types/core';


import {
	describe,
	expect,
	test as it,
} from '@jest/globals';
import { LibValue } from '../../../src';
import {readFileSync} from 'fs';
import {join} from 'path';
import {BinaryReference} from '../../../src/implementation/util/BinaryReference';


const FILENAME = 'Lea-Seydoux.jpg'
const DATA: ByteSource = readFileSync(join(__dirname, '../..', FILENAME)) as unknown as ByteSource;
const BINARY_NAME = 'binaryName';


describe('LibValue', () => {
	describe('binary()', () => {
		it('should return BinaryAttachment', () => {
			const binaryAttachment = LibValue.binary(BINARY_NAME, DATA);
			const reference = binaryAttachment.getReference();
			const binaryName = reference.toString();
			const hashCode = reference.hashCode();
			expect(binaryName).toBe(BINARY_NAME);
			expect(hashCode).toBe(-880602580);

			const anotherBinaryReferenceWithTheSameValue = BinaryReference.from(BINARY_NAME);
			expect(reference.equals(anotherBinaryReferenceWithTheSameValue)).toBeTruthy();

			expect(binaryAttachment.getByteSource()).toBe(DATA);
		});
	});
});
