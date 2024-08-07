import type { FeedbackId } from './feedback.js'

export class EntitySubscriptions {
	// Map<entityId, Map<feedbackId, id>>
	private readonly data: Map<string, Map<string, FeedbackId>>

	constructor() {
		this.data = new Map()
	}

	public getFeedbackInstanceIds(entityId: string): string[] {
		const entries = this.data.get(entityId)
		if (entries) {
			return Array.from(entries.keys())
		} else {
			return []
		}
	}
	public subscribe(entityId: string, feedbackId: string, type: FeedbackId): void {
		let entries = this.data.get(entityId)
		if (!entries) {
			entries = new Map()
			this.data.set(entityId, entries)
		}
		entries.set(feedbackId, type)
	}
	public unsubscribe(entityId: string, feedbackId: string): void {
		const entries = this.data.get(entityId)
		if (entries) {
			entries.delete(feedbackId)
		}
	}

	public clear(): void {
		this.data.clear()
	}
}
