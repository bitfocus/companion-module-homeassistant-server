import {
	CompanionFeedbackDefinition,
	CompanionFeedbackDefinitions,
	combineRgb,
	CompanionFeedbackBooleanEvent,
	CompanionFeedbackInfo,
} from '@companion-module/base'
import type { HassEntities, HassEntity } from 'home-assistant-js-websocket'
import { EntityPicker, OnOffPicker } from './choices.js'
import { EntitySubscriptions } from './state.js'

export enum FeedbackId {
	SwitchState = 'switch_state',
	InputBooleanState = 'input_boolean_state',
	LightOnState = 'light_on_state',
	BinarySensorState = 'binary_sensor_state',
	InputSelectState = 'input_select_state',
	GroupOnState = 'group_on_state',
}

export function GetFeedbacksList(
	initialState: HassEntity[],
	getState: () => HassEntities,
	entitySubscriptions: EntitySubscriptions,
): CompanionFeedbackDefinitions {
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

	const subscribeEntityPicker = (feedback: CompanionFeedbackInfo): void => {
		const entityId = String(feedback.options.entity_id)
		entitySubscriptions.subscribe(entityId, feedback.id, feedback.feedbackId as FeedbackId)
	}
	const unsubscribeEntityPicker = (feedback: CompanionFeedbackInfo): void => {
		const entityId = String(feedback.options.entity_id)
		entitySubscriptions.unsubscribe(entityId, feedback.id)
	}

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
			subscribe: subscribeEntityPicker,
			unsubscribe: unsubscribeEntityPicker,
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
			subscribe: subscribeEntityPicker,
			unsubscribe: unsubscribeEntityPicker,
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
			subscribe: subscribeEntityPicker,
			unsubscribe: unsubscribeEntityPicker,
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
			subscribe: subscribeEntityPicker,
			unsubscribe: unsubscribeEntityPicker,
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
			subscribe: subscribeEntityPicker,
			unsubscribe: unsubscribeEntityPicker,
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
			subscribe: subscribeEntityPicker,
			unsubscribe: unsubscribeEntityPicker,
		},
	}

	return feedbacks
}
