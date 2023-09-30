//@ts-check
import { createComponent } from 'omni-utils';
import { sanitizeName } from './variables';

const group_id = 'utilities';
const id = 'text_template_with_jsons';
const title = `Text Template with JSONs`;
const category = 'Blocks';
const description = `Replace texts in a template based on the names of the blocks connected to the <replace_with> mulitple inputs.`;
const summary = description;

const inputs = [
    { name: 'template', title: 'Template with {{pattern}} {{other_pattern}}, etc.', type: 'string', customSocket: 'text' },
    { name: 'replacements', title: '{pattern:replacement}', type: 'object', customSocket: 'object', allowMultiple: true, description: 'Replace {{<key>}} patterns in the template with <value> when fed with {<key>:<value>} objects. Support multiple inputs.' },
];
const outputs = [
    { name: 'output_string', type: 'string', customSocket: 'text', description: 'The string output after the replacements.' },
    { name: 'json', title: '{<block_name>:<output_string}', type: 'object', customSocket: 'object', description: 'A json with the format { <blockname>: <output_string> }'},
    { name: 'info', type: 'string', customSocket: 'text', description: 'Information about the block execution' },

];

const controls = null;
const links = {};

export const text_template_with_jsons_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, parsePayload);


function replaceSubstrings(str, block_name, replace_with)
{
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

    const blockname = ctx.node.data["x-omni-title"] || "Text Template with JSONs";
    let replacements = ctx.inputs.replacements; // We can't use payload.replacements as we want to support multiple inputs on the same socket.

    if (!replacements) throw new Error(`No replacements specified`);
    if (Array.isArray(replacements) == false) replacements = [replacements];
    if (replacements.length == 0) throw new Error(`No replacements specified`);

    // Regular expression to match substrings between {{ and }}
    const regex = /\{\{(.*?)\}\}/g;
    let match;
    let sanitized_template = template;
    const template_patterns = [];
    let replacement_count = 0;

    // Use regex.exec() in a loop to find all matches
    while ((match = regex.exec(template)) !== null)
    {
        template_patterns.push(match[1].trim());  // match[1] contains the captured group
    }

    // sanitize the patterns between {{ and }} in the template
    for (const pattern of template_patterns)
    {
        const sanitized_pattern = sanitizeName(pattern);
        if (sanitized_pattern != pattern) 
        {
            [sanitized_template, replacement_count] = replaceSubstrings(sanitized_template, pattern, `{{${sanitized_pattern}}}`);
            info += `Swapped pattern {{${pattern}}} for {{${sanitized_pattern}}} #${replacement_count} times; `;
        }
    }

    let output_string = sanitized_template;
    for (const replacement of replacements)
    {
        const replacements_names = Object.keys(replacement);
        for (const replacement_name of replacements_names)
        {
            const replacement_value = replacement[replacement_name];
            const sanitized_replacement_name = sanitizeName(replacement_name);
            if (replacement_name != sanitized_replacement_name)
            {
                info += `Using replacement {{${sanitized_replacement_name}}} instead of {{${replacement_name}}}; `;
            }

            [output_string, replacement_count] = replaceSubstrings(output_string, sanitized_replacement_name, replacement_value);
            info += `Replaced {{${replacement_name}}} #${replacement_count} times with [${replacement_value}];\n `;
        }
    }
    const json = {};
    json[blockname] = output_string;

    return { result: { "ok": true }, output_string, json, info };

}