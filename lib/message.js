'use strict';


class Message {
    constructor(topic, title, message, priority = 3)
    {
        this.topic    = topic;
        this.title    = title;
        this.message  = message;
        this.priority = priority;

        this.delay    = 0;
        this.tags     = {};
        this.clickURL = null;

        this.attachment = null;
        this.actionBtns = {};
    }

    addDelay()
    {
        this.delay = 5;
    }

    addTag(tag)
    {
        this.tags[this.tags.length + 1] = tag;
    }

    addClickURL(url)
    {
        this.clickURL = url;
    }

    addAttachment(attachFromURL)
    {
        if (!this.isValidUrl(attachFromURL)) return;

        this.attachment = {
            attach: attachFromURL,
            filename: attachFromURL.substring(attachFromURL.lastIndexOf('/')+1)
        };
    }

    addActionBtn(actionButton)
    {
        this.actionBtns[this.actionBtns.length + 1] = actionButton;
    }



    isValidUrl(urlString)
    {
        const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
        '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
        return !!urlPattern.test(urlString);
    }
}

module.exports = { Message };