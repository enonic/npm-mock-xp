import type { ByteSource } from '@enonic-types/lib-content';


import {
	createReadStream,
	readFileSync
} from 'fs';
import { join } from 'path';
import {Server} from '../../../src';
import {THUR_BYTE_SIZE} from '../../constants';


const server = new Server({
	loglevel: 'silent'
});


describe('mock', () => {
	describe('Server', () => {
		server.createRepo({
			id: 'com.enonic.cms.default'
		});
		describe('contentConnect', () => {
			const contentConnection = server.contentConnect({
				branchId: 'master',
				projectId: 'default'
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
										byteSize: THUR_BYTE_SIZE,
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
