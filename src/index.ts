import {
	Connection,
	createConnection,
	UnsubscribeFunc,
	subscribeServices,
	HassServices,
	createLongLivedTokenAuth,
	HassEntity,
} from 'home-assistant-js-websocket'
import { GetActionsList } from './actions.js'
import { type DeviceConfig, GetConfigFields } from './config.js'
import { FeedbackId, GetFeedbacksList } from './feedback.js'
import { createSocket, hassErrorToString } from './hass-socket.js'
import { GetPresetsList } from './presets.js'
import { InitVariables, updateVariables } from './variables.js'
import { InstanceBase, InstanceStatus, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { UpgradeScripts } from './upgrades.js'
import { stripTrailingSlash } from './util.js'
import { HassEntitiesWithChanges, entitiesColl } from './hass/entities.js'

const RECONNECT_INTERVAL = 5000

class ControllerInstance extends InstanceBase<DeviceConfig> {
	public needsReconnect: boolean

	private config: DeviceConfig
	private state: HassEntity[]
	private services: HassServices
	private client: Connection | undefined
	private connecting: boolean
	private unsubscribeEntities: UnsubscribeFunc | undefined
	private unsubscribeServices: UnsubscribeFunc | undefined

	constructor(internal: unknown) {
		super(internal)

		this.config = {}
		this.connecting = false
		this.state = []
		this.services = {}
		this.needsReconnect = false
	}

	// Override base types to make types stricter
	public checkFeedbacks(...feedbackTypes: FeedbackId[]): void {
		super.checkFeedbacks(...feedbackTypes)
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 */
	public async init(config: DeviceConfig): Promise<void> {
		this.config = config

		await this.configUpdated(this.config)

		InitVariables(this, this.state)
		this.setPresetDefinitions(GetPresetsList(this.state))
		this.setFeedbackDefinitions(GetFeedbacksList(() => this.state))
		this.setActionDefinitions(
			GetActionsList(() => ({ state: this.state, services: this.services, client: this.client }))
		)
		// updateVariables(this, this.state) No need, there are no entities
	}

	/**
	 * Process an updated configuration array.
	 */
	public async configUpdated(config: DeviceConfig): Promise<void> {
		this.config = config

		if (this.connecting) {
			this.needsReconnect = true
			return
		}

		if (this.unsubscribeEntities) {
			this.unsubscribeEntities()
		}
		if (this.unsubscribeServices) {
			this.unsubscribeServices()
		}

		try {
			if (this.client) {
				this.client.close()
			}
		} catch (e) {
			// Ignore
		}
		this.client = undefined

		this.state = []
		this.services = {}
		// updateVariables(this, this.state) No need, there are no entities

		this.tryConnect()
	}

	/**
	 * Creates the configuration fields for web config.
	 */
	public getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	/**
	 * Clean up the instance before it is destroyed.
	 */
	public async destroy(): Promise<void> {
		try {
			if (this.unsubscribeEntities) {
				this.unsubscribeEntities()
				this.unsubscribeEntities = undefined
			}
			if (this.unsubscribeServices) {
				this.unsubscribeServices()
				this.unsubscribeServices = undefined
			}

			if (this.client) {
				this.client.close()
			}
		} catch (e) {
			// Ignore
		}
		this.client = undefined

		this.needsReconnect = false
		this.state = []
		this.services = {}

		this.log('debug', `destroy ${this.id}`)
	}

	private tryConnect(): void {
		if (this.connecting || this.client) {
			return
		}

		this.connecting = true
		this.needsReconnect = false

		const auth = createLongLivedTokenAuth(stripTrailingSlash(this.config.url || ''), this.config.access_token || '')

		createConnection({
			auth,
			createSocket: async () => createSocket(auth, this.config.ignore_certificates || false, this),
		})
			.then((connection) => {
				this.connecting = false

				// Need reconnection already?
				if (this.needsReconnect) {
					try {
						connection.close()
					} catch (e) {
						// Ignore
					}
					// Restart the process with the new url
					setImmediate(() => this.tryConnect())
					return
				}

				this.client = connection
				this.updateStatus(InstanceStatus.Ok)

				this.log('info', `Connected to v${connection.haVersion}`)

				connection.addEventListener('disconnected', () => {
					this.connecting = true
					this.updateStatus(InstanceStatus.Disconnected, 'Lost connection')
					this.log('info', `Lost connection`)
				})
				connection.addEventListener('ready', () => {
					this.connecting = false
					this.updateStatus(InstanceStatus.Ok)
					this.log('info', `Reconnected to v${connection.haVersion}`)
				})
				connection.addEventListener('reconnect-error', () => {
					this.connecting = false
					this.updateStatus(InstanceStatus.ConnectionFailure, 'Reconnect failed')
					this.log('info', `Reconnect failed`)
				})

				this.unsubscribeServices = subscribeServices(connection, this.processServicesChange.bind(this))
				this.unsubscribeEntities = entitiesColl(connection).subscribe(this.processStateChange.bind(this))
			})
			.catch((e: number | string) => {
				this.connecting = false
				this.client = undefined

				if (this.needsReconnect) {
					// Restart the process with the new url
					setImmediate(() => this.tryConnect())
					return
				}

				const errorMsg = typeof e === 'number' ? hassErrorToString(e) : e
				this.client = undefined
				this.updateStatus(InstanceStatus.UnknownError, errorMsg)
				this.log('error', `Connect failed: ${errorMsg}`)

				// Try and reset connection
				setTimeout(() => this.tryConnect(), RECONNECT_INTERVAL)
			})
	}

	/**
	 * Handle state changes
	 * Note: This mustn't be debounced directly, as then the added/changed/removed will be incorrect
	 */
	private processStateChange = (newState: HassEntitiesWithChanges): void => {
		const newEntities = Object.values(newState.entities).sort((a, b) => a.entity_id.localeCompare(b.entity_id))

		const entitiesChanged =
			newState.added.length > 0 || newState.removed.length > 0 || newState.friendlyNameChange.length > 0

		this.state = newEntities

		if (entitiesChanged) {
			this.setPresetDefinitions(GetPresetsList(this.state))
			this.setFeedbackDefinitions(GetFeedbacksList(() => this.state))
			this.setActionDefinitions(
				GetActionsList(() => ({ state: this.state, client: this.client, services: this.services }))
			)
			InitVariables(this, this.state)
		}

		updateVariables(this, newState)

		this.checkFeedbacks()
	}

	private processServicesChange(services: HassServices): void {
		this.services = services

		this.setActionDefinitions(
			GetActionsList(() => ({ state: this.state, client: this.client, services: this.services }))
		)
	}
}

runEntrypoint(ControllerInstance, UpgradeScripts)
