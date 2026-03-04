import type {
	CompanionFeedbackDefinitions,
	CompanionFeedbackBooleanEvent,
	CompanionFeedbackInfo,
} from '@companion-module/base'
import type { HassEntities, HassEntity } from 'home-assistant-js-websocket'
import { EntityPicker, OnOffPicker } from './choices.js'
import { EntitySubscriptions } from './state.js'

export type FeedbackId = keyof FeedbacksSchema

export type FeedbacksSchema = {
	switch_state: {
		type: 'boolean'
		options: {
			entity_id: string
			state: boolean
		}
	}
	input_boolean_state: {
		type: 'boolean'
		options: {
			entity_id: string
			state: boolean
		}
	}
	light_on_state: {
		type: 'boolean'
		options: {
			entity_id: string
			state: boolean
		}
	}
	binary_sensor_state: {
		type: 'boolean'
		options: {
			entity_id: string
			state: boolean
		}
	}
	input_select_state: {
		type: 'boolean'
		options: {
			entity_id: string
			option: string
		}
	}
	group_on_state: {
		type: 'boolean'
		options: {
			entity_id: string
			state: boolean
		}
	}
}

export function GetFeedbacksList(
	initialState: HassEntity[],
	getState: () => HassEntities,
	entitySubscriptions: EntitySubscriptions,
): CompanionFeedbackDefinitions<FeedbacksSchema> {
	const checkEntityOnOffState = (
		feedback: CompanionFeedbackBooleanEvent<{ entity_id: string; state: boolean }>,
	): boolean => {
		const state = getState()
		const entity = state[feedback.options.entity_id]
		if (entity) {
			const isOn = entity.state === 'on'
			const targetOn = !!feedback.options.state
			return isOn === targetOn
		}
		return false
	}

	const subscribeEntityPicker = (feedback: CompanionFeedbackInfo<{ entity_id: string }>): void => {
		entitySubscriptions.subscribe(feedback.options.entity_id, feedback.id, feedback.feedbackId as FeedbackId)
	}
	const unsubscribeEntityPicker = (feedback: CompanionFeedbackInfo<{ entity_id: string }>): void => {
		entitySubscriptions.unsubscribe(feedback.options.entity_id, feedback.id)
	}

	const feedbacks: CompanionFeedbackDefinitions<FeedbacksSchema> = {
		switch_state: {
			type: 'boolean',
			name: 'Change from switch state',
			description: 'If the switch state matches the rule, change style of the bank',
			options: [EntityPicker(initialState, 'switch'), OnOffPicker()],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: (feedback): boolean => {
				subscribeEntityPicker(feedback)

				return checkEntityOnOffState(feedback)
			},
			unsubscribe: unsubscribeEntityPicker,
		},
		input_boolean_state: {
			type: 'boolean',
			name: 'Change from input_boolean state',
			description: 'If the input_boolean state matches the rule, change style of the bank',
			options: [EntityPicker(initialState, 'input_boolean'), OnOffPicker()],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: (feedback): boolean => {
				subscribeEntityPicker(feedback)
				return checkEntityOnOffState(feedback)
			},
			unsubscribe: unsubscribeEntityPicker,
		},
		light_on_state: {
			type: 'boolean',
			name: 'Change from light on state',
			description: 'If the light state matches the rule, change style of the bank',
			options: [EntityPicker(initialState, 'light'), OnOffPicker()],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: (feedback): boolean => {
				subscribeEntityPicker(feedback)
				return checkEntityOnOffState(feedback)
			},
			unsubscribe: unsubscribeEntityPicker,
		},
		binary_sensor_state: {
			type: 'boolean',
			name: 'Change from binary sensor state',
			description: 'If the binary sensor state matches the rule, change style of the bank',
			options: [EntityPicker(initialState, 'binary_sensor'), OnOffPicker()],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: (feedback): boolean => {
				subscribeEntityPicker(feedback)
				return checkEntityOnOffState(feedback)
			},
			unsubscribe: unsubscribeEntityPicker,
		},
		input_select_state: {
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
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: (feedback): boolean => {
				subscribeEntityPicker(feedback)
				const state = getState()
				const entity = state[String(feedback.options.entity_id)]
				if (entity) {
					return entity.state === feedback.options.option
				}
				return false
			},
			unsubscribe: unsubscribeEntityPicker,
		},
		group_on_state: {
			type: 'boolean',
			name: 'Change from group on state',
			description: 'If the group state matches the rule, change style of the bank',
			options: [EntityPicker(initialState, 'group'), OnOffPicker()],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: (feedback): boolean => {
				subscribeEntityPicker(feedback)
				return checkEntityOnOffState(feedback)
			},
			unsubscribe: unsubscribeEntityPicker,
		},
	}

	return feedbacks
}
