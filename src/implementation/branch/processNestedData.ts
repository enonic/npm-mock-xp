import {isBoolean} from '@enonic/js-utils/value/isBoolean';
import {isNumber} from '@enonic/js-utils/value/isNumber';
import {isObject} from '@enonic/js-utils/value/isObject';
import {isString} from '@enonic/js-utils/value/isString';
import {sha512} from 'node-forge';
import {BinaryAttachment} from '../util/BinaryAttachment';
import {Branch} from '../Branch';


export function processNestedData({
	branch,
	data,
	foundBinaryReferenceNames = [], // Gets modified by this function
	nodeId
}: {
	branch: Branch,
	data: any
	foundBinaryReferenceNames?: string[],
	nodeId: string
}) {
	if (isString(data) || isNumber(data) || isBoolean(data)) {
		return data;
	}

	if (data instanceof BinaryAttachment) {
		const binaryReference = data.getReference();
		if (!branch.binaryReferences[nodeId]) {
			branch.binaryReferences[nodeId] = {};
		}
		const binaryReferenceName = binaryReference.toString();
		// branch.log.debug('binaryReferenceName: %s', binaryReferenceName);
		foundBinaryReferenceNames.push(binaryReferenceName);

		const byteSource = data.getByteSource();
		const byteSourceAsString = byteSource.toString();
		const sha512HexDigest = sha512.create().update(byteSourceAsString).digest().toHex();
		// branch.log.debug('sha512HexDigest: %s', sha512HexDigest);

		const prevSha512 = branch.binaryReferences[nodeId][binaryReferenceName]
		// branch.log.debug('prevSha512: %s', prevSha512);
		if (sha512HexDigest !== prevSha512) {
			if (prevSha512) {
				branch.log.debug(
					'%s:%s:%s Binary reference: %s now points to a new binary previous: %s new: %s',
					branch.repo.id, branch.id, nodeId,
					binaryReferenceName, prevSha512, sha512HexDigest
				);
			}
			branch.binaryReferences[nodeId][binaryReferenceName] = sha512HexDigest;
			const filePath = `/${sha512HexDigest}`;
			// TODO Log a warning if file already exists?
			branch.repo.server.vol.writeFileSync(filePath, byteSourceAsString);
		}
		return binaryReferenceName;
	}

	if (Array.isArray(data)) {
		// branch.log.debug('processNestedData() array	: %s', data);
		return data.map((item) => processNestedData({
			branch,
			data: item,
			foundBinaryReferenceNames,
			nodeId
		}));
	}

	if (isObject(data)) {
		// branch.log.debug('processNestedData() object: %s', data);
		return Object.entries(data).reduce((acc, [key, value]) => {
			acc[key] = processNestedData({
				branch,
				data: value,
				foundBinaryReferenceNames,
				nodeId
			});
			return acc;
		}, {});
	}

	// branch.log.debug('processNestedData() date,null,undefined,NaN,symbol,BigInt,function,etc: %s', data);
	return data;
}
