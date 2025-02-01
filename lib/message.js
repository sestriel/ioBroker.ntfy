"use strict";


class Message {
    /**
     * @param { String } topic
     * @param { String } title
     * @param { String } message
     * @param { Number } priority
     */
    constructor(topic, title = "", message = "", priority = 3) {
        this.topic = topic;
        this.title = title;
        this.message = message;
        this.priority = priority;

        this.delay = "";
        this.tags = [];
        this.clickURL = null;
        this.iconURL = null;

        this.attachment = null;
        this.actionBtns = [];
    }

    /**
     * @param { string | null } delay
     */
    addDelay(delay) {
        if (delay !== null && delay !== "") this.delay = delay;
    }

    /**
     * @param { String } tag
     */
    addTag(tag) {
        this.tags.push(tag);
    }

    addTags(tags) {
        if (!(tags instanceof Array)) return;

        for (const i in tags) {
            this.tags.push(tags[i]);
        }
    }

    addClickURL(url) {
        if (url === null || url === "") return;
        if (!this.isValidUrl(url)) return;
        this.clickURL = url;
    }

    addIconURL(url) {
        if (!this.isValidUrl(url)) return;
        this.iconURL = url;
    }

    addAttachment(attachFromURL, filename) {
        if (attachFromURL === null || attachFromURL === "") return;
        if (!this.isValidUrl(attachFromURL)) return;

        this.attachment = {
            url: attachFromURL,
            filename: (filename !== null && filename !== "") ? filename : attachFromURL.substring(attachFromURL.lastIndexOf("/") + 1)
        };
    }

    addActionBtn(actionButton) {
        this.actionBtns.push(actionButton);
    }

    isValidUrl(urlString) {
        const urlPattern = new RegExp("^(https?:\\/\\/)?" + // validate protocol
            "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
            "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
            "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
            "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
            "(\\#[-a-z\\d_]*)?$", "i"); // validate fragment locator
        return !!urlPattern.test(urlString);
    }

    toJSON() {
        return {
            topic: this.topic,
            priority: this.priority,
            ...(this.title !== null && this.title !== "" && { title: this.title }),
            ...(this.message !== null && this.message !== "" && { message: this.message }),
            ...(this.iconURL !== null && this.iconURL !== "" && { icon: this.iconURL }),
            ...(this.delay !== null && this.delay !== "" && { delay: this.delay }),
            ...(this.clickURL !== null && this.clickURL !== "" && { click: this.clickURL }),
            ...(this.attachment !== null && { attach: this.attachment.url, filename: this.attachment.filename }),
            ...(this.tags.length > 0 && { tags: this.tags }),
            ...(this.actionBtns.length > 0 && { actions: this.actionBtns }),
        };
    }
}

module.exports = { Message };