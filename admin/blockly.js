'use strict';

if (typeof goog !== 'undefined') {
    goog.provide('Blockly.JavaScript.Ntfy');
    goog.require('Blockly.JavaScript');
}

Blockly.Words['Ntfy']                            = {'en': 'Ntfy',                                                            'de': 'Ntfy'};
Blockly.Words['ntfy_send_message']               = {'en': 'Send Ntfy Message',                                               'de': 'Ntfy Nachricht senden'};
Blockly.Words['ntfy_instance']                   = {'en': 'Instance',                                                        'de': 'Instanz'};
Blockly.Words['ntfy_topic']                      = {'en': 'Topic',                                                           'de': 'Topic'};
Blockly.Words['ntfy_title']                      = {'en': 'Title (optional)',                                                'de': 'Titel (optional)'};
Blockly.Words['ntfy_message']                    = {'en': 'Message',                                                         'de': 'Nachricht'};
Blockly.Words['ntfy_tags']                       = {'en': 'Tags (List, optional)',                                           'de': 'Tags (Liste, optional)'};
Blockly.Words['ntfy_attachment']                 = {'en': 'Attachment (optional)',                                           'de': 'Anhang (optional)'};
Blockly.Words['ntfy_clickurl']                   = {'en': 'Click-URL (optional)',                                            'de': 'Klick-URL (optional)'};
Blockly.Words['ntfy_action_button']              = {'en': 'Action-Button (optional)',                                        'de': 'Aktions-Button (optional)'};
Blockly.Words['ntfy_priority']                   = {'en': 'Priority',                                                        'de': 'Priorität'};
Blockly.Words['ntfy_delay']                      = {'en': 'Delay (String, optional)',                                        'de': 'Verzögerung als Text (optional)'};
Blockly.Words['ntfy_prio_urgent']                = {'en': 'Urgent',                                                          'de': 'Dringend'};
Blockly.Words['ntfy_prio_high']                  = {'en': 'High',                                                            'de': 'Hoch'};
Blockly.Words['ntfy_prio_default']               = {'en': 'Default',                                                         'de': 'Standard'};
Blockly.Words['ntfy_prio_low']                   = {'en': 'Low',                                                             'de': 'Niedrig'};
Blockly.Words['ntfy_prio_min']                   = {'en': 'Quiet',                                                           'de': 'Leise'};
Blockly.Words['ntfy_action_button_view']         = {'en': 'Ntfy Action-Button (View)',                                       'de': 'Ntfy Aktions-Button (Ansicht)'};
Blockly.Words['ntfy_action_button_http']         = {'en': 'Ntfy Action-Button (HTTP)',                                       'de': 'Ntfy Aktions-Button (HTTP)'};
Blockly.Words['ntfy_action_button_label']        = {'en': 'Button-Text',                                                     'de': 'Button-Text'};
Blockly.Words['ntfy_action_button_url']          = {'en': 'URL',                                                             'de': 'URL'};
Blockly.Words['ntfy_action_button_method']       = {'en': 'Method',                                                          'de': 'Method'};
Blockly.Words['ntfy_action_button_headers']      = {'en': 'Headers (Ntfy Object, optional)',                                 'de': 'Headers (Ntfy-Objekt, optional)'};
Blockly.Words['ntfy_action_button_body']         = {'en': 'Body (Ntfy Object, optional)',                                    'de': 'Body (Ntfy-Objekt, optional)'};
Blockly.Words['ntfy_action_button_clear']        = {'en': 'Clear notification',                                              'de': 'Clear notification'};
Blockly.Words['ntfy_url_attachment']             = {'en': 'Ntfy Attachment from URL',                                        'de': 'Ntfy Anhang von URL'};
Blockly.Words['ntfy_url_attachment_url']         = {'en': 'URL',                                                             'de': 'URL'};
Blockly.Words['ntfy_url_attachment_name']        = {'en': 'Filename (optional)',                                             'de': 'Dateiname (optional)'};
Blockly.Words['ntfy_object_label']               = {'en': 'Ntfy Object',                                                     'de': 'Ntfy Objekt'};
Blockly.Words['ntfy_object_attribute']           = {'en': 'Object Attribute',                                                'de': 'Attribut'};
Blockly.Words['ntfy_object_attribute_attribute'] = {'en': 'Name',                                                            'de': 'Name'};
Blockly.Words['ntfy_object_attribute_content']   = {'en': 'content',                                                         'de': 'content'};
Blockly.Words['ntfy_object_attributes']          = {'en': 'Attributes',                                                      'de': 'Attribute'};
Blockly.Words['ntfy_tooltip']                    = {'en': 'Send message to Ntfy Topic',                                      'de': 'Nachricht an Ntfy Thema senden'};
Blockly.Words['ntfy_help']                       = {'en': 'https://github.com/ioBroker/ioBroker.ntfy/blob/master/README.md', 'de': 'https://github.com/ioBroker/ioBroker.ntfy/blob/master/README.md'};

