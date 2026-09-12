import type { DeviceConfig } from './config.js'

export type EntityFilter = (entityId: string) => boolean
export type AttributeFilter = (attributeName: string) => boolean

/**
 * Convert a glob pattern (supporting `*` and `?`) into a regex source string.
 * All other regex-special characters are escaped so they match literally.
 */
function globToRegex(glob: string): string {
	return glob
		.replace(/[.+^${}()|[\]\\]/g, '\\$&')
		.replace(/\*/g, '.*')
		.replace(/\?/g, '.')
}

/**
 * Compile a comma-separated list of glob patterns into a single anchored regex.
 * Returns `null` when there are no (non-empty) patterns, meaning "no filter".
 */
function compileGlobList(patterns: string | undefined): RegExp | null {
	if (!patterns) return null
	const tokens = patterns
		.split(',')
		.map((p) => p.trim())
		.filter(Boolean)
	if (tokens.length === 0) return null
	const body = tokens.map(globToRegex).join('|')
	return new RegExp(`^(?:${body})$`)
}

/**
 * Build an entity-id filter from the config: an entity passes when it matches
 * the include list (or there is none) and no exclude pattern. Both lists empty
 * means "all entities". Intended to run at definition time, not per update.
 */
export function compileFilter(config: DeviceConfig): EntityFilter {
	const includes = compileGlobList(config.variables_include_patterns)
	const excludes = compileGlobList(config.variables_exclude_patterns)

	return (id) => {
		if (includes && !includes.test(id)) return false
		if (excludes && excludes.test(id)) return false
		return true
	}
}

/**
 * Build an attribute-name filter from the config, using the same include/exclude
 * logic as `compileFilter`. The "disable attribute variables" checkbox is a
 * global switch that drops everything. Results are memoised per attribute name.
 */
export function compileAttributeFilter(config: DeviceConfig): AttributeFilter {
	if (config.variables_disable_attributes) return () => false

	const includes = compileGlobList(config.variables_include_attributes)
	const excludes = compileGlobList(config.variables_exclude_attributes)
	if (!includes && !excludes) return () => true

	const cache = new Map<string, boolean>()
	return (attr) => {
		const cached = cache.get(attr)
		if (cached !== undefined) return cached

		let ok = true
		if (includes && !includes.test(attr)) ok = false
		if (excludes && excludes.test(attr)) ok = false

		cache.set(attr, ok)
		return ok
	}
}
