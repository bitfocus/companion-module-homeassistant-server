import { type CompanionStaticUpgradeScript, CreateConvertToBooleanFeedbackUpgradeScript } from '@companion-module/base'
import type { DeviceConfig } from './config.js'
import { FeedbackId } from './feedback.js'

const BooleanFeedbackUpgradeMap: {
	[id in FeedbackId]?: true
} = {
	[FeedbackId.SwitchState]: true,
	[FeedbackId.InputBooleanState]: true,
	[FeedbackId.LightOnState]: true,
	[FeedbackId.BinarySensorState]: true,
}

export const UpgradeScripts: CompanionStaticUpgradeScript<DeviceConfig>[] = [
	CreateConvertToBooleanFeedbackUpgradeScript(BooleanFeedbackUpgradeMap),
]
