import type {ByteSource} from '@enonic-types/lib-value';


import {BinaryAttachment} from '../implementation/util/BinaryAttachment';
import {GeoPoint} from '../implementation/util/GeoPoint';
import {Instant} from '../java/time/Instant';
import {LocalDate} from '../java/time/LocalDate';
import {LocalDateTime} from '../java/time/LocalDateTime';
import {LocalTime} from '../java/time/LocalTime';
import {Reference} from '../implementation/util/Reference';


export class LibValue {
	static binary(name: string, stream: ByteSource): BinaryAttachment {
		return new BinaryAttachment(name, stream);
	}

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
