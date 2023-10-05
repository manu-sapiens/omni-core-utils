//@ts-check
import { console_warn, createComponent } from 'omni-utils';

const isBlockAvailable = (ctx, block) => {
  return ctx.app.blocks.hasBlock(block)
}

const runBlock = async (ctx, block, args) => {
  return ctx.app.blocks.runBlock(ctx, block, args)
}

const group_id = 'utilities';
const id = 'stringarray_to_json';
const title = 'Construct a json from a string array';
const category = 'Data Manipulation';
const description = 'Construct a json from a string array, using a specified separator to split the string array.';
const summary = description;

const inputs = [
    { name: 'name', type: 'string', customSocket: 'text', description: 'If specified, the json will have this structure: { <name> : [array_value1, array_value2...] }, if not it will use [array_value1, array_value2...]'},
    { name: 'string', type: 'string', customSocket: 'text', description: 'The string to be parsed and turned into an array of values.'},
    { name: 'type', type: 'string', customSocket: 'text', choices: ["string", "number", "boolean","object"], defaultValue:"string", description: 'The type of the values in the array.'},
    { name: 'separator', type: 'string', customSocket: 'text', description: 'The separator to use to split the values of the input variable to loop. If not specified, line-break will be used.'},
];
const outputs = [
    { name: 'json', type: 'object', customSocket: 'object', description: 'The json created from the inputs.'},
    { name: 'text', type: 'string', customSocket: 'text', description: 'The stringified json object created from the inputs.'},
    { name: 'info', type: 'string', customSocket: 'text', description: 'Information about the block execution'},
];

const controls = null;
const links = {}

export const stringarray_to_json_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, parsePayload );

async function parsePayload(payload, ctx) 
{
    const input_name = payload.name;
    const input_string = payload.string;
    const input_type = payload.type;
    const separator = payload.separator || '\n';

    if (!input_string) {
        throw new Error(`No string specified`)
    }

    let info = "";

    // break the input_string using the separator
    let values = [];
    if (separator == '\n') values = input_string.split(/\r?\n/);
    else values = input_string.split(separator);
    if (!values || values.length == 0) throw new Error(`No values found in the string ${input_string} using the separator ${separator}`);

    const value_array = [];

    for (let value of values)
    {
        try
        {
            if (input_type == "number") value = Number(value);
            else if (input_type == "boolean") 
            {
                value = value.toLowerCase() === 'true';
                if (!value) value = value.toLowerCase() === '1';
                if (!value) value = value.toLowerCase() === 'yes';
                if (!value) value = value.toLowerCase() === 'y';
                if (!value) value = value.toLowerCase() === 'ok';
                if (!value) value = value.toLowerCase() === 'on';
            }
            else if (input_type == "object") value = JSON.parse(value);
    
            if (value) 
            {
                value_array.push(value); 
            }
            else
            {
                info += `Value ${value} is not a valid ${input_type}; \n`;
            }
            
        }
        catch (e)
        {
            info += `Error parsing value ${value} to type ${input_type}: ${e.message}; \n`;
            continue;
        }
    }

    if (value_array.length == 0) throw new Error(`No values found in the string ${input_string} using the separator ${separator}`);
    let json = null;
    if (input_name && input_name.length > 0)
    {
        json = {};
        json[input_name] = value_array;
    }
    else
    {
        json = value_array;
    }
    if (info.length > 0) console_warn(info); else info = "ok";

    let text = "";
    try{
        text = JSON.stringify(json);
    }
    catch (e)
    {
        throw new Error(`Error stringifying json: ${e.message}`);
    }

    return { result: { "ok": true }, json, text, info};
}