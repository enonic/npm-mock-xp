import {GeoPoint} from './value/GeoPoint';
import {Instant} from './value/Instant';
import {LocalDate} from './value/LocalDate';
import {LocalDateTime} from './value/LocalDateTime';
import {LocalTime} from './value/LocalTime';
import {Reference} from './value/Reference';


export class LibValue {
	static geoPoint(lat: number, lon: number): GeoPoint {
		return new GeoPoint({lat, lon});
	}

	static geoPointString(value: string) {
		return GeoPoint.fromString(value);
	}

	static instant(value: string | Date): Instant {
		return new Instant(value);
	}

	static localDate(value: string | Date): LocalDate {
		return new LocalDate(value);
	}

	static localDateTime(value: string | Date): LocalDateTime {
		return new LocalDateTime(value);
	}

	static localTime(value: string | Date): LocalTime {
		return new LocalTime(value);
	}

	static reference(value: string): Reference {
		return new Reference(value);
	}
} // class LibValue
