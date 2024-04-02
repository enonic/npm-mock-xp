export default {
	collectCoverageFrom: [
		'src/**/*.ts',
		'!src/**/*.d.ts',
	],

	coveragePathIgnorePatterns: [
		'<rootDir>/node_modules/',
		// '<rootDir>/src/types/',
		'<rootDir>/test/',
	],

	// This causes class properties to be uncovered :(
	// coverageProvider: 'v8', // Changes Uncovered Lines

	// globals: {},
	// moduleNameMapper: {},
	preset: 'ts-jest/presets/js-with-babel-legacy',
	// preset: 'ts-jest/presets/js-with-babel',

	// testEnvironment: 'jsdom', // Doesn't change Uncovered Lines
	testEnvironment: 'node',

	// testMatch [array<string>]
	// The glob patterns Jest uses to detect test files. By default it looks for
	// .js, .jsx, .ts and .tsx files inside of __tests__ folders, as well as any
	// files with a suffix of .test or .spec (e.g. Component.test.js or
	// Component.spec.js). It will also find files called test.js or spec.js.
	testMatch: [
		// The defaults:
		// "**/__tests__/**/*.[jt]s?(x)",
		// "**/?(*.)+(spec|test).[jt]s?(x)",
		"<rootDir>/test/**/?(*.)+(spec|test).[jt]s?(x)"
	],

	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': [
			'ts-jest',
			{
				tsconfig: 'test/tsconfig.json'
			}
		]
	},

	// transformIgnorePatterns: [
	// 	'/node_modules/(?!@sindresorhus/)'
	// ]
}
