import {Server} from '../../../src';
import {hasMethod} from '../../hasMethod';

const PROJECT_NAME = 'myproject';
const server = new Server().createProject({
	projectName: PROJECT_NAME,
});


describe('mock', () => {
	describe('Server', () => {
		describe('contentConnect', () => {
			describe('throws', () => {
				it("when repo doesn't exist", () => {
					const fn = () => server.contentConnect({
						branchId: 'master',
						projectId: 'default'
					});
					expect(fn).toThrow('Repository with id [com.enonic.cms.default] not found');
				});
			});

			describe('connects', () => {
				it('returns an object which has a get method', () => {
					const connection = server.contentConnect({
						branchId: 'master',
						projectId: PROJECT_NAME
					});
					expect(hasMethod(connection, 'get')).toBe(true);
				});
			});
		});
	});
});
