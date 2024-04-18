'use strict';

const utils       = require('@iobroker/adapter-core');
const axios       = require('axios');

const { Topic }   = require('./lib/topic');

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

        this.on('ready',   this.onReady.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload',  this.onUnload.bind(this));
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
    }

    onUnload(callback)
    {
        try {
            for (const topicIndex in this.topics) {
                this.topics[topicIndex].disconnect();
            }

            this.setState('info.connection', true, false);

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
    }

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