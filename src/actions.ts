import {
	callService,
	type Connection,
	type HassEntity,
	type HassServices,
	type HassServiceTarget,
} from 'home-assistant-js-websocket'
import type { CompanionActionEvent, CompanionActionDefinitions, DropdownChoice } from '@companion-module/base'
import { EntityMultiplePicker, OnOffTogglePicker } from './choices.js'
import { OnOffToggle } from './util.js'

export type ActionsSchema = {
	set_switch: {
		options: {
			entity_id: string[]
			state: OnOffToggle
		}
	}
	set_input_boolean: {
		options: {
			entity_id: string[]
			state: OnOffToggle
		}
	}
	set_light_on: {
		options: {
			entity_id: string[]
			state: OnOffToggle
		}
	}
	set_light_pct: {
		options: {
			entity_id: string[]
			pct: number
		}
	}
	adj_light_pct: {
		options: {
			entity_id: string[]
			pct: number
		}
	}
	execute_script: {
		options: {
			entity_id: string[]
		}
	}
	press_button: {
		options: {
			entity_id: string[]
		}
	}
	activate_scene: {
		options: {
			entity_id: string[]
		}
	}
	input_select_first: {
		options: {
			entity_id: string[]
		}
	}
	input_select_last: {
		options: {
			entity_id: string[]
		}
	}
	input_select_next: {
		options: {
			entity_id: string[]
		}
	}
	input_select_previous: {
		options: {
			entity_id: string[]
		}
	}
	input_select_set: {
		options: {
			entity_id: string[]
			option: string
		}
	}
	set_group_on: {
		options: {
			entity_id: string[]
			state: OnOffToggle
		}
	}
	call_service: {
		options: {
			entity_id: string[]
			service: string
			payload: string
		}
	}
}

