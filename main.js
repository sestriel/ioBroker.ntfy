'use strict'

const utils       = require('@iobroker/adapter-core')
const axios       = require('axios')
const EventSource = require('eventsource')

class ntfy extends utils.Adapter {

    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options)
    {
        super({
            ...options,
            name: 'ntfy',
        })

        this.messageTime = 0
        this.messageText = ''
        this.topicSubscriptionData = {}
        this.checkSubscriptionsTimeout = null

        this.on('ready',   this.onReady.bind(this))
        this.on('message', this.onMessage.bind(this))
    }

    async onReady()
    {
        this.setState('info.connection', false, true)
        if (!await this.checkConfig()) {
            this.checkTopic()
            this.checkAuth()
            return
        }

        this.setState('info.connection', true, true)
    
        await this.subscribeTopics()

        this.startCheckSubscriptions()
    }

    /**
     * @param {ioBroker.Message} obj
     */
    async onMessage(obj)
    {
        if (typeof obj === 'object' && obj.message) {
            if (obj.message === 'checkSubscriptions') {
                this.startCheckSubscriptions()
                return
            }
            if (obj.command === 'send') {
                if (await this.checkConfig()) {
                    this.sendMessage(obj)
                }
            }
    
        }
    
        if (typeof obj === 'object' && obj.command) {
            if (obj.command === 'testBtn') {
                let testMsg
                if (typeof this.config.presetTopics !== 'object' || this.config.presetTopics.length <= 0) {
                    testMsg = 'Presets: None'
                } else {
                    testMsg = `Presets: ${JSON.stringify(this.config.presetTopics)}`
                }
                this.sendTo(obj.from, obj.command, { result: testMsg }, obj.callback)
            }
        }
    }


    async checkConfig()
    {
        if (!this.config.serverURL) {
            this.log.error('Ntfy-Config: Server-URL is not set')
            return false
        }
        try {
            const response = await axios.get(this.config.serverURL)
            if (response.status !== 200) {
                this.log.error('Ntfy-Config: Server-URL is not reachable')
                return false
            }
        } catch(err) {
            this.log.error('Ntfy-Config: Server-URL is not reachable')
            return false
        }
        return true
    }

    checkTopic()
    {
        if (!this.config.defaultTopic) {
            this.log.info('Ntfy-Config: No default topic is set')
            return false
        }
        return true
    }

    checkAuth()
    {
        if  ( this.config.defaultTopicAuth !== 0 && 
            ( this.config.defaultTopicAuth === 1 && ( !this.config.defaultUsername && !this.config.defaultPassword ) ) || 
            ( this.config.defaultTopicAuth === 2 && !this.config.defaultAccessToken ) ) {

            this.log.info('Ntfy-Config: No default credentials are set (either username & password or access token)')
            return false
        }
        return true
    }

    sendMessage(obj)
    {
        if (!obj.message.topic) obj.message.topic = this.config.defaultTopic

        const json = JSON.stringify(obj.message)

        if (this.messageTime && this.messageText === json && Date.now() - this.messageTime < 1000) {
            return
        }

        this.messageTime = Date.now()
        this.messageText = json

        let axiosConfig = {}
        if (this.config.defaultTopicAuth === 1) {
            axiosConfig = { headers: { 'Authorization': 'Basic ' + Buffer.from(this.config.defaultUsername + ':' + this.config.defaultPassword).toString('base64') } }
        } else if (this.config.defaultTopicAuth === 2) {
            axiosConfig = { headers: { 'Authorization': 'Bearer ' +  this.config.defaultAccessToken } }
        }

        axios.post(this.config.serverURL, json, axiosConfig)
            .catch(err => {
                this.log.error(`Ntfy error: ${err}`)
                this.log.error(`Ntfy error: ${JSON.stringify(err.response.data)}`)
                this.log.error(`Ntfy with config: ${JSON.stringify(axiosConfig)}`)
            })
    }

    async subscribeTopics()
    {
        if (this.config.defaultSubscribed) {
            await this.subscribeTopic(this.config.defaultTopic, this.config.defaultTopicAuth, this.config.defaultUsername, this.config.defaultPassword, this.config.defaultAccessToken)
        }
        
        if (typeof this.config.presetTopics === 'object' || this.config.presetTopics.length > 0) {
            this.config.presetTopics.forEach( async (presetTopic) => {
                if (presetTopic.presetTopicSubscribed) {
                    await this.subscribeTopic(presetTopic.presetTopicName, presetTopic.presetTopicAuth, presetTopic.presetTopicUsername, presetTopic.presetTopicPassword, presetTopic.presetTopicAccessToken)
                }
            })
        }
    }

    async subscribeTopic (topicName, authType, username = '', password = '', accessToken = '')
    {
        this.topicSubscriptionData[topicName] = this.topicSubscriptionData[topicName] ?? {
            topicData: {
                authType: authType,
                username: username,
                password: password,
                accessToken: accessToken
            },
            topicKey: 'subscribedTopics.' + topicName,
            messageKey: 'subscribedTopics.' + topicName + '.lastMessage.',
            connected: false,
            eventSource : null
        }

        if (this.topicSubscriptionData[topicName].eventSource !== null && this.topicSubscriptionData[topicName].eventSource.readyState !== 2) {
            return
        }
           
        await this.createSubsrciptionObjects(topicName)

        let subscribtionEventSourceConfig = {}

        switch(authType) {
            case 1:
                subscribtionEventSourceConfig = { headers: { 'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64') } }
                break
            case 2:
                subscribtionEventSourceConfig = { headers: { 'Authorization': 'Bearer ' +  accessToken } }
                break
        }

        this.topicSubscriptionData[topicName].eventSource = new EventSource(this.config.serverURL + '/' + topicName + '/sse', subscribtionEventSourceConfig)
        this.topicSubscriptionData[topicName].eventSource.onmessage = (e) => {
            this.log.debug('Received new message from topic ' + topicName)

            const msgData = JSON.parse(e.data)

            this.setState(this.topicSubscriptionData[topicName].topicKey   + '.lastMessageRaw', {ack: true, val: e.data})            
            this.setState(this.topicSubscriptionData[topicName].messageKey + 'id',              {ack: true, val: msgData.id})
            this.setState(this.topicSubscriptionData[topicName].messageKey + 'time',            {ack: true, val: msgData.time})
            this.setState(this.topicSubscriptionData[topicName].messageKey + 'tags',            {ack: true, val: msgData.tags})
            this.setState(this.topicSubscriptionData[topicName].messageKey + 'event',           {ack: true, val: msgData.event})
            this.setState(this.topicSubscriptionData[topicName].messageKey + 'title',           {ack: true, val: msgData.title})
            this.setState(this.topicSubscriptionData[topicName].messageKey + 'value',           {ack: true, val: msgData.message})
            this.setState(this.topicSubscriptionData[topicName].messageKey + 'expires',         {ack: true, val: msgData.expires})
            this.setState(this.topicSubscriptionData[topicName].messageKey + 'priority',        {ack: true, val: msgData.priority})
        }
        this.topicSubscriptionData[topicName].eventSource.onopen = () => {
            if (!this.topicSubscriptionData[topicName].connected) {
                this.log.debug('Subscription to topic ' + topicName + ' established.')
                this.setState(this.topicSubscriptionData[topicName].topicKey + '.connected', {ack: true, val: true})
                this.topicSubscriptionData[topicName].connected = true
            }
        }
        this.topicSubscriptionData[topicName].eventSource.onerror = (e) => {
            this.log.error('Subscription to topic ' + topicName + ' cant be established or lost. Status code: ' + e.status + ' Error: ' + e.message)
            this.setState(this.topicSubscriptionData[topicName].topicKey + '.connected', {ack: true, val: false})
        }
    }

    async createSubsrciptionObjects(topicName)
    {
        await this.setObjectNotExists(this.topicSubscriptionData[topicName].topicKey,                       { type: "channel", common: { name: this.config.serverURL + '/' + topicName, role: "subscription" } })
        await this.setObjectNotExists(this.topicSubscriptionData[topicName].topicKey   + '.lastMessageRaw', { type: "state",   common: { name: "Last message RAW",   role: "message",   type: "string" } })
        await this.setObjectNotExists(this.topicSubscriptionData[topicName].topicKey   + '.connected',      { type: "state",   common: { name: "Subscribtion state", role: "state",     type: "boolean" } })
        await this.setObjectNotExists(this.topicSubscriptionData[topicName].messageKey + 'id',              { type: 'state',   common: { name: 'ID',                 role: '',          type: "string" } })
        await this.setObjectNotExists(this.topicSubscriptionData[topicName].messageKey + 'tags',            { type: 'state',   common: { name: 'Tags',               role: '',          type: "string" } })
        await this.setObjectNotExists(this.topicSubscriptionData[topicName].messageKey + 'time',            { type: 'state',   common: { name: 'Time',               role: '',          type: "number" } })
        await this.setObjectNotExists(this.topicSubscriptionData[topicName].messageKey + 'event',           { type: 'state',   common: { name: 'Event type',         role: '',          type: "string" } })
        await this.setObjectNotExists(this.topicSubscriptionData[topicName].messageKey + 'title',           { type: 'state',   common: { name: 'Title',              role: '',          type: "string" } })
        await this.setObjectNotExists(this.topicSubscriptionData[topicName].messageKey + 'value',           { type: 'state',   common: { name: 'Content',            role: '',          type: "string" } })
        await this.setObjectNotExists(this.topicSubscriptionData[topicName].messageKey + 'expires',         { type: 'state',   common: { name: 'Expire',             role: '',          type: "number" } })
        await this.setObjectNotExists(this.topicSubscriptionData[topicName].messageKey + 'priority',        { type: 'state',   common: { name: 'Priority',           role: '',          type: "number" } })
    }

    async startCheckSubscriptions()
    {
        for (const [topicName, subscription] of Object.entries(this.topicSubscriptionData)) {
            this.log.silly('Check subscription connection for ' + topicName)
            if (subscription.eventSource === null) continue
            if (subscription.eventSource.readyState === 1) {
                this.setState(this.topicSubscriptionData[topicName].topicKey + '.connected', {ack: true, val: true})
                continue
            }

            this.setState(this.topicSubscriptionData[topicName].topicKey + '.connected', {ack: true, val: false})
            await this.subscribeTopic(topicName, subscription.topicData.authType, subscription.topicData.username, subscription.topicData.password, subscription.topicData.accessToken)
        }
        this.checkSubscriptionsTimeout = setTimeout( () => { this.startCheckSubscriptions() }, 30000 )
    }
}


if (require.main !== module) {
    module.exports = (options) => new ntfy(options)
} else {
    new ntfy()
}