import type {
	CompanionFeedbackDefinitions,
	CompanionFeedbackBooleanEvent,
	CompanionFeedbackInfo,
} from '@companion-module/base'
import type { HassEntities, HassEntity } from 'home-assistant-js-websocket'
import { EntityPicker, HvacModePicker, OnOffPicker } from './choices.js'
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
	lock_state: {
		type: 'boolean'
		options: {
			entity_id: string
			locked: boolean
		}
	}
	cover_state: {
		type: 'boolean'
		options: {
			entity_id: string
			state: boolean
		}
	}
	climate_hvac_mode: {
		type: 'boolean'
		options: {
			entity_id: string
			hvac_mode: string
		}
	}
	climate_hvac_action: {
		type: 'boolean'
		options: {
			entity_id: string
			hvac_action: string
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
		lock_state: {
			type: 'boolean',
			name: 'Change from lock state',
			description: 'If the lock state matches the rule, change style of the bank',
			options: [
				EntityPicker(initialState, 'lock'),
				{
					type: 'checkbox',
					label: 'Locked',
					id: 'locked',
					default: true,
				},
			],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: (feedback): boolean => {
				subscribeEntityPicker(feedback)
				const state = getState()
				const entity = state[feedback.options.entity_id]
				if (entity) {
					const isLocked = entity.state === 'locked'
					return isLocked === !!feedback.options.locked
				}
				return false
			},
			unsubscribe: unsubscribeEntityPicker,
		},
		cover_state: {
			type: 'boolean',
			name: 'Change from cover open/closed state',
			description: 'If the cover open/closed state matches the rule, change style of the bank',
			options: [
				EntityPicker(initialState, 'cover'),
				{
					type: 'checkbox',
					label: 'Open',
					id: 'state',
					default: true,
				},
			],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: (feedback): boolean => {
				subscribeEntityPicker(feedback)
				const state = getState()
				const entity = state[feedback.options.entity_id]
				if (entity) {
					const isOpen = entity.state === 'open'
					return isOpen === !!feedback.options.state
				}
				return false
			},
			unsubscribe: unsubscribeEntityPicker,
		},
		climate_hvac_mode: {
			type: 'boolean',
			name: 'Change from climate HVAC mode',
			description: 'If the climate HVAC mode matches the rule, change style of the bank',
			options: [EntityPicker(initialState, 'climate'), HvacModePicker()],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: (feedback): boolean => {
				subscribeEntityPicker(feedback)
				const state = getState()
				const entity = state[feedback.options.entity_id]
				if (entity) {
					return entity.state === feedback.options.hvac_mode
				}
				return false
			},
			unsubscribe: unsubscribeEntityPicker,
		},
		climate_hvac_action: {
			type: 'boolean',
			name: 'Change from climate HVAC action',
			description: 'Match the current HVAC action attribute, e.g. heating, cooling, idle, off',
			options: [
				EntityPicker(initialState, 'climate'),
				{
					type: 'textinput',
					id: 'hvac_action',
					label: 'HVAC action',
					default: 'heating',
				},
			],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: (feedback): boolean => {
				subscribeEntityPicker(feedback)
				const state = getState()
				const entity = state[feedback.options.entity_id]
				if (entity) {
					return entity.attributes?.hvac_action === feedback.options.hvac_action
				}
				return false
			},
			unsubscribe: unsubscribeEntityPicker,
		},
	}

	return feedbacks
}
