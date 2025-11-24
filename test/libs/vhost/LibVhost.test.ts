import {
	LibVhost,
	Server,
	VirtualHost,
} from '../../../src';

let server: Server, libVhost: LibVhost;

describe('LibVhost', () => {

	beforeAll(done => {
		server = new Server({
			// loglevel: 'debug'
			// loglevel: 'error'
			loglevel: 'silent'
		});

		libVhost = new LibVhost({
			server
		});
		done();
	}); // beforeAll

	describe('isEnabled', () => {
		it('is false by default', () => {
			expect(libVhost.isEnabled()).toBe(false);
		});
		it('is true when enabled', () => {
			server.vhost.isEnabled = true;
			expect(libVhost.isEnabled()).toBe(true);
		});
	});

	describe('list', () => {
		it('is empty by default', () => {
			expect(libVhost.list()).toStrictEqual({ vhosts: [] });
		});
		it('reflects the added vhosts', () => {
			const v1 = new VirtualHost({
				name: 'admin',
				source: '/admin',
				target: '/admin',
			});
			server.vhost.add(v1);
			expect(libVhost.list()).toStrictEqual({ vhosts: [v1] });
			server.vhost.isEnabled = true; // TODO: In real Enonic, does this matter?
			expect(libVhost.list()).toStrictEqual({ vhosts: [v1] });
			const v2 = new VirtualHost({
				name: 'site',
				source: '/siteName',
				target: '/site/projectName/master/siteName',
			});
			server.vhost.add(v2);
			expect(libVhost.list()).toStrictEqual({ vhosts: [ v1, v2 ] });
		});
	});
});
