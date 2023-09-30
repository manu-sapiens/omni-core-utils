//@ts-check
import { createComponent } from 'omni-utils';
import { sanitizeName } from './variables';

const group_id = 'utilities';
const id = 'replace_from_blocks';
const title = `Replace {{block_names }} from block names`;
const category = 'Blocks';
const description = `Replace texts in a template based on the names of the blocks connected to the <replace_with> mulitple inputs.`;
const summary = description;

const inputs = [
    { name: 'template', type: 'string', customSocket: 'text' },
    { name: 'replace_with', type: 'string', customSocket: 'text', allowMultiple: true, description: 'Replace texts in the template based on the name of the block(s) connected here using a {{<name of block>}} pattern.' },
];
const outputs = [
    { name: 'output_string', type: 'string', customSocket: 'text', description: 'The string output after the replacements.' },
    { name: 'info', type: 'string', customSocket: 'text', description: 'Information about the block execution' },

];

const controls = null;
const links = {};

export const replace_from_block_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, parsePayload);


function replaceSubstrings(str, block_name, replace_with) {
    // Regular expression to match the specified block_name between {{ and }}
    const regex = new RegExp(`\\{\\{\\s*${block_name}\\s*\\}\\}`, 'g');
    
    // Count the number of matches
    const matches = str.match(regex);
    const count = matches ? matches.length : 0;
    
    // Perform the replacement
    const replacedStr = str.replace(regex, replace_with);

    return [replacedStr, count];
}


async function parsePayload(payload, ctx) 
{
    let info = "";

    const template = payload.template;
    if (!template || template == "") throw new Error(`No template specified`);
    //let replace_withs = payload.replace_with;
    //if (!replace_withs) throw new Error(`No block connected to the replace_with input`);
    //if (Array.isArray(replace_withs) == false) replace_withs = [replace_withs];
    const node = ctx.node;    
    debugger;
    const inputs = node.inputs;
    let replace_with_inputs = inputs.replace_with;
    let connections = replace_with_inputs.connections;

    if (!replace_with_inputs) throw new Error(`No block connected to the replace_with input`);
    if (Array.isArray(replace_with_inputs) == false) replace_with_inputs = [replace_with_inputs];

    // Regular expression to match substrings between {{ and }}
    const regex = /\{\{(.*?)\}\}/g;
    let match;
    let sanitized_template = template;
    const patterns = [];
    let replacement_count = 0;
    
    // Use regex.exec() in a loop to find all matches
    while ((match = regex.exec(template)) !== null) {
        patterns.push(match[1].trim());  // match[1] contains the captured group
    }

    // sanitize the patterns between {{ and }}
    for (const pattern of patterns)
    {
        const sanitized_pattern = sanitizeName(pattern);
        if (sanitized_pattern != pattern) 
        {
            [sanitized_template, replacement_count] = replaceSubstrings(sanitized_template, pattern, sanitized_pattern);
            info += `Swapped pattern {{${pattern}}} for {{${sanitized_pattern}}} #${replacement_count} times; \n `;
        }
    }
    
    let output_string = sanitized_template;
    for (const input of replace_with_inputs)
    {
    
        let block_name = input.name;
        const sanitized_block_name =  sanitizeName(block_name);
        if (block_name != sanitized_block_name)
        {
            info += `Using block_name ${block_name} instead of ${sanitized_block_name}; \n `;
        }

        [output_string, replacement_count] = replaceSubstrings(output_string, sanitized_block_name, input.value);
        info += `Replaced ${block_name} #${replacement_count} times with ${input.value};\n `;
    }

    return { result: { "ok": true }, output_string, info };

}