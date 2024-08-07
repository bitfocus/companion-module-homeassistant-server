import {
	Collection,
	Connection,
	Context,
	HassEntities,
	StateChangedEvent,
	getCollection,
	getStates,
} from 'home-assistant-js-websocket'
import { Store } from 'home-assistant-js-websocket/dist/store.js'
import { atLeastHaVersion } from 'home-assistant-js-websocket/dist/util.js'

interface EntityState {
	/** state */
	s: string
	/** attributes */
	a: { [key: string]: any }
	/** context */
	c: Context | string
	/** last_changed; if set, also applies to lu */
	lc: number
	/** last_updated */
	lu: number
}

interface EntityStateRemove {
	/** attributes */
	a: string[]
}

interface EntityDiff {
	/** additions */
	'+'?: Partial<EntityState>
	/** subtractions */
	'-'?: EntityStateRemove
}

interface StatesUpdates {
	/** add */
	a?: Record<string, EntityState>
	/** remove */
	r?: string[] // remove
	/** change */
	c: Record<string, EntityDiff>
}

function processEvent(store: Store<HassEntitiesWithChanges>, updates: StatesUpdates) {
	const myNewState: HassEntitiesWithChanges = {
		entities: { ...store.state?.entities },
		added: new Set(),
		removed: new Set(),
		friendlyNameChange: new Set(),
		contentChanged: new Set(),
	}

	if (updates.a) {
		for (const entityId in updates.a) {
			const newState = updates.a[entityId]
			const last_changed = new Date(newState.lc * 1000).toISOString()
			myNewState.entities[entityId] = {
				entity_id: entityId,
				state: newState.s,
				attributes: newState.a,
				context: typeof newState.c === 'string' ? { id: newState.c, parent_id: null, user_id: null } : newState.c,
				last_changed: last_changed,
				last_updated: newState.lu ? new Date(newState.lu * 1000).toISOString() : last_changed,
			}
			myNewState.added.add(entityId)
		}
	}

	if (updates.r) {
		for (const entityId of updates.r) {
			delete myNewState.entities[entityId]
			myNewState.removed.add(entityId)
		}
	}

	if (updates.c) {
		for (const entityId in updates.c) {
			let entityState = myNewState.entities[entityId]

			if (!entityState) {
				console.warn('Received state update for unknown entity', entityId)
				continue
			}

			entityState = { ...entityState }

			const oldAttributes = entityState.attributes

			const { '+': toAdd, '-': toRemove } = updates.c[entityId]
			const attributesChanged = toAdd?.a || toRemove?.a
			const attributes = attributesChanged ? { ...entityState.attributes } : entityState.attributes

			if (toAdd) {
				if (toAdd.s !== undefined) {
					entityState.state = toAdd.s
				}
				if (toAdd.c) {
					if (typeof toAdd.c === 'string') {
						entityState.context = { ...entityState.context, id: toAdd.c }
					} else {
						entityState.context = { ...entityState.context, ...toAdd.c }
					}
				}
				if (toAdd.lc) {
					entityState.last_updated = entityState.last_changed = new Date(toAdd.lc * 1000).toISOString()
				} else if (toAdd.lu) {
					entityState.last_updated = new Date(toAdd.lu * 1000).toISOString()
				}
				if (toAdd.a) {
					Object.assign(attributes, toAdd.a)
				}
			}
			if (toRemove?.a) {
				for (const key of toRemove.a) {
					delete attributes[key]
				}
			}
			if (attributesChanged) {
				entityState.attributes = attributes
			}
			myNewState.entities[entityId] = entityState

			myNewState.contentChanged.add(entityId) // TODO - more granular?
			if (oldAttributes.friendly_name !== attributes.friendly_name) myNewState.friendlyNameChange.add(entityId)
		}
	}

	store.setState(myNewState, true)
}

const subscribeUpdates = async (conn: Connection, store: Store<HassEntitiesWithChanges>) =>
	conn.subscribeMessage<StatesUpdates>((ev) => processEvent(store, ev), {
		type: 'subscribe_entities',
	})

function legacyProcessEvent(store: Store<HassEntitiesWithChanges>, event: StateChangedEvent) {
	const state = store.state
	if (state === undefined) return

	const myNewState: HassEntitiesWithChanges = {
		entities: { ...state.entities },
		added: new Set(),
		removed: new Set(),
		friendlyNameChange: new Set(),
		contentChanged: new Set(),
	}

	const { entity_id, new_state } = event.data
	if (new_state) {
		const oldEntityState = state.entities[entity_id]
		if (!oldEntityState) {
			myNewState.added.add(entity_id)
		} else {
			myNewState.contentChanged.add(entity_id)

			if (oldEntityState.attributes.friendly_name !== new_state.attributes.friendly_name) {
				myNewState.friendlyNameChange.add(entity_id)
			}
		}

		store.setState({ [new_state.entity_id]: new_state })
	} else {
		delete myNewState.entities[entity_id]
		myNewState.removed.add(entity_id)

		store.setState(myNewState, true)
	}
}

async function legacyFetchEntities(conn: Connection): Promise<HassEntitiesWithChanges> {
	const states = await getStates(conn)

	const entities: HassEntities = {}
	for (const state of states) {
		entities[state.entity_id] = state
	}

	return {
		entities,
		added: new Set(Object.keys(entities)),
		removed: new Set(),
		friendlyNameChange: new Set(),
		contentChanged: new Set(),
	}
}

const legacySubscribeUpdates = async (conn: Connection, store: Store<HassEntitiesWithChanges>) =>
	conn.subscribeEvents<StateChangedEvent>((ev) => legacyProcessEvent(store, ev), 'state_changed')

export interface HassEntitiesWithChanges {
	entities: HassEntities
	added: Set<string>
	removed: Set<string>

	friendlyNameChange: Set<string>
	contentChanged: Set<string>
}

export const entitiesColl = (conn: Connection): Collection<HassEntitiesWithChanges> =>
	atLeastHaVersion(conn.haVersion, 2022, 4, 0)
		? getCollection(conn, '_ent', undefined, subscribeUpdates)
		: getCollection(conn, '_ent', legacyFetchEntities, legacySubscribeUpdates)

// export const subscribeEntities = (conn: Connection, onChange: (state: HassEntities) => void): UnsubscribeFunc =>
// 	entitiesColl(conn).subscribe(onChange)
