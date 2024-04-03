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
			// loglevel: 'debug'
			loglevel: 'error'
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
			// loglevel: 'debug',
			loglevel: 'error',
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
			// loglevel: 'debug',
			loglevel: 'error',
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

	describe('addResource', () => {
		it('should add a resource to the app', () => {
			const app = new App({
				config: {},
				key: 'com.enonic.myapp',
				version: '1.0.0'
			});
			app.addResource({
				data: "log.info('Hello, world!');",
				path: 'main.js'
			});
			const resource = app.getResource('main.js');
			expect(resource.readText()).toBe("log.info('Hello, world!');");
		});
	}); // describe addResource

	describe('getAsset', () => {
		it('should return an asset', () => {
			const app = new App({
				config: {},
				key: 'com.enonic.myapp',
				version: '1.0.0'
			});
			app.addAsset({
				data: 'Hello, world!',
				path: 'main.txt'
			});
			const asset = app.getAsset('main.txt');
			expect(asset.readText()).toBe('Hello, world!');
		});
	}); // describe getAsset

	describe('getController', () => {
		it('should return a controller', () => {
			const app = new App({
				config: {},
				key: 'com.enonic.myapp',
				version: '1.0.0'
			});
			app.addController({
				data: "exports.get = function() { return 'Hello, world!'; }",
				path: 'main.js'
			});
			const controller = app.getController('main.js');
			expect(controller.readText()).toBe("exports.get = function() { return 'Hello, world!'; }");
		});
	}); // describe getController

}); // describe App
