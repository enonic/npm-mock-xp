import {stringHashCode} from '../String';

function hash(...args: any[]): number {
	let hash = 0;
	for (const arg of args) {
		if (arg === null || arg === undefined) {
			hash = 31 * hash;
		} else if (typeof arg === 'object') {
			// Recursive call for nested objects
			hash = 31 * hash + hashObject(arg);
		} else {
			// Hash based on primitive types
			hash = 31 * hash + (typeof arg === 'string' ? stringHashCode(arg) : arg);
		}
	}
	return hash;
}

function hashObject(obj: object): number {
	// Handle common object types with specific hashing logic
	if (Array.isArray(obj)) {
		return hashArray(obj);
	} else if (typeof obj === 'function') {
		// Hash based on function name (may not be unique)
		return stringHashCode(obj.name);
	} else {
		// Generic object hashing (iterate over properties)
		let int = 0;
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				int = 31 * int + hash([key, obj[key]]);
			}
		}
		return int;
	}
}

function hashArray(arr: any[]): number {
	let int = 0;
	for (const item of arr) {
		int = 31 * int + hash(item);
	}
	return int;
}

function hashCode(obj: any): number {
	if (obj === null || obj === undefined) {
		return 0;
	} else if (typeof obj === 'number') {
		// Hash based on integer representation
		const bits = Float64Array.of(obj);
		const intHash = bits[0];
		return intHash ^ (intHash >> 32);
	} else if (typeof obj === 'string') {
		// Hash based on string content
		let hash = 0;
		for (let i = 0; i < obj.length; i++) {
		hash = (hash << 5) - hash + obj.charCodeAt(i);
		hash = hash & hash; // Convert to 32-bit integer
		}
		return hash;
	} else if (typeof obj === 'boolean') {
		// Hash based on boolean value
		return obj ? 1231 : 1237;
	} else if (Array.isArray(obj)) {
		// Hash based on array content recursively
		let hash = 1;
		for (const item of obj) {
		hash = 31 * hash + hashCode(item);
		}
		return hash;
	} else {
		// Hash based on object properties (simplified approach)
		let hash = 0;
		for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			hash = 31 * hash + hashCode([key, obj[key]]);
		}
		}
		return hash;
	}
}

export class Objects {
	static hash(...args: any[]): number {
		return hash(...args);
	}
	static hashCode(obj: any): number {
		return hashCode(obj);
	}
}
