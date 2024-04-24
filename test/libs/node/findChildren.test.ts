import type {
	RepoConnection,
} from '@enonic-types/lib-node';


import {
	LibNode,
	Server,
} from '../../../src';


let server: Server;
let libNode: LibNode;
let connection: RepoConnection;


beforeAll(done => {
	server = new Server({
		// loglevel: 'debug',
		loglevel: 'info',
		// loglevel: 'silent',
	});
	libNode = new LibNode({
		server
	});
	connection = libNode.connect({
		branch: 'master',
		repoId: 'system-repo'
	});
	done();
});


describe('findChildren', () => {
	it('returns empty array when no children', () => {
		expect(connection.findChildren({
			count: -1,
			parentKey: '/'
		})).toEqual({
			count: 1,
			hits: [{
				id: '00000000-0000-4000-8000-000000000002'
			}],
			total: 1,
		});
		// server.log.info('childNode:%s', connection.get('00000000-0000-4000-8000-000000000002'));
	});
});
