import type { DeviceConfig } from './config.js'
import type { HassVariables } from './variables.js'
import type { ActionsSchema } from './actions.js'
import type { FeedbacksSchema } from './feedback.js'

export type HassSchema = {
	config: DeviceConfig
	secrets: undefined
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: HassVariables
}