Blockly.CustomBlocks = Blockly.CustomBlocks || [];
Blockly.CustomBlocks.push('Ntfy');
Blockly.Ntfy = { HUE: 120, blocks: {} };

const NtfyBlockHelpers = {
    getInstances: () => {
        const options = [];
        if (typeof main !== 'undefined' && main.instances) {
            for (const instance of main.instances) {
                const m = instance.match(/^system.adapter.ntfy.(\d+)$/);
                if (m) {
                    const k = parseInt(m[1], 10);
                    options.push(['ntfy.' + k, '.' + k]);
                }
            }
            if (options.length === 0) {
                for (let u = 0; u <= 4; u++) {
                    options.push(['ntfy.' + u, '.' + u]);
                }
            }
        } else {
            for (let n = 0; n <= 4; n++) {
                options.push(['ntfy.' + n, '.' + n]);
            }
        }
        return options;
    },
    getTopics: () => {
        const topics = [];
        topics.push([main.objects['system.adapter.ntfy.0'].native.defaultTopic, main.objects['system.adapter.ntfy.0'].native.defaultTopic]);
        if (typeof main !== 'undefined' && main.instances) {
            const presetTopics = main.objects['system.adapter.ntfy.0'].native.presetTopics;
            for (const topicIndex in presetTopics) {
                topics.push([ presetTopics[topicIndex].presetTopicName, presetTopics[topicIndex].presetTopicName ]);
            }
        }
        if (!topics.length) topics.push(['No input', 'No input']);
        return topics;
    }
};


// ##### Main block : ntfy_send_message #####################################################################################
Blockly.Ntfy.blocks['ntfy_send_message'] =
      '<block type="ntfy_send_message">'
    + '  <value name="INSTANCE"></value>'
    + '  <value name="TOPIC"></value>'
    + '  <value name="TITLE">'
    + '    <shadow type="text">'
    + '      <field name="TEXT"></field>'
    + '    </shadow>'
    + '  </value>'
    + '  <value name="MESSAGE">'
    + '    <shadow type="text">'
    + '      <field name="TEXT"></field>'
    + '    </shadow>'
    + '  </value>'
    + '  <value name="TAGS">'
    + '    <shadow type="logic_null"></shadow>'
    + '  </value>'
    + '  <value name="ATTACHMENT">'
    + '    <shadow type="logic_null"></shadow>'
    + '  </value>'
    + '  <value name="CLICKURL">'
    + '    <shadow type="text"></shadow>'
    + '  </value>'
    + '  <value name="ACTIONBUTTON">'
    + '    <shadow type="logic_null"></shadow>'
    + '  </value>'
    + '  <value name="PRIORITY"></value>'
    + '  <value name="DELAY"></value>'
    + '</block>';

Blockly.Blocks['ntfy_send_message'] = {
    init: function() {
        const options = NtfyBlockHelpers.getInstances();
        const topics  = NtfyBlockHelpers.getTopics();

        this.appendDummyInput('_label')
            .appendField(Blockly.Translate('ntfy_send_message'));

        this.appendDummyInput('INSTANCE')
            .appendField(Blockly.Translate('ntfy_instance'))
            .appendField(new Blockly.FieldDropdown(options), 'INSTANCE');

        this.appendDummyInput('TOPIC')
            .appendField(Blockly.Translate('ntfy_topic'))
            .appendField(new Blockly.FieldDropdown(topics), 'TOPIC');

        this.appendValueInput('TITLE')
            .setCheck('String')
            .appendField(Blockly.Translate('ntfy_title'));

        this.appendValueInput('MESSAGE')
            .setCheck(['String'])
            .appendField(Blockly.Translate('ntfy_message'));

        this.appendValueInput('TAGS')
            .setCheck(['Array'])
            .appendField(Blockly.Translate('ntfy_tags'));

        this.appendValueInput('ATTACHMENT')
            .setCheck(['NtfyAttachmentContent'])
            .appendField(Blockly.Translate('ntfy_attachment'));

        this.appendValueInput('CLICKURL')
            .setCheck(['String'])
            .appendField(Blockly.Translate('ntfy_clickurl'));

        this.appendValueInput('ACTIONBUTTON')
            .setCheck(['NtfyActionButtonContent'])
            .appendField(Blockly.Translate('ntfy_action_button'));

        this.appendDummyInput('PRIORITY')
            .appendField(Blockly.Translate('ntfy_priority'))
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Translate('ntfy_prio_urgent'),  '5'],
                [Blockly.Translate('ntfy_prio_high'),    '4'],
                [Blockly.Translate('ntfy_prio_default'), '3'],
                [Blockly.Translate('ntfy_prio_low'),     '2'],
                [Blockly.Translate('ntfy_prio_min'),     '1'],
            ]), 'PRIORITY');

        this.appendValueInput('DELAY')
            .setCheck('String')
            .appendField(Blockly.Translate('ntfy_delay'));

        this.setColour(Blockly.Ntfy.HUE);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip(Blockly.Translate('ntfy_tooltip'));
        this.setHelpUrl(Blockly.Translate('ntfy_help'));
    }
};

