//@ts-check
import { createComponent } from 'omni-utils';
import { useLabel } from "./utils";

const group_id = 'utilities';
const id = 'label_string';
const title = 'Label a String';
const category = 'Data Manipulation';
const description = 'Label a string with a block name and save it in the db under the block name. If no block name is provided, it will error out. If no value is provided, the value is fetched from the db with the same block name. If multiple input are provided, they will be saved as an array. If the append flag is set, the input will be appended to the existing value.';
const summary = description;

const inputs = [
    { name: 'input', type: 'string', customSocket: 'text', allowMultiple: true, description: 'The string to be labeled.' },
    { name: 'append', type: 'boolean', defaultValue: false, description: 'If true, append the new value to any existing value.' },
];
const outputs = [
    { name: 'value', type: 'string', customSocket: 'text', description: 'The value of the string that was labeled.' },
    { name: 'json', title: '{<block_name>:<output_string>}', type: 'object', customSocket: 'object', description: 'A json with the format { <blockname> : <value> }' },
    { name: 'info', type: 'string', customSocket: 'text', description: 'Information about the block execution' },
];

const controls = null;
const links = {};

export const label_string_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, useLabel);
