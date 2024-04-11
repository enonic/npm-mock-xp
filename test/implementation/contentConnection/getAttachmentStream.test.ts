import type { ByteSource } from '@enonic-types/lib-content';



import { readFileSync } from 'fs';
import { vol } from 'memfs';
import { join } from 'path';
import {Server} from '../../../src';
import {THUR_BYTE_SIZE} from '../../constants';


const APP_NAME = 'com.enonic.app.test';


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
						expect(size).toBe(THUR_BYTE_SIZE);
					});
				});
			});
		});
	});
});
