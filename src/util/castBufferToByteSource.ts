import type {ByteSource} from '@enonic-types/core';


export function castBufferToByteSource(buffer: Buffer): ByteSource {
	return buffer as unknown as ByteSource;
}
