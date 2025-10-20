import type { Node } from '@enonic-types/lib-node';
import type { NodeXML } from './NodeXML.d';

import { XMLParser } from 'fast-xml-parser';
import { forceArray } from '@enonic/js-utils/array/forceArray';
import { sortKeys } from '@enonic/js-utils/object/sortKeys';


interface ParsedObject {
	[key: string]: any;
}


function transform(obj: ParsedObject, tag?: string): any {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => transform(item, tag));
	}

	// Handle null values
	if ('@isNull' in obj && obj['@isNull'] === 'true') {
		return null;
	}

	// Handle arrays marked with type="array"
	if ('@type' in obj && obj['@type'] === 'array') {
		if ('value' in obj) {
			const val = obj['value'];
			const transformedVal = transform(val, 'value');
			return Array.isArray(transformedVal) ? transformedVal : [transformedVal];
		}
		return [];
	}

	// Handle leaf nodes with #text
	if ('#text' in obj) {
		let value = obj['#text'];
		switch (tag) {
		case 'boolean':
			return value === 'true';
		case 'dateTime':
			// return new Date(value); // TODO This is probably wrong...
		case 'string':
		case 'reference':
		case 'localTime': // if any
		case 'long': // if any, parseInt
			return value;
		default:
			return value;
		}
	}

	// Handle principals with @key
	if ('@key' in obj) {
		const result: ParsedObject = { key: obj['@key'] };
		for (const k in obj) {
			if (k !== '@key' && !k.startsWith('@')) {
				result[k] = transform(obj[k], k);
			}
		}
		return result;
	}

	// General container: group by type and @name
	const result: ParsedObject = {};
	for (const type in obj) {
		if (type.startsWith('@') || type === '#text') continue;

		let items = Array.isArray(obj[type]) ? obj[type] : [obj[type]];

		for (const item of items) {
			const name = item['@name'];
			let val = transform(item, type);

			// Remove @name from val if it's an object
			if (typeof val === 'object' && val !== null && '@name' in val) {
				delete val['@name'];
			}

			if (name) {
				// Group by name
				if (name in result) {
					if (!Array.isArray(result[name])) {
						result[name] = [result[name]];
					}
					result[name].push(val);
				} else {
					result[name] = val;
				}
			} else {
				// No name, group by type
				const key = type;
				if (key in result) {
					if (!Array.isArray(result[key])) {
						result[key] = [result[key]];
					}
					result[key].push(val);
				} else {
					result[key] = val;
				}
			}
		}
	}

	return result;
}


export function parseEnonicXml<DATA extends Record<string, unknown> = Record<string, unknown>>(xmlString: string): Node<DATA> {
	const options = {
		ignoreAttributes: false,
		attributeNamePrefix: '@',
		textNodeName: '#text',
		parseNodeValue: false,
		parseAttributeValue: false,
		trimValues: true,
		allowBooleanAttributes: true,
		arrayMode: false,
	};

	const parser = new XMLParser(options);
	const parsed = parser.parse(xmlString);

	// Assuming the root is <node>, transform its content
	const obj = transform(parsed.node) as NodeXML['node'];

	const { data, indexConfigs, permissions, timestamp } = obj;
	delete obj.data;
	delete obj.indexConfigs;
	delete obj.permissions;
	delete obj.timestamp;

	const _permissions = [];
	for (const permission of forceArray(permissions)) {
		const { principal } = permission;
		for (const { allow, deny, key } of principal) {
			_permissions.push({
				principal: key,
				allow,
				deny
			});
		}
	}

	const node = {
		_indexConfig: {
			// Used same order as datatoolbox, not alphabetical.
			analyzer: indexConfigs.analyzer,
			default: indexConfigs.defaultConfig,
			configs: indexConfigs.pathIndexConfigs.pathIndexConfig?.map(({
				indexConfig: config,
				path,
			}) => ({
				config,
				path
			})) || [],
		},
		_permissions,
		_tz: timestamp,
	};

	for (const attr in obj) {
		node[`_${attr}`] = obj[attr];
	}

	for (const attr in data) {
		node[attr] = data[attr];
	}

	return sortKeys(node) as unknown as Node<DATA>;
}
