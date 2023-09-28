
await(async()=>{let{dirname:e}=await import("path"),{fileURLToPath:i}=await import("url");if(typeof globalThis.__filename>"u"&&(globalThis.__filename=i(import.meta.url)),typeof globalThis.__dirname>"u"&&(globalThis.__dirname=e(globalThis.__filename)),typeof globalThis.require>"u"){let{default:a}=await import("module");globalThis.require=a.createRequire(import.meta.url)}})();


// component_LoadVariable.js
import { createComponent } from "omni-utils";
import { user_db_get } from "omni-utils";
var group_id = "utilities";
var id = "load_variable";
var title = `Load a variable`;
var category = "Database";
var description = `Load a variable from the database`;
var summary = description;
var inputs = [
  { name: "variable_name", type: "string", customSocket: "text" }
];
var outputs = [
  { name: "variable_name", type: "string", customSocket: "text" },
  { name: "variable_value", type: "string", customSocket: "text" }
];
var controls = null;
var links = {};
var load_variable_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, parsePayload);
async function parsePayload(payload, ctx) {
  const variable_name = payload.variable_name;
  const variable_id = `${ctx.user}_string_${variable_name}`;
  let variable_value = await user_db_get(ctx, variable_id) || "";
  const return_value = { result: { "ok": true }, variable_name, variable_value };
  return return_value;
}

// component_SaveVariable.js
import { createComponent as createComponent2 } from "omni-utils";
import { user_db_put, user_db_get as user_db_get2 } from "omni-utils";
var group_id2 = "utilities";
var id2 = "save_variable";
var title2 = `Save a variable`;
var category2 = "Database";
var description2 = `Save a variable to the database`;
var summary2 = description2;
var inputs2 = [
  { name: "variable_name", type: "string", customSocket: "text" },
  { name: "variable_value", type: "string", customSocket: "text" }
];
var outputs2 = [
  { name: "variable_value", type: "string", customSocket: "text" }
];
var controls2 = null;
var links2 = {};
var save_variable_component = createComponent2(group_id2, id2, title2, category2, description2, summary2, links2, inputs2, outputs2, controls2, parsePayload2);
async function parsePayload2(payload, ctx) {
  const variable_name = payload.variable_name;
  const variable_value = payload.variable_value;
  const variable_id = `${ctx.user}_string_${variable_name}`;
  await user_db_put(ctx, variable_value, variable_id) || "";
  const check_value = await user_db_get2(ctx, variable_id);
  if (check_value != variable_value)
    throw new Error(`save_variable_component: check_value = ${check_value} != variable_value = ${variable_value}`);
  const return_value = { result: { "ok": true }, variable_value };
  return return_value;
}

// component_LoopBlock.js
import { console_warn, createComponent as createComponent3 } from "omni-utils";
var isBlockAvailable = (ctx, block) => {
  return ctx.app.blocks.hasBlock(block);
};
var runBlock = async (ctx, block, args) => {
  return ctx.app.blocks.runBlock(ctx, block, args);
};
var group_id3 = "utilities";
var id3 = "loop_block";
var title3 = `Loop a block`;
var category3 = "Blocks";
var description3 = `Run a block, possibly multiple time based on an array of values`;
var summary3 = description3;
var inputs3 = [
  { name: "block_name", type: "string", customSocket: "text" },
  { name: "loop_input", type: "object", customSocket: "object", description: "An object containing the name of the input variable to loop and its value which can be an array of values" },
  { name: "loop_output_name", type: "string", customSocket: "text", description: "The name of the loop output to return as the main results of the block. Will probably be an array of values" },
  { name: "args", type: "object", customSocket: "object", description: "All the other input arguments to pass to the block" }
];
var outputs3 = [
  { name: "results", type: "object", customSocket: "object", description: "All the outputs of the looped block" },
  { name: "info", type: "string", customSocket: "text", description: "Information about the block execution for loop_output_name" },
  { name: "images", type: "array", customSocket: "imageArray", description: "Images returned by the block for loop_output_name" },
  { name: "audio", type: "array", customSocket: "audioArray", description: "Audio returned by the block for loop_output_name" },
  { name: "documents", type: "array", customSocket: "documentArray", description: "Documents returned by the block for loop_output_name" },
  { name: "videos", type: "array", customSocket: "fileArray", description: "Videos returned by the block for loop_output_name" },
  { name: "files", type: "array", customSocket: "fileArray", description: "Files returned by the block for loop_output_name" },
  { name: "objects", type: "array", customSocket: "objectArray", description: "Objects returned by the block for loop_output_name" }
];
var controls3 = null;
var links3 = {};
var loop_block_component = createComponent3(group_id3, id3, title3, category3, description3, summary3, links3, inputs3, outputs3, controls3, parsePayload3);
function findNameFromTitle(infos, title4) {
  const keys = Object.keys(infos);
  for (const key of keys) {
    const info = infos[key];
    if (info.title == title4 || info.name == title4)
      return info.name;
  }
  return "";
}
async function parsePayload3(payload, ctx) {
  debugger;
  const block_name = payload.block_name;
  if (!isBlockAvailable(ctx, block_name)) {
    throw new Error(`Block ${block_name} not found`);
  }
  const loop_input = payload.loop_input;
  const loop_output_title = payload.loop_output_name;
  const common_args = payload.args;
  const loop_input_titles = Object.keys(loop_input);
  const loop_input_title = loop_input_titles[0];
  const loop_input_value = loop_input[loop_input_title];
  let input_array = [];
  if (loop_input_title && Array.isArray(loop_input_value)) {
    input_array = loop_input_value;
  } else {
    input_array = [loop_input_value];
  }
  let info = "";
  let results = {};
  const targetBlock = await ctx.app.blocks.getInstance(block_name);
  if (!targetBlock) {
    throw new Error(`Block ${block_name} not found`);
  }
  let input_name = findNameFromTitle(targetBlock.inputs, loop_input_title);
  if (loop_input_title && loop_input_title != "" && input_name == "")
    throw new Error(`Block ${block_name} does not have an input named ${loop_input_title}`);
  const args_keys = Object.keys(common_args);
  const args = {};
  for (const key of args_keys) {
    const id4 = findNameFromTitle(targetBlock.inputs, key);
    if (id4)
      args[id4] = common_args[key];
    else
      info += `WARNING running block ${block_name}, input ${key} not recognized; `;
  }
  let output_name = findNameFromTitle(targetBlock.outputs, loop_output_title);
  for (const input of input_array) {
    args[input_name] = input;
    try {
      let run_result = await runBlock(ctx, block_name, args);
      if (run_result._omni_status != 200) {
        throw new Error(`Block ${block_name} failed to run, returned result = ${JSON.stringify(run_result)}`);
      }
      delete run_result._omni_status;
      if (!results)
        results = run_result;
      else {
        const run_result_keys = Object.keys(run_result);
        for (const key of run_result_keys) {
          const value = run_result[key];
          if (results[key]) {
            if (Array.isArray(results[key])) {
              if (Array.isArray(value)) {
                results[key].push(...value);
              } else {
                results[key].push(value);
              }
            } else {
              if (Array.isArray(value)) {
                results[key] = [results[key], ...value];
              } else {
                results[key] = [results[key], value];
              }
            }
          } else {
            results[key] = value;
          }
        }
      }
    } catch (e) {
      info += `Error running block ${block_name} with input ${input}, error = ${e}; `;
    }
  }
  if (!results || results.length == 0)
    throw new Error(`Block ${block_name} did not return any results`);
  const outputs4 = results[output_name];
  if (info != "")
    console_warn(info);
  return { result: { "ok": true }, results, info, documents: outputs4, videos: outputs4, images: outputs4, audios: outputs4, files: outputs4, objects: outputs4 };
}

// extension.js
async function CreateComponents() {
  const components = [
    load_variable_component,
    save_variable_component,
    loop_block_component
  ];
  return {
    blocks: components,
    patches: []
  };
}
var extension_default = { createComponents: CreateComponents };
export {
  extension_default as default
};
