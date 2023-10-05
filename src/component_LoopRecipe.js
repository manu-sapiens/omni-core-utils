//@ts-check
import { createComponent } from 'omni-utils';
import { combineValues, runRecipe, blockOutput, loadVariablesGroups, readVariableFromGroup, saveVariableToGroup, wipeVariableFromGroup, RECIPE_OUTPUT_GROUP } from './utils';

const group_id = 'utilities';
const id = 'loop_recipe';
const title = `Loop a recipe`;
const category = 'Data Manipulation';
const description = `Run a recipe, possibly multiple time based on an array of values`;
const summary = description;

const inputs = [
    { name: 'recipe_id', type: 'string', customSocket: 'text', description: "The UUID of the recipe to loop"},
    { name: 'loop_input_json', type: 'object', customSocket: 'object', description: 'A json containing the name of the input variable to loop and its (array) value. If using Chat Input in the recipe, the name should be "text", "images", "audio", or "documents"' },
    { name: 'other_inputs_json', type: 'object', customSocket: 'object', description: 'All the other inputs to pass to the recipe, in the format {<type>:<value>}' },
];
const outputs = [
    { name: 'text', type:'string', customSocket: 'text', description: 'Text returned by each recipe for loop_output_name, separated with |'},
    { name: 'images', type: 'array', customSocket: 'imageArray', description: 'Images returned by each recipe for loop_output_name' },
    { name: 'audio', type: 'array', customSocket: 'audioArray', description: 'Audio returned by each recipe for loop_output_name' },
    { name: 'documents', type: 'array', customSocket: 'documentArray', description: 'Documents returned by each recipe for loop_output_name' },
    { name: 'videos', type: 'array', customSocket: 'fileArray', description: 'Videos returned by each recipe for loop_output_name' },
    { name: 'files', type: 'array', customSocket: 'fileArray', description: 'Files returned by each recipe for loop_output_name' },
    { name: 'objects', type: 'array', customSocket: 'objectArray', description: 'Objects returned by each recipe for loop_output_name' },
    { name: 'results', type: 'object', customSocket: 'object', description: 'A json object of all the results' },
    { name: 'info', type: 'string', customSocket: 'text', description: 'Information about the recipe execution' },

];

const controls = null;
const links = {};

export const loop_recipe_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, parsePayload);

async function parsePayload(payload, ctx) 
{

    const loop_input_json = payload.loop_input_json; // in the format {<type> : <array of values>}
    const append = payload.append || false;
    const other_args = payload.other_inputs_json || {};
    const recipe_id = payload.recipe_id;
    let info = "";
    // ---------------------
    if (!recipe_id) throw new Error(`No recipe id specified`);
    if (!loop_input_json) throw new Error(`No loop input json specified`);

    const groups = await loadVariablesGroups(ctx);
    if (!groups) throw new Error(`No variable groups found in the database and error creating the groups object`);
    
    const input_keys = Object.keys(loop_input_json);
    const input_name = input_keys[0].toLowerCase();
    if (!input_name || input_name == "") throw new Error(`No input name specified`);
    if (input_name in ["text", "images", "audio", "documents"] == false) 
    {
        info += `Using non-standard input_name ${input_name}, which works with form_io, but not Chat Input | `;
    }

    const loop_input_value = loop_input_json[input_name];


    const other_keys = Object.keys(other_args);
    const args = {};
    for (let key of other_keys)
    {
        args[key] = other_args[key]; // -> for form_io (To be tested)
    }

    let input_array = [];
    if (input_name && Array.isArray(loop_input_value)) { input_array = loop_input_value; } else { input_array = [loop_input_value]; }

    let texts = [];
    let values = [];
    let images = [];
    let audio = [];
    let videos = [];
    let files = [];
    let objects = [];
    let documents = [];

    for (const input of input_array) 
    {
        if (!input) continue;      
        args[input_name] = input;

        try
        {
            const result = await runRecipe(ctx, recipe_id, args);
            if (result) values.push(result); else info +=  `WARNING: could not read any value from recipe_id ${recipe_id} | `;
            
            if (result.text) texts = combineValues(texts, result.text);
            if (result.images) images = combineValues(images, result.images);
            if (result.audio) audio = combineValues(audio, result.audio);
            if (result.documents) documents = combineValues(documents, result.documents);
            if (result.videos) videos = combineValues(videos, result.videos);
            if (result.files) files = combineValues(files, result.files);
            if (result.objects) objects = combineValues(objects, result.objects);
        }
        catch
        {
            info += `Error running recipe ${recipe_id} with input ${input} | `;
            continue;
        }
    }

    let text = '';
    for (const text_value of texts) 
    {
        if (text == '') text = text_value; else text = `${text} | ${text_value}`;
    }

    const results = {text, images, audio, documents, videos, files, objects};
    
    //const return_value = { result: { "ok": true }, text, images, audio, documents, videos, files, objects, results, info};
    const return_value = blockOutput({text, images, audio, documents, videos, files, objects, results, info});
    return return_value;
}