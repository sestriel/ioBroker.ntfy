"use strict";

const axios = require("axios");
const https = require("node:https");
const EventSource = require("eventsource");

class Topic {
    /**
     * 
     * @param {ioBroker.Adapter} adapter 
     * @param {string} name 
     * @param {boolean} subscribed 
     * @param {number} authType 
     * @param {string} username 
     * @param {string} password 
     * @param {string} accessToken 
     */
    constructor(adapter, name, subscribed, authType = 0, username = "", password = "", accessToken = "") {
        this.adapter = adapter;

        this.name = name;
        this.authType = authType;
        this.username = username;
        this.password = password;
        this.accessToken = accessToken;

        this.shouldSubcribe = subscribed;
        this.subscribed = false;

        this.topicKey = "topics." + this.name;
        this.lastMessageKey = this.topicKey + ".lastMessage.";

        this.connected = false;
        this.eventSource = null;

        this.createTopicObjects();
        this.checkSubscriptionTimeout = null;

        if (this.shouldSubcribe) {
            this.subscribe();
        }
    }

    subscribe() {
        const logPrefix = "[subscribe]:";

        try {
            if (this.shouldSubcribe) {
                if (this.eventSource !== null && this.eventSource.readyState !== 2) {
                    return;
                }

                this.eventSource = new EventSource(this.adapter.config.serverURL + "/" + this.name + "/sse", this.getHTTPConfig());
                this.eventSource.onmessage = (e) => {
                    this.adapter.log.debug('Received new message from topic "' + this.name + '"');

                    const msgData = JSON.parse(e.data);

                    this.adapter.setState(this.topicKey + ".lastMessageRaw", { ack: true, val: e.data });
                    this.adapter.setState(this.lastMessageKey + "id", { ack: true, val: msgData.id });
                    this.adapter.setState(this.lastMessageKey + "time", { ack: true, val: msgData.time });
                    this.adapter.setState(this.lastMessageKey + "tags", { ack: true, val: msgData.tags });
                    this.adapter.setState(this.lastMessageKey + "event", { ack: true, val: msgData.event });
                    this.adapter.setState(this.lastMessageKey + "title", { ack: true, val: msgData.title });
                    this.adapter.setState(this.lastMessageKey + "value", { ack: true, val: msgData.message });
                    this.adapter.setState(this.lastMessageKey + "expires", { ack: true, val: msgData.expires });
                    this.adapter.setState(this.lastMessageKey + "priority", { ack: true, val: msgData.priority });
                };
                this.eventSource.onopen = () => {
                    if (!this.subscribed) {
                        this.adapter.log.debug('Subscription to topic "' + this.name + '" established.');
                        this.adapter.setState(this.topicKey + ".connected", true, true);
                        this.subscribed = true;
                        this.startCheckSubscription();
                    }
                };
                this.eventSource.onerror = (e) => {
                    this.adapter.log.error('Subscription to topic "' + this.name + '" cant be established or lost. Status code: ' + e.status + " Error: " + e.message);
                    this.adapter.setState(this.topicKey + ".connected", false, true);
                };
            }

        } catch (error) {
            this.adapter.log.error(`${logPrefix} error: ${error}, stack: ${error.stack}`);
        }
    }

    startCheckSubscription() {
        this.adapter.log.silly("Check subscription connection for " + this.name);
        if (this.eventSource === null) return;
        if (this.eventSource.readyState === 1) {
            this.adapter.setState(this.topicKey + ".connected", true, true);
        } else {
            this.adapter.setState(this.topicKey + ".connected", false, true);
            this.subscribe();
        }

        this.checkSubscriptionTimeout = setTimeout(() => { this.startCheckSubscription(); }, 30000);
    }

