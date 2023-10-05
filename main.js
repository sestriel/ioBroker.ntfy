'use strict';

const utils = require('@iobroker/adapter-core');
const axios = require('axios');

class ntfy extends utils.Adapter {

    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'ntfy',
        });
        this.messageTime = 0;
        this.messageText = '';

        this.on('ready', this.onReady.bind(this));
        this.on('message', this.onMessage.bind(this));
    }

    async onReady() {
        this.setState('info.connection', false, true);
        if (await this.checkConfig()) {
            this.setState('info.connection', true, true);
        }
        this.checkTopic();
        this.checkAuth();
    }


    async checkConfig() {
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
    checkTopic() {
        if (!this.config.defaultTopic) {
            this.log.info('Ntfy-Config: No Default Topic is set - you need to set a topic in script');
            return false;
        }
        return true;
    }
    checkAuth() {
        if ( this.config.defaultTopicAuth !== 1 && ((!this.config.defaultUsername || !this.config.defaultPassword) && !this.config.defaultAccessToken )) {
            this.log.info('Ntfy-Config: No Default Credentials are set (either username & password or access token');
            return false;
        }
        return true;

    }

    /**
     *
     * @param {ioBroker.Message} obj
     */
    async onMessage(obj) {
        if (typeof obj === 'object' && obj.message) {
            if (obj.command === 'send') {
                if (await this.checkConfig()) {
                    this.sendMessage(obj);
                }
            }
        }
    }

    sendMessage(obj) {

        if (!obj.message.topic) obj.message.topic = this.config.defaultTopic;

        const json = JSON.stringify(obj.message);

        if (this.messageTime && this.messageText === json && Date.now() - this.messageTime < 1000) {
            return this.log.debug(`Double Message Detected: ${json}`);
        }

        this.messageTime = Date.now();
        this.messageText = json;

        let axiosConfig = {};
        if (this.config.defaultTopicAuth === 1) {
            axiosConfig = { headers: { 'Authorization': 'Basic ' + Buffer.from(this.config.defaultUsername + ':' + this.config.defaultPassword).toString('base64') } };
        } else if (this.config.defaultTopicAuth === 2) {
            axiosConfig = { headers: { 'Authorization': 'Bearer ' +  this.config.defaultAccessToken } };
        }

        axios.post(this.config.serverURL, json, axiosConfig)
            .catch(err => {
                this.log.error(`Ntfy error: ${err}`);
                this.log.error(`Ntfy error: ${JSON.stringify(err.response.data)}`);
                this.log.error(`Ntfy with config: ${JSON.stringify(axiosConfig)}`);
            });
    }
}

if (require.main !== module) {
    module.exports = (options) => new ntfy(options);
} else {
    new ntfy();
}