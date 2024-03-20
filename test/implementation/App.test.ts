import {
	App,
	Server,
} from '../../src';


describe('App', () => {
	it('should be instantiable', () => {
		expect(new App({
			config: {},
			key: 'com.enonic.myapp',
			version: '1.0.0'
		})).toBeInstanceOf(App);
	});

	it('should be installable on a server', () => {
		const server = new Server({
			loglevel: 'debug'
		});
		const app = new App({
			config: {},
			key: 'com.enonic.myapp',
			version: '1.0.0'
		});
		server.install(app);
		expect(server.applications).toStrictEqual([app]);
	});

	it('should throw if minSystemVersion is higher than server version', () => {
		const server = new Server({
			loglevel: 'debug',
			version: '1.0.0'
		});
		const app = new App({
			config: {},
			key: 'com.enonic.myapp',
			minSystemVersion: '2.0.0',
			version: '1.0.0'
		});
		expect(() => server.install(app)).toThrow();
	});

	it('should throw if maxSystemVersion is lower than server version', () => {
		const server = new Server({
			loglevel: 'debug',
			version: '1.0.0'
		});
		const app = new App({
			config: {},
			key: 'com.enonic.myapp',
			maxSystemVersion: '0.0.1',
			version: '1.0.0'
		});
		expect(() => server.install(app)).toThrow();
	});
});