    createTopicObjects() {
        this.adapter.setObjectNotExists("topics", { type: "channel", common: { name: "ntfy.sh topics", role: "folder" }, native: {} });
        this.adapter.setObjectNotExists(this.topicKey, { type: "channel", common: { name: this.adapter.config.serverURL + "/" + this.name, role: "subscription" }, native: {} });
        this.adapter.setObjectNotExists(this.topicKey + ".lastMessage", { type: "channel", common: { name: "last message", role: "folder" }, native: {} });
        this.adapter.setObjectNotExists(this.topicKey + ".sendJSON", { type: "state", common: { name: "Send JSON payload", role: "state", type: "string", read: false, write: true }, native: {} });
        this.adapter.subscribeStates(this.topicKey + ".sendJSON");

        if (this.shouldSubcribe) {
            this.adapter.setObjectNotExists(this.topicKey + ".lastMessageRaw", { type: "state", common: { name: "Last message RAW", role: "message", type: "string", read: true, write: false }, native: {} });
            this.adapter.setObjectNotExists(this.topicKey + ".connected", { type: "state", common: { name: "Subscription state", role: "state", type: "boolean", read: true, write: false }, native: {} });
            this.adapter.setObjectNotExists(this.lastMessageKey + "id", { type: "state", common: { name: "ID", role: "", type: "string", read: true, write: false }, native: {} });
            this.adapter.setObjectNotExists(this.lastMessageKey + "tags", { type: "state", common: { name: "Tags", role: "", type: "string", read: true, write: false }, native: {} });
            this.adapter.setObjectNotExists(this.lastMessageKey + "time", { type: "state", common: { name: "Time", role: "", type: "number", read: true, write: false }, native: {} });
            this.adapter.setObjectNotExists(this.lastMessageKey + "event", { type: "state", common: { name: "Event type", role: "", type: "string", read: true, write: false }, native: {} });
            this.adapter.setObjectNotExists(this.lastMessageKey + "title", { type: "state", common: { name: "Title", role: "", type: "string", read: true, write: false }, native: {} });
            this.adapter.setObjectNotExists(this.lastMessageKey + "value", { type: "state", common: { name: "Content", role: "", type: "string", read: true, write: false }, native: {} });
            this.adapter.setObjectNotExists(this.lastMessageKey + "expires", { type: "state", common: { name: "Expire", role: "", type: "number", read: true, write: false }, native: {} });
            this.adapter.setObjectNotExists(this.lastMessageKey + "priority", { type: "state", common: { name: "Priority", role: "", type: "number", read: true, write: false }, native: {} });
        } else {
            this.adapter.delObject(this.topicKey + ".lastMessage", { recursive: true });
            this.adapter.delObject(this.topicKey + ".lastMessageRaw");
            this.adapter.delObject(this.topicKey + ".connected");
        }
    }

    async sendMessage(message, obj) {
        const data = JSON.stringify(message);

        const instance = axios.create({
            httpsAgent: new https.Agent({
                rejectUnauthorized: !this.adapter.config.allowSSL
            })
        });

        // @ts-ignore
        instance.post(this.adapter.config.serverURL, message, this.getHTTPConfig())
            .then((response) => {
                if (obj.callback) {
                    this.adapter.sendTo(obj.from, obj.command, { "error": false, "status": response.status, "response": response.data }, obj.callback);
                }
            })
            .catch((error) => {

                if (obj.callback) {
                    this.adapter.sendTo(obj.from, obj.command, { "error": true, "status": error.status, "response": error.response.data }, obj.callback);
                }

                if (error.response) {
                    // The request was made and the server responded with a status code, that falls out of the range of 2xx
                    this.adapter.log.error(`Ntfy error status: ${error.status}`);
                } else if (error.request) {
                    // The request was made but no response was received
                    this.adapter.log.error(`Ntfy error request: ${JSON.stringify(error.request)}`);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    this.adapter.log.error(`Ntfy error settings: ${error.message}`);
                }

                this.adapter.log.error(`Ntfy error: ${error}`);
                this.adapter.log.error(`Ntfy error: ${JSON.stringify(error.response.data)}`);
                this.adapter.log.error(`Ntfy with config: ${JSON.stringify(this.getHTTPConfig())}`);
                this.adapter.log.error(`Ntfy with body: ${JSON.stringify(error.config.data)}`);
                this.adapter.log.error(`Ntfy with data: ${data}`);

            });
    }

    getHTTPConfig() {
        switch (this.authType) {
            case 1:
                return { headers: { "Authorization": "Basic " + Buffer.from(this.username + ":" + this.password).toString("base64") } };
            case 2:
                return { headers: { "Authorization": "Bearer " + this.accessToken } };
            default:
                return {};
        }
    }

    disconnect() {
        if (this.checkSubscriptionTimeout) clearTimeout(this.checkSubscriptionTimeout);
        if (this.eventSource === null) return;
        this.eventSource.close();
        if (this.shouldSubcribe) this.adapter.setState(this.topicKey + ".connected", false, true);
    }
}

module.exports = { Topic };