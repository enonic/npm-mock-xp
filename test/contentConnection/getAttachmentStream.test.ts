import type { ByteSource } from '@enonic-types/lib-content';


import {
	describe,
	expect,
	// jest,
	// test
} from '@jest/globals';
import { readFileSync } from 'fs';
import { vol } from 'memfs';
import { join } from 'path';
import { JavaBridge } from '../../src';
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
				describe('getAttachmentStream', () => {
					it('get the attachment stream', () => {
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
						const attachmentStream = contentConnection.getAttachmentStream({
							key: createdMediaContent._id,
							name: filename
						});
						vol.fromJSON({}, '/');
						const filePath = `/${filename}`;
						vol.writeFileSync(filePath, attachmentStream.toString());
						const {
							size
						} = vol.statSync(filePath);
						expect(size).toBe(187348);
					});
				});
			});
		});
	});
});
