import type { IZipEntry } from 'adm-zip';

/**
 * Sorts ZIP entries based on specified criteria.
 * @param {string} zipPath - Path to the ZIP file.
 * @param {Object} [options] - Sorting options.
 * @param {boolean} [options.prioritizeShorter=true] - Sort by path length (shorter first).
 * @param {boolean} [options.prioritizeDirectories=false] - Prioritize directories over files.
 * @param {string} [options.excludePattern] - Pattern to deprioritize (e.g., '__unnamed__').
 * @param {boolean} [options.caseInsensitive=false] - Use case-insensitive sorting.
 * @returns {Array} Sorted array of ZipEntry objects.
 */
export function sortZipEntries(entries: IZipEntry[], options: {
	prioritizeShorter?: boolean;
	prioritizeDirectories?: boolean;
	excludePattern?: string | null;
	caseInsensitive?: boolean;
} = {}): IZipEntry[] {
	const {
		prioritizeShorter = true,
		prioritizeDirectories = false,
		excludePattern = null,
		caseInsensitive = false,
	} = options;

	return entries.sort((a, b) => {
		// Handle directory prioritization
		if (prioritizeDirectories && a.isDirectory !== b.isDirectory) {
			return a.isDirectory ? -1 : 1; // Directories first
		}

		// Handle pattern exclusion (e.g., __unnamed__)
		if (excludePattern) {
			const aHasPattern = a.entryName.includes(excludePattern);
			const bHasPattern = b.entryName.includes(excludePattern);
			if (aHasPattern !== bHasPattern) {
				return aHasPattern ? 1 : -1; // Entries with pattern last
			}
		}

		// Handle length-based sorting
		if (prioritizeShorter && a.entryName.length !== b.entryName.length) {
			return a.entryName.length - b.entryName.length; // Shorter paths first
		}

		// Alphabetical sorting (case-sensitive or insensitive)
		return caseInsensitive
			? a.entryName.localeCompare(b.entryName, undefined, { sensitivity: 'base' })
			: a.entryName.localeCompare(b.entryName);
	});
}
