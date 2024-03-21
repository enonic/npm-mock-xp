import type {
	DayOfWeek,
	Month,
	LocalDateTime as LocalDateTimeInterface,
} from '@enonic-types/lib-value';


export class LocalDateTime implements LocalDateTimeInterface {
	private date: Date;
	private belowMilli: number = 0;

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
			const split = value.split('.');
			if (split.length > 1) {
				const sixString = split[1].replace(/\d{3}/, '').padEnd(6, '0');
				this.belowMilli = parseInt(sixString);
			}
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
		return LocalDateTime.months[this.date.getMonth()];
	}

	public getDayOfMonth(): number {
		return this.date.getDate();
	}

	public getDayOfWeek(): DayOfWeek {
		return LocalDateTime.daysOfWeek[this.date.getDay()];
	}

	public getHour(): number {
		return this.date.getHours();
	}

	public getMinute(): number{
		return this.date.getMinutes();
	}

	public getSecond(): number{
		return this.date.getSeconds();
	}

	public getNano(): number{
		return this.date.getMilliseconds() * 1000000 + this.belowMilli;
	}
}
