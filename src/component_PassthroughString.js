//@ts-check
import { createComponent } from 'omni-utils';

const group_id = 'utilities';
const id = 'passthrough_string';
const title = 'Passthrough String';
const category = 'Data Manipulation';
const description = 'Passthrough a string. By naming this block and moving it, a cleaner recipe can be achieved.';
const summary = description;

const inputs = [
    { name: 'input_string', type: 'string', customSocket: 'text', description: 'The string to be passed through.'},
];
const outputs = [
    { name: 'output_string', type: 'string', customSocket: 'text', description: 'The string that was passed through.'},
    { name: 'json', title: '{<block_name>:<output_string}', type: 'object', customSocket: 'object', description: 'A json with the format { <blockname>: <output_string> }'},
];

const controls = null;
const links = {}

export const passthrough_string_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, parsePayload );

async function parsePayload(payload, ctx) 
{
    const output_string = payload.input_string;
    const json = {};
    const blockname = ctx.node.data["x-omni-title"] || "Passthrough String";
    json[blockname] = output_string;
    return { result: { "ok": true }, output_string, json};
    
}