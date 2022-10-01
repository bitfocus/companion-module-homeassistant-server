import {
	Connection,
	createConnection,
	HassEntities,
	subscribeEntities,
	UnsubscribeFunc,
	subscribeServices,
	HassServices,
	createLongLivedTokenAuth,
} from 'home-assistant-js-websocket'
import { GetActionsList } from './actions'
import { DeviceConfig, GetConfigFields } from './config'
import { FeedbackId, GetFeedbacksList } from './feedback'
import { createSocket, hassErrorToString } from './hass-socket'
import { GetPresetsList } from './presets'
import { InitVariables, updateVariables } from './variables'
import { InstanceBase, InstanceStatus, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { UpgradeScripts } from './upgrades'
import { stripTrailingSlash } from './util'

const RECONNECT_INTERVAL = 5000

class ControllerInstance extends InstanceBase<DeviceConfig> {
	public needsReconnect: boolean

	private config: DeviceConfig
	private state: HassEntities
	private services: HassServices
	private client: Connection | undefined
	private connecting: boolean
	private unsubscribeEntities: UnsubscribeFunc | undefined
	private unsubscribeServices: UnsubscribeFunc | undefined
	private initDone: boolean

	constructor(internal: unknown) {
		super(internal)

		this.config = {}
		this.connecting = false
		this.state = {}
		this.services = {}
		this.initDone = false
		this.needsReconnect = false
	}

	// Override base types to make types stricter
	public checkFeedbacks(...feedbackTypes: FeedbackId[]): void {
		if (this.initDone) {
			super.checkFeedbacks(...feedbackTypes)
		}
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
		updateVariables(this, this.state)
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

		this.initDone = false
		this.state = {}
		this.services = {}
		updateVariables(this, this.state)
		this.checkFeedbacks()

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
				this.client = undefined
			}
		} catch (e) {
			// Ignore
		}

		this.needsReconnect = false
		this.initDone = false
		this.state = {}
		this.services = {}

		this.log('debug', `destroy ${this.id}`)
	}

	private tryConnect(): void {
		if (this.connecting || this.client) {
			return
		}

		this.needsReconnect = false

		const auth = createLongLivedTokenAuth(stripTrailingSlash(this.config.url || ''), this.config.access_token || '')

		this.connecting = true
		createConnection({
			auth,
			createSocket: async () => createSocket(auth, this.config.ignore_certificates || false, this),
		})
			.then(async (connection) => {
				this.client = connection
				this.connecting = false
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
				this.unsubscribeEntities = subscribeEntities(connection, this.processStateChange.bind(this))
			})
			.catch((e: number | string) => {
				if (this.needsReconnect) {
					// Restart the process with the new url
					setImmediate(() => this.tryConnect())
					return
				}

				const errorMsg = typeof e === 'number' ? hassErrorToString(e) : e
				this.connecting = false
				this.client = undefined
				this.updateStatus(InstanceStatus.UnknownError, errorMsg)
				this.log('error', `Connect failed: ${errorMsg}`)

				// Try and reset connection
				setTimeout(() => this.tryConnect(), RECONNECT_INTERVAL)
			})
	}

	/**
	 * Handle state changes
	 */
	private processStateChange(newState: HassEntities): void {
		const entitiesChanged = getStateInfoString(this.state) !== getStateInfoString(newState)

		this.state = newState
		this.initDone = true

		if (entitiesChanged) {
			this.setPresetDefinitions(GetPresetsList(this.state))
			this.setFeedbackDefinitions(GetFeedbacksList(() => this.state))
			this.setActionDefinitions(
				GetActionsList(() => ({ state: this.state, client: this.client, services: this.services }))
			)
			InitVariables(this, this.state)
		}

		updateVariables(this, this.state)

		this.checkFeedbacks()
	}

	private processServicesChange(services: HassServices): void {
		this.services = services

		this.setActionDefinitions(
			GetActionsList(() => ({ state: this.state, client: this.client, services: this.services }))
		)
	}
}

function getStateInfoString(state: HassEntities): string {
	return JSON.stringify(
		Object.values(state)
			.map((v) =>
				JSON.stringify({
					entity_id: v.entity_id,
					friendly_name: v.attributes.friendly_name,
				})
			)
			.sort()
	)
}

runEntrypoint(ControllerInstance, UpgradeScripts)
