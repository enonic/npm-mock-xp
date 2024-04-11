import type {ByteSource} from '@enonic-types/core';


import {readFileSync } from 'fs';
import {join} from 'path';
import {
	App,
	Asset,
	LibIo,
	ResourceKey,
} from '../../src';
import {LEA_JPG_BYTE_SIZE} from '../constants';


const APP_KEY = 'com.enonic.app.myapp';
const FILENAME = 'Lea-Seydoux.jpg'
const ASSET_PATH = Asset.prefixPath(FILENAME)
const DATA: ByteSource = readFileSync(join(__dirname, '..', FILENAME)) as unknown as ByteSource;
const LINE_1 = "const text = 'Hello World!';"
const LINE_2 = "log.info(text);"
const CONTROLLER_DATA = `${LINE_1}\n${LINE_2}`;
const CONTROLLER_PATH = 'main.js';

const app = new App({
	key: APP_KEY
}).addAsset({
	data: DATA,
	path: FILENAME,
}).addController({
	data: CONTROLLER_DATA,
	path: CONTROLLER_PATH,
});

const libIo = new LibIo({
	app
});

const resourceKey = new ResourceKey({
	applicationKey: APP_KEY,
	path: CONTROLLER_PATH
});

const resource = libIo.getResource(ASSET_PATH);
const resource2 = libIo.getResource(resourceKey);
const stream = resource.getStream();
const stream2 = resource2.getStream();


describe('LibIo', () => {
	describe('getMimeType', () => {
		it('should return the correct mime type', () => {
			expect(libIo.getMimeType('file.css')).toBe('text/css');
			expect(libIo.getMimeType('file.ico')).toBe('image/x-icon');
			expect(libIo.getMimeType('file.jpg')).toBe('image/jpeg');
			expect(libIo.getMimeType('file.js')).toBe('application/javascript');
			expect(libIo.getMimeType('file.json')).toBe('application/json');
			expect(libIo.getMimeType('file.gif')).toBe('image/gif');
			expect(libIo.getMimeType('file.html')).toBe('text/html');
			expect(libIo.getMimeType('file.png')).toBe('image/png');
			expect(libIo.getMimeType('file.svg')).toBe('image/svg+xml');
			expect(libIo.getMimeType('file.txt')).toBe('text/plain');
			expect(libIo.getMimeType('file.xml')).toBe('application/xml');
			expect(libIo.getMimeType('file')).toBe('application/octet-stream');
		});
	}); // describe getMimeType

	describe('getResource', () => {
		it('should return a resource', () => {
			expect(resource).toBeDefined();
			expect(resource.path).toBe(ASSET_PATH);
			expect(resource.exists()).toBe(true);
			expect(resource.getSize()).toBe(LEA_JPG_BYTE_SIZE);
			expect(resource.getTimestamp()).toBeGreaterThan(0);
		});
	}); // describe getResource

	describe('getSize', () => {
		it('should return the size of the stream', () => {
			expect(libIo.getSize(stream)).toBe(LEA_JPG_BYTE_SIZE);
		});
	}); // describe getSize

	describe('newStream', () => {
		it('should return a new stream', () => {
			const text = 'Hello World!';
			const newStream = libIo.newStream(text);
			expect(newStream.toString()).toBe(text);
		});
	}); // describe newStream

	describe('processLines', () => {
		it('should process each line in the stream', () => {
			let i = 0;
			libIo.processLines(stream2, (line) => {
				if (i === 0) {
					expect(line).toBe(LINE_1);
				} else if (i === 1) {
					expect(line).toBe(LINE_2);
				}
				i++;
			});
		});
	}); // describe processLines

	describe('readLines', () => {
		it('should return an array of lines', () => {
			const lines = libIo.readLines(stream2);
			expect(lines).toEqual([LINE_1, LINE_2]);
		});
	}); // describe readLines

	describe('readText', () => {
		it('should return the text in the stream', () => {
			const text = libIo.readText(stream2);
			expect(text).toBe(`${LINE_1}\n${LINE_2}`);
		});
	});
}); // describe LibIo
