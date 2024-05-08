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
	constructor(string: string|String) {
		super(string);
	}

	public equals(s: string|String): boolean {
		return this.toString() === s;
	}

	public hashCode(): number {
		return stringHashCode(this.toString());
	}
}
