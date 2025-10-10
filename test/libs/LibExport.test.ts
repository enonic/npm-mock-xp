import {
	LibExport,
	Server
} from '../../src';


const SANDBOX_NAME = 'mysandbox';


let server;


describe('LibExport', () => {

	beforeAll(done => {
		server = new Server({
			// loglevel: 'debug'
			// loglevel: 'error'
			loglevel: 'silent'
		});
		done();
	}); // beforeAll

	describe('constructor', () => {
		// This test must be skipped since it depends on a local sandbox.
		it.skip(`sandboxName: ${SANDBOX_NAME}`, () => {
			const libExport = new LibExport({
				sandboxName: SANDBOX_NAME,
				server
			});
			expect(libExport).toBeDefined();
			expect(libExport).toBeInstanceOf(LibExport);
		});

		it('sandboxName: non-existant', () => {
			function fn() {
				return new LibExport({
					sandboxName: 'non-existant',
					server
				});
			}
			expect(fn).toThrow(/LibExport constructor: Sandbox not found at/);
		});
	});
});
