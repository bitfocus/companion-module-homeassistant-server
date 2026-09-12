import { SomeCompanionConfigField } from '@companion-module/base'

export type DeviceConfig = {
	url?: string
	ignore_certificates?: boolean
	variables_disable?: boolean
	variables_include_patterns?: string
	variables_exclude_patterns?: string
	variables_disable_attributes?: boolean
	variables_include_attributes?: string
	variables_exclude_attributes?: string
}

export type DeviceSecrets = {
	access_token?: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'url',
			label: 'Home Assistant Url',
			width: 6,
		},
		{
			type: 'checkbox',
			id: 'ignore_certificates',
			label: 'Ignore Certificate Signing',
			width: 6,
			default: false,
		},
		{
			type: 'secret-text',
			id: 'access_token',
			label: 'Access Token',
			width: 6,
		},
		{
			type: 'static-text',
			id: 'variables_help',
			label: 'Variables',
			width: 12,
			value:
				'Limit which variables are created to keep large installations responsive. Entity patterns ' +
				'match the entity id (e.g. <code>light.kitchen</code>), attribute patterns match the attribute ' +
				'name (e.g. <code>color_mode</code>); both support <code>*</code>/<code>?</code> wildcards and ' +
				'comma-separated lists. Leave everything empty to keep all variables. See the module help for details.',
		},
		{
			type: 'checkbox',
			id: 'variables_disable',
			label: 'Disable variables entirely',
			width: 12,
			default: false,
		},
		{
			type: 'textinput',
			id: 'variables_include_patterns',
			label: 'Include entity patterns (comma-separated, empty = all)',
			width: 12,
			default: '',
			tooltip: 'Examples: light.*  |  light.*, switch.kitchen  |  sensor.*temperature*',
		},
		{
			type: 'textinput',
			id: 'variables_exclude_patterns',
			label: 'Exclude entity patterns (comma-separated)',
			width: 12,
			default: '',
			tooltip: 'Entities matching any of these are dropped. Examples: *battery*  |  sensor.*, *_debug',
		},
		{
			type: 'checkbox',
			id: 'variables_disable_attributes',
			label: 'Disable entity attribute variables',
			width: 12,
			default: false,
		},
		{
			type: 'textinput',
			id: 'variables_include_attributes',
			label: 'Include attribute patterns (comma-separated, empty = all)',
			width: 6,
			default: '',
			tooltip: 'Matched against the attribute name. Examples: color_mode  |  color_mode, color_temp  |  *color*',
		},
		{
			type: 'textinput',
			id: 'variables_exclude_attributes',
			label: 'Exclude attribute patterns (comma-separated)',
			width: 6,
			default: '',
			tooltip: 'Attributes matching any of these are dropped. Examples: friendly_name  |  supported_*',
		},
	]
}
