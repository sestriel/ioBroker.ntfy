'use strict';

if (typeof goog !== 'undefined') {
    goog.provide('Blockly.JavaScript.Ntfy');
    goog.require('Blockly.JavaScript');
}





Blockly.Words['Ntfy']                = {'en': 'Ntfy',                        'de': 'Ntfy'};

Blockly.Words['ntfy_instance']       = {'en': 'Instance',                    'de': 'Instanz'};
Blockly.Words['ntfy_message']        = {'en': 'Message',                     'de': 'Nachricht'};
Blockly.Words['ntfy_title']          = {'en': 'Title (optional)',            'de': 'Titel (optional)'};
Blockly.Words['ntfy_priority']       = {'en': 'Priority',                    'de': 'Priorität'};
Blockly.Words['ntfy_topic']          = {'en': 'Topic',                       'de': 'Topic'};
Blockly.Words['ntfy_delay']          = {'en': 'Delay (seconds, optional)',   'de': 'Verzögerung in s (optional)'};

Blockly.Words['ntfy_prio_urgent']    = {'en': 'Urgent',                      'de': 'Dringend'};
Blockly.Words['ntfy_prio_high']      = {'en': 'High',                        'de': 'Hoch'};
Blockly.Words['ntfy_prio_default']   = {'en': 'Default',                     'de': 'Standard'};
Blockly.Words['ntfy_prio_low']       = {'en': 'Low',                         'de': 'Niedrig'};
Blockly.Words['ntfy_prio_min']       = {'en': 'Quiet',                       'de': 'Leise'};

Blockly.Words['ntfy_log']            = {'en': 'Log level',                   'de': 'Loglevel'};
Blockly.Words['ntfy_log_none']       = {'en': 'none',                        'de': 'keins'};
Blockly.Words['ntfy_log_info']       = {'en': 'info',                        'de': 'info'};
Blockly.Words['ntfy_log_debug']      = {'en': 'debug',                       'de': 'debug'};
Blockly.Words['ntfy_log_warn']       = {'en': 'warning',                     'de': 'warning'};
Blockly.Words['ntfy_log_error']      = {'en': 'error',                       'de': 'error'};
Blockly.Words['ntfy_all_instances']  = {'en': 'All instances',               'de': 'Alle Instanzen'};
Blockly.Words['ntfy_tooltip']        = {'en': 'Send message to Ntfy Topic',  'de': 'Nachricht an Ntfy Topic senden'};
Blockly.Words['ntfy_help']           = {'en': 'https://github.com/ioBroker/ioBroker.ntfy/blob/master/README.md', 'de': 'https://github.com/ioBroker/ioBroker.ntfy/blob/master/README.md'};

Blockly.Words['ntfy_send_message']   = {'en': 'Send Ntfy Message',                 'de': 'Ntfy Nachricht senden'};

Blockly.Words['ntfy_action_button_view']     = {'en': 'Ntfy Action-Button (View)', 'de': 'Ntfy Aktions-Button (Ansicht)'};
Blockly.Words['ntfy_action_button_label']    = {'en': 'Button-Text',               'de': 'Button-Text'};
Blockly.Words['ntfy_action_button_url']      = {'en': 'URL',                       'de': 'URL'};
Blockly.Words['ntfy_action_button_clear']    = {'en': 'Clear notification',        'de': 'Clear notification'};
Blockly.Words['ntfy_message_content']        = {'en': 'Content',                   'de': 'Inhalt'};
Blockly.Words['ntfy_tags']                   = {'en': 'Tags (List, optional)',     'de': 'Tags (Liste, optional)'};
Blockly.Words['ntfy_attachment']             = {'en': 'Attachment (optional)',     'de': 'Anhang (optional)'};
Blockly.Words['ntfy_url_attachment']         = {'en': 'Ntfy Attachment from URL',  'de': 'Ntfy Anhang von URL'};
Blockly.Words['ntfy_url_attachment_content'] = {'en': 'Content',                   'de': 'Inhalt'};
Blockly.Words['ntfy_clickurl']               = {'en': 'Click-URL (optional)',      'de': 'Klick-URL (optional)'};
Blockly.Words['ntfy_actionbutton']           = {'en': 'Action-Button (optional)',  'de': 'Aktions-Button (optional)'};


