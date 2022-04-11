import {deepStrictEqual} from 'assert';
import {JavaBridge} from '../src/JavaBridge';
import {
	GEOPOINT_ARRAYS,
	GEOPOINT_STRINGS,
	INSTANT_STRINGS,
	LOCAL_DATE_STRINGS,
	LOCAL_DATE_TIME_STRINGS,
	LOCAL_TIME_STRINGS,
	UUID_V4
} from '@enonic/test-data';


function hasMethod(obj :unknown, name :string) {
	// TODO check if obj is Object?
	return typeof obj[name] === 'function';
}


describe('mock', () => {
	describe('JavaBridge', () => {
		const javaBridge = new JavaBridge({
			app: {
				config: {},
				name: 'com.enonic.app.test',
				version: '0.0.1-SNAPSHOT'
			}
		});
		it('instance has property value', () => {
			deepStrictEqual(
				true,
				javaBridge.hasOwnProperty('value')
			);
		}); // it
		describe('value', () => {
			it('value object has method geoPoint', () => {
				deepStrictEqual(
					true,
					hasMethod(javaBridge.value, 'geoPoint')
				);
			}); // it
			it('value object has method geoPointString', () => {
				deepStrictEqual(
					true,
					hasMethod(javaBridge.value, 'geoPointString')
				);
			}); // it
			it('value object has method instant', () => {
				deepStrictEqual(
					true,
					hasMethod(javaBridge.value, 'instant')
				);
			}); // it
			it('value object has method localDate', () => {
				deepStrictEqual(
					true,
					hasMethod(javaBridge.value, 'localDate')
				);
			}); // it
			it('value object has method localDateTime', () => {
				deepStrictEqual(
					true,
					hasMethod(javaBridge.value, 'localDateTime')
				);
			}); // it
			it('value object has method localTime', () => {
				deepStrictEqual(
					true,
					hasMethod(javaBridge.value, 'localTime')
				);
			}); // it
			it('value object has method reference', () => {
				deepStrictEqual(
					true,
					hasMethod(javaBridge.value, 'reference')
				);
			}); // it
			describe('geoPoint', () => {
				it('returns the input', () => {
					deepStrictEqual(
						`${GEOPOINT_ARRAYS[0][0]},${GEOPOINT_ARRAYS[0][1]}`,
						javaBridge.value.geoPoint(
							GEOPOINT_ARRAYS[0][0],
							GEOPOINT_ARRAYS[0][1]
						)
					);
				}); // it
			}); // describe geoPoint
			describe('geoPointString', () => {
				it('returns the input', () => {
					deepStrictEqual(
						GEOPOINT_STRINGS[0],
						javaBridge.value.geoPointString(GEOPOINT_STRINGS[0])
					);
				}); // it
			}); // describe geoPointString
			describe('instant', () => {
				it('returns the input', () => {
					deepStrictEqual(
						INSTANT_STRINGS[0],
						javaBridge.value.instant(INSTANT_STRINGS[0])
					);
				}); // it
			}); // describe instant
			describe('localDate', () => {
				it('returns the input', () => {
					deepStrictEqual(
						LOCAL_DATE_STRINGS[0],
						javaBridge.value.localDate(LOCAL_DATE_STRINGS[0])
					);
				}); // it
			}); // describe localDate
			describe('localDateTime', () => {
				it('returns the input', () => {
					deepStrictEqual(
						LOCAL_DATE_TIME_STRINGS[0],
						javaBridge.value.localDateTime(LOCAL_DATE_TIME_STRINGS[0])
					);
				}); // it
			}); // describe localDateTime
			describe('localTime', () => {
				it('returns the input', () => {
					deepStrictEqual(
						LOCAL_TIME_STRINGS[0],
						javaBridge.value.localTime(LOCAL_TIME_STRINGS[0])
					);
				}); // it
			}); // describe localTime
			describe('reference', () => {
				it('returns the input', () => {
					deepStrictEqual(
						UUID_V4[0],
						javaBridge.value.reference(UUID_V4[0])
					);
				}); // it
			}); // describe reference
		}); // describe value
	}); // describe JavaBridge
}); // describe mock
