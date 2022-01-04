import { Connection, HassEntities } from 'home-assistant-js-websocket'
import { CompanionActionEvent, CompanionActions, CompanionAction } from '../../../instance_skel_types'
import { EntityPicker, OnOffTogglePicker } from './choices'
import { OnOffToggle } from './util'

export enum ActionId {
	SetSwitch = 'set_switch',
	SetInputBoolean = 'set_input_boolean',
	SetLightOn = 'set_light_on',
	SetLightPercent = 'set_light_pct',
	AdjLightPercent = 'adj_light_pct',
	ExecuteScript = 'execute_script',
	PressButton = 'press_button',
	ActivateScene = 'activate_scene',
}

type CompanionActionWithCallback = CompanionAction & Required<Pick<CompanionAction, 'callback'>>

export function GetActionsList(
	getProps: () => { state: HassEntities; client: Connection | undefined }
): CompanionActions {
	const entityOnOff = (opt: CompanionActionEvent['options']): void => {
		const { state, client } = getProps()

		const entity = state[String(opt.entity_id)]
		if (entity) {
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

			client?.sendMessage({
				type: 'call_service',
				domain: 'homeassistant',
				service: service,
				service_data: {
					entity_id: [opt.entity_id],
				},
			})
		}
	}

	const { state: initialState } = getProps()
	const pickerLights = EntityPicker(initialState, 'light')

	const actions: { [id in ActionId]: CompanionActionWithCallback | undefined } = {
		[ActionId.SetSwitch]: {
			label: 'Set switch state',
			options: [EntityPicker(initialState, 'switch'), OnOffTogglePicker()],
			callback: (evt): void => entityOnOff(evt.options),
		},
		[ActionId.SetInputBoolean]: {
			label: 'Set input_boolean state',
			options: [EntityPicker(initialState, 'input_boolean'), OnOffTogglePicker()],
			callback: (evt): void => entityOnOff(evt.options),
		},
		[ActionId.SetLightOn]: {
			label: 'Set light on/off state',
			options: [pickerLights, OnOffTogglePicker()],
			callback: (evt): void => entityOnOff(evt.options),
		},
		[ActionId.SetLightPercent]: {
			label: 'Set light brightness (percentage)',
			options: [
				pickerLights,
				{
					type: 'number',
					label: 'Adjustment',
					id: 'pct',
					default: 50,
					min: 0,
					max: 100,
					step: 1,
					range: true,
				},
			],
			callback: (evt): void => {
				const { client } = getProps()

				client?.sendMessage({
					type: 'call_service',
					domain: 'light',
					service: 'turn_on',
					service_data: {
						entity_id: evt.options.entity_id,
						brightness_pct: Number(evt.options.pct),
					},
				})
			},
		},
		[ActionId.AdjLightPercent]: {
			label: 'Adjust light brightness (percentage)',
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
			callback: (evt): void => {
				const { client } = getProps()

				client?.sendMessage({
					type: 'call_service',
					domain: 'light',
					service: 'turn_on',
					service_data: {
						entity_id: evt.options.entity_id,
						brightness_step_pct: Number(evt.options.pct),
					},
				})
			},
		},
		[ActionId.ExecuteScript]: {
			label: 'Execute script',
			options: [EntityPicker(initialState, 'script')],
			callback: (evt): void => {
				const { client } = getProps()
				client?.sendMessage({
					type: 'call_service',
					domain: 'homeassistant',
					service: 'turn_on',
					service_data: {
						entity_id: [evt.options.entity_id],
					},
				})
			},
		},
		[ActionId.PressButton]: {
			label: 'Press button',
			options: [EntityPicker(initialState, 'button')],
			callback: (evt): void => {
				const { client } = getProps()
				client?.sendMessage({
					type: 'call_service',
					domain: 'button',
					service: 'press',
					service_data: {
						entity_id: [evt.options.entity_id],
					},
				})
			},
		},
		[ActionId.ActivateScene]: {
			label: 'Activate scene',
			options: [EntityPicker(initialState, 'scene')],
			callback: (evt): void => {
				const { client } = getProps()

				client?.sendMessage({
					type: 'call_service',
					domain: 'scene',
					service: 'turn_on',
					service_data: {
						entity_id: evt.options.entity_id,
					},
				})
			},
		},
	}

	return actions
}
