import { Denum, PolyFit, assertAlmostEquals } from "@/deps.ts"
import { ExperimentalDatas, FitOptions, FitResult } from "@/types.ts"
import { range, transpose2D, zip } from "@/utils.ts"

/**
 * Fit a 2D data array to a polynomial approximation.
 * @param  - `datas`: the data points to fit
 * @param {FitOptions}  - `datas`: the data points to fit
 * @returns Fit points and fit params.
 */
export function poly(
	{ datas }: Pick<ExperimentalDatas['measures'][0], 'datas'>,
	{ resolution, degree }: FitOptions = { resolution: 0.01, degree: 1 },
): FitResult<{ coefs: number[] }> {
	const [x] = transpose2D(datas as [number, number][])

	const fit = PolyFit.read(
		datas.map(([x, y]) => ({ x, y })),
		degree,
	)
	const terms = fit.getTerms() as number[]
	const fitX = range(
		Math.min(...x),
		Math.max(...x) + resolution,
		resolution,
	)
	const fitY = fitX.map((x) => fit.predictY(terms, x)) as number[]

	const points = zip<[number, number]>(fitX, fitY)

	return { points, params: { coefs: terms } }
}

Deno.test({
    name: 'fit plynomial',
    fn: () => {
        const coefs = Denum.randomArray(0, 5, Denum.randomInt(1, 5)).map(coef => Denum.round(coef, 4))
        
        const x = [...Array(Denum.randomInt(2, 100)).keys()]
        const y = x.map(i => coefs.reduce((acc, coef, power) => acc + coef * i ** power, 0))
        const datas = zip<[number, number]>(x, y)

        const fit = poly({ datas }, { resolution: 1, degree: coefs.length - 1 })
        
        coefs.map((_, index) => assertAlmostEquals(coefs[index], fit.params.coefs[index], coefs[index] * 0.01))
        datas.flat().map((point, index) => assertAlmostEquals(point, fit.points.flat()[index], point * 0.01))
    }
})
