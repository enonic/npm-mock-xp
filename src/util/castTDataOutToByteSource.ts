import type {ByteSource} from '@enonic-types/core';


type TDataOut = string | Buffer;

export function castTDataOutToByteSource(buffer: TDataOut): ByteSource {
	return buffer as unknown as ByteSource;
}
