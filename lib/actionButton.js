"use strict";

class ActionButton
{
    constructor(action, label, clear = false)
    {
        this.action = action;
        this.label  = label;
        this.clear  = clear;
    }

    isValidUrl(urlString)
    {
        const urlPattern = new RegExp("^(https?:\\/\\/)?"+ // validate protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|"+ // validate domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))"+ // validate OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*"+ // validate port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?"+ // validate query string
        "(\\#[-a-z\\d_]*)?$","i"); // validate fragment locator
        return !!urlPattern.test(urlString);
    }
}

class ActionButtonView extends ActionButton
{
    constructor(label, url, clear = false)
    {
        super("view", label, clear);

        this.url = url;
    }

}

class ActionButtonHTTP extends ActionButton
{
    constructor(label, url, clear = false)
    {
        super("http", label, clear);

        this.url = url;
        this.method = "POST";
        this.headers = {};
        this.body = "";
    }

    getData()
    {
        return {
            action: this.action,
            label: this.label,
            url: this.url,
            method: this.method,
            headers: this.headers,
            body: this.body,
            clear: this.clear
        };
    }

    setMethod(method)
    {
        this.method = method;
    }

    setHeaders(headers)
    {
        this.headers = headers;
    }

    setBody(body)
    {
        this.body = body;
    }
}

class ActionButtonAB extends ActionButton
{

}


module.exports = { ActionButton, ActionButtonView, ActionButtonHTTP, ActionButtonAB };