Blockly.JavaScript['ntfy_send_message'] = function(block) {
    const instance = block.getFieldValue('INSTANCE');
    const topic = block.getFieldValue('TOPIC');
    const title =  Blockly.JavaScript.valueToCode(block, 'TITLE', Blockly.JavaScript.ORDER_ATOMIC);
    const message = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_ATOMIC);
    const tags = Blockly.JavaScript.valueToCode(block, 'TAGS', Blockly.JavaScript.ORDER_ATOMIC);
    const attachment = Blockly.JavaScript.valueToCode(block, 'ATTACHMENT', Blockly.JavaScript.ORDER_ATOMIC);
    const clickURL = Blockly.JavaScript.valueToCode(block, 'CLICKURL', Blockly.JavaScript.ORDER_ATOMIC);
    const actionButton = Blockly.JavaScript.valueToCode(block, 'ACTIONBUTTON', Blockly.JavaScript.ORDER_ATOMIC);
    const delay = Blockly.JavaScript.valueToCode(block, 'DELAY', Blockly.JavaScript.ORDER_ATOMIC);
    const priority = parseInt(block.getFieldValue('PRIORITY'), 10);

    let data = `{`;
    data += `\n    instance: '${instance}',`;
    data += `\n    topic: '${topic}',`;
    data += `\n    title: ${(title && title !== 'null' && title !== `''`) ? title : null},`;
    data += `\n    message: ${message},`;
    data += `\n    tags: ${(tags && tags !== 'null' && tags !== `''`) ? tags : null},`;
    data += `\n    attachment: ${(attachment && attachment !== 'null' && attachment !== `''`) ? attachment : null},`;
    data += `\n    clickURL: ${(clickURL && clickURL !== 'null' && clickURL !== `''`) ? clickURL : null},`;
    data += `\n    actionButton: ${(actionButton && actionButton !== 'null' && actionButton !== `''`) ? actionButton : null},`;
    data += `\n    delay: ${(delay && delay !== 'null' && delay !== `''`) ? delay : null},`;
    data += `\n    priority: ${priority}`;
    data += '\n  }';
    return 'sendTo("ntfy' + instance + '", "send", ' + data + ');\n';
};


// ##### Allocation block : ntfy_url_attachment #############################################################################
Blockly.Ntfy.blocks['ntfy_url_attachment'] =
      '<block type="ntfy_url_attachment">'
    + '  <value name="URL">'
    + '    <shadow type="text">'
    + '      <field name="TEXT"></field>'
    + '    </shadow>'
    + '  </value>'
    + '  <value name="NAME">'
    + '    <shadow type="text">'
    + '      <field name="TEXT"></field>'
    + '    </shadow>'
    + '  </value>'
    + '</block>';

Blockly.Blocks['ntfy_url_attachment'] = {
    init: function () {
        this.appendDummyInput('_title')
            .appendField(Blockly.Translate('ntfy_url_attachment'));

        this.appendValueInput('URL')
            .setCheck('String')
            .appendField(Blockly.Translate('ntfy_url_attachment_url'));

        this.appendValueInput('NAME')
            .setCheck('String')
            .appendField(Blockly.Translate('ntfy_url_attachment_name'));

        this.setColour(Blockly.Ntfy.HUE);
        this.setInputsInline(false);
        this.setOutput(true, 'NtfyAttachmentContent');
    },
};

