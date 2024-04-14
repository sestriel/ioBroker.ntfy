'use strict';

const axios       = require('axios');
const EventSource = require('eventsource');

class Topic {
    constructor(adapter, name, subscribed, authType = 0, username = '', password = '', accessToken)
    {
        this.adapter     = adapter;

        this.name        = name;
        this.authType    = authType;
        this.username    = username;
        this.password    = password;
        this.accessToken = accessToken;

        this.shouldSubcribe = subscribed;
        this.subscribed  = false;

        this.topicKey    = 'subscribedTopics.' + this.name;
        this.messageKey  = 'subscribedTopics.' + this.name + '.lastMessage.';
        this.connected   = false;
        this.eventSource = null;
    }

    async subscribe()
    {
        this.adapter.log.debug('subscribe called ' + this.name);

        if (this.shouldSubcribe) {
            this.adapter.log.debug('shouldSub ' + this.name);

            if (this.eventSource !== null && this.eventSource.readyState !== 2) {
                return;
            }

            await this.createSubsrciptionObjects();

            this.eventSource = new EventSource(this.adapter.config.serverURL + '/' + this.name + '/sse', this.getHTTPConfig());
            this.eventSource.onmessage = (e) => {
                this.adapter.log.debug('Received new message from topic ' + this.name);

                const msgData = JSON.parse(e.data);

                this.adapter.setState(this.topicKey   + '.lastMessageRaw', {ack: true, val: e.data});
                this.adapter.setState(this.messageKey + 'id',              {ack: true, val: msgData.id});
                this.adapter.setState(this.messageKey + 'time',            {ack: true, val: msgData.time});
                this.adapter.setState(this.messageKey + 'tags',            {ack: true, val: msgData.tags});
                this.adapter.setState(this.messageKey + 'event',           {ack: true, val: msgData.event});
                this.adapter.setState(this.messageKey + 'title',           {ack: true, val: msgData.title});
                this.adapter.setState(this.messageKey + 'value',           {ack: true, val: msgData.message});
                this.adapter.setState(this.messageKey + 'expires',         {ack: true, val: msgData.expires});
                this.adapter.setState(this.messageKey + 'priority',        {ack: true, val: msgData.priority});
            };
            this.eventSource.onopen = () => {
                if (!this.subscribed) {
                    this.adapter.log.debug('Subscription to topic ' + this.name + ' established.');
                    this.adapter.setState(this.topicKey + '.connected', {ack: true, val: true});
                    this.subscribed = true;
                }
            };
            this.eventSource.onerror = (e) => {
                this.adapter.log.error('Subscription to topic ' + this.name + ' cant be established or lost. Status code: ' + e.status + ' Error: ' + e.message);
                this.adapter.setState(this.topicKey + '.connected', {ack: true, val: false});
            };
        }
    }

    async createSubsrciptionObjects()
    {
        await this.adapter.setObjectNotExists(this.topicKey,                       { type: 'channel', common: { name: this.adapter.config.serverURL + '/' + this.name, role: 'subscription' } });
        await this.adapter.setObjectNotExists(this.topicKey   + '.lastMessageRaw', { type: 'state',   common: { name: 'Last message RAW',                              role: 'message',   type: 'string' } });
        await this.adapter.setObjectNotExists(this.topicKey   + '.connected',      { type: 'state',   common: { name: 'Subscribtion state',                            role: 'state',     type: 'boolean' } });
        await this.adapter.setObjectNotExists(this.messageKey + 'id',              { type: 'state',   common: { name: 'ID',                                            role: '',          type: 'string' } });
        await this.adapter.setObjectNotExists(this.messageKey + 'tags',            { type: 'state',   common: { name: 'Tags',                                          role: '',          type: 'string' } });
        await this.adapter.setObjectNotExists(this.messageKey + 'time',            { type: 'state',   common: { name: 'Time',                                          role: '',          type: 'number' } });
        await this.adapter.setObjectNotExists(this.messageKey + 'event',           { type: 'state',   common: { name: 'Event type',                                    role: '',          type: 'string' } });
        await this.adapter.setObjectNotExists(this.messageKey + 'title',           { type: 'state',   common: { name: 'Title',                                         role: '',          type: 'string' } });
        await this.adapter.setObjectNotExists(this.messageKey + 'value',           { type: 'state',   common: { name: 'Content',                                       role: '',          type: 'string' } });
        await this.adapter.setObjectNotExists(this.messageKey + 'expires',         { type: 'state',   common: { name: 'Expire',                                        role: '',          type: 'number' } });
        await this.adapter.setObjectNotExists(this.messageKey + 'priority',        { type: 'state',   common: { name: 'Priority',                                      role: '',          type: 'number' } });
    }

    async sendMessage(message)
    {
        const data = message.getData();
        axios.post(this.adapter.config.serverURL, data, this.getHTTPConfig())
            .catch(err => {
                this.adapter.log.error(`Ntfy error: ${err}`);
                this.adapter.log.error(`Ntfy error: ${JSON.stringify(err.response.data)}`);
                this.adapter.log.error(`Ntfy with config: ${JSON.stringify(this.getHTTPConfig())}`);
            });
    }

    getHTTPConfig()
    {
        switch(this.authType) {
            case 1:
                return { headers: { 'Authorization': 'Basic ' + Buffer.from(this.username + ':' + this.password).toString('base64') } };
            case 2:
                return { headers: { 'Authorization': 'Bearer ' +  this.accessToken } };
            default:
                return {};
        }
    }
}

module.exports = { Topic };