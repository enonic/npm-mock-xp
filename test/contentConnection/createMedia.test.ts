import type { ByteSource } from '@enonic-types/lib-content';


import {
	describe,
	expect,
	// jest,
	// test
} from '@jest/globals';
import {
	createReadStream,
	readFileSync
} from 'fs';
import { join } from 'path';
import {JavaBridge} from '../../src';
import Log from '../../src/Log';


const APP_NAME = 'com.enonic.app.test';


const log = Log.createLogger({
	loglevel: 'silent'
});

describe('mock', () => {
	describe('JavaBridge', () => {
		const javaBridge = new JavaBridge({
			app: {
				config: {},
				name: APP_NAME,
				version: '0.0.1-SNAPSHOT'
			},
			log
		});
		javaBridge.repo.create({
			id: 'com.enonic.cms.default'
		});
		describe('contentConnect', () => {
			const contentConnection = javaBridge.contentConnect({
				branch: 'master',
				project: 'default'
			});
			describe('contentConnection', () => {
				describe('createMedia', () => {
					it('creates media content', () => {
						const filename = 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg.webp';
						const fileBuffer = readFileSync(join(__dirname, filename));
						const createdMediaContent = contentConnection.createMedia({
							data: fileBuffer as unknown as ByteSource,
							focalX: 0.5,
							focalY: 0.5,
							mimeType: 'text/plain',
							name: filename,
							parentPath: '/',
						});
						// log.debug('createdMediaContent:%s', createdMediaContent);
						expect(createdMediaContent).toStrictEqual({
							_id: createdMediaContent._id,
							_name: filename,
							_path: `/${filename}`,
							attachments: {},
							childOrder: 'displayname ASC',
							creator: 'user:system:su',
							createdTime: createdMediaContent.createdTime,
							data: {
								artist: '',
								caption: '',
								copyright: '',
								media: {
									attachment: filename,
									focalPoint: {
										x: 0.5,
										y: 0.5
									}
								},
								tags: ''
							},
							displayName: 'Thuringia_Schmalkalden_asv2020-07_img18_Schloss_Wilhelmsburg.jpg',
							hasChildren: true,
							owner: 'user:system:su',
							publish: {},
							type: 'media:image',
							valid: true,
							x: {
								media: {
									imageInfo: {
										byteSize: 187348,
										contentType: 'text/plain',
										imageHeight: 600,
										imageWidth: 480,
										pixelSize: 288000
									}
								}
							}
						});
					});
				});
			});
		});
	});
});
