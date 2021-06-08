import { FeedbackId } from './feedback'

export const BooleanFeedbackUpgradeMap: {
	[id in FeedbackId]?: true
} = {
	[FeedbackId.SwitchState]: true,
	[FeedbackId.InputBooleanState]: true,
	[FeedbackId.LightOnState]: true,
	[FeedbackId.BinarySensorState]: true,
}
