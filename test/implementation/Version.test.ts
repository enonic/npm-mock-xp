import {
	Version,
} from '../../src';


describe('Version', () => {
	it('should be instantiable without a qualifier', () => {
		expect(new Version('1.0.0')).toBeInstanceOf(Version);
	});

	it('should be instantiable with qualifier', () => {
		const v = new Version('1.2.3-B4');
		expect(v).toBeInstanceOf(Version);
		expect(v.major).toBe(1);
		expect(v.minor).toBe(2);
		expect(v.patch).toBe(3);
		expect(v.qualifier).toBe('B4');
	});

	it('should be comparable', () => {
		expect((new Version('1.0.0')).compareTo(new Version('1.0.1'))).toBe(-1);
		expect((new Version('1.0.0')).compareTo(new Version('1.1.0'))).toBe(-1);
		expect((new Version('1.0.0')).compareTo(new Version('2.0.0'))).toBe(-1);
		expect((new Version('1.0.0')).compareTo(new Version('1.0.0-B1'))).toBe(-1);
		expect((new Version('1.0.0-B1')).compareTo(new Version('1.0.0-B2'))).toBe(-1);
		expect((new Version('1.0.0-B2')).compareTo(new Version('1.0.0-B1'))).toBe(1);
		expect((new Version('1.0.0-B1')).compareTo(new Version('1.0.0'))).toBe(1);
	});

	it('should be equal', () => {
		const v1 = new Version('1.0.0');
		const v2 = new Version('1.0.0');
		expect(v1.equals(v2)).toBe(true);
	});

	it('should be greater than', () => {
		const v1 = new Version('1.0.1');
		const v2 = new Version('1.0.0');
		expect(v1.greaterThan(v2)).toBe(true);
	});

	it('should be greater than or equal', () => {
		const v1 = new Version('1.0.1');
		const v2 = new Version('1.0.0');
		expect(v1.greaterThanOrEquals(v2)).toBe(true);
	});

	it('should be less than', () => {
		const v1 = new Version('1.0.0');
		const v2 = new Version('1.0.1');
		expect(v1.lessThan(v2)).toBe(true);
	});

	it('should be less than or equal', () => {
		const v1 = new Version('1.0.0');
		const v2 = new Version('1.0.1');
		expect(v1.lessThanOrEquals(v2)).toBe(true);
	});

	it('should be stringified', () => {
		const v = new Version('1.0.0');
		expect(v.toString()).toBe('1.0.0');
	});

	it('should be stringified with qualifier', () => {
		const v = new Version('1.0.0-B1');
		expect(v.toString()).toBe('1.0.0-B1');
	});

});
