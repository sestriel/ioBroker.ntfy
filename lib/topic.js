'use strict';

const axios       = require('axios');
const EventSource = require('eventsource');

class Topic {
    constructor(adapter, name, subscribed, authType = 0, username = '', password = '', accessToken = '')
    {
        this.adapter     = adapter;

        this.name        = name;
        this.authType    = authType;
        this.username    = username;
        this.password    = password;
        this.accessToken = accessToken;

        this.shouldSubcribe  = subscribed;
        this.subscribed      = false;

        this.topicKey        = 'topics.' + this.name;
        this.lastMessageKey  = this.topicKey + '.lastMessage.';

        this.connected   = false;
        this.eventSource = null;

        this.createTopicObjects();
        this.checkSubscriptionTimeout = null;

        if (this.shouldSubcribe) {
            this.subscribe();
        }
    }

    subscribe()
    {
        if (this.shouldSubcribe) {
            if (this.eventSource !== null && this.eventSource.readyState !== 2) {
                return;
            }

            this.eventSource = new EventSource(this.adapter.config.serverURL + '/' + this.name + '/sse', this.getHTTPConfig());
            this.eventSource.onmessage = (e) => {
                this.adapter.log.debug('Received new message from topic "' + this.name + '"');

                const msgData = JSON.parse(e.data);

                this.adapter.setState(this.topicKey       + '.lastMessageRaw', {ack: true, val: e.data});
                this.adapter.setState(this.lastMessageKey + 'id',              {ack: true, val: msgData.id});
                this.adapter.setState(this.lastMessageKey + 'time',            {ack: true, val: msgData.time});
                this.adapter.setState(this.lastMessageKey + 'tags',            {ack: true, val: msgData.tags});
                this.adapter.setState(this.lastMessageKey + 'event',           {ack: true, val: msgData.event});
                this.adapter.setState(this.lastMessageKey + 'title',           {ack: true, val: msgData.title});
                this.adapter.setState(this.lastMessageKey + 'value',           {ack: true, val: msgData.message});
                this.adapter.setState(this.lastMessageKey + 'expires',         {ack: true, val: msgData.expires});
                this.adapter.setState(this.lastMessageKey + 'priority',        {ack: true, val: msgData.priority});
            };
            this.eventSource.onopen = () => {
                if (!this.subscribed) {
                    this.adapter.log.debug('Subscription to topic "' + this.name + '" established.');
                    this.adapter.setState(this.topicKey + '.connected', {ack: true, val: true});
                    this.subscribed = true;
                    this.startCheckSubscription();
                }
            };
            this.eventSource.onerror = (e) => {
                this.adapter.log.error('Subscription to topic "' + this.name + '" cant be established or lost. Status code: ' + e.status + ' Error: ' + e.message);
                this.adapter.setState(this.topicKey + '.connected', {ack: true, val: false});
            };
        }
    }

    startCheckSubscription()
    {
        this.adapter.log.silly('Check subscription connection for ' + this.name);
        if (this.eventSource === null) return;
        if (this.eventSource.readyState === 1) {
            this.adapter.setState(this.topicKey + '.connected', {ack: true, val: true});
        } else {
            this.adapter.setState(this.topicKey + '.connected', {ack: true, val: false});
            this.subscribe();
        }

        this.checkSubscriptionTimeout = setTimeout( () => { this.startCheckSubscription(); }, 30000 );
    }

    createTopicObjects()
    {
        this.adapter.setObjectNotExists('topics',                            { type: 'channel', common: { name: 'ntfy.sh topics',                                role: 'folder' } });
        this.adapter.setObjectNotExists(this.topicKey,                       { type: 'channel', common: { name: this.adapter.config.serverURL + '/' + this.name, role: 'subscription' } });
        this.adapter.setObjectNotExists(this.topicKey   + '.lastMessageRaw', { type: 'state',   common: { name: 'Last message RAW',                              role: 'message',   type: 'string'  } });
        this.adapter.setObjectNotExists(this.topicKey   + '.connected',      { type: 'state',   common: { name: 'Subscription state',                            role: 'state',     type: 'boolean' } });
        this.adapter.setObjectNotExists(this.topicKey   + '.sendJSON',       { type: 'state',   common: { name: 'Send JSON payload',                             role: 'state',     type: 'string'  } });
        this.adapter.setObjectNotExists(this.lastMessageKey + 'id',          { type: 'state',   common: { name: 'ID',                                            role: '',          type: 'string'  } });
        this.adapter.setObjectNotExists(this.lastMessageKey + 'tags',        { type: 'state',   common: { name: 'Tags',                                          role: '',          type: 'string'  } });
        this.adapter.setObjectNotExists(this.lastMessageKey + 'time',        { type: 'state',   common: { name: 'Time',                                          role: '',          type: 'number'  } });
        this.adapter.setObjectNotExists(this.lastMessageKey + 'event',       { type: 'state',   common: { name: 'Event type',                                    role: '',          type: 'string'  } });
        this.adapter.setObjectNotExists(this.lastMessageKey + 'title',       { type: 'state',   common: { name: 'Title',                                         role: '',          type: 'string'  } });
        this.adapter.setObjectNotExists(this.lastMessageKey + 'value',       { type: 'state',   common: { name: 'Content',                                       role: '',          type: 'string'  } });
        this.adapter.setObjectNotExists(this.lastMessageKey + 'expires',     { type: 'state',   common: { name: 'Expire',                                        role: '',          type: 'number'  } });
        this.adapter.setObjectNotExists(this.lastMessageKey + 'priority',    { type: 'state',   common: { name: 'Priority',                                      role: '',          type: 'number'  } });
    }

    async sendMessage(message)
    {
        const data = JSON.stringify(message);

        // @ts-ignore
        axios.post(this.adapter.config.serverURL, message, this.getHTTPConfig())
            .catch(err => {
                this.adapter.log.error(`Ntfy error: ${err}`);
                this.adapter.log.error(`Ntfy error: ${JSON.stringify(err.response.data)}`);
                this.adapter.log.error(`Ntfy with config: ${JSON.stringify(this.getHTTPConfig())}`);
                this.adapter.log.error(`Ntfy with body: ${JSON.stringify(err.config.data)}`);
                this.adapter.log.error(`Ntfy with data: ${data}`);
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

    disconnect()
    {
        if (this.checkSubscriptionTimeout) clearTimeout(this.checkSubscriptionTimeout);
        if (this.eventSource === null) return;
        this.eventSource.close();
        this.adapter.setState(this.topicKey + '.connected', {ack: true, val: false});
    }
}

module.exports = { Topic };