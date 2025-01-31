![Logo](admin/ntfy.png)
# ioBroker ntfy.sh adapter

[![NPM version](https://img.shields.io/npm/v/iobroker.ntfy.svg)](https://www.npmjs.com/package/iobroker.ntfy) [![Downloads](https://img.shields.io/npm/dm/iobroker.ntfy.svg)](https://www.npmjs.com/package/iobroker.ntfy) ![Number of Installations](https://iobroker.live/badges/ntfy-installed.svg) 

![Test and Release](https://github.com/sestriel/ioBroker.ntfy/workflows/Test%20and%20Release/badge.svg)

Use your ntfy.sh (free selfhosted) server to send and receive push notifications

* Integrates an Blockly to easily send notifications
  - Currently supported: Title, Message, Priority, Tags, Click-URL, Actionbuttons (View & HTTP), URL-Attachments
* Subscribe to topics without the need of extra javascript/blockly 
  - messages will be pushed to the corresponding, auto-created ioBroker object
* Send and receive from as many topics as you want

### Known bugs and errors
* ntfy has an invalid jsonConfig (see [Issue](https://github.com/ioBroker/adapter-react-v5/issues/292))

## Changelog
<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->
### **WORK IN PROGRESS**
* (Scrounger) jsonConfig optimized
* (Scrounger) encryption bug fix
* (Scrounger) option to allow self signed certs
* (Scrounger) send message via sendJSON state
* (Scrounger) error handling improved
* (Scrounger) small code improvements

### 0.3.3 (2024-11-07)
* (sestriel) Updated Blockly
* (sestriel) Updated packages

### 0.3.0 (2024-04-28)
* (sestriel) Added URL-Attachments
* (sestriel) Added Click-URL
* (sestriel) Added Actionbuttons (View & HTTP)
* (sestriel) Added Tags
* (sestriel) Removed wrong error messages
* (sestriel) Restructuring

### 0.2.2 (2024-04-12)
* (sestriel) Bump version to 0.2.2

### 0.2.1 (2024-04-12)
* (sestriel) Added proper unload handler
* (sestriel) Fixed some errors shown from adapter-checker
* (sestriel) Updated Readme

### 0.2.0 (2024-04-12)
* (sestriel) Added ability to subscribe to topics

### 0.1.2 (2023-10-05)
* (sestriel) Added presets for more topics
* (sestriel) Added proper authorization for default topic

### 0.1.1 (2023-09-28)
* (sestriel) First working release

### 0.1.0 (2023-09-27)
* (sestriel) Initial release

## License
MIT License

Copyright (c) 2023-2025 sestriel <admin@sestriel.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.