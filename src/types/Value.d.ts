export type GeoPointArray = [number, number]; // Tuple

type OptionalSpace = '' | ' ';
export type GeoPointString = `${string},${OptionalSpace}${string}`;

export type GeoPointFunction = (lat :number, lon :number) => unknown;
export type StringFunction = (v :string) => unknown;
export type UnknownFunction = (v :unknown) => unknown;

export interface ValueLib {
	geoPoint :GeoPointFunction
	geoPointString :StringFunction
	instant :UnknownFunction
	localDate :UnknownFunction
	localDateTime :UnknownFunction
	localTime :UnknownFunction
	reference :StringFunction
}
