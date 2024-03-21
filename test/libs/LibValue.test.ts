import {
	DATE_OBJECTS,
	// GEOPOINT_ARRAYS,
	// GEOPOINT_STRINGS,
	INSTANT_STRINGS,
	LOCAL_DATE_STRINGS,
	LOCAL_DATE_TIME_STRINGS,
	LOCAL_TIME_STRINGS,
	UUID_V4,
} from '@enonic/test-data';
import {
	GeoPoint,
	Instant,
	LibValue,
	LocalDate,
	LocalDateTime,
	LocalTime,
	Reference,
} from '../../src'

function hasMethod(obj :unknown, name :string) {
	// TODO check if obj is Object?
	return typeof obj[name] === 'function';
}

describe('LibValue', () => {
	it('LibValue class has a static method geoPoint', () => {
		expect(hasMethod(LibValue, 'geoPoint')).toBe(true);
	});

	describe('geoPoint()', () => {
		it('returns an instance of GeoPoint', () => {
			expect(LibValue.geoPoint(1,2)).toBeInstanceOf(GeoPoint);
		});
		it("returns a GeoPoint that toString's correctly", () => {
			expect(`${LibValue.geoPoint(1,2)}`).toBe('1,2');
		});
		describe('GeoPoint', () => {
			it('GeoPoint class has a static method fromString', () => {
				expect(hasMethod(GeoPoint, 'fromString')).toBe(true);
			});
			describe('fromString()', () => {
				it('returns an instance of GeoPoint', () => {
					expect(GeoPoint.fromString('1,2')).toBeInstanceOf(GeoPoint);
				});
			});
			describe('getLatitude()', () => {
				it('returns the latitude', () => {
					expect(LibValue.geoPoint(1,2).getLatitude()).toBe(1);
				});
			});
			describe('getLongitude()', () => {
				it('returns the longitude', () => {
					expect(LibValue.geoPoint(1,2).getLongitude()).toBe(2);
				});
			});
		}); // describe GeoPoint
	}); // describe geoPoint

	describe('geoPointString()', () => {
		it('returns an instance of GeoPoint', () => {
			expect(LibValue.geoPointString('1,2')).toBeInstanceOf(GeoPoint);
		});
		it("returns a GeoPoint that toString's correctly", () => {
			expect(`${LibValue.geoPointString('1,2')}`).toBe('1,2');
		});
	});

	describe('instant()', () => {
		it('returns an instance of Instant', () => {
			[...INSTANT_STRINGS,...DATE_OBJECTS].forEach(str => {
				expect(LibValue.instant(str)).toBeInstanceOf(Instant);
			});
		});
		it("returns an Instant that toString's correctly", () => {
			expect(`${LibValue.instant('2011-12-03T10:15:30Z')}`).toBe('2011-12-03T10:15:30.000Z');
			expect(`${LibValue.instant('2011-12-03T10:15:30.1Z')}`).toBe('2011-12-03T10:15:30.100Z');
			expect(`${LibValue.instant('2011-12-03T10:15:30.12Z')}`).toBe('2011-12-03T10:15:30.120Z');
			expect(`${LibValue.instant('2011-12-03T10:15:30.123Z')}`).toBe('2011-12-03T10:15:30.123Z');
			expect(`${LibValue.instant('2011-12-03T10:15:30.1234Z')}`).toBe('2011-12-03T10:15:30.123Z');
			expect(`${LibValue.instant('2011-12-03T10:15:30.12345Z')}`).toBe('2011-12-03T10:15:30.123Z');
			expect(`${LibValue.instant('2011-12-03T10:15:30.123456Z')}`).toBe('2011-12-03T10:15:30.123Z');
			expect(`${LibValue.instant('2011-12-03T10:15:30.1234567Z')}`).toBe('2011-12-03T10:15:30.123Z');
			expect(`${LibValue.instant('2011-12-03T10:15:30.12345678Z')}`).toBe('2011-12-03T10:15:30.123Z');
			expect(`${LibValue.instant('2011-12-03T10:15:30.123456789Z')}`).toBe('2011-12-03T10:15:30.123Z');
		});
		describe('Instant', () => {
			describe('getEpochSecond', () => {
				it('returns the epoch second', () => {
					expect(LibValue.instant('2011-12-03T10:15:30Z').getEpochSecond()).toBe(1322907330);
				});
			});
			describe('getNano', () => {
				it('returns the nano second', () => {
					expect(LibValue.instant('2011-12-03T10:15:30.123456789Z').getNano()).toBe(1322907330123000000);
				});
			});
			describe('toEpochMilli', () => {
				it('returns the epoch millisecond', () => {
					expect(LibValue.instant('2011-12-03T10:15:30.123456789Z').toEpochMilli()).toBe(1322907330123);
				});
			});
		}); // describe Instant
	}); // describe instant()

	describe('localDate()', () => {
		it('returns an instance of LocalDate', () => {
			[...LOCAL_DATE_STRINGS,...DATE_OBJECTS].forEach(str => {
				expect(LibValue.localDate(str)).toBeInstanceOf(LocalDate);
			});
		});

		describe('LocalDate', () => {

			describe('getYear()', () => {
				it('returns the year', () => {
					expect(LibValue.localDate('2011-12-03').getYear()).toBe(2011);
				});
			});

			describe('getMonthValue()', () => {
				it('returns the month value', () => {
					expect(LibValue.localDate('2011-12-03').getMonthValue()).toBe(12);
				});
			});

			describe('getMonth()', () => {
				it('returns the month', () => {
					expect(LibValue.localDate('2011-12-03').getMonth()).toBe('DECEMBER');
				});
			});

			describe('getDayOfMonth()', () => {
				it('returns the day of month', () => {
					expect(LibValue.localDate('2011-12-03').getDayOfMonth()).toBe(3);
				});
			}); // describe getDayOfMonth()

			describe('getDayOfWeek()', () => {
				it('returns the day of week', () => {
					expect(LibValue.localDate('2011-12-03').getDayOfWeek()).toBe('SUNDAY');
					expect(LibValue.localDate('2011-12-04').getDayOfWeek()).toBe('MONDAY');
					expect(LibValue.localDate('2011-12-05').getDayOfWeek()).toBe('TUESDAY');
					expect(LibValue.localDate('2011-12-06').getDayOfWeek()).toBe('WEDNESDAY');
					expect(LibValue.localDate('2011-12-07').getDayOfWeek()).toBe('THURSDAY');
					expect(LibValue.localDate('2011-12-08').getDayOfWeek()).toBe('FRIDAY');
					expect(LibValue.localDate('2011-12-09').getDayOfWeek()).toBe('SATURDAY');
				});
			}); // describe getDayOfWeek()

			describe('getDayOfYear()', () => {
				it('returns the day of year', () => {
					expect(LibValue.localDate('2024-01-01').getDayOfYear()).toBe(1);
					expect(LibValue.localDate('2024-01-31').getDayOfYear()).toBe(31);
					expect(LibValue.localDate('2024-02-01').getDayOfYear()).toBe(31 + 1);
					expect(LibValue.localDate('2024-02-29').getDayOfYear()).toBe(31 + 29);
					expect(LibValue.localDate('2024-03-01').getDayOfYear()).toBe(31 + 29 + 1);
					expect(LibValue.localDate('2024-03-31').getDayOfYear()).toBe(31 + 29 + 31);
					expect(LibValue.localDate('2024-04-01').getDayOfYear()).toBe(31 + 29 + 31 + 1);
					expect(LibValue.localDate('2024-12-31').getDayOfYear()).toBe(31 + 29 + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31 + 30 + 31);
					expect(LibValue.localDate('2024-12-31').getDayOfYear()).toBe(366);
				});
			}); // describe getDayOfYear()

			describe('isLeapYear()', () => {
				it('returns true for leap years', () => {
					expect(LibValue.localDate('2024-01-01').isLeapYear()).toBe(true);
					expect(LibValue.localDate('2028-01-01').isLeapYear()).toBe(true);
				});
				it('returns false for non leap years', () => {
					expect(LibValue.localDate('2023-01-01').isLeapYear()).toBe(false);
					expect(LibValue.localDate('2025-01-01').isLeapYear()).toBe(false);
				});
			}); // describe isLeapYear()

		}); // describe LocalDate
	}); // describe localDate()

	describe('localDateTime()', () => {
		it('returns an instance of LocalDateTime', () => {
			[...LOCAL_DATE_TIME_STRINGS,...DATE_OBJECTS].forEach(str => {
				expect(LibValue.localDateTime(str)).toBeInstanceOf(LocalDateTime);
			});
		});

		describe('LocalDateTime', () => {

			describe('getYear()', () => {
				it('returns the year', () => {
					expect(LibValue.localDateTime('2011-12-03T10:15:30').getYear()).toBe(2011);
				});
			});

			describe('getMonthValue()', () => {
				it('returns the month value', () => {
					expect(LibValue.localDateTime('2011-12-03T10:15:30').getMonthValue()).toBe(12);
				});
			});

			describe('getMonth()', () => {
				it('returns the month', () => {
					expect(LibValue.localDateTime('2011-12-03T10:15:30').getMonth()).toBe('DECEMBER');
				});
			});

			describe('getDayOfMonth()', () => {
				it('returns the day of month', () => {
					expect(LibValue.localDateTime('2011-12-03T10:15:30').getDayOfMonth()).toBe(3);
				});
			}); // describe getDayOfMonth()

			describe('getDayOfWeek()', () => {
				it('returns the day of week', () => {
					expect(LibValue.localDateTime('2011-12-03T10:15:30').getDayOfWeek()).toBe('SUNDAY');
					expect(LibValue.localDateTime('2011-12-04T10:15:30').getDayOfWeek()).toBe('MONDAY');
					expect(LibValue.localDateTime('2011-12-05T10:15:30').getDayOfWeek()).toBe('TUESDAY');
					expect(LibValue.localDateTime('2011-12-06T10:15:30').getDayOfWeek()).toBe('WEDNESDAY');
					expect(LibValue.localDateTime('2011-12-07T10:15:30').getDayOfWeek()).toBe('THURSDAY');
					expect(LibValue.localDateTime('2011-12-08T10:15:30').getDayOfWeek()).toBe('FRIDAY');
					expect(LibValue.localDateTime('2011-12-09T10:15:30').getDayOfWeek()).toBe('SATURDAY');
				});
			}); // describe getDayOfWeek()

			describe('getHour()', () => {
				it('returns the hour', () => {
					expect(LibValue.localDateTime('2011-12-03T10:15:30').getHour()).toBe(10);
				});
			}); // describe getHour()

			describe('getMinute()', () => {
				it('returns the minute', () => {
					expect(LibValue.localDateTime('2011-12-03T10:15:30').getMinute()).toBe(15);
				});
			}); // describe getMinute()

			describe('getSecond()', () => {
				it('returns the second', () => {
					expect(LibValue.localDateTime('2011-12-03T10:15:30').getSecond()).toBe(30);
				});
			}); // describe getSecond()

			describe('getNano()', () => {
				it('returns the nano second', () => {
					expect(LibValue.localDateTime('2011-12-03T10:15:30.123456789').getNano()).toBe(123456789);
				});
			}); // describe getNano()

		}); // describe LocalDateTime
	}); // describe localDateTime()

	describe('localTime()', () => {
		it('returns an instance of LocalTime', () => {
			[...LOCAL_TIME_STRINGS,...DATE_OBJECTS].forEach(str => {
				expect(LibValue.localTime(str)).toBeInstanceOf(LocalTime);
			});
		});

		describe('LocalTime', () => {

			describe('getHour()', () => {
				it('returns the hour', () => {
					expect(LibValue.localTime('10:15:30').getHour()).toBe(10);
				});
			}); // describe getHour()

			describe('getMinute()', () => {
				it('returns the minute', () => {
					expect(LibValue.localTime('10:15:30').getMinute()).toBe(15);
				});
			}); // describe getMinute()

			describe('getSecond()', () => {
				it('returns the second', () => {
					expect(LibValue.localTime('10:15:30').getSecond()).toBe(30);
				});
			}); // describe getSecond()

			describe('getNano()', () => {
				it('returns the nano second', () => {
					expect(LibValue.localTime('10:15:30').getNano()).toBe(0);
					expect(LibValue.localTime('10:15:30.').getNano()).toBe(0);
					expect(LibValue.localTime('10:15:30.1').getNano()).toBe(100000000);
					expect(LibValue.localTime('10:15:30.12').getNano()).toBe(120000000);
					expect(LibValue.localTime('10:15:30.123').getNano()).toBe(123000000);
					expect(LibValue.localTime('10:15:30.1234').getNano()).toBe(123400000);
					expect(LibValue.localTime('10:15:30.12345').getNano()).toBe(123450000);
					expect(LibValue.localTime('10:15:30.123456').getNano()).toBe(123456000);
					expect(LibValue.localTime('10:15:30.1234567').getNano()).toBe(123456700);
					expect(LibValue.localTime('10:15:30.12345678').getNano()).toBe(123456780);
					expect(LibValue.localTime('10:15:30.123456789').getNano()).toBe(123456789);
					expect(LibValue.localTime('10:15:30.123456789Z').getNano()).toBe(123456789);
				});
			}); // describe getNano()

		}); // describe LocalTime
	}); // describe localTime()

	describe('reference()', () => {
		it('returns an instance of Reference', () => {
			UUID_V4.forEach(str => {
				expect(LibValue.reference(str)).toBeInstanceOf(Reference);
			});
		});
		it("returns a Reference that toString's correctly", () => {
			expect(`${LibValue.reference(UUID_V4[0])}`).toBe(UUID_V4[0]);
		});

		describe('Reference', () => {

			describe('getNodeId', () => {
				it('returns the node id', () => {
					expect(LibValue.reference(UUID_V4[0]).getNodeId()).toBe(UUID_V4[0]);
				});
			});

			describe('toString', () => {
				it('returns the node id', () => {
					expect(`${LibValue.reference(UUID_V4[0])}`).toBe(UUID_V4[0]);
				});
			});

		}); // describe Reference
	}); // describe reference()

}); // describe LibValue
