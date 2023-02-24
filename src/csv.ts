import { path } from '../deps.ts'
import { ExperimentalDatas } from '../types.ts'

export class CSV {
	static write(
		dir: string,
		{ measures }: { measures: ExperimentalDatas['measures'] },
		{ separator } = { separator: ';' },
	) {
		for (const measure of measures) {
			const headers = measure.format.map((header) =>
				`"${header.description ?? header.name}" ${header.name} / ${header.unit}`
			)
			const csv = headers.join(separator) + '\n' +
				measure.datas.map((values) => values.join(separator)).join('\n')
			Deno.writeTextFile(path.join(dir, measure.description), csv)
		}
	}
}
