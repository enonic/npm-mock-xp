import type {ByteSource} from '@enonic-types/core';


import {readFileSync } from 'fs';
import {join} from 'path';
import {vol} from 'memfs';
import {
	ContentConnection,
	Server,
} from '../../src';


const REPO_ID = 'com.enonic.myapp';
const FILENAME = 'Lea-Seydoux.jpg'
const DATA: ByteSource = readFileSync(join(__dirname, '..', FILENAME)) as unknown as ByteSource;

const server = new Server();
server.repo.create({id: REPO_ID});
server.repo.createBranch({
	branchId: 'draft',
	repoId: REPO_ID
});


describe('ContentConnection', () => {
	it('should be instantiable', () => {
		const connection = new ContentConnection({
			branch: server.repos[REPO_ID].getBranch('draft')
		});
		expect(connection).toBeInstanceOf(ContentConnection);
	});

	it('should be able to create, exists, get, modify, move, publish and delete content', () => {
		const connection = new ContentConnection({
			branch: server.repos[REPO_ID].getBranch('draft')
		});
		const content = connection.create({
			contentType: 'com.enonic.myapp:mycontent',
			data: {
				key: 'value'
			},
			name: 'mycontent',
			parentPath: '/',
		});
		expect(content).toStrictEqual({
			_id: '00000000-0000-4000-8000-000000000004',
			_name: 'mycontent',
			_path: '/mycontent',
			attachments: {},
			childOrder: undefined,
			createdTime: expect.any(String) as unknown as string,
			creator: 'user:system:su',
			data: {
				key: 'value'
			},
			displayName: 'mycontent',
			hasChildren: true,
			owner: 'user:system:su',
			publish: {},
			type: 'com.enonic.myapp:mycontent',
			valid: true,
			x: {}
		});

		expect(connection.exists({ key: content._id })).toBe(true);

		expect(connection.get({ key: content._id })).toStrictEqual(content);

		const modRes = connection.modify({
			key: content._id,
			editor: (content) => {
				content.data.key = 'modified';
				return content;
			}
		});
		expect(modRes).toStrictEqual({
			_id: '00000000-0000-4000-8000-000000000004',
			_name: 'mycontent',
			_path: '/mycontent',
			attachments: {},
			childOrder: undefined,
			createdTime: expect.any(String) as unknown as string,
			creator: 'user:system:su',
			data: {
				key: 'modified'
			},
			displayName: 'mycontent',
			hasChildren: true,
			modifiedTime: expect.any(String) as unknown as string,
			modifier: 'user:system:su',
			owner: 'user:system:su',
			publish: {},
			type: 'com.enonic.myapp:mycontent',
			valid: true,
			x: {}
		});

		const moveRes = connection.move({
			source: content._id,
			target: '/renamedMyContent'
		});
		expect(moveRes).toStrictEqual({
			_id: '00000000-0000-4000-8000-000000000004',
			_name: 'renamedMyContent',
			_path: '/renamedMyContent',
			attachments: {},
			childOrder: undefined,
			createdTime: expect.any(String) as unknown as string,
			creator: 'user:system:su',
			data: {
				key: 'modified'
			},
			displayName: 'mycontent',
			hasChildren: true,
			modifiedTime: expect.any(String) as unknown as string,
			modifier: 'user:system:su',
			owner: 'user:system:su',
			publish: {},
			type: 'com.enonic.myapp:mycontent',
			valid: true,
			x: {}
		});

		const publishRes = connection.publish({
			keys: [content._id]
		});
		expect(publishRes).toStrictEqual({
			deletedContents: [],
			failedContents: [],
			pushedContents: [
				'00000000-0000-4000-8000-000000000004',
			],
		});

		const deleteRes = connection.delete({ key: content._id });
		expect(deleteRes).toBe(true);

		expect(connection.exists({ key: content._id })).toBe(false);
		expect(connection.get({ key: content._id })).toBe(null);
	});

	it('should be able to createMedia and getAttachmentStream', () => {
		const connection = new ContentConnection({
			branch: server.repos[REPO_ID].getBranch('draft')
		});
		const mediaContent = connection.createMedia({
			data: DATA,
					name: FILENAME,
					parentPath: '/',
					mimeType: 'image/jpeg',
					focalX: 0.5,
					focalY: 0.5,
		});
		expect(mediaContent).toStrictEqual({
			_id: '00000000-0000-4000-8000-000000000010',
			_name: FILENAME,
			_path: `/${FILENAME}`,
			attachments: {},
			childOrder: 'displayname ASC',
			createdTime: expect.any(String) as unknown as string,
			creator: 'user:system:su',
			data: {
				artist: "",
				caption: "",
				copyright: "",
				media: {
				attachment: FILENAME,
				focalPoint: {
					x: 0.5,
					y: 0.5,
				},
				},
				tags: "",
			},
			displayName: 'Lea-Seydoux',
			hasChildren: true,
			owner: 'user:system:su',
			publish: {},
			type: 'media:image',
			valid: true,
			x: {
				media: {
					imageInfo: {
						byteSize: 528238,
						contentType: 'image/jpeg',
						imageHeight: 1080,
						imageWidth: 1920,
						pixelSize: 2073600,
					},
				},
			},
		}); // expect mediaContent

		const attachmentStream = connection.getAttachmentStream({
			name: FILENAME,
			key: mediaContent._id
		});
		vol.fromJSON({}, '/');
			const filePath = `/${FILENAME}`;
			vol.writeFileSync(filePath, attachmentStream.toString());
			const {
				size
			} = vol.statSync(filePath);
			expect(size).toBe(528238);
	}); // it should be able to createMedia and getAttachmentStream
}); // describe ContentConnection
