import { Denum } from '../../../deps.ts'
import { ExperimentalDatas, FitOptions, FitResult } from '../../../types.ts'
import { range, transpose2D, zip } from '../../../utils.ts'

/**
 * Fit a 2D datas array to a gaussian approximation.
 * @param  - `datas`: the data points to fit
 * @param {FitOptions}  - `datas`: the data points to fit
 * @returns Fit points and fit params.
 */
export function gaussian(
	{ datas }: Pick<ExperimentalDatas['measures'][0], 'datas'>,
	{ resolution }: Pick<FitOptions, 'resolution'> = { resolution: 0.01 },
): FitResult<{ μ: number; σ: number }> {
	const [x] = transpose2D(datas as [number, number][])
	const μ = Denum.mean(...x)
	const σ = Math.sqrt(
		x.reduce((prev, curr) => prev + (curr - μ) ** 2) / (x.length - 1),
	)

	Math.sqrt(
		(1 / (x.length - 1)) *
				Denum.mean(...x.map((value) => value ** 2)) - Denum.mean(...x) ** 2,
	)

	const fitX = range(
		Math.min(...x),
		Math.max(...x) + resolution,
		resolution,
	)
	const fitY = fitX.map((x) => gaussFn(x, μ, σ))

	const points = zip<[number, number]>(fitX, fitY)

	return { points, params: { μ, σ } }
}

function gaussFn(x: number, μ: number, σ: number): number {
	return (1 / (σ * Math.sqrt(2 * Math.PI))) *
		Math.exp(-((x - μ) ** 2 / (2 * σ ** 2)))
}
