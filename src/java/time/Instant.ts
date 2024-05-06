import type {Instant as InstantInterface} from '@enonic-types/lib-value';


// java.time.Instant uses nanoseconds for fractional seconds, while JavaScript's Date uses milliseconds.
export class Instant implements InstantInterface {
	private date: Date;

	// To convert a java.time.Instant to a JavaScript Date, you'll need to:
	static convertInstantToDate(instant: Instant) {
		// Extract the epoch seconds (seconds since 1970-01-01T00:00:00Z) from the Instant object.
		const epochSeconds = instant.getEpochSecond();

		// Extract the nanoseconds from the Instant object.
		const nanoseconds = instant.getNano();

		// Multiply the epoch seconds by 1000 to convert to milliseconds.
		// Divide the nanoseconds by 1,000,000 to convert to milliseconds.
		const milliseconds = (epochSeconds * 1000) + (nanoseconds / 1000000);

		// Create a new Date object using the sum of these milliseconds.
		return new Date(milliseconds);
	}

	static convertToInstantEpochSeconds(jsDate: Date): number {
		// Get milliseconds since epoch (1970-01-01T00:00:00Z)
		const milliseconds = jsDate.getTime();

		// Convert to seconds (discard milliseconds)
		const seconds = Math.floor(milliseconds / 1000);

		return seconds;
	}

	static convertToInstantNanoseconds(jsDate: Date, useMicroseconds = false): number {
		const milliseconds = jsDate.getTime();
		let nanoseconds = milliseconds * 1000000;

		if (useMicroseconds && performance && performance.now) {
			const startTime = performance.now();
			// Perform some action (assuming it takes negligible time)
			const microseconds = Math.floor((performance.now() - startTime) * 1000);
			nanoseconds += microseconds * 1000;
		}

		return nanoseconds;
	}

	static convertToInstantMilliseconds(jsDate: Date): number {
		return jsDate.getTime();
	}

	constructor(value: string | Date) {
		if (typeof value === 'string') {
			this.date = new Date(value);

			// Alternatively:
			// const milliseconds = Date.parse(value);
			// this.date = new Date(milliseconds);

			// The Date constructor and parse method can handle various ISO 8601
			// formats, including dates, times, and timezones (e.g.,
			// "YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ss", "YYYY-MM-DDTHH:mm:ss.sssZ").
			// For less common formats or stricter validation, consider using
			// libraries like moment.js or date-fns.
		} else {
			this.date = value;
		}
	}

	public getEpochSecond(): number {
		return Instant.convertToInstantEpochSeconds(this.date);
	}

	public getNano(): number {
		return Instant.convertToInstantNanoseconds(this.date);
	}

	public toEpochMilli(): number {
		return Instant.convertToInstantMilliseconds(this.date);
	}

	public toString(): string {
		return this.date.toISOString();
	}
} // class Instant
