import {
	describe,
	expect,
	jest,
	test
} from '@jest/globals';
import {JavaBridge} from '../../src/JavaBridge';
import Log from '../../src/Log';


function hasMethod(obj: unknown, name: string) {
	// TODO check if obj is Object?
	return typeof obj[name] === 'function';
}


const log = Log.createLogger({
	loglevel: 'silent'
});


describe('mock', () => {
	describe('JavaBridge', () => {
		describe('contentConnect', () => {
			describe('throws', () => {
				it("when repo doesn't exist", () => {
					const javaBridge = new JavaBridge({
						app: {
							config: {},
							name: 'com.enonic.app.test',
							version: '0.0.1-SNAPSHOT'
						},
						log
					});
					const fn = () => javaBridge.contentConnect({
						branch: 'master',
						project: 'default'
					});
					expect(fn).toThrow('contentConnect: No repo with id:com.enonic.cms.default!');
				});
			});

			describe('connects', () => {
				const javaBridge = new JavaBridge({
					app: {
						config: {},
						name: 'com.enonic.app.test',
						version: '0.0.1-SNAPSHOT'
					}
				});
				javaBridge.repo.create({
					id: 'com.enonic.cms.default'
				});
				it('returns an object which has a get method', () => {
					const connection = javaBridge.contentConnect({
						branch: 'master',
						project: 'default'
					});
					expect(hasMethod(connection, 'get')).toBe(true);
				});
			});
		});
	});
});