Blockly.JavaScript['ntfy_url_attachment'] = function (block) {
    const url  = Blockly.JavaScript.valueToCode(block, 'URL', Blockly.JavaScript.ORDER_ATOMIC);
    const name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);

    let data = `{`;
    data += `\n        url: ${url},`;
    data += `\n        name: ${(name && name !== 'null' && name !== `''`) ? name : null},`;
    data += '\n    }';
    return [data, Blockly.JavaScript.ORDER_ATOMIC];
};


// ##### Allocation block : ntfy_action_button_view #########################################################################
Blockly.Ntfy.blocks['ntfy_action_button_view'] =
      '<block type="ntfy_action_button_view">'
    + '  <value name="LABEL">'
    + '    <shadow type="text">'
    + '      <field name="TEXT"></field>'
    + '    </shadow>'
    + '  </value>'
    + '  <value name="URL">'
    + '    <shadow type="text">'
    + '      <field name="TEXT"></field>'
    + '    </shadow>'
    + '  </value>'
    + '  <value name="CLEAR"></value>'
    + '</block>';

Blockly.Blocks['ntfy_action_button_view'] = {
    init: function () {
        this.appendDummyInput('_title')
            .appendField(Blockly.Translate('ntfy_action_button_view'));

        this.appendValueInput('LABEL')
            .setCheck('String')
            .appendField(Blockly.Translate('ntfy_action_button_label'));

        this.appendValueInput('URL')
            .setCheck('String')
            .appendField(Blockly.Translate('ntfy_action_button_url'));

        this.appendDummyInput('CLEAR')
            .appendField(Blockly.Translate('ntfy_action_button_clear'))
            .appendField(new Blockly.FieldDropdown([['false', 'false'],['true', 'true']]), 'CLEAR');

        this.setColour(Blockly.Ntfy.HUE);
        this.setInputsInline(false);
        this.setOutput(true, 'NtfyActionButtonContent');
    },
};

Blockly.JavaScript['ntfy_action_button_view'] = function (block) {
    const label = Blockly.JavaScript.valueToCode(block, 'LABEL', Blockly.JavaScript.ORDER_ATOMIC);
    const url   = Blockly.JavaScript.valueToCode(block, 'URL', Blockly.JavaScript.ORDER_ATOMIC);
    const clear       = block.getFieldValue('CLEAR');

    let data = `{`;
    data += `\n        type: 'view',`;
    data += `\n        label: ${label},`;
    data += `\n        url: ${url},`;
    data += `\n        clear: ${clear}`;
    data += '\n    }';
    return [data, Blockly.JavaScript.ORDER_ATOMIC];
};


// ##### Allocation block : ntfy_action_button_http #########################################################################
Blockly.Ntfy.blocks['ntfy_action_button_http'] =
      '<block type="ntfy_action_button_http">'
    + '  <value name="LABEL">'
    + '    <shadow type="text">'
    + '      <field name="TEXT"></field>'
    + '    </shadow>'
    + '  </value>'
    + '  <value name="URL">'
    + '    <shadow type="text">'
    + '      <field name="TEXT"></field>'
    + '    </shadow>'
    + '  </value>'
    + '  <value name="METHOD"></value>'
    + '  <value name="HEADERS">'
    + '    <shadow type="logic_null"></shadow>'
    + '  </value>'
    + '  <value name="BODY">'
    + '    <shadow type="logic_null"></shadow>'
    + '  </value>'
    + '  <value name="CLEAR"></value>'
    + '</block>';

Blockly.Blocks['ntfy_action_button_http'] = {
    init: function () {
        this.appendDummyInput('_title')
            .appendField(Blockly.Translate('ntfy_action_button_http'));

        this.appendValueInput('LABEL')
            .setCheck('String')
            .appendField(Blockly.Translate('ntfy_action_button_label'));

        this.appendValueInput('URL')
            .setCheck('String')
            .appendField(Blockly.Translate('ntfy_action_button_url'));

        this.appendDummyInput('METHOD')
            .appendField(Blockly.Translate('ntfy_action_button_method'))
            .appendField(new Blockly.FieldDropdown([['POST', 'POST'],['GET', 'GET'],['PUT', 'PUT'],['PATCH', 'PATCH'],['DELETE', 'DELETE']]), 'METHOD');

        this.appendValueInput('HEADERS')
            .setCheck(['NtfyObjectList'])
            .appendField(Blockly.Translate('ntfy_action_button_headers'));

        this.appendValueInput('BODY')
            .setCheck(['NtfyObjectList'])
            .appendField(Blockly.Translate('ntfy_action_button_body'));

        this.appendDummyInput('CLEAR')
            .appendField(Blockly.Translate('ntfy_action_button_clear'))
            .appendField(new Blockly.FieldDropdown([['false', 'false'],['true', 'true']]), 'CLEAR');

        this.setInputsInline(false);

        this.setOutput(true, 'NtfyActionButtonContent');

        this.setColour(Blockly.Ntfy.HUE);
    },
};

