import { assertAlmostEquals, Denum } from '../../../deps.ts'
import { ExperimentalDatas, FitOptions, FitResult } from '../../../types.ts'
import { range, zip } from '../../../utils.ts'
import { poly } from './poly.ts'

/**
 * Fit a 2D datas array to a sinus approximation.
 * @param  - `datas`: the data points to fit
 * @param {FitOptions}  - `datas`: the data points to fit
 * @returns Fit points and fit params (up to 15% error).
 */
export function sin(
	{ datas }: Pick<ExperimentalDatas['measures'][0], 'datas'>,
	{ resolution, degree }: FitOptions = { resolution: 0.01, degree: 1 },
): FitResult<
	{
		magnitude: number
		pulsation: number
		phase: number
		carrier: FitResult<{ coefs: number[] }>
	}
> {
	const extremums: [number, number][] = []
	for (let index = 1; index < datas.length - 1; index++) {
		if (
			Math.sign(datas[index][1] - datas[index - 1][1]) !==
				Math.sign(datas[index + 1][1] - datas[index][1])
		) {
			extremums.push(datas[index] as [number, number])
		}
	}

	const magnitudes: number[] = []
	const periods: number[] = []
	const phases: number[] = []

	for (let index = 1; index < extremums.length; index++) {
		periods.push(Math.abs(extremums[index][0] - extremums[index - 1][0]))
		magnitudes.push(Math.abs(extremums[index][1] - extremums[index - 1][1]) / 2)
	}

	const magnitude = Denum.mean(...magnitudes)
	const pulsation = Math.PI / Denum.mean(...periods)

	for (let index = 0; index < extremums.length; index++) {
		phases.push(extremums[index][0] - index * Math.PI / pulsation)
	}

	const falling = extremums[0][1] > extremums[1][1]
	const phase = falling
		? Denum.mean(...phases) + Math.PI
		: Denum.mean(...phases)

	const carrier = poly({
		datas: extremums.filter((_, index) => index % 2 === 0).map((
			[x, y],
		) => [x, falling ? y - magnitude : y + magnitude]),
	}, { resolution, degree })

	const computeCarrier = (x: number) =>
		carrier.params.coefs.reduce(
			(acc, coef, power) => acc + coef * x ** power,
			0,
		)

	const x = range(datas[0][0], datas[0][1], resolution)
	const y = x.map((_, i) =>
		magnitude * Math.sin(pulsation * x[i] + phase) + computeCarrier(i)
	)

	return {
		points: zip(x, y),
		params: { magnitude, pulsation, phase, carrier },
	}
}

Deno.test({
	name: 'fit sinusoidal',
	fn: () => {
		const magnitude = Denum.random(0.2, 10)
		const pulsation = Denum.random(0.2, 2)
		const phase = Denum.random(0, 10)
		const carrierCoefs = Denum.randomArray(0, 5, 2).map((coef) =>
			Denum.round(coef, 4)
		)
		// const carrierCoefs = [0]
		const carrier = (x: number) =>
			carrierCoefs.reduce((acc, coef, power) => acc + coef * x ** power, 0)

		const x = [...Array(40).keys()]
		const y = x.map((i) =>
			magnitude * Math.sin(pulsation * i + phase) + carrier(i)
		)
		const datas = zip<[number, number]>(x, y)

		const fit = sin({ datas }, {
			resolution: 1,
			degree: carrierCoefs.length - 1,
		})

		const errorFactor = 0.15
		assertAlmostEquals(magnitude, fit.params.magnitude, magnitude * errorFactor)
		assertAlmostEquals(pulsation, fit.params.pulsation, pulsation * errorFactor)
		//TODO assertAlmostEquals(phase, fit.params.phase, errorFactor * (1 + phase))
		carrierCoefs.map((_, index) =>
			assertAlmostEquals(
				carrierCoefs[index],
				fit.params.carrier.params.coefs[index],
				errorFactor * (1 + carrierCoefs[index]),
			)
		)
	},
})
