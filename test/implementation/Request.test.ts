import {Request} from '../../src';


describe('Request', () => {
	it('should be instantiable without params', () => {
		const request = new Request();
		expect(request).toBeInstanceOf(Request);
		// console.debug('request.url', request.url);
	});

	[
		'http',
		'https',
	].forEach((scheme) => {
		it(`should be instantiable with just scheme ${scheme}`, () => {
			const request = new Request({
				scheme
			});
			expect(request).toBeInstanceOf(Request);
			// console.debug('request.url', request.url);
		});
	});

	[
		'localhost',
		'127.0.0.1',
		'www.example.com'
	].forEach((host) => {
		it(`should be instantiable with just host ${host}`, () => {
			const request = new Request({
				host
			});
			expect(request).toBeInstanceOf(Request);
			// console.debug('request.url', request.url);
		});
	});

	[
		'http',
		'https',
		'localhost',
		'http://localhost',
		'http://localhost:80',
		'http://localhost:8080',
		'http://localhost/',
		'http://localhost:80/',
	].forEach((url) => {
		it(`should be instantiable with just url ${url}`, () => {
			const request = new Request({
				url
			});
			expect(request).toBeInstanceOf(Request);
			// console.debug('request.url', request.url);
		});
	});

	[
		'localhost?justKey&key=value&sameKey=1&sameKey=2&sameKey=3',
		'localhost?sameKey=1&sameKey=2&sameKey=3&key=value&justKey',
	].forEach((url) => {
		it(`should convert url query to request.params when url ${url}`, () => {
			const request = new Request({
				url
			});
			expect(request).toBeInstanceOf(Request);
			expect(request.path).toBe('');
			expect(request.url).toBe('http://localhost/?justKey=&key=value&sameKey=1,2,3');
			expect(request.params).toStrictEqual({
				justKey: '',
				key: 'value',
				sameKey: ['1', '2', '3'],
			});
		});
	});

	it('should throw when scheme !== url.scheme', () => {
		expect(() => new Request({
			scheme: 'http',
			url: 'https://localhost'
		})).toThrow('scheme !== url.scheme: http !== https');
	});

	it('should throw when host !== url.host', () => {
		expect(() => new Request({
			host: 'localhost',
			url: 'http://www.example.com'
		})).toThrow('host !== url.host: localhost !== www.example.com');
	});

	it('should throw when port !== url.port', () => {
		expect(() => new Request({
			port: 80,
			url: 'http://localhost:8080'
		})).toThrow('port !== url.port: 80 !== 8080');
	});

	it('should throw when path !== url.path', () => {
		expect(() => new Request({
			path: '/path',
			url: 'http://localhost'
		})).toThrow('path !== url.path: /path !== ');
	});

	it('should throw when params !== query', () => {
		expect(() => new Request({
			params: {
				key: 'value'
			},
			url: 'http://localhost?key'
		})).toThrow('params !== query: {"key":"value"} !== {"key":""}');
	});

	describe('project', () => {
		it("should throw when it's unable to determine project, because of missing repositoryId", () => {
			const request = new Request();
			expect(() => request.project()).toThrow('Unable to get project from request without repositoryId!');
		});
	}); // describe project

}); // describe Request