Blockly.JavaScript['ntfy_action_button_http'] = function (block) {
    const label   = Blockly.JavaScript.valueToCode(block, 'LABEL', Blockly.JavaScript.ORDER_ATOMIC);
    const url     = Blockly.JavaScript.valueToCode(block, 'URL', Blockly.JavaScript.ORDER_ATOMIC);
    const headers = Blockly.JavaScript.valueToCode(block, 'HEADERS', Blockly.JavaScript.ORDER_ATOMIC);
    const body    = Blockly.JavaScript.valueToCode(block, 'BODY', Blockly.JavaScript.ORDER_ATOMIC);
    const method  = block.getFieldValue('METHOD');
    const clear   = block.getFieldValue('CLEAR');

    let data = `{`;
    data += `\n    type: 'http',`;
    data += `\n    label: ${label},`;
    data += `\n    url: ${url},`;
    data += `\n    method: '${method}',`;
    data += `\n    headers: ${(headers && headers !== 'null' && headers !== `''`) ? headers : null},`;
    data += `\n    body: ${(body && body !== 'null' && body !== `''`) ? body : null},`;
    data += `\n    clear: ${clear}`;
    data += '\n}';
    return [data, Blockly.JavaScript.ORDER_ATOMIC];
};


// ##### Allocation block : ntfy_object #####################################################################################
Blockly.Ntfy.blocks['ntfy_object'] =
      '<block type="ntfy_object">'
    + '  <value name="LABEL">'
    + '    <shadow type="text">'
    + '      <field name="TEXT"></field>'
    + '    </shadow>'
    + '  </value>'
    + '  <mutation items="3"></mutation>'
    + '</block>';

Blockly.Blocks['ntfy_object'] = {
    init: function () {
        this.appendDummyInput('_title')
            .appendField(Blockly.Translate('ntfy_object_label'));

        this.itemCount_ = 3;
        this.updateShape_();
        this.setMutator(new Blockly.Mutator(['ntfy_object_item']));
        this.setOutput(true, 'NtfyObjectList');
        this.setColour(Blockly.Ntfy.HUE);
    },

    mutationToDom: function () {
        const container = document.createElement('mutation');
        container.setAttribute('items', String(this.itemCount_));
        return container;
    },

    domToMutation: function (xmlElement) {
        const items = xmlElement.getAttribute('items');
        if (!items) throw new TypeError('element did not have items');
        this.itemCount_ = parseInt(items, 10);
        this.updateShape_();
    },

    saveExtraState: function () {
        return {
            'itemCount': this.itemCount_,
        };
    },

    loadExtraState: function (state) {
        this.itemCount_ = state['itemCount'];
        this.updateShape_();
    },

    decompose: function (workspace) {
        const containerBlock = workspace.newBlock('ntfy_object_container');
        containerBlock.initSvg();
        let connection = containerBlock.getInput('STACK').connection;
        for (let i = 0; i < this.itemCount_; i++) {
            const itemBlock = workspace.newBlock('ntfy_object_item');
            itemBlock.initSvg();
            if (!itemBlock.previousConnection) {
                throw new Error('itemBlock has no previousConnection');
            }
            connection.connect(itemBlock.previousConnection);
            connection = itemBlock.nextConnection;
        }
        return containerBlock;
    },

    compose: function (containerBlock) {
        let itemBlock = containerBlock.getInputTargetBlock('STACK');
        const connections = [];
        while (itemBlock) {
            if (itemBlock.isInsertionMarker()) {
                itemBlock = itemBlock.getNextBlock();
                continue;
            }
            connections.push(itemBlock.valueConnection);
            itemBlock = itemBlock.getNextBlock();
        }
        // Disconnect any children that don't belong.
        for (let i = 0; i < this.itemCount_; i++) {
            const connection = this.getInput('ADD' + i).connection.targetConnection;
            if (connection && !connections.includes(connection)) {
                connection.disconnect();
            }
        }
        this.itemCount_ = connections.length;
        this.updateShape_();
        // Reconnect any child blocks.
        for (let i = 0; i < this.itemCount_; i++) {
            connections[i]?.reconnect(this, 'ADD' + i);
        }
    },

    saveConnections: function (containerBlock) {
        let itemBlock = containerBlock.getInputTargetBlock('STACK');
        let i = 0;
        while (itemBlock) {
            if (itemBlock.isInsertionMarker()) {
                itemBlock = itemBlock.getNextBlock();
                continue;
            }
            const input = this.getInput('ADD' + i);
            itemBlock.valueConnection_ = input?.connection.targetConnection;
            itemBlock = itemBlock.getNextBlock();
            i++;
        }
    },

    updateShape_: function () {
        if (this.itemCount_ && this.getInput('EMPTY')) {
            this.removeInput('EMPTY');
        } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
            this.appendDummyInput('EMPTY').appendField('');
        }
        for (let i = 0; i < this.itemCount_; i++) {
            if (!this.getInput('ADD' + i)) {
                const input = this.appendValueInput('ADD' + i).setAlign(Blockly.ALIGN_RIGHT);
                input.setCheck('NtfyObjectAttribute');
                if (i === 0) {
                    input.appendField('');
                }
            }
        }
        for (let i = this.itemCount_; this.getInput('ADD' + i); i++) {
            this.removeInput('ADD' + i);
        }
    }
};
Blockly.JavaScript['ntfy_object'] = function (block) {
    let data = '{';
    for (let n = 0; n < block.itemCount_; n++) {
        const val = Blockly.JavaScript.valueToCode(block, 'ADD' + n, Blockly.JavaScript.ORDER_COMMA);
        if (val && val !== 'null' && val !== `''`) {
            data += `\n        ${val},`;
        }
    }
    data += '\n    }';
    return [data, Blockly.JavaScript.ORDER_ATOMIC];
};


