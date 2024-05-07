export const isStringLiteral = (value: string | unknown): value is string =>
	typeof value === 'string'

export const isStringObject = (value: string | unknown): value is String =>
	value instanceof String;

export function stringHashCode(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i);
		hash = hash & hash; // Convert to 32-bit integer
	}
	return hash;
}

// JavaScript has it's own String class, so we should avoid using the same name
export class JavaString extends String {
	// private stringObject: String;

	constructor(string: string|String) {
		super(string);
		// this.stringObject = isStringObject(string) ? string : new String(string);
	}

	public equals(s: string|String): boolean {
		return this.toString() === s;
	}

	public hashCode(): number {
		return stringHashCode(this.toString());
	}
}
