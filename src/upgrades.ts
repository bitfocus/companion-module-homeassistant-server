import { CompanionStaticUpgradeScript, CreateConvertToBooleanFeedbackUpgradeScript } from '@companion-module/base'
import { DeviceConfig } from './config'
import { FeedbackId } from './feedback'

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
