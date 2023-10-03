//@ts-check
import { createComponent } from 'omni-utils';
import { combineValues } from './utils';

const group_id = 'utilities';
const id = 'json_combiner';
const title = `JSON combiner`;
const category = 'Data Manipulation';
const description = `Combine multiple json inputs into a single json output.`;
const summary = description;

const inputs = [
    { name: 'input_jsons', title: '{key:value}', type: 'object', customSocket: 'object', allowMultiple: true, description: 'Simple json in the format {<key>:<value>}. Support multiple inputs.' },
];
const outputs = [
    { name: 'output_json', type: 'object', customSocket: 'object', description: 'A combination of the input jsons.' },
    { name: 'json', title: '{<block_name>:<output_string}', type: 'object', customSocket: 'object', description: 'A json with the format { <blockname>: <output_string> }' },
    { name: 'info', type: 'string', customSocket: 'text', description: 'Information about the block execution' },

];

const controls = null;
const links = {};

export const json_combiner_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, parsePayload);

async function parsePayload(payload, ctx) 
{
    let info = "";

    const blockname = ctx.node.data["x-omni-title"] || "Text Template with JSONs";
    let input_jsons = ctx.inputs.input_jsons; // We can't use payload.input_jsons as we want to support multiple inputs on the same socket.

    if (!input_jsons) throw new Error(`No replacements specified`);
    if (Array.isArray(input_jsons) == false) input_jsons = [input_jsons];
    if (input_jsons.length == 0) throw new Error(`No replacements specified`);

    const output_json = {};

    // multiple inputs on the same socket are passed as an array
    for (const input of input_jsons)
    {
        // if the input is an array, iterate over it
        let input_array = input;
        if (Array.isArray(input) == false) input_array = [input];

        for (const input_json of input_array)
        {
            const input_json_keys = Object.keys(input_json);
            for (const input_json_key of input_json_keys)
            {
                const value = input_json[input_json_key];
                if (input_json_key in output_json == false) 
                {
                    output_json[input_json_key] = value;
                }
                else
                {
                    // if the existing entry is an array and the new entry is an array, concat them
                    // if the existing entry is an array and the new entry is not an array, push the new entry
                    // if the existing entry is not an array and the new entry is an array, make the old entry an array with a single element and and concat the new entry
                    // if the existing entry is not an array and the new entry is not an array, build an array with both entries
                    output_json[input_json_key] = combineValues(output_json[input_json_key], value);
                }
            }
        }

    }

    const json = {};
    json[blockname] = output_json;

    return { result: { "ok": true }, output_json, json, info };

}