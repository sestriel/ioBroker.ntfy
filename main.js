"use strict";

const utils = require("@iobroker/adapter-core");
const axios = require("axios");
const https = require("node:https");

const { Topic } = require("./lib/topic");
const { Message } = require("./lib/message");
const { ActionButtonView, ActionButtonHTTP } = require("./lib/actionButton");

class ntfy extends utils.Adapter {
  /**
   * @param [options]
   */
  constructor(options) {
    super({
      ...options,
      name: "ntfy",
    });

    this.messageTime = 0;
    this.topics = {};

    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("message", this.onMessage.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }

  async onReady() {
    this.setState("info.connection", false, true);
    if (!(await this.checkConfig())) {
      this.checkTopic();
      this.checkAuth();
      return;
    }

    this.setState("info.connection", true, true);

    this.topics = this.getTopics();
  }

  onUnload(callback) {
    try {
      for (const topicIndex in this.topics) {
        this.topics[topicIndex].disconnect();
      }

      this.setState("info.connection", false, true);

      callback();
    } catch (e) {
      console.log(e);
      callback();
    }
  }

  /**
   * @param obj
   */
  async onMessage(obj) {
    if (typeof obj === "object" && obj.message) {
      if (obj.command === "send") {
        if (await this.checkConfig()) {
          this.sendMessage(obj);
        }
      }
    }

    if (typeof obj === "object" && obj.command) {
      if (obj.command === "testBtn") {
        let testMsg;
        if (
          typeof this.config.presetTopics !== "object" ||
          Object.keys(this.config.presetTopics).length <= 0
        ) {
          testMsg = "Presets: None";
        } else {
          testMsg = `Presets: ${JSON.stringify(this.config.presetTopics)}`;
        }
        this.sendTo(obj.from, obj.command, { result: testMsg }, obj.callback);
      }
    }
  }

  /**
   * @param id
   * @param state
   */
  onStateChange(id, state) {
    const logPrefix = "[onStateChange]:";
    // Warning, state can be null if it was deleted
    try {
      if (
        state &&
        !state.ack &&
        !state.from.includes(this.namespace) &&
        state.val
      ) {
        if (id.endsWith(".sendJSON")) {
          const topic = id.split(".")[id.split(".").length - 2];
          const json = JSON.parse(state.val);

          this.sendMessage({ message: { topic: topic, ...json } });
        }
      }
    } catch (error) {
      this.log.error(`${logPrefix} error: ${error}, stack: ${error.stack}`);
    }
  }

  async checkConfig() {
    if (!this.config.serverURL) {
      this.log.error("Ntfy-Config: Server-URL is not set");
      return false;
    }
    try {
      const instance = axios.create({
        httpsAgent: new https.Agent({
          rejectUnauthorized: !this.config.allowSSL,
        }),
      });

      const response = await instance.get(this.config.serverURL);
      if (response.status !== 200) {
        this.log.error("Ntfy-Config: Server-URL is not reachable");
        return false;
      }
    } catch (err) {
      this.log.error("Ntfy-Config: Server-URL is not reachable");
      this.log.error(err);
      return false;
    }
    return true;
  }

  checkTopic() {
    if (!this.config.defaultTopic) {
      this.log.info("Ntfy-Config: No default topic is set");
      return false;
    }
    return true;
  }

  checkAuth() {
    if (
      (this.config.defaultTopicAuth !== 0 &&
        this.config.defaultTopicAuth === 1 &&
        !this.config.defaultUsername &&
        !this.config.defaultPassword) ||
      (this.config.defaultTopicAuth === 2 && !this.config.defaultAccessToken)
    ) {
      this.log.info(
        "Ntfy-Config: No default credentials are set (either username & password or access token)",
      );
      return false;
    }
    return true;
  }

  sendMessage(obj) {
    if (!obj.message.topic) {
      obj.message.topic = this.config.defaultTopic;
    }

    const message = new Message(
      obj.message.topic || this.config.defaultTopic,
      obj.message.title,
      obj.message.message,
      obj.message.priority,
    );
    message.addDelay(obj.message.delay);
    message.addTags(obj.message.tags);
    message.addClickURL(obj.message.clickURL);

    if (
      obj.message.attachment &&
      obj.message.attachment.url !== "" &&
      obj.message.attachment.name !== ""
    ) {
      message.addAttachment(
        obj.message.attachment.url,
        obj.message.attachment.name,
      );
    }

    let actionButton = null;

    if (obj.message.actionButton) {
      switch (obj.message.actionButton.type) {
        case "view":
          actionButton = new ActionButtonView(
            obj.message.actionButton.label,
            obj.message.actionButton.url,
            obj.message.actionButton.clear,
          );
          break;
        case "http":
          actionButton = new ActionButtonHTTP(
            obj.message.actionButton.label,
            obj.message.actionButton.url,
            obj.message.actionButton.clear,
          );
          actionButton.setMethod(obj.message.actionButton.method);
          actionButton.setHeaders(obj.message.actionButton.headers);
          actionButton.setBody(JSON.stringify(obj.message.actionButton.body));
          break;
      }
      message.addActionBtn(actionButton);
    }

    this.log.debug(`Message body (JSON): ${JSON.stringify(message)}`);

    if (this.messageTime && Date.now() - this.messageTime < 1000) {
      return;
    }

    this.messageTime = Date.now();

    this.topics[message.topic].sendMessage(message, obj);
  }

  getTopics() {
    const topics = {};

    topics[this.config.defaultTopic] = new Topic(
      this,
      this.config.defaultTopic,
      this.config.defaultSubscribed,
      this.config.defaultTopicAuth,
      this.config.defaultUsername,
      this.config.defaultPassword,
      this.config.defaultAccessToken,
    );

    if (
      typeof this.config.presetTopics === "object" &&
      Object.keys(this.config.presetTopics).length > 0
    ) {
      this.config.presetTopics.forEach((presetTopic) => {
        topics[presetTopic.presetTopicName] = new Topic(
          this,
          presetTopic.presetTopicName,
          presetTopic.presetTopicSubscribed,
          presetTopic.presetTopicAuth,
          presetTopic.presetTopicUsername,
          presetTopic.presetTopicPassword,
          presetTopic.presetTopicAccessToken,
        );
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