Blockly.CustomBlocks = Blockly.CustomBlocks || [];
Blockly.CustomBlocks.push('Ntfy');

Blockly.Ntfy = {
    HUE: 120,
    blocks: {},
};

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

// -- START -- ntfy_send_simple_message
Blockly.Ntfy.blocks['ntfy_send_message'] =
    '<block type="ntfy_send_message">'
    + '     <value name="INSTANCE"></value>'
    + '     <value name="TOPIC"></value>'
    + '     <value name="TITLE">'
    + '         <shadow type="text">'
    + '             <field name="TEXT"></field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="MESSAGE">'
    + '         <shadow type="text">'
    + '             <field name="TEXT"></field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="TAGS">'
    + '         <shadow type="logic_null"></shadow>'
    + '     </value>'
    + '     <value name="ATTACHMENT">'
    + '         <shadow type="logic_null"></shadow>'
    + '     </value>'
    + '     <value name="CLICKURL">'
    + '         <shadow type="text"></shadow>'
    + '     </value>'
    + '     <value name="ACTIONBUTTON">'
    + '         <shadow type="logic_null"></shadow>'
    + '     </value>'
    + '     <value name="PRIORITY">'
    + '     </value>'
    + '     <value name="DELAY">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['ntfy_send_message'] = {
    init: function() {

        const options = NtfyBlockHelpers.getInstances();
        const topics  = NtfyBlockHelpers.getTopics();

        this.appendDummyInput('_label')
            .appendField(Blockly.Translate('ntfy_send_message'));

        this.appendDummyInput('INSTANCE')
            .appendField(Blockly.Translate('ntfy_instance'))
            .appendField(new Blockly.FieldDropdown(options), "INSTANCE");

        this.appendDummyInput('TOPIC')
            .appendField(Blockly.Translate('ntfy_topic'))
            .appendField(new Blockly.FieldDropdown(topics), "TOPIC");

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
            .appendField(Blockly.Translate('ntfy_actionbutton'));

        this.appendDummyInput('PRIORITY')
            .appendField(Blockly.Translate('ntfy_priority'))
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Translate('ntfy_prio_urgent'),  "5"],
                [Blockly.Translate('ntfy_prio_high'),    "4"],
                [Blockly.Translate('ntfy_prio_default'), "3"],
                [Blockly.Translate('ntfy_prio_low'),     "2"],
                [Blockly.Translate('ntfy_prio_min'),     "1"],
            ]), 'PRIORITY');

        this.appendValueInput('DELAY')
            .setCheck('String')
            .appendField(Blockly.Translate('ntfy_delay'));

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setColour(Blockly.Ntfy.HUE);
        this.setTooltip(Blockly.Translate('ntfy_tooltip'));
        this.setHelpUrl(Blockly.Translate('ntfy_help'));
    }
};

Blockly.JavaScript['ntfy_send_message'] = function(block) {
    const dropdown_instance = block.getFieldValue('INSTANCE');
    const topic    = Blockly.JavaScript.valueToCode(block, 'TOPIC', Blockly.JavaScript.ORDER_ATOMIC);
    const title    = Blockly.JavaScript.valueToCode(block, 'TITLE', Blockly.JavaScript.ORDER_ATOMIC);
    const message  = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_ATOMIC);
    const delay    = Blockly.JavaScript.valueToCode(block, 'DELAY', Blockly.JavaScript.ORDER_ATOMIC);
    const priority = parseInt(block.getFieldValue('PRIORITY'), 10);

    let jsonStr = '{\n';

    if (topic)
        jsonStr += 'topic: ' + topic + ',\n';

    if (title)
        jsonStr += 'title: ' + title + ',\n';

    if (message)
        jsonStr += 'message: ' + message + ',\n';

    if (priority)
        jsonStr += 'priority: ' + priority + ',\n';

    if (delay)
        jsonStr += 'delay: ' + delay + ',\n';

    jsonStr += '\n}';

    console.log('str:', jsonStr);

    return 'sendTo("ntfy' + dropdown_instance + '", "send", ' + jsonStr + ');\n';
};

