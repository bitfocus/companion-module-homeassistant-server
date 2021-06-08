import { HassEntities } from 'home-assistant-js-websocket'
import { SetRequired } from 'type-fest'
import InstanceSkel = require('../../../instance_skel')
import { CompanionFeedbackEvent, CompanionFeedbacks, CompanionFeedbackBoolean } from '../../../instance_skel_types'
import { EntityPicker, OnOffPicker } from './choices'
import { DeviceConfig } from './config'

export enum FeedbackId {
	SwitchState = 'switch_state',
	InputBooleanState = 'input_boolean_state',
	LightOnState = 'light_on_state',
	BinarySensorState = 'binary_sensor_state',
}

type CompanionFeedbackWithCallback = SetRequired<CompanionFeedbackBoolean, 'callback'>

export function GetFeedbacksList(
	instance: InstanceSkel<DeviceConfig>,
	getState: () => HassEntities
): CompanionFeedbacks {
	const checkEntityOnOffState = (feedback: CompanionFeedbackEvent): boolean => {
		const state = getState()
		const entity = state[String(feedback.options.entity_id)]
		if (entity) {
			const isOn = entity.state === 'on'
			const targetOn = !!feedback.options.state
			return isOn === targetOn
		}
		return false
	}

	const initialState = getState()
	const feedbacks: { [id in FeedbackId]: CompanionFeedbackWithCallback | undefined } = {
		[FeedbackId.SwitchState]: {
			type: 'boolean',
			label: 'Change from switch state',
			description: 'If the switch state matches the rule, change style of the bank',
			options: [EntityPicker(initialState, 'switch'), OnOffPicker()],
			style: {
				color: instance.rgb(0, 0, 0),
				bgcolor: instance.rgb(0, 255, 0),
			},
			callback: (feedback): boolean => checkEntityOnOffState(feedback),
		},
		[FeedbackId.InputBooleanState]: {
			type: 'boolean',
			label: 'Change from input_boolean state',
			description: 'If the input_boolean state matches the rule, change style of the bank',
			options: [EntityPicker(initialState, 'input_boolean'), OnOffPicker()],
			style: {
				color: instance.rgb(0, 0, 0),
				bgcolor: instance.rgb(0, 255, 0),
			},
			callback: (feedback): boolean => checkEntityOnOffState(feedback),
		},
		[FeedbackId.LightOnState]: {
			type: 'boolean',
			label: 'Change from light on state',
			description: 'If the light state matches the rule, change style of the bank',
			options: [EntityPicker(initialState, 'light'), OnOffPicker()],
			style: {
				color: instance.rgb(0, 0, 0),
				bgcolor: instance.rgb(0, 255, 0),
			},
			callback: (feedback): boolean => checkEntityOnOffState(feedback),
		},
		[FeedbackId.BinarySensorState]: {
			type: 'boolean',
			label: 'Change from binary sensor state',
			description: 'If the binary sensor state matches the rule, change style of the bank',
			options: [EntityPicker(initialState, 'binary_sensor'), OnOffPicker()],
			style: {
				color: instance.rgb(0, 0, 0),
				bgcolor: instance.rgb(0, 255, 0),
			},
			callback: (feedback): boolean => checkEntityOnOffState(feedback),
		},
	}

	return feedbacks
}
