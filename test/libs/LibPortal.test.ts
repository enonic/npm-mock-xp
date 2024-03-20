import type {ByteSource} from '@enonic-types/core';


import {readFileSync } from 'fs';
import {join} from 'path';
import {
	App,
	LibPortal,
	Project,
	Request,
	Server,
} from '../../src';



const app = new App({
	key: 'com.example.myapp'
});

const project = new Project({
	projectName: 'myproject',
	server: new Server()
});

const portal = new LibPortal({
	app,
	project
});


describe('Portal', () => {
	it('should be instantiable', () => {
		expect(portal).toBeInstanceOf(LibPortal);
	});


	describe('assetUrl', () => {
		it('should throw if no request is set', () => {
			expect(() => portal.assetUrl({path: '/'})).toThrow('mock-xp: Portal.assetUrl(): No request set on the Portal object instance!');
		});

		it('should return an asset URL', () => {
			portal.request = new Request({path: '/what/ever/'});
			expect(portal.assetUrl({path: '/images/asset.png'}))
				.toBe('/what/ever/_/asset/com.example.myapp:0123456789abcdef/images/asset.png');
		});

		it('should return an asset URL', () => {
			portal.request = new Request({path: '/'});
			expect(portal.assetUrl({
				path: '/images/asset.png',
				type: 'absolute'
			}))
				.toBe('http://localhost/_/asset/com.example.myapp:0123456789abcdef/images/asset.png');
		});
	}); // describe assetUrl


	describe('getContent', () => {
		it('should throw if no request is set', () => {
			portal.request = undefined;
			expect(() => portal.getContent()).toThrow('mock-xp: Portal.getContent(): Unable to determine current contentId as there is no request set on the Portal object instance!');
		});

		it('should return null if no content is found', () => {
			portal.request = new Request({path: '/non-existent'});
			expect(portal.getContent()).toBe(null);
		});

		it('should return root content', () => {
			portal.request = new Request({path: '/'});
			expect(portal.getContent()).toStrictEqual({
				_id: '00000000-0000-4000-8000-000000000002',
				_name: 'content',
				_path: '',
				attachments: {},
				childOrder: 'displayname ASC',
				createdTime: undefined,
				creator: undefined,
				data: undefined,
				displayName: 'Content',
				hasChildren: true,
				owner: undefined,
				publish: {},
				type: 'base:folder',
				valid: false,
				x: {},
			});
		});

		it('should return content if found', () => {
			const content = portal.project.connection.create({
				contentType: 'com.enonic.myapp:mycontent',
				data: {
					key: 'value'
				},
				name: 'mycontent',
				parentPath: '/',
			});
			portal.request = new Request({path: '/mycontent'});;
			expect(portal.getContent()).toStrictEqual(content);
		});
	}); // describe getContent

	describe('imageUrl', () => {
		it('should throw if no key is set', () => {
			expect(() => portal.imageUrl({
				id: '123',
				scale: 'width(500)'
			})).toThrow('lib-portal.imageUrl(): No imageContent with key:123');
		});

		it('should return an image URL', () => {
			const content = portal.project.connection.createMedia({
				data: readFileSync(join(__dirname, 'Lea-Seydoux.jpg')) as unknown as ByteSource,
				name: 'Lea-Seydoux.jpg',
				parentPath: '/',
				mimeType: 'image/jpeg',
				focalX: 0.5,
				focalY: 0.5,
			});
			expect(portal.imageUrl({
				id: content._id,
				scale: 'width(500)'
			})).toBe('/mycontent/_/image/00000000-0000-4000-8000-000000000006:0123456789abcdef/width-500/Lea-Seydoux.jpg');
		});
	}); // describe imageUrl

}); // describe Portal
