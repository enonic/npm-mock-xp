import {
	ResourceKey,
} from '../../../src';


describe('ResourceKey', () => {
	it('should be instantiable', () => {
		const resourceKey = new ResourceKey({
			applicationKey: 'com.enonic.app.myapp',
			path: 'main.js',
		});
		expect(resourceKey).toBeInstanceOf(ResourceKey);
	});

	describe('getApplicationKey', () => {
		it('should return the application key', () => {
			const resourceKey = new ResourceKey({
				applicationKey: 'com.enonic.app.myapp',
				path: 'main.js',
			});
			expect(resourceKey.getApplicationKey()).toBe('com.enonic.app.myapp');
		});
	});

	describe('getPath', () => {
		it('should return the path', () => {
			const resourceKey = new ResourceKey({
				applicationKey: 'com.enonic.app.myapp',
				path: 'main.js',
			});
			expect(resourceKey.getPath()).toBe('main.js');
		});
	});

	describe('getUri', () => {
		it('should return the uri', () => {
			const resourceKey = new ResourceKey({
				applicationKey: 'com.enonic.app.myapp',
				path: 'main.js',
			});
			expect(resourceKey.getUri()).toBe('com.enonic.app.myapp:main.js');
		});
	});

	describe('isRoot', () => {
		it('should return true if the path starts with a slash', () => {
			const resourceKey = new ResourceKey({
				applicationKey: 'com.enonic.app.myapp',
				path: 'main.js',
			});
			expect(resourceKey.isRoot()).toBe(false);

			const resourceKey2 = new ResourceKey({
				applicationKey: 'com.enonic.app.myapp',
				path: '/',
			});
			expect(resourceKey2.isRoot()).toBe(true);
		});
	});

	describe('getName', () => {
		it('should return the name', () => {
			const resourceKey = new ResourceKey({
				applicationKey: 'com.enonic.app.myapp',
				path: 'main.js',
			});
			expect(resourceKey.getName()).toBe('main.js');
		});

		it("should return an emptry string when path is '/'", () => {
			const resourceKey = new ResourceKey({
				applicationKey: 'com.enonic.app.myapp',
				path: '/',
			});
			expect(resourceKey.getName()).toBe('');
		});
	});

	describe('getExtension', () => {
		it('should return the extension', () => {
			const resourceKey = new ResourceKey({
				applicationKey: 'com.enonic.app.myapp',
				path: 'main.js',
			});
			expect(resourceKey.getExtension()).toBe('js');
		});

		it('should return null if there is no extension', () => {
			const resourceKey = new ResourceKey({
				applicationKey: 'com.enonic.app.myapp',
				path: 'main',
			});
			expect(resourceKey.getExtension()).toBe(null);
		});
	});
});
