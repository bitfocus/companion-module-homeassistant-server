export enum OnOffToggle {
	On = 'on',
	Off = 'off',
	Toggle = 'toggle',
}

export function assertUnreachable(_never: never): void {
	// throw new Error('Unreachable')
}

export function stripTrailingSlash(url: string): string {
	// Strip trailing slash.
	if (url && url.endsWith('/')) {
		return url.substr(0, url.length - 1)
	} else {
		return url
	}
}
