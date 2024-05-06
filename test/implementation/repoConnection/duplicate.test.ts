import {
	describe,
	expect,
	test as it,
} from '@jest/globals';
import {
	NodeAlreadyExistAtPathException,
	OperationNotPermittedException,
	Server
} from '../../../src';
import { UUID_NIL } from '../../../src/constants';


const server = new Server({
	// loglevel: 'debug',
	loglevel: 'silent'
});

const systemRepoMasterBranch = server.getBranch({
	branchId: 'master',
	repoId: 'system-repo'
});

const identityNode = server.systemRepoConnection.get('/identity');
// server.log.debug('identityNode:%s', identityNode);

const identityNodeId = identityNode['_id'];
// server.log.debug('identityNodeId:%s', identityNodeId);


describe('RepoConnection()', () => {
	describe('duplicate()', () => {
		it('should throw an Error if nodeId is UUID_NIL', () => {
			expect(() => server.systemRepoConnection.duplicate({
				nodeId: UUID_NIL,
			})).toThrowError(new OperationNotPermittedException('Not allowed to duplicate root-node'));
		}); // it

		it('should throw NodeAlreadyExistAtPathException if name is passed and target exists', () => {
			expect(() => server.systemRepoConnection.duplicate({
				nodeId: identityNodeId,
				name: 'identity'
			})).toThrowError(new NodeAlreadyExistAtPathException('/identity', 'system-repo', systemRepoMasterBranch));
		}); // it

		it('should make a copy with ending with -copy (if there are no previous copies)', () => {
			const dup = server.systemRepoConnection.duplicate({
				nodeId: identityNodeId,
			});
			expect(dup._name).toBe('identity-copy');
			expect(dup._path).toBe('/identity-copy');
		}); // it

		it('should make a copy with ending with -copy-2 (if there is one previous copy)', () => {
			const dup = server.systemRepoConnection.duplicate({
				nodeId: identityNodeId,
			});
			expect(dup._name).toBe('identity-copy-2');
			expect(dup._path).toBe('/identity-copy-2');
		}); // it

		it('should make a copy with ending with -copy-3 (if there are two previous copies)', () => {
			const dup = server.systemRepoConnection.duplicate({
				nodeId: identityNodeId,
			});
			// server.log.debug('dup:%s', dup);
			expect(dup._name).toBe('identity-copy-3');
			expect(dup._path).toBe('/identity-copy-3');
		}); // it

		it('should make a copy under parent', () => {
			const dup = server.systemRepoConnection.duplicate({
				nodeId: identityNodeId,
				parent: '/identity',
			});
			expect(dup._name).toBe('identity');
			expect(dup._path).toBe('/identity/identity');
		}); // it

		it('should throw NodeAlreadyExistAtPathException if parent is passed and target exists', () => {
			expect(() => server.systemRepoConnection.duplicate({
				nodeId: identityNodeId,
				parent: '/identity',
			})).toThrowError(new NodeAlreadyExistAtPathException('/identity/identity', 'system-repo', systemRepoMasterBranch));
		}); // it

		it('should throw NodeAlreadyExistAtPathException if parent and name is passed and target exists', () => {
			expect(() => server.systemRepoConnection.duplicate({
				name: 'identity',
				nodeId: identityNodeId,
				parent: '/identity',
			})).toThrowError(new NodeAlreadyExistAtPathException('/identity/identity', 'system-repo', systemRepoMasterBranch));
		}); // it

		it('should make a copy with ending with -copy-3 (if there are two previous copies)', () => {
			const dup = server.systemRepoConnection.duplicate({
				dataProcessor: (data) => {
					data._id = 'should-be-ignored';
					data._name = 'should-be-ignored';
					data._path = '/should-be-ignored';
					data._ts = 'should-be-ignored';
					data._versionKey = 'should-be-ignored';
					data.k = 'value';
					return data;
				},
				nodeId: identityNodeId,
			});
			// server.log.debug('dup:%s', dup);
			expect(dup._id).not.toBe('should-be-ignored');
			expect(dup._name).toBe('identity-copy-4');
			expect(dup._path).toBe('/identity-copy-4');
			expect(dup._ts).not.toBe('should-be-ignored');
			expect(dup._versionKey).not.toBe('should-be-ignored');
			expect(dup.k).toBe('value');
		}); // it

		it('should call refresh', () => {
			const dup = server.systemRepoConnection.duplicate({
				refresh: 'ALL',
				nodeId: identityNodeId,
			});
			expect(dup._name).toBe('identity-copy-5');
			expect(dup._path).toBe('/identity-copy-5');
			// TODO check if refresh was called
		}); // it

	}); // describe setRootPermission()
}); // describe RepoConnection()
