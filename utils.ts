/**
 * It returns an array of numbers from start to end, incrementing by step.
 * @param {number} start - The first number in the range.
 * @param {number} end - The end of the range.
 * @param {number} step - The step between each number in the sequence.
 * @returns An array of numbers.
 */
export function range(start: number, end: number, step: number): number[] {
	const array: number[] = []
	for (let i = start; i < end; i += step) array.push(i)
	return array
}

/**
 * It takes an array of arrays of numbers, and returns an array of arrays of numbers
 * @param {number[][]} array - The array to transpose.
 * @returns [number[], number[]]
 */
export function transpose2D(array: number[][]): [number[], number[]] {
	const x = array.map((e) => e[0]).flat()
	const y = array.map((e) => e[1]).flat()
	return [x, y]
}

/**
 * Zip arrays into one.
 * @param {T[][]} arrays - T[][]
 * @returns Zipped array.
 */
export function zip<T extends unknown[], U extends unknown[] = Array<keyof T>>(...arrays: U[]): T[] {
	const zipped: T[] = []
	for (let index = 0; index < arrays[0].length; index++) {
		zipped.push(arrays.map((array) => array[index]).flat() as T)
	}
	return zipped
}