export function GetActionsList(
	getProps: () => { state: HassEntity[]; services: HassServices; client: Connection | undefined },
): CompanionActionDefinitions<ActionsSchema> {
	const entityOnOff = async (opt: CompanionActionEvent['options']): Promise<void> => {
		const { client } = getProps()
		if (!client) return

		let service: string
		switch (opt.state as OnOffToggle) {
			case OnOffToggle.Off:
				service = 'turn_off'
				break
			case OnOffToggle.Toggle:
				service = 'toggle'
				break
			default:
				service = 'turn_on'
				break
		}

		await callService(client, 'homeassistant', service, {
			entity_id: opt.entity_id,
		})
	}

	const { state: initialState, services: initialServices } = getProps()
	const pickerLights = EntityMultiplePicker(initialState, 'light')

	const serviceChoices: DropdownChoice[] = []
	for (const [domain, services] of Object.entries(initialServices)) {
		for (const [service, props] of Object.entries(services)) {
			const id = `${domain}.${service}`
			serviceChoices.push({
				id: id,
				label: props.name ? `${domain}: ${props.name}` : id,
			})
		}
	}

	const actions: CompanionActionDefinitions<ActionsSchema> = {
		set_switch: {
			name: 'Set switch state',
			options: [EntityMultiplePicker(initialState, 'switch'), OnOffTogglePicker()],
			callback: async (evt) => entityOnOff(evt.options),
		},
		set_input_boolean: {
			name: 'Set input_boolean state',
			options: [EntityMultiplePicker(initialState, 'input_boolean'), OnOffTogglePicker()],
			callback: async (evt) => entityOnOff(evt.options),
		},
		set_light_on: {
			name: 'Set light on/off state',
			options: [pickerLights, OnOffTogglePicker()],
			callback: async (evt) => entityOnOff(evt.options),
		},
		set_light_pct: {
			name: 'Set light brightness (percentage)',
			options: [
				pickerLights,
				{
					type: 'number',
					label: 'Brightness',
					id: 'pct',
					default: 50,
					min: 0,
					max: 100,
					step: 1,
					range: true,
				},
			],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'light', 'turn_on', {
					entity_id: evt.options.entity_id,
					brightness_pct: Number(evt.options.pct),
				})
			},
		},
		adj_light_pct: {
			name: 'Adjust light brightness (percentage)',
			options: [
				pickerLights,
				{
					type: 'number',
					label: 'Adjustment',
					id: 'pct',
					default: 1,
					min: -100,
					max: 100,
					step: 1,
				},
			],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'light', 'turn_on', {
					entity_id: evt.options.entity_id,
					brightness_step_pct: Number(evt.options.pct),
				})
			},
		},
		execute_script: {
			name: 'Execute script',
			options: [EntityMultiplePicker(initialState, 'script')],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'homeassistant', 'turn_on', {
					entity_id: evt.options.entity_id,
				})
			},
		},
		press_button: {
			name: 'Press button',
			options: [EntityMultiplePicker(initialState, 'button')],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'button', 'press', {
					entity_id: evt.options.entity_id,
				})
			},
		},
		activate_scene: {
			name: 'Activate scene',
			options: [EntityMultiplePicker(initialState, 'scene')],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'scene', 'turn_on', {
					entity_id: evt.options.entity_id,
				})
			},
		},
		input_select_first: {
			name: 'Input Select: First',
			options: [EntityMultiplePicker(initialState, 'input_select')],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'input_select', 'select_first', {
					entity_id: evt.options.entity_id,
				})
			},
		},
		input_select_last: {
			name: 'Input Select: Last',
			options: [EntityMultiplePicker(initialState, 'input_select')],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'input_select', 'select_last', {
					entity_id: evt.options.entity_id,
				})
			},
		},
		input_select_next: {
			name: 'Input Select: Next',
			options: [EntityMultiplePicker(initialState, 'input_select')],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'input_select', 'select_next', {
					entity_id: evt.options.entity_id,
				})
			},
		},
		input_select_previous: {
			name: 'Input Select: Previous',
			options: [EntityMultiplePicker(initialState, 'input_select')],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'input_select', 'select_previous', {
					entity_id: evt.options.entity_id,
				})
			},
		},
		input_select_set: {
			name: 'Input Select: Select',
			options: [
				EntityMultiplePicker(initialState, 'input_select'),
				{
					type: 'textinput',
					id: 'option',
					default: '',
					label: 'Option',
				},
			],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'input_select', 'select_option', {
					entity_id: evt.options.entity_id,
					option: evt.options.option,
				})
			},
		},
		set_group_on: {
			name: 'Set group on/off state',
			options: [EntityMultiplePicker(initialState, 'group'), OnOffTogglePicker()],
			callback: async (evt) => entityOnOff(evt.options),
		},
		call_service: {
			name: 'Call Service',
			description: 'Please open a feature request, so that useful things are properly supported',
			options: [
				EntityMultiplePicker(initialState, undefined),
				{
					id: 'service',
					label: 'Service',
					type: 'dropdown',
					default: serviceChoices[0]?.id,
					choices: serviceChoices,
					allowCustom: true,
				},
				{
					type: 'textinput',
					id: 'payload',
					tooltip: 'Must be valid JSON!',
					default: '{ "option": "value" }',
					label: 'Payload',
					useVariables: true,
				},
			],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				try {
					const payload = JSON.parse(evt.options.payload)

					// Split the domain off of the service name
					const [domain, service] = `${evt.options.service}`.split('.', 2)
					const serviceDefinition = initialServices[domain][service]

					const target: HassServiceTarget = {}

					const selectedEntities = evt.options.entity_id
					if (selectedEntities.length > 0) {
						if (serviceDefinition.fields.entity_id) {
							const entityIdSelector = serviceDefinition.fields.entity_id.selector as any | undefined
							const selectorSupportsMultipleEntities = entityIdSelector?.entity?.multiple

							if (selectedEntities.length > 1 && !selectorSupportsMultipleEntities) {
								throw new Error(`The service ${evt.options.service} only supports a single entity_id`)
							}

							payload.entity_id = selectorSupportsMultipleEntities ? selectedEntities : selectedEntities[0]
						}

						if (serviceDefinition.target) {
							target.entity_id = selectedEntities
						}
					}

					await callService(client, domain, service, payload, target)
				} catch (e) {
					console.debug(`Call service failed: ${e}`)
				}
			},
		},
	}

	return actions
}