// ##### Allocation block : ntfy_object_attribute ###########################################################################
Blockly.Ntfy.blocks['ntfy_object_attribute'] =
      '<block type="ntfy_object_attribute">'
    + '  <value name="ATTRIBUTE">'
    + '    <shadow type="text">'
    + '      <field name="TEXT"></field>'
    + '    </shadow>'
    + '  </value>'
    + '  <value name="CONTENT">'
    + '    <shadow type="text">'
    + '      <field name="TEXT"></field>'
    + '    </shadow>'
    + '  </value>'
    + '</block>';

Blockly.Blocks['ntfy_object_attribute'] = {
    init: function () {
        this.appendDummyInput('_title')
            .appendField(Blockly.Translate('ntfy_object_attribute'));

        this.appendValueInput('ATTRIBUTE')
            .setCheck('String')
            .appendField(Blockly.Translate('ntfy_object_attribute_attribute'));

        this.appendValueInput('CONTENT')
            .setCheck('String')
            .appendField(Blockly.Translate('ntfy_object_attribute_content'));

        this.setColour(Blockly.Ntfy.HUE);
        this.setInputsInline(true);
        this.setOutput(true, 'NtfyObjectAttribute');
    },
};

Blockly.JavaScript['ntfy_object_attribute'] = function (block) {
    const attribute   = Blockly.JavaScript.valueToCode(block, 'ATTRIBUTE', Blockly.JavaScript.ORDER_ATOMIC);
    const content     = Blockly.JavaScript.valueToCode(block, 'CONTENT', Blockly.JavaScript.ORDER_ATOMIC);
    const data = `${(attribute && attribute !== 'null' && attribute !== `''`) ? attribute : 'Missing-Attribute'}: ${(content && content !== 'null' && content !== `''`) ? content : 'Missing-Content'}`;
    return [data, Blockly.JavaScript.ORDER_ATOMIC];
};


// ##### Mutation block : ntfy_object_container #############################################################################
Blockly.Blocks['ntfy_object_container'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Translate('ntfy_object_attributes'));

        this.setColour(Blockly.Ntfy.HUE);
        this.appendStatementInput('STACK');
        this.contextMenu = false;
    }
};


// ##### Mutation block : ntfy_object_attribute #############################################################################
Blockly.Blocks['ntfy_object_item'] = {
    init: function () {
        this.appendDummyInput('NAME')
            .appendField(Blockly.Translate('ntfy_object_attribute'));

        this.setColour(Blockly.Ntfy.HUE);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.contextMenu = false;
    }
};