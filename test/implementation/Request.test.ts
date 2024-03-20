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
		'localhost?justKey&key=value&sameKey=1&sameKey=2',
		'localhost?sameKey=1&sameKey=2&key=value&justKey',
	].forEach((url) => {
		it(`should convert url query to request.params when url ${url}`, () => {
			const request = new Request({
				url
			});
			expect(request).toBeInstanceOf(Request);
			expect(request.path).toBe('');
			expect(request.url).toBe('http://localhost/?justKey=&key=value&sameKey=1,2');
			expect(request.params).toStrictEqual({
				justKey: '',
				key: 'value',
				sameKey: ['1', '2'],
			});
		});
	});
});
