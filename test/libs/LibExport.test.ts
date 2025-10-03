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
		it(`sandboxName: ${SANDBOX_NAME}`, () => {
			const libExport = new LibExport({
				sandboxName: 'mysandbox',
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
