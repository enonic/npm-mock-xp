import type {TDataOut} from 'memfs/lib/encoding';
import type {ByteSource} from '@enonic-types/core';


export function castTDataOutToByteSource(buffer: TDataOut): ByteSource {
	return buffer as unknown as ByteSource;
}
