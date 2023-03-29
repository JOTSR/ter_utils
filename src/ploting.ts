import { Deplot } from '../deps.ts'
import { ExperimentalDatas, FitResult } from '../types.ts'
import { transpose2D } from '../utils.ts'

export const deplot = new Deplot('Plotly')

export type PlotClassicOptions<
	T extends Record<string, unknown> = Record<string, unknown>,
> = {
	fits?: (FitResult<T> | undefined)[]
	layout?: Partial<Plotly.Layout>
	title: string
	size?: [number, number]
	traceOptions?: Partial<Omit<Plotly.Data, 'x' | 'y'>>[]
}

/**
 * It plots the experimental data and the fit alongside to each other
 * @param measures - ExperimentalDatas['measures']
 * @param {PlotClassicOptions}  - `measures`: The experimental data to plot.
 */
export function plotClassic(
	measures: ExperimentalDatas['measures'],
	{ fits, layout, title, size, traceOptions }: PlotClassicOptions,
) {
	const data: Plotly.Data[] = measures.map(
		({ datas, name, description }, index) => {
			//transform data to plotly format
			const [x, y] = transpose2D(datas as [number, number][])

			const scatter = {
				//plot experimental datas
				x,
				y,
				mode: 'markers',
				type: 'scatter',
				name,
				xaxis: layout?.grid?.pattern === 'coupled' ? 'x1' : `x${index + 1}`,
				yaxis: layout?.grid?.pattern === 'coupled' ? 'y1' : `y${index + 1}`,
				title: { text: description },
				...traceOptions?.[index],
			}

			if (fits?.at(index) !== undefined) {
				const { points, params } = fits[index]!
				const [x, y] = transpose2D(points)
				const name = (() => {
					if (params?.μ !== undefined && params?.σ !== undefined) {
						return `gauss(μ: ${params.μ}, σ: ${params.σ})`
					}
					if (params?.coefs !== undefined) {
						return (params.coefs as number[]).map((coef, index) =>
							index === 0
								? `${coef.toExponential(2)}`
								: `${coef.toExponential(2)} * x^${index}`
						).toReversed().join(' + ')
					}
					if (params?.pulsation !== undefined) {
						const { magnitude, pulsation, phase, carrier } = params as {
							magnitude: number
							pulsation: number
							phase: number
							carrier: FitResult<{ coefs: number[] }>
						}

						const carrierStr = (carrier.params.coefs as number[]).map((
							coef,
							index,
						) =>
							index === 0
								? `${coef.toExponential(2)}`
								: `${coef.toExponential(2)} * x^${index}`
						).toReversed().join(' + ')

						return `${magnitude.toExponential(2)} * sin(${
							pulsation.toExponential(2)
						} * x + ${phase.toExponential(2)}) + ${carrierStr}`
					}
					return `fit_${index}`
				})()

				return [scatter, {
					//Draw fit alongside to experimental data
					x,
					y,
					mode: 'lines',
					name,
					xaxis: layout?.grid?.pattern === 'coupled' ? 'x1' : `x${index + 1}`,
					yaxis: layout?.grid?.pattern === 'coupled' ? 'y1' : `y${index + 1}`,
					...traceOptions?.[index],
				}] as Plotly.Data[]
			}

			return [scatter] as Plotly.Data[]
		},
	).flat()

	const _layout: Partial<Plotly.Layout> = {
		showlegend: true,
		grid: {
			rows: Math.floor(Math.sqrt(measures.length)),
			columns: Math.ceil(Math.sqrt(measures.length)),
			pattern: 'independent',
		},
		legend: {
			x: 1,
			xanchor: 'right',
			y: 1,
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
