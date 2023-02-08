type ExperimentalCondition = {
	name: string
	unit: string
	value: number
	description?: string
}

export type ExperimentalDatas = {
	conditions: ExperimentalCondition[]
	measures: {
		name: string
		description: string
		conditions: ExperimentalCondition[]
		format: {
			name: string
			unit: string
		}[]
		datas: number[][]
	}[]
}
