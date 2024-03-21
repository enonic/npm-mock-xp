import type {GeoPoint as GeoPointInterface} from '@enonic-types/lib-value';


export class GeoPoint implements GeoPointInterface {
	readonly lat: number;
	readonly lon: number;

	constructor({
		lat,
		lon
	}: {
		lat: number,
		lon: number
	}) {
		this.lat = lat;
		this.lon = lon;
	}

	static fromString(v: string): GeoPoint {
		const [lat, lon] = v.split(',');
		return new GeoPoint({
			lat: parseFloat(lat),
			lon: parseFloat(lon)
		});
	}

	public getLatitude(): number {
		return this.lat;
	}

	public getLongitude(): number {
		return this.lon;
	}

	public toString(): string {
		return `${this.lat},${this.lon}`;
	}
} // class GeoPoint