// --  END -- ntfy_send_simple_message
// -- START -- ntfy_send_extended_message




// --- Allocation block : ntfy_url_attachment ----------------------------------------------------
Blockly.Ntfy.blocks['ntfy_url_attachment'] =
    `<block type='ntfy_url_attachment'>
    <value name='CONTENT'>
      <shadow type='TEXT'>
        <field name='TEXT'></field>
      </shadow>
    </value>

  </block>`;

Blockly.Blocks['ntfy_url_attachment'] = {
    init: function () {
        this.appendDummyInput('_title')
            .appendField(Blockly.Translate('ntfy_url_attachment'));

        this.appendValueInput('content')
            .setCheck('String')
            .appendField(Blockly.Translate('ntfy_url_attachment_content'));

        this.setInputsInline(false);

        this.setOutput(true, 'NtfyAttachmentContent');

        this.setColour(Blockly.Ntfy.HUE);
    },
};

// --- Allocation block : ntfy_action_button_view ----------------------------------------------------
Blockly.Ntfy.blocks['ntfy_action_button_view'] =
    `<block type='ntfy_action_button_view'>
    <value name='LABEL'>
      <shadow type='TEXT'>
        <field name='TEXT'></field>
      </shadow>
    </value>
    <value name='URL'>
      <shadow type='TEXT'>
        <field name='TEXT'></field>
      </shadow>
    </value>
    <value name='CLEAR'></value>
  </block>`;

Blockly.Blocks['ntfy_action_button_view'] = {
    init: function () {
        this.appendDummyInput('_title')
            .appendField(Blockly.Translate('ntfy_action_button_view'));

        this.appendValueInput('label')
            .setCheck('String')
            .appendField(Blockly.Translate('ntfy_action_button_label'));

        this.appendValueInput('url')
            .setCheck('String')
            .appendField(Blockly.Translate('ntfy_action_button_url'));

        this.appendDummyInput('CLEAR')
            .appendField(Blockly.Translate('ntfy_action_button_clear'))
            .appendField(new Blockly.FieldDropdown([['false', 'false'],['true', 'true']]), 'CLEAR');

        this.setInputsInline(false);

        this.setOutput(true, 'NtfyActionButtonContent');

        this.setColour(Blockly.Ntfy.HUE);
    },
};

Blockly.JavaScript['ntfy_action_button_view'] = function (block) {
    /*
    const content = Blockly.JavaScript.valueToCode(block, 'content', Blockly.JavaScript.ORDER_ATOMIC);
    const replyToId = Blockly.JavaScript.valueToCode(block, 'replyToId', Blockly.JavaScript.ORDER_ATOMIC);
    const embeds = Blockly.JavaScript.valueToCode(block, 'embeds', Blockly.JavaScript.ORDER_ATOMIC);
    const files = Blockly.JavaScript.valueToCode(block, 'files', Blockly.JavaScript.ORDER_ATOMIC);

    const propEmbeds = embeds && embeds !== 'null' ? `\n    embeds: ${embeds},` : '';
    const propFiles = files && files !== 'null' ? `\n    files: ${files},` : '';
    const propReply = replyToId && replyToId !== 'null' ? `\n    reply: { messageReference: ${replyToId} },` : '';

    const ret = `{
    content: ${content},${propEmbeds}${propFiles}${propReply}
  }`;
    return [ret, Blockly.JavaScript.ORDER_ATOMIC];

     */
};

