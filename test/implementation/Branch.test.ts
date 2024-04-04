import {
	Branch,
	Server
} from '../../src';


describe('Branch', () => {
	describe('_createNodeInternal', () => {
		it('should throw when node already exists', () => {
			const server = new Server({loglevel: 'silent'}).createRepo({
				id: 'myrepo'
			}).createNode({
				branchId: 'master',
				node: {
					_name: 'myname',
					_parentPath: '/'
				},
				repoId: 'myrepo'
			});
		});
	}); // describe _createNodeInternal
}); // describe Branch
