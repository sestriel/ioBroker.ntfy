'use strict';

const utils       = require('@iobroker/adapter-core');
const axios       = require('axios');


const { Topic }   = require('./lib/topic');

const { ActionButtonView } = require('./lib/message/actionButton/actionButtonView.js');

class ntfy extends utils.Adapter  {

    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options)
    {
        super({
            ...options,
            name: 'ntfy',
        });

        this.messageTime = 0;
        this.messageText = '';
        this.topics = {};
        this.topicSubscriptionData = {};
        this.checkSubscriptionsTimeout = null;

        this.on('ready',   this.onReady.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload',  this.onUnload.bind(this));

        let test = new ActionButtonView()
    }

    async onReady()
    {
        this.setState('info.connection', false, true);
        if (!await this.checkConfig()) {
            this.checkTopic();
            this.checkAuth();
            return;
        }

        this.setState('info.connection', true, true);

        this.topics = this.getTopics();

        await this.subscribeTopics();

        //this.startCheckSubscriptions();
    }

    onUnload(callback)
    {
        try {
            if (this.checkSubscriptionsTimeout) {
                clearTimeout(this.checkSubscriptionsTimeout);
            }

            for (const topicName of Object.entries(this.topicSubscriptionData)) {
                if (this.topicSubscriptionData[topicName].eventSource === null) continue;
                this.topicSubscriptionData[topicName].eventSource.close();
                this.setState(this.topicSubscriptionData[topicName].topicKey + '.connected', {ack: true, val: false});
                this.setState('info.connection', true, false);
            }

            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * @param {ioBroker.Message} obj
     */
    async onMessage(obj)
    {
        if (typeof obj === 'object' && obj.message) {
            if (obj.command === 'send') {
                if (await this.checkConfig()) {
                    this.sendMessage(obj);
                }
            }
        }

        if (typeof obj === 'object' && obj.command) {
            if (obj.command === 'testBtn') {
                let testMsg;
                if (typeof this.config.presetTopics !== 'object' || this.config.presetTopics.length <= 0) {
                    testMsg = 'Presets: None';
                } else {
                    testMsg = `Presets: ${JSON.stringify(this.config.presetTopics)}`;
                }
                this.sendTo(obj.from, obj.command, { result: testMsg }, obj.callback);
            }
        }
    }


    async checkConfig()
    {
        if (!this.config.serverURL) {
            this.log.error('Ntfy-Config: Server-URL is not set');
            return false;
        }
        try {
            const response = await axios.get(this.config.serverURL);
            if (response.status !== 200) {
                this.log.error('Ntfy-Config: Server-URL is not reachable');
                return false;
            }
        } catch(err) {
            this.log.error('Ntfy-Config: Server-URL is not reachable');
            return false;
        }
        return true;
    }

    checkTopic()
    {
        if (!this.config.defaultTopic) {
            this.log.info('Ntfy-Config: No default topic is set');
            return false;
        }
        return true;
    }

    checkAuth()
    {
        if  ( this.config.defaultTopicAuth !== 0 &&
            ( this.config.defaultTopicAuth === 1 && ( !this.config.defaultUsername && !this.config.defaultPassword ) ) ||
            ( this.config.defaultTopicAuth === 2 && !this.config.defaultAccessToken ) ) {

            this.log.info('Ntfy-Config: No default credentials are set (either username & password or access token)');
            return false;
        }
        return true;
    }

    sendMessage(obj)
    {
        if (!obj.message.topic) obj.message.topic = this.config.defaultTopic;

        const json = JSON.stringify(obj.message);

        if (this.messageTime && this.messageText === json && Date.now() - this.messageTime < 1000) {
            return;
        }

        this.messageTime = Date.now();
        this.messageText = json;

        let axiosConfig = {};
        if (this.config.defaultTopicAuth === 1) {
            axiosConfig = { headers: { 'Authorization': 'Basic ' + Buffer.from(this.config.defaultUsername + ':' + this.config.defaultPassword).toString('base64') } };
        } else if (this.config.defaultTopicAuth === 2) {
            axiosConfig = { headers: { 'Authorization': 'Bearer ' +  this.config.defaultAccessToken } };
        }


    }

    async subscribeTopics()
    {
        for (const [index, topic] of Object.entries(this.topics)) {
            await topic.subscribe();
        }
    }


/*
    async startCheckSubscriptions()
    {
        for (const [topicName, subscription] of Object.entries(this.topicSubscriptionData)) {
            this.log.silly('Check subscription connection for ' + topicName);
            if (subscription.eventSource === null) continue;
            if (subscription.eventSource.readyState === 1) {
                this.setState(this.topicSubscriptionData[topicName].topicKey + '.connected', {ack: true, val: true});
                continue;
            }

            this.setState(this.topicSubscriptionData[topicName].topicKey + '.connected', {ack: true, val: false});
            await this.subscribeTopic(topicName, subscription.topicData.authType, subscription.topicData.username, subscription.topicData.password, subscription.topicData.accessToken);
        }
        this.checkSubscriptionsTimeout = setTimeout( () => { this.startCheckSubscriptions(); }, 30000 );
    }
*/

    getTopics()
    {
        const topics = {};

        // Add default topic
        topics[0] = new Topic(this, this.config.defaultTopic, this.config.defaultSubscribed, this.config.defaultTopicAuth, this.config.defaultUsername, this.config.defaultPassword, this.config.defaultAccessToken);

        // Add preset topics
        if (typeof this.config.presetTopics === 'object' && this.config.presetTopics.length > 0) {
            this.config.presetTopics.forEach( (presetTopic, index) => {
                topics[index + 1] = new Topic(this, presetTopic.presetTopicName, presetTopic.presetTopicSubscribed, presetTopic.presetTopicAuth, presetTopic.presetTopicUsername, presetTopic.presetTopicPassword, presetTopic.presetTopicAccessToken);
            });
        }

        return topics;
    }
}


if (require.main !== module) {
    module.exports = (options) => new ntfy(options);
} else {
    new ntfy();
}