import type {LocalTime as LocalTimeInterface} from '@enonic-types/lib-value';


export class LocalTime implements LocalTimeInterface {
	private date: Date;
	private nano: number = 0;

	static parseLocalTimeString(timeString: string): {
		hours: number
		minutes: number
		seconds: number
		milliseconds: number
		nanoseconds: number
	} {
		const parts = timeString.split(":");

		const hours = parseInt(parts[0], 10);
		const minutes = parseInt(parts[1], 10);

		let seconds = 0;
		let nanoseconds = 0;

		if (parts[2]) {
			const [s,rest] = parts[2].split('.');

			seconds = parseInt(s, 10);

			if (rest) {
				nanoseconds = parseInt(`${parseInt(rest, 10)}`.padEnd(9, '0'), 10);
			}
		}
		const milliseconds = nanoseconds / 1000000;

		// Add validation for valid time values (0-23 hours, 0-59 minutes, 0-59 seconds, optional milliseconds)
		return { hours, minutes, seconds, milliseconds, nanoseconds };
	}

	static createTimeObjectFromHoursMinutesSeconds(hours: number, minutes: number, seconds: number, milliseconds: number): Date {
		const date = new Date(new Date().getFullYear(), 0, 1); // Use January 1st of current year
		date.setHours(hours, minutes, seconds, milliseconds); // Set parsed time values
		return date;
	}

	constructor(value: string | Date) {
		if (typeof value === 'string') {
			const { hours, minutes, seconds, milliseconds, nanoseconds } = LocalTime.parseLocalTimeString(value);
			this.date = LocalTime.createTimeObjectFromHoursMinutesSeconds(hours, minutes, seconds, milliseconds);
			this.nano = nanoseconds;
		} else {
			this.date = value;
		}
	}

	public getHour(): number {
		return this.date.getHours();
	}

	public getMinute(): number {
		return this.date.getMinutes();
	}

	public getSecond(): number {
		return this.date.getSeconds();
	}

	public getNano(): number {
		return this.nano;
	}
}
