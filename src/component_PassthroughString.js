//@ts-check
import { createComponent } from 'omni-utils';

const group_id = 'utilities';
const id = 'passthrough_string';
const title = 'Passthrough a String';
const category = 'JSON';
const description = 'Passthrough a string. By naming this block and moving it, a cleaner recipe can be achieved.';
const summary = description;

const inputs = [
    { name: 'string', type: 'string', customSocket: 'text', description: 'The string to be passed through.'},
];
const outputs = [
    { name: 'string', type: 'string', customSocket: 'text', description: 'The string that was passed through.'},
];

const controls = null;
const links = {}

export const passthrough_string_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, parsePayload );

async function parsePayload(payload, ctx) 
{
    return { result: { "ok": true }, string:payload?.string};
}