import type {ByteSource} from '@enonic-types/core';


import {readFileSync } from 'fs';
import {join} from 'path';
import {
	App,
	LibContext,
	LibContent,
	LibPortal,
	Request,
	Server,
} from '../../src';
import { SYSTEM_REPO } from '../../src/constants';

const PROJECT_NAME = 'myproject';
const REPO_ID = `com.enonic.cms.${PROJECT_NAME}`;

const server = new Server({
	// loglevel: 'debug'
	loglevel: 'error'
}).createProject({
	projectName: PROJECT_NAME,
}).setContext({
	projectName: PROJECT_NAME,
});

const app = new App({
	key: 'com.example.myapp'
});

const libContent = new LibContent({
	server
});

const libContext = new LibContext({
	server
});

const libPortal = new LibPortal({
	app,
	server,
});


describe('Portal', () => {
	it('should be instantiable', () => {
		expect(libPortal).toBeInstanceOf(LibPortal);
	});

	describe('_connect', () => {
		it("should throw if context doesn't contain repository", () => {
			libContext.run({
				branch: 'draft',
				repository: ''
			}, () => {
				expect(() => libPortal.connect()).toThrow('mock-xp: LibPortal.connect: No repository set in context!')
			});
		});

		it("should throw if context doesn't contain branch", () => {
			libContext.run({
				branch: '',
				repository: SYSTEM_REPO
			}, () => {
				expect(() => libPortal.connect()).toThrow('mock-xp: LibPortal.connect: No branch set in context!')
			});
		});
	});
}); // describe Portal
