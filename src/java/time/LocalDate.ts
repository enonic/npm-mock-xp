import type {
	DayOfWeek,
	Month,
	LocalDate as LocalDateInterface,
} from '@enonic-types/lib-value';


export class LocalDate implements LocalDateInterface {
	private date: Date;

	static months: Month[] = [
		'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL',
		'MAY', 'JUNE', 'JULY', 'AUGUST',
		'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
	];

	static daysOfWeek: DayOfWeek[] = [
		'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY',
		'FRIDAY', 'SATURDAY', 'SUNDAY'
	];

	constructor(value: string | Date) {
		if (typeof value === 'string') {
			this.date = new Date(value);
		} else {
			this.date = value;
		}
	}

	public getYear(): number {
		return this.date.getFullYear();
	}

	public getMonthValue(): number {
		return this.date.getMonth() + 1;
	}

	public getMonth(): Month {
		return LocalDate.months[this.date.getMonth()];
	}

	public getDayOfMonth(): number {
		return this.date.getDate();
	}

	public getDayOfWeek(): DayOfWeek {
		return LocalDate.daysOfWeek[this.date.getDay()];
	}

	public getDayOfYear(): number {
		const start = new Date(this.date.getFullYear(), 0, 0);
		const diff = this.date.getTime() - start.getTime();
		const oneDay = 1000 * 60 * 60 * 24;
		return Math.floor(diff / oneDay);
	}

	public isLeapYear(): boolean {
		const year = this.getYear();
		return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	}
}
