import {
	CompanionInputFieldCheckbox,
	CompanionInputFieldDropdown,
	CompanionInputFieldMultiDropdown,
	DropdownChoice,
} from '@companion-module/base'
import type { HassEntity } from 'home-assistant-js-websocket'
import { OnOffToggle } from './util.js'

export const LIGHT_MAX_BRIGHTNESS = 255

export function OnOffTogglePicker(): CompanionInputFieldDropdown<'state'> {
	const options = [
		{ id: OnOffToggle.On, label: 'On' },
		{ id: OnOffToggle.Off, label: 'Off' },
		{ id: OnOffToggle.Toggle, label: 'Toggle' },
	]
	return {
		type: 'dropdown',
		label: 'State',
		id: 'state',
		default: OnOffToggle.On,
		choices: options,
		disableAutoExpression: true,
	}
}

export function OnOffPicker(): CompanionInputFieldCheckbox<'state'> {
	return {
		type: 'checkbox',
		label: 'State',
		id: 'state',
		default: true,
	}
}

// The set of hvac modes defined by Home Assistant. Individual climate entities
// typically support only a subset, so the picker allows custom values too.
export const HVAC_MODES = ['off', 'heat', 'cool', 'heat_cool', 'auto', 'dry', 'fan_only']

export function HvacModePicker(): CompanionInputFieldDropdown<'hvac_mode'> {
	return {
		type: 'dropdown',
		label: 'HVAC mode',
		id: 'hvac_mode',
		default: 'heat',
		choices: HVAC_MODES.map((mode) => ({ id: mode, label: mode })),
		allowCustom: true,
	}
}

function EntityOptions(state: HassEntity[], prefix: string | undefined): DropdownChoice<string>[] {
	const entities = state.filter((ent) => prefix === undefined || ent.entity_id.indexOf(`${prefix}.`) === 0)

	return entities
		.map((ent) => ({
			id: ent.entity_id,
			label: ent.attributes.friendly_name || ent.entity_id,
		}))
		.sort((a, b) => {
			const a2 = a.label.toLowerCase()
			const b2 = b.label.toLowerCase()
			return a2 === b2 ? 0 : a2 < b2 ? -1 : 1
		})
}

export function EntityPicker(
	state: HassEntity[],
	prefix: string | undefined,
): CompanionInputFieldDropdown<'entity_id', string> {
	const choices = EntityOptions(state, prefix)

	return {
		type: 'dropdown',
		label: 'Entity',
		id: 'entity_id',
		default: choices[0]?.id ?? '',
		choices: choices,
	}
}

export function EntityMultiplePicker(
	state: HassEntity[],
	prefix: string | undefined,
): CompanionInputFieldMultiDropdown<'entity_id'> {
	const choices = EntityOptions(state, prefix)

	return {
		type: 'multidropdown',
		label: 'Entities',
		id: 'entity_id',
		default: [],
		choices: choices,
	}
}
