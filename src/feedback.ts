import {
	CompanionFeedbackDefinition,
	CompanionFeedbackDefinitions,
	combineRgb,
	CompanionFeedbackBooleanEvent,
} from '@companion-module/base'
import type { HassEntities } from 'home-assistant-js-websocket'
import { EntityPicker, OnOffPicker } from './choices.js'

export enum FeedbackId {
	SwitchState = 'switch_state',
	InputBooleanState = 'input_boolean_state',
	LightOnState = 'light_on_state',
	BinarySensorState = 'binary_sensor_state',
	InputSelectState = 'input_select_state',
	GroupOnState = 'group_on_state',
}

export function GetFeedbacksList(getState: () => HassEntities): CompanionFeedbackDefinitions {
	const checkEntityOnOffState = (feedback: CompanionFeedbackBooleanEvent): boolean => {
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
	const feedbacks: { [id in FeedbackId]: CompanionFeedbackDefinition | undefined } = {
		[FeedbackId.SwitchState]: {
			type: 'boolean',
			name: 'Change from switch state',
			description: 'If the switch state matches the rule, change style of the bank',
			options: [EntityPicker(initialState, 'switch'), OnOffPicker()],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (feedback): boolean => checkEntityOnOffState(feedback),
		},
		[FeedbackId.InputBooleanState]: {
			type: 'boolean',
			name: 'Change from input_boolean state',
			description: 'If the input_boolean state matches the rule, change style of the bank',
			options: [EntityPicker(initialState, 'input_boolean'), OnOffPicker()],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (feedback): boolean => checkEntityOnOffState(feedback),
		},
		[FeedbackId.LightOnState]: {
			type: 'boolean',
			name: 'Change from light on state',
			description: 'If the light state matches the rule, change style of the bank',
			options: [EntityPicker(initialState, 'light'), OnOffPicker()],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (feedback): boolean => checkEntityOnOffState(feedback),
		},
		[FeedbackId.BinarySensorState]: {
			type: 'boolean',
			name: 'Change from binary sensor state',
			description: 'If the binary sensor state matches the rule, change style of the bank',
			options: [EntityPicker(initialState, 'binary_sensor'), OnOffPicker()],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (feedback): boolean => checkEntityOnOffState(feedback),
		},
		[FeedbackId.InputSelectState]: {
			type: 'boolean',
			name: 'Change from input select state',
			description: 'If the input select state matches the rule, change style of the bank',
			options: [
				EntityPicker(initialState, 'input_select'),
				{
					type: 'textinput',
					id: 'option',
					default: '',
					label: 'Option',
				},
			],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (feedback): boolean => {
				const state = getState()
				const entity = state[String(feedback.options.entity_id)]
				if (entity) {
					return entity.state === feedback.options.option
				}
				return false
			},
		},
		[FeedbackId.GroupOnState]: {
			type: 'boolean',
			name: 'Change from group on state',
			description: 'If the group state matches the rule, change style of the bank',
			options: [EntityPicker(initialState, 'group'), OnOffPicker()],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (feedback): boolean => checkEntityOnOffState(feedback),
		},
	}

	return feedbacks
}
