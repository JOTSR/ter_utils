import { assertAlmostEquals } from 'https://deno.land/std@0.177.0/testing/asserts.ts'
import { Denum } from '../deps.ts'

export function fitSin(
	xyArray: (readonly [number, number])[],
): { freq: number; mag: number; offset: number } {
	const y = xyArray.map(([_, y]) => y)

	const offset = Denum.mean(...y)
	const mag = (Math.max(...y) - Math.min(...y)) / 2

	const e: number[] = []
	for (let i = 1; i < xyArray.length; i++) {
		if (xyArray[i - 1][1] < offset && offset < xyArray[i][1]) {
			e.push(xyArray[i][0])
			continue
		}
		if (xyArray[i - 1][1] > offset && offset > xyArray[i][1]) {
			e.push(xyArray[i][0])
			continue
		}
	}
	const f: number[] = []
	for (let i = 1; i < e.length; i++) {
		f.push(e[i] - e[i - 1])
	}
	const freq = Denum.mean(...f)

	return { mag, freq, offset }
}

const mag = Math.random() * 10 + 1
const freq = Math.random() + 1
const offset = Math.random() * 10
const xy = [...Array(1e3).keys()].map((e) =>
	[e, mag * Math.sin(freq * e * 2 * Math.PI) + offset] as const
)

Deno.test({
	name: 'fit sin magnitude',
	fn: () => assertAlmostEquals(mag, fitSin(xy).mag, 0.1 * mag),
})

Deno.test({
	name: 'fit sin frequency',
	fn: () => assertAlmostEquals(freq, fitSin(xy).freq, 0.2 * freq),
})

Deno.test({
	name: 'fit sin offset',
	fn: () => assertAlmostEquals(offset, fitSin(xy).offset, 0.1 * offset),
})
