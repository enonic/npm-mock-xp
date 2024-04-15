import type {ResourceKey} from '../../../src';

import {readFileSync} from 'fs';
import {join} from 'path';
import {
	compile,
	// render,
} from 'slm';


// Perhaps only related to Express
// interface Options {
// 	cache?: boolean
// 	views?: string
// }

interface CompileOptions {
	basePath?: string
	filename?: string
	useCache?: boolean
}

// function renderString(
// 	template: string,
// 	model: Record<string, any> = {},
// 	compileOptions: CompileOptions = {}
// ) {
// 	return compile(template, compileOptions)(model, compileOptions);
// }

export function render(
	resourceKey: ResourceKey,
	model: Record<string, any> = {},
	compileOptions: CompileOptions = {
		// filename
	}
) {
	const {
		basePath// = __dirname
	} = compileOptions;
	const path = resourceKey.getPath();
	const fullPath = basePath ? join(basePath, path) : path;
	const template = readFileSync(fullPath, 'utf8');
	return compile(template, compileOptions)(model, compileOptions);
}
