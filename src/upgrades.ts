import { type CompanionStaticUpgradeScript, CreateConvertToBooleanFeedbackUpgradeScript } from '@companion-module/base'
import type { DeviceConfig } from './config.js'
import { FeedbackId } from './feedback.js'

const BooleanFeedbackUpgradeMap: {
	[id in FeedbackId]?: true
} = {
	switch_state: true,
	input_boolean_state: true,
	light_on_state: true,
	binary_sensor_state: true,
}

export const UpgradeScripts: CompanionStaticUpgradeScript<DeviceConfig>[] = [
	CreateConvertToBooleanFeedbackUpgradeScript(BooleanFeedbackUpgradeMap),
]
