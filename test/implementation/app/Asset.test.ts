import {
	App,
	Asset,
} from '../../../src';


const app = new App({
	key: 'com.enonic.app.myapp',
});

describe('Asset', () => {
	it('should be instantiable', () => {
		const asset = new Asset({
			app,
			path: 'Lea-Seydoux.jpg',
		});
		expect(asset).toBeInstanceOf(Asset);
		expect(asset.path).toBe('/assets/Lea-Seydoux.jpg');
	});
});
