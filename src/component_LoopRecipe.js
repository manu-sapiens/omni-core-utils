//@ts-check
import { createComponent } from 'omni-utils';
import { runRecipe, sanitizeName, getLabelValue, wipeLabelValue } from './utils';

const group_id = 'utilities';
const id = 'loop_recipe';
const title = `Loop a recipe`;
const category = 'recipes';
const description = `Run a recipe, possibly multiple time based on an array of values`;
const summary = description;

const inputs = [
    { name: 'recipe_id', type: 'string', customSocket: 'text', description: "The UUID of the recipe to loop"},
    //{ name: 'loop_input_type', type: 'string', customSocket: 'text', choices: ["text", "images", "audio", "documents"], defaultValue: 'text', description: 'The type of input to loop.' },
    { name: 'loop_input_json', type: 'object', customSocket: 'object', description: 'A json containing the type of the input variable to loop and its (array) value. Type can be "text", "images", "audio", or "documents"' },
    { name: 'other_inputs_json', type: 'object', customSocket: 'object', description: 'All the other inputs to pass to the recipe, in the format {<type>:<value>}' },
    { name: 'loop_output_label', type: 'string', customSocket: 'text', defaultValue: "result", description: 'The name of the label the recipe uses to returns its result.' },
    { name: 'append', type: 'boolean', defaultValue: false, description: 'If true, the loop will append the new values to any existing value.' },
];
const outputs = [
    { name: 'results', type: 'object', customSocket: 'object', description: 'A json in the format <input_type : [label_value from the recipes] >' },
    { name: 'images', type: 'array', customSocket: 'imageArray', description: 'Images returned by each recipe for loop_output_name' },
    { name: 'audio', type: 'array', customSocket: 'audioArray', description: 'Audio returned by each recipe for loop_output_name' },
    { name: 'documents', type: 'array', customSocket: 'documentArray', description: 'Documents returned by each recipe for loop_output_name' },
    { name: 'videos', type: 'array', customSocket: 'fileArray', description: 'Videos returned by each recipe for loop_output_name' },
    { name: 'files', type: 'array', customSocket: 'fileArray', description: 'Files returned by each recipe for loop_output_name' },
    { name: 'objects', type: 'array', customSocket: 'objectArray', description: 'Objects returned by each recipe for loop_output_name' },
    { name: 'info', type: 'string', customSocket: 'text', description: 'Information about the recipe execution' },

];

const controls = null;
const links = {};

export const loop_recipe_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, parsePayload);

async function parsePayload(payload, ctx) 
{
    let info = "";
    const recipe_id = payload.recipe_id;
    if (!recipe_id) throw new Error(`No recipe id specified`);

    const append = payload.append;

    const loop_input_json = payload.loop_input_json; // in the format {<type> : <array of values>}
    const input_keys = Object.keys(loop_input_json);
    const input_type = input_keys[0].toLowerCase();
    if (!input_type || input_type == "") throw new Error(`No input name specified`);
    if (input_type in ["text", "images", "audio", "documents"]) throw new Error(`Invalid input type ${input_type}`);

    const loop_input_value = loop_input_json[input_type];

    const loop_output_label = payload.loop_output_label;
    const label = sanitizeName(loop_output_label);
    let other_args = payload.other_inputs_json || {};
    const other_keys = Object.keys(other_args);
    const args = {};
    for (let key of other_keys)
    {
        //const lower_key = key.toLowerCase();
        //if (lower_key != key) info += `Warning: converting key ${key} to lower case;`
        //if (key in ["text", "images", "audio", "documents"]) args[lower_key] = other_args[key]; else info += `Warning: ignoring key ${key} as it is not a valid input type;`;
        args[key] = other_args[key]; // -> for form_io (To be tested)
    }

    let input_array = [];
    if (input_type && Array.isArray(loop_input_value)) { input_array = loop_input_value; } else { input_array = [loop_input_value]; }
 
    if (!append) await wipeLabelValue(ctx, label);

    for (const input of input_array) 
    {
        if (!input) continue;      
        args[input_type] = input;

        try
        {
            const result_before = await getLabelValue(ctx, label); // I hope you set your label to 'append' !
            info += `[${input}] result_before = ${result_before} | `;
            await runRecipe(ctx, recipe_id, args);
            const result_after = await getLabelValue(ctx, label); // I hope you set your label to 'append' !
            info += `[${input}] result_after = ${result_after} | `;
        }
        catch
        {
            
            info += `Error running recipe ${recipe_id} with input ${input} | `;
            continue;
        }
    }

    const label_value = await getLabelValue(ctx, label); // I hope you set your label to 'append' !
    if (!label_value) info +=  `WARNING: could not read any value from label ${label} | `;

    const results = {};
    results[input_type] = label_value;

    return { result: { "ok": true }, results, info, documents: label_value, videos: label_value, images: label_value, audios: label_value, files: label_value, objects: label_value };
}