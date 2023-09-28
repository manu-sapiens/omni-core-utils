//@ts-check
import { console_warn, createComponent } from 'omni-utils';

const isBlockAvailable = (ctx, block) => {
  return ctx.app.blocks.hasBlock(block)
}

const runBlock = async (ctx, block, args) => {
  return ctx.app.blocks.runBlock(ctx, block, args)
}

const group_id = 'utilities';
const id = 'loop_block';
const title = `Loop a block`;
const category = 'Blocks';
const description = `Run a block, possibly multiple time based on an array of values`;
const summary = description;

const inputs = [
    { name: 'block_name', type: 'string', customSocket: 'text'},
    { name: 'loop_input', type: 'object', customSocket: 'object', description: 'A json containing the name or title of the input variable to loop and its value which can be an array of values.'},
    { name: 'args', type: 'object', customSocket: 'object', description: 'All the other inputs to pass to the block'},
    { name: 'loop_output_name', type: 'string', customSocket: 'text', description: 'Optional. The name or title of the loop output to return as an image/audio/document/video/file array.'},
];
const outputs = [
    { name: 'results', type: 'object', customSocket: 'object', description: 'All the outputs of the looped block. Works even if loop_output_name is not specified'},
    { name: 'info', type: 'string', customSocket: 'text', description: 'Information about the block execution for loop_output_name'},
    { name: 'images', type: 'array', customSocket: 'imageArray', description: 'Images returned by the block for loop_output_name'},
    { name: 'audio', type: 'array', customSocket: 'audioArray', description: 'Audio returned by the block for loop_output_name'},
    { name: 'documents', type: 'array', customSocket: 'documentArray', description: 'Documents returned by the block for loop_output_name'},
    { name: 'videos', type: 'array', customSocket: 'fileArray', description: 'Videos returned by the block for loop_output_name'},
    { name: 'files', type: 'array', customSocket: 'fileArray', description: 'Files returned by the block for loop_output_name'},
    { name: 'objects', type: 'array', customSocket: 'objectArray', description: 'Objects returned by the block for loop_output_name'},
];

const controls = null;
const links = {}

export const loop_block_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, parsePayload );

function findNameFromTitle(infos, title)
{
    const keys  = Object.keys(infos);

    for (const key of keys)
    {
        const info = infos[key];
        if (info.title == title || info.name == title) return info.name;
    }
    return "";
}

async function parsePayload(payload, ctx) 
{
    debugger;
    const block_name = payload.block_name;
    if (!isBlockAvailable(ctx, block_name)) {
        throw new Error(`Block ${block_name} not found`)
    }

    const loop_input = payload.loop_input;
    const loop_output_title = payload.loop_output_name;
    const common_args = payload.args;

    const loop_input_titles = Object.keys(loop_input);
    const loop_input_title = loop_input_titles[0];
    const loop_input_value = loop_input[loop_input_title];

    let input_array = [];
    if (loop_input_title && Array.isArray(loop_input_value) ) { input_array = loop_input_value; } else { input_array = [loop_input_value]; }

    let info = "";
    let results = {};

    const targetBlock = await ctx.app.blocks.getInstance(block_name)
    if (!targetBlock) { throw new Error(`Block ${block_name} not found`) }
    let input_name = findNameFromTitle(targetBlock.inputs, loop_input_title);
    if (loop_input_title && loop_input_title != "" && input_name == "") throw new Error(`Block ${block_name} does not have an input named ${loop_input_title}`);
    
    const args_keys = Object.keys(common_args);
    const args = {};
    for (const key of args_keys)
    {
        // find the read name (or 'id') of all the input arguments (as the user may have entered their 'title' instead of their 'id')
        const id = findNameFromTitle(targetBlock.inputs, key);
        if (id) args[id] = common_args[key];
        else info += `WARNING running block ${block_name}, input ${key} not recognized; `;
    }

    let output_name = findNameFromTitle(targetBlock.outputs, loop_output_title);

    for (const input of input_array) 
    {
        args[input_name] = input;

        try{
            let run_result = await runBlock(ctx, block_name, args);
            if (run_result._omni_status != 200) {
                throw new Error(`Block ${block_name} failed to run, returned result = ${JSON.stringify(run_result)}`)
            }
            delete run_result._omni_status;

            if (!results) results = run_result;
            else
            {
                // go through all the keys in the run_result object
                // if a run_result key already exist in all_results, concatenate the values
                // if a run_result key does not exist in all_results, add the key and value

                const run_result_keys = Object.keys(run_result);
                for (const key of run_result_keys)
                {
                    const value = run_result[key];
                    if (results[key])
                    {
                        if (Array.isArray(results[key]))
                        {
                            if (Array.isArray(value))
                            {
                                results[key].push(...value);
                            }
                            else
                            {
                                results[key].push(value);
                            }
                        }
                        else
                        {
                            if (Array.isArray(value))
                            {
                                results[key] = [results[key], ...value];
                            }
                            else
                            {
                                results[key] = [results[key], value];
                            }
                        }
                    }
                    else
                    {
                        results[key] = value;
                    }
                }

            } 
        }
        catch(e)
        {
            info += `Error running block ${block_name} with input ${input}, error = ${e}; `; 
        }
    }
    if (!results || results.length == 0) throw new Error(`Block ${block_name} did not return any results`);

    const outputs = results[output_name];

    if (info != "") console_warn(info); else info = "ok";    
   
    return { result: { "ok": true }, results, info, documents: outputs, videos: outputs, images: outputs, audios: outputs, files: outputs, objects: outputs};
}