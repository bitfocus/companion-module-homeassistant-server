import {
	callService,
	type Connection,
	type HassEntity,
	type HassServices,
	type HassServiceTarget,
} from 'home-assistant-js-websocket'
import type {
	CompanionActionContext,
	CompanionActionEvent,
	CompanionActionDefinitions,
	CompanionActionDefinition,
	DropdownChoice,
} from '@companion-module/base'
import { EntityMultiplePicker, OnOffTogglePicker } from './choices.js'
import { OnOffToggle } from './util.js'

export enum ActionId {
	SetSwitch = 'set_switch',
	SetInputBoolean = 'set_input_boolean',
	SetLightOn = 'set_light_on',
	SetLightPercent = 'set_light_pct',
	AdjLightPercent = 'adj_light_pct',
	ExecuteScript = 'execute_script',
	PressButton = 'press_button',
	ActivateScene = 'activate_scene',
	InputSelectFirst = 'input_select_first',
	InputSelectLast = 'input_select_last',
	InputSelectNext = 'input_select_next',
	InputSelectPrevious = 'input_select_previous',
	InputSelectSet = 'input_select_set',
	SetGroupOn = 'set_group_on',
	CallService = 'call_service',
}

export function GetActionsList(
	getProps: () => { state: HassEntity[]; services: HassServices; client: Connection | undefined },
): CompanionActionDefinitions {
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

	const actions: { [id in ActionId]: CompanionActionDefinition | undefined } = {
		[ActionId.SetSwitch]: {
			name: 'Set switch state',
			options: [EntityMultiplePicker(initialState, 'switch'), OnOffTogglePicker()],
			callback: async (evt) => entityOnOff(evt.options),
		},
		[ActionId.SetInputBoolean]: {
			name: 'Set input_boolean state',
			options: [EntityMultiplePicker(initialState, 'input_boolean'), OnOffTogglePicker()],
			callback: async (evt) => entityOnOff(evt.options),
		},
		[ActionId.SetLightOn]: {
			name: 'Set light on/off state',
			options: [pickerLights, OnOffTogglePicker()],
			callback: async (evt) => entityOnOff(evt.options),
		},
		[ActionId.SetLightPercent]: {
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
		[ActionId.AdjLightPercent]: {
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
		[ActionId.ExecuteScript]: {
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
		[ActionId.PressButton]: {
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
		[ActionId.ActivateScene]: {
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
		[ActionId.InputSelectFirst]: {
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
		[ActionId.InputSelectLast]: {
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
		[ActionId.InputSelectNext]: {
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
		[ActionId.InputSelectPrevious]: {
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
		[ActionId.InputSelectSet]: {
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
		[ActionId.SetGroupOn]: {
			name: 'Set group on/off state',
			options: [EntityMultiplePicker(initialState, 'group'), OnOffTogglePicker()],
			callback: async (evt) => entityOnOff(evt.options),
		},
		[ActionId.CallService]: {
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
			callback: async (evt, context: CompanionActionContext) => {
				const { client } = getProps()
				if (!client) return

				try {
					const payload = JSON.parse(await context.parseVariablesInString(evt.options.payload as string))

					// Split the domain off of the service name
					const [domain, service] = `${evt.options.service}`.split('.', 2)
					const serviceDefinition = initialServices[domain][service]

					const target: HassServiceTarget = {}

					const selectedEntities = evt.options.entity_id as string[]
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
