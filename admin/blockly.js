'use strict';

if (typeof goog !== 'undefined') {
    goog.provide('Blockly.JavaScript.Sendto');
    goog.require('Blockly.JavaScript');
}

Blockly.Words['ntfy']                = {'en': 'ntfy',                        'de': 'ntfy'};
Blockly.Words['ntfy_instance']       = {'en': 'Ntfy instance',               'de': 'Ntfy Instanz'};
Blockly.Words['ntfy_message']        = {'en': 'Message',                     'de': 'Nachricht'};
Blockly.Words['ntfy_title']          = {'en': 'Title (optional)',            'de': 'Titel (optional)'};
Blockly.Words['ntfy_priority']       = {'en': 'Priority',                    'de': 'Priorität'};
Blockly.Words['ntfy_topic']          = {'en': 'Topic',                       'de': 'Topic'};
Blockly.Words['ntfy_delay']          = {'en': 'Delay (optional)',            'de': 'Verzögerung in s (optional)'};

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

Blockly.Sendto.blocks['ntfy'] =
    '<block type="ntfy">'
    + '     <value name="INSTANCE"></value>'
    + '     <value name="TOPIC">'
    + '         <shadow type="text">'
    + '             <field name="TEXT"></field>'
    + '         </shadow>'
    + '     </value>'
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
    + '     <value name="PRIORITY">'
    + '     </value>'
    + '     <value name="DELAY">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['ntfy'] = {
    init: function() {

        let options = [[Blockly.Translate('ntfy_all_instances'), '']];
        if (typeof main !== 'undefined' && main.instances) {
            for (let i = 0; i < main.instances.length; i++) {
                const m = main.instances[i].match(/^system.adapter.ntfy.(\d+)$/);
                if (m) {
                    const n = parseInt(m[1], 10);
                    options.push(['ntfy.' + n, '.' + n]);
                }
            }
        }

        if (!options.length) {
            for (let u = 0; u <= 4; u++) {
                options.push(['ntfy.' + u, '.' + u]);
            }
        }

        this.appendDummyInput('INSTANCE')
            .appendField(Blockly.Translate('ntfy_instance'))
            .appendField(new Blockly.FieldDropdown(options), "INSTANCE");

        this.appendValueInput('TOPIC')
            .setCheck('String')
            .appendField(Blockly.Translate('ntfy_topic'));

        this.appendValueInput('TITLE')
            .setCheck('String')
            .appendField(Blockly.Translate('ntfy_title'));

        this.appendValueInput('MESSAGE')
            .appendField(Blockly.Translate('ntfy_message'));

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

        this.setColour(Blockly.Sendto.HUE);
        this.setTooltip(Blockly.Translate('ntfy_tooltip'));
        this.setHelpUrl(Blockly.Translate('ntfy_help'));
    }
};

Blockly.JavaScript['ntfy'] = function(block) {
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