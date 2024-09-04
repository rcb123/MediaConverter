/**
 * Formats a media file size in bytes to a human-readable string using binary units (up to GB).
 *
 * @param {number} bytes - The size in bytes to be converted.
 * @param {number} [precision=2] - Optional. The number of decimal places to include (default is 2).
 * @returns {string} Human-readable size format (e.g., "1.23 MB", "4.56 GB").
 */
export function formatMediaFileSize(bytes: number, precision: number = 2): string {
	if (bytes < 0) {
		throw new Error('Bytes cannot be negative');
	}

	if (isNaN(bytes) || !isFinite(bytes)) {
		throw new Error('Invalid byte value');
	}

	const units = ['Bytes', 'KB', 'MB', 'GB'];
	const base = 1024;

	if (bytes === 0) {
		return `0 ${units[0]}`;
	}

	// Calculate the index of the unit based on the logarithm (base 1024)
	const unitIndex = Math.floor(Math.log(bytes) / Math.log(base));

	// Cap the unit index to 3, so it doesn't exceed 'GB'
	const cappedUnitIndex = Math.min(unitIndex, units.length - 1);

	// Calculate the value in the selected unit
	const readableValue = bytes / Math.pow(base, cappedUnitIndex);

	// Format the number with the specified precision
	return `${readableValue.toFixed(precision)} ${units[cappedUnitIndex]}`;
}

// Example usage:
// const size = formatMediaFileSize(1048576); // Returns "1.00 MB"
// const sizeWithPrecision = formatMediaFileSize(1048576, 3); // Returns "1.000 MB"
