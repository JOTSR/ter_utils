import { fs, path } from "@/deps.ts"
import { ExperimentalDatas } from "@/types.ts"

export class Cassy {
	/**
	 * Parse cassy text data to Datas interface.
	 * @param filePath - Path of the file.
	 * @param  options - name: Name of the measure entry.
	 * @returns Datas.
	 */
	static async read(filePath: string, { name }: { name: string }) {
		const { base } = path.parse(filePath)
		const regExp = /"(.+)"\s(\S+)\s?\/?\s?(\S*)/

		const file = await Deno.readTextFile(filePath)
		const format = file
			.split('\n')
			.at(4)
			?.split('\t')
			.slice(0, -1)
			.map((header) => header.match(regExp) ?? [])
			.map(([_, description, name, unit]) => ({
				name,
				unit: unit !== '' ? unit : undefined,
				description,
			}))

		if (format === undefined) {
			throw new TypeError(
				`can't parse headers from [${
					file.split('\n').at(4)?.split('\t').slice(0, -1)
				}]`,
			)
		}

		const datas = file
			.split('\n')
			.slice(5)
			.map((row) =>
				row.split('\t').slice(0, -1).map((value) =>
					parseFloat(value.replace(',', '.'))
				)
			)

		return {
			conditions: {},
			measures: [{
				name,
				description: base,
				conditions: [],
				format,
				datas,
			}],
		} satisfies ExperimentalDatas
	}

	/**
	 * Get all datas of a cassy text files matching a glob expression and encapse in one Datas object as a serie of measures.
	 * @param glob - The glob to expand.
	 * @param  options - names: Name list for each measures.
	 * @returns Datas.
	 */
	static async readDir(glob: string, { names }: { names: string[] }) {
		const datas: ExperimentalDatas[] = []

		for await (const file of fs.expandGlob(glob)) {
			if (file.isFile) {
				datas.push(
					await this.read(file.path, { name: names.shift() ?? 'undefined' }),
				)
			}
		}

		return {
			...datas[0],
			measures: datas.map(({ measures }) => measures).flat(),
		} satisfies ExperimentalDatas
	}
}
