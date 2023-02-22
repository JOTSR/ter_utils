import { Denum, Deplot, PolyFit } from '../deps.ts'
import { ExperimentalDatas } from '../types.ts'

export const deplot = new Deplot('Plotly')

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

export type PlotClassicOptions = {
	fits: {
		degree: number
		resolution: number
	}[]
	layout?: Partial<Plotly.Layout>
	title: string
	size?: [number, number]
}

/**
 * It plots the experimental data and the fit alongside to each other
 * @param measures - ExperimentalDatas['measures']
 * @param {PlotClassicOptions}  - `measures`: The experimental data to plot.
 */
export function plotClassic(
	measures: ExperimentalDatas['measures'],
	{ fits, layout, title, size }: PlotClassicOptions,
) {
	const data: Plotly.Data[] = measures.map(
		({ datas, name, description }, index) => {
			//transform data to plotly format
			const [x, y] = transpose2D(datas as [number, number][])

			const fit = PolyFit.read(
				datas.map(([x, y]) => ({ x, y })),
				fits[index].degree,
			)
			const terms = fit.getTerms() as number[]
			const fitX = Denum.range(
				Denum.round(Math.min(...x), 2),
				Denum.round(Math.max(...x), 2),
				fits[index].resolution,
			)
			const fitY = fitX.map((x) => fit.predictY(terms, x)) as number[]

			return [{
				//plot experimental datas
				x,
				y,
				mode: 'markers',
				type: 'scatter',
				name,
				xaxis: `x${index + 1}`,
				yaxis: `y${index + 1}`,
				title: { text: description },
			}, {
				//Draw fit alongside to experimental data
				x: fitX,
				y: fitY,
				mode: 'lines',
				name: terms.map((coef, index) =>
					index === 0
						? `${Denum.round(coef, 2)}`
						: `${Denum.round(coef, 2)} * x^${index}`
				).toReversed().join(' + '),
				xaxis: `x${index + 1}`,
				yaxis: `y${index + 1}`,
			}] as Plotly.Data[]
		},
	).flat()

	const _layout: Partial<Plotly.Layout> = {
		showlegend: true,
		grid: {
			rows: Math.floor(Math.sqrt(measures.length)),
			columns: Math.ceil(Math.sqrt(measures.length)),
			pattern: 'independent',
		},
		...layout,
	}
	measures.forEach(({ format }, index) => {
		//@ts-ignore _
		_layout[`xaxis${index + 1}`] = {
			title: `${format[0].name} (${format[0].unit})`,
		}
		//@ts-ignore _
		_layout[`yaxis${index + 1}`] = {
			title: `${format[1].name} (${format[1].unit})`,
		}
	})

	deplot.plot({ data, layout: _layout }, {
		title,
		size: size ?? [1280, 720],
	})
}
