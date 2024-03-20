export class Version {
	readonly major: number;
	readonly minor: number;
	readonly patch: number;
	readonly qualifier: string;

	constructor(version: string) {
		const [major, minor, patchAndQualifier] = version.split('.');
		this.major = Number(major);
		this.minor = Number(minor);
		const [patch, qualifier] = patchAndQualifier.split('-');
		this.patch = Number(patch);
		this.qualifier = qualifier;
	}

	toString(): string {
		return `${this.major}.${this.minor}.${this.patch}${this.qualifier ? `-${this.qualifier}` : ''}`;
	}

	compareTo(other: Version): number {
		if (this.major !== other.major) {
			return this.major - other.major;
		}
		if (this.minor !== other.minor) {
			return this.minor - other.minor;
		}
		if (this.patch !== other.patch) {
			return this.patch - other.patch;
		}
		if (this.qualifier && other.qualifier) {
			return this.qualifier.localeCompare(other.qualifier);
		}
		if (this.qualifier) {
			return 1;
		}
		if (other.qualifier) {
			return -1;
		}
		return 0;
	}

	equals(other: Version): boolean {
		return this.compareTo(other) === 0;
	}

	greaterThan(other: Version): boolean {
		return this.compareTo(other) > 0;
	}

	greaterThanOrEquals(other: Version): boolean {
		return this.compareTo(other) >= 0;
	}

	lessThan(other: Version): boolean {
		return this.compareTo(other) < 0;
	}

	lessThanOrEquals(other: Version): boolean {
		return this.compareTo(other) <= 0;
	}

} // class Version
