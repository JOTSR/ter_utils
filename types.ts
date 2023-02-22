export type DatasEntry = {
	name?: string
	unit?: string
	value?: string | number
	uncert?: string | number
	description?: string
}

export type ExperimentalDatas = {
	conditions: Record<string, unknown>
	measures: {
		name: string
		description: string
		conditions: (Pick<DatasEntry, 'name' | 'value'> & DatasEntry)[]
		format: (
			& Pick<DatasEntry, 'name'>
			& Partial<Pick<DatasEntry, 'unit' | 'uncert' | 'description'>>
		)[]
		datas: (string | number)[][]
	}[]
}
