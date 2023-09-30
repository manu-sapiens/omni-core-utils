
await(async()=>{let{dirname:e}=await import("path"),{fileURLToPath:i}=await import("url");if(typeof globalThis.__filename>"u"&&(globalThis.__filename=i(import.meta.url)),typeof globalThis.__dirname>"u"&&(globalThis.__dirname=e(globalThis.__filename)),typeof globalThis.require>"u"){let{default:a}=await import("module");globalThis.require=a.createRequire(import.meta.url)}})();


// component_LoadVariable.js
import { createComponent } from "omni-utils";

// variables.js
import { user_db_get, user_db_put, is_valid } from "omni-utils";
var VARIABLES_GROUPS = "omni_variable_groups";
function sanitizeName(name) {
  if (is_valid(name) == false)
    return null;
  const sanetized_name = name.trim().toLowerCase().replace(/[ '"`\\]/g, "_");
  return sanetized_name;
}
async function loadVariablesGroups(ctx) {
  let groups = await user_db_get(ctx, VARIABLES_GROUPS);
  if (!groups) {
    groups = {};
    await user_db_put(ctx, groups, VARIABLES_GROUPS);
  }
  return groups;
}
function saveVariableToGroup(ctx, groups, group_name, variable_name, variable_value) {
  let group = null;
  if (group_name in groups === false || groups[group_name] === null || groups[group_name] === void 0) {
    groups[group_name] = {};
  }
  group = groups[group_name];
  group[variable_name] = variable_value;
  saveGroupsToDb(ctx, groups);
}
function readVariableFromGroup(ctx, groups, group_name, variable_name) {
  if (group_name in groups === false || groups[group_name] === null || groups[group_name] === void 0)
    return null;
  const group = groups[group_name];
  const variable_value = group[variable_name];
  return variable_value;
}
async function saveGroupsToDb(ctx, groups) {
  await user_db_put(ctx, groups, VARIABLES_GROUPS);
}
function GetVariablesInfo(groups, group_name) {
  if (group_name in groups === false || groups[group_name] === null || groups[group_name] === void 0)
    return "";
  const group = groups[group_name];
  const variables_names = Object.keys(group);
  if (!variables_names || variables_names.length == 0)
    return "";
  let variables = "";
  for (const variable in variables_names) {
    variables += variable + ", ";
  }
  const variables_info = `Group ${group_name} contains ${variables_names.length} variables: ${variables}`;
  return variables_info;
}

// component_LoadVariable.js
var group_id = "utilities";
var id = "load_variable";
var title = "Load a variable";
var category = "Database";
var description = "Load a variable from the database";
var summary = description;
var inputs = [
  { name: "group_name", type: "string", customSocket: "text", defaultValue: "default_group", description: "The name of the group where the variable is stored" },
  { name: "variable_name", type: "string", customSocket: "text", description: "The name of the variable to load" }
];
var outputs = [
  { name: "group_name", type: "string", customSocket: "text", description: "The name of the group the variable was loaded from." },
  { name: "variable_name", type: "string", customSocket: "text", description: "The name of the variable loaded." },
  { name: "string_value", type: "string", customSocket: "text", description: "The value of the variable loaded if it is a string." },
  { name: "number_value", type: "number", customSocket: "number", description: "The value of the variable loaded if it is a number." },
  { name: "boolean_value", type: "boolean", customSocket: "boolean", description: "The value of the variable loaded if it is a boolean." },
  { name: "object_value", type: "object", customSocket: "object", description: "The value of the variable loaded if it is a object." },
  { name: "info", type: "string", customSocket: "text", description: "Information about the block execution." }
];
var controls = null;
var links = {};
var load_variable_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, parsePayload);
async function parsePayload(payload, ctx) {
  let info = "";
  let variable_name = payload.variable_name;
  if (!variable_name)
    throw new Error(`No variable name specified`);
  variable_name = sanitizeName(variable_name);
  let group_name = payload.group_name;
  group_name = sanitizeName(group_name);
  if (!group_name || group_name == "") {
    group_name = "default_group";
    info += `No group name specified, using default_group`;
  }
  const groups = await loadVariablesGroups(ctx);
  if (!groups)
    throw new Error(`No variable groups found in the database and error creating the groups object`);
  const variable_value = readVariableFromGroup(ctx, groups, group_name, variable_name);
  if (!variable_value) {
    info += `No variable ${variable_name} found in the group ${group_name}, returning null`;
    const return_value2 = { result: { "ok": false }, group_name, variable_name, string_value: null, number_value: null, boolean_value: null, object_value: null, info };
    return return_value2;
  }
  let string_value = variable_value.string_value;
  const number_value = variable_value.number_value;
  const boolean_value = variable_value.boolean_value || false;
  const object_value = variable_value.object_value;
  if (string_value == "<empty>")
    string_value == "";
  const return_value = { result: { "ok": true }, group_name, variable_name, string_value, number_value, boolean_value, object_value, info };
  return return_value;
  return return_value;
}

// component_SaveVariable.js
import { createComponent as createComponent2 } from "omni-utils";
var group_id2 = "utilities";
var id2 = "save_variable";
var title2 = `Save a variable`;
var category2 = "Database";
var description2 = `Save a variable to the database`;
var summary2 = description2;
var inputs2 = [
  { name: "group_name", type: "string", customSocket: "text", defaultValue: "default_group", description: "The name of the group where the variable will be stored" },
  { name: "variable_name", type: "string", customSocket: "text", description: "The name of the variable to save" },
  { name: "string_value", type: "string", customSocket: "text", description: "The value of the string to save." },
  { name: "number_value", type: "number", description: "The value of the number to save." },
  { name: "boolean_value", type: "boolean", description: "The value of the boolean to save." },
  { name: "object_value", type: "object", customSocket: "object", description: "The value of the object to save." }
];
var outputs2 = [
  { name: "group_name", type: "string", customSocket: "text", defaultValue: "default_group", description: "The name of the group where the variable was stored" },
  { name: "variable_name", type: "string", customSocket: "text", description: "The name of the variable saved" },
  { name: "string_value", type: "string", customSocket: "text", description: "The value of the string saved." },
  { name: "number_value", type: "number", customSocket: "number", description: "The value of the number saved." },
  { name: "boolean_value", type: "boolean", customSocket: "boolean", description: "The value of the boolean saved." },
  { name: "object_value", type: "object", customSocket: "object", description: "The value of the object saved." },
  { name: "info", type: "string", customSocket: "text", description: "Information about the block execution." }
];
var controls2 = null;
var links2 = {};
var save_variable_component = createComponent2(group_id2, id2, title2, category2, description2, summary2, links2, inputs2, outputs2, controls2, parsePayload2);
async function parsePayload2(payload, ctx) {
  let info = "";
  let variable_name = payload.variable_name;
  if (!variable_name)
    throw new Error(`No variable name specified`);
  variable_name = sanitizeName(variable_name);
  let group_name = payload.group_name;
  group_name = sanitizeName(group_name);
  if (!group_name || group_name == "") {
    group_name = "default_group";
    info += `No group name specified, using default_group`;
  }
  const string_value = payload.string_value;
  const number_value = payload.number_value;
  const boolean_value = payload.boolean_value;
  const object_value = payload.object_value;
  const variable_value = { string_value, number_value, boolean_value, object_value };
  const groups = await loadVariablesGroups(ctx);
  if (!groups)
    throw new Error(`No variable groups found in the database and error creating the groups object`);
  saveVariableToGroup(ctx, groups, group_name, variable_name, variable_value);
  const read_value = readVariableFromGroup(ctx, groups, group_name, variable_name);
  if (!read_value)
    throw new Error(`Error saving variable ${variable_name} to group ${group_name}`);
  if (read_value.string_value != string_value)
    throw new Error(`Error saving variable ${variable_name} to group ${group_name}, string value ${string_value} not saved`);
  if (read_value.number_value != number_value)
    throw new Error(`Error saving variable ${variable_name} to group ${group_name}, number value ${number_value} not saved`);
  if (read_value.boolean_value != boolean_value)
    throw new Error(`Error saving variable ${variable_name} to group ${group_name}, boolean value ${boolean_value} not saved`);
  if (read_value.object_value != object_value)
    throw new Error(`Error saving variable ${variable_name} to group ${group_name}, object value ${object_value} not saved`);
  const return_value = { result: { "ok": true }, group_name, variable_name, string_value, number_value, boolean_value, object_value, info };
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
  { name: "loop_input", type: "object", customSocket: "object", description: "A json containing the name or title of the input variable to loop and its value which can be an array of values." },
  { name: "args", type: "object", customSocket: "object", description: "All the other inputs to pass to the block" },
  { name: "loop_output_name", type: "string", customSocket: "text", description: "Optional. The name or title of the loop output to return as an image/audio/document/video/file array." }
];
var outputs3 = [
  { name: "results", type: "object", customSocket: "object", description: "All the outputs of the looped block. Works even if loop_output_name is not specified" },
  { name: "images", type: "array", customSocket: "imageArray", description: "Images returned by the block for loop_output_name" },
  { name: "audio", type: "array", customSocket: "audioArray", description: "Audio returned by the block for loop_output_name" },
  { name: "documents", type: "array", customSocket: "documentArray", description: "Documents returned by the block for loop_output_name" },
  { name: "videos", type: "array", customSocket: "fileArray", description: "Videos returned by the block for loop_output_name" },
  { name: "files", type: "array", customSocket: "fileArray", description: "Files returned by the block for loop_output_name" },
  { name: "objects", type: "array", customSocket: "objectArray", description: "Objects returned by the block for loop_output_name" },
  { name: "info", type: "string", customSocket: "text", description: "Information about the block execution" }
];
var controls3 = null;
var links3 = {};
var loop_block_component = createComponent3(group_id3, id3, title3, category3, description3, summary3, links3, inputs3, outputs3, controls3, parsePayload3);
function findNameFromTitle(infos, title9) {
  const keys = Object.keys(infos);
  for (const key of keys) {
    const info = infos[key];
    if (info.title == title9 || info.name == title9)
      return info.name;
  }
  return "";
}
async function parsePayload3(payload, ctx) {
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
    const id9 = findNameFromTitle(targetBlock.inputs, key);
    if (id9)
      args[id9] = common_args[key];
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
  const outputs9 = results[output_name];
  if (info != "")
    console_warn(info);
  else
    info = "ok";
  return { result: { "ok": true }, results, info, documents: outputs9, videos: outputs9, images: outputs9, audios: outputs9, files: outputs9, objects: outputs9 };
}

// component_StringArrayToJson.js
import { console_warn as console_warn2, createComponent as createComponent4 } from "omni-utils";
var group_id4 = "utilities";
var id4 = "stringarray_to_json";
var title4 = "Construct a json from a string array";
var category4 = "JSON";
var description4 = "Construct a json from a string array, using a specified separator to split the string array.";
var summary4 = description4;
var inputs4 = [
  { name: "name", type: "string", customSocket: "text", description: "If specified, the json will have this structure: { <name> : [array_value1, array_value2...] }, if not it will use [array_value1, array_value2...]" },
  { name: "string", type: "string", customSocket: "text", description: "The string to be parsed and turned into an array of values." },
  { name: "type", type: "string", customSocket: "text", choices: ["string", "number", "boolean", "object"], defaultValue: "string", description: "The type of the values in the array." },
  { name: "separator", type: "string", customSocket: "text", description: "The separator to use to split the values of the input variable to loop. If not specified, line-break will be used." }
];
var outputs4 = [
  { name: "json", type: "object", customSocket: "object", description: "The json created from the inputs." },
  { name: "text", type: "string", customSocket: "text", description: "The stringified json object created from the inputs." },
  { name: "info", type: "string", customSocket: "text", description: "Information about the block execution" }
];
var controls4 = null;
var links4 = {};
var stringarray_to_json_component = createComponent4(group_id4, id4, title4, category4, description4, summary4, links4, inputs4, outputs4, controls4, parsePayload4);
async function parsePayload4(payload, ctx) {
  const input_name = payload.name;
  const input_string = payload.string;
  const input_type = payload.type;
  const separator = payload.separator || "\n";
  if (!input_string) {
    throw new Error(`No string specified`);
  }
  let info = "";
  let values = [];
  if (separator == "\n")
    values = input_string.split(/\r?\n/);
  else
    values = input_string.split(separator);
  if (!values || values.length == 0)
    throw new Error(`No values found in the string ${input_string} using the separator ${separator}`);
  const value_array = [];
  for (let value of values) {
    try {
      if (input_type == "number")
        value = Number(value);
      else if (input_type == "boolean") {
        value = value.toLowerCase() === "true";
        if (!value)
          value = value.toLowerCase() === "1";
        if (!value)
          value = value.toLowerCase() === "yes";
        if (!value)
          value = value.toLowerCase() === "y";
        if (!value)
          value = value.toLowerCase() === "ok";
        if (!value)
          value = value.toLowerCase() === "on";
      } else if (input_type == "object")
        value = JSON.parse(value);
      if (value) {
        value_array.push(value);
      } else {
        info += `Value ${value} is not a valid ${input_type}; 
`;
      }
    } catch (e) {
      info += `Error parsing value ${value} to type ${input_type}: ${e.message}; 
`;
      continue;
    }
  }
  if (value_array.length == 0)
    throw new Error(`No values found in the string ${input_string} using the separator ${separator}`);
  let json = null;
  if (input_name && input_name.length > 0) {
    json = {};
    json[input_name] = value_array;
  } else {
    json = value_array;
  }
  if (info.length > 0)
    console_warn2(info);
  else
    info = "ok";
  let text = "";
  try {
    text = JSON.stringify(json);
  } catch (e) {
    throw new Error(`Error stringifying json: ${e.message}`);
  }
  return { result: { "ok": true }, json, text, info };
}

// component_ImagesToMarkdown.js
import { console_warn as console_warn3, createComponent as createComponent5 } from "omni-utils";
var group_id5 = "utilities";
var id5 = "images_to_markdown";
var title5 = "Images to Markdown";
var category5 = "Data Manipulation";
var description5 = "Construct a markdown from an array of images and captions.";
var summary5 = description5;
var inputs5 = [
  { name: "title", type: "string", customSocket: "text", description: "The title of the markdown." },
  { name: "images", type: "array", customSocket: "imageArray", description: "Images to be included in the markdown." },
  { name: "captions", type: "object", customSocket: "object", description: 'Captions to be included in the markdown in the format { "captions": ["caption1", "caption2", ...] }.' },
  { name: "entry_name", type: "string", customSocket: "text", defaultValue: "Panel", description: "The name to be used for each picture, e.g. panel, page or illustration" },
  { name: "append_to", type: "string", customSocket: "text", description: "Optional. The name of the markdown to append the new markdown to." }
];
var outputs5 = [
  { name: "markdown", type: "string", customSocket: "text", description: "The markdown created from the inputs." },
  { name: "info", type: "string", customSocket: "text", description: "Information about the block execution" }
];
var controls5 = null;
var links5 = {};
var images_to_markdown_component = createComponent5(group_id5, id5, title5, category5, description5, summary5, links5, inputs5, outputs5, controls5, parsePayload5);
async function parsePayload5(payload, ctx) {
  const title9 = payload.title;
  const images_cdns = payload.images;
  const captions_object = payload.captions;
  const entry_name = payload.entry_name;
  const captions = captions_object?.captions;
  const append_to = payload.append_to;
  if ((!images_cdns || images_cdns.length == 0) && (!captions_object || captions.length == 0)) {
    throw new Error(`No images or captions specified`);
  }
  let info = "";
  const image_urls = [];
  for (const image_cdn of images_cdns) {
    image_urls.push(image_cdn.url);
  }
  let markdown = "";
  if (title9) {
    markdown += `# ${title9}

`;
  } else {
    info += `No title specified
`;
  }
  if (!entry_name || entry_name == "") {
    info += `No Entry Name specified
`;
  }
  const minLen = Math.min(image_urls.length, captions.length);
  for (let i = 0; i < minLen; i++) {
    markdown += `## ${entry_name} ${i + 1}

`;
    markdown += `![${captions[i]}](${image_urls[i]})`;
    markdown += `${captions[i]}

`;
    markdown += `---

`;
  }
  for (let i = minLen; i < image_urls.length; i++) {
    markdown += `## ${entry_name} ${i + 1}

`;
    markdown += `![](${image_urls[i]})

`;
    markdown += `---

`;
    info += `No caption for image ${i + 1}
`;
  }
  for (let i = minLen; i < captions.length; i++) {
    markdown += `## ${entry_name} ${i + 1}

`;
    markdown += `${captions[i]}

`;
    markdown += `---

`;
    info += `No image for caption ${i + 1}
`;
  }
  if (!markdown || markdown == "")
    throw new Error(`No markdown created`);
  if (info.length > 0)
    console_warn3(info);
  else
    info = "ok";
  if (append_to && append_to != "")
    markdown = append_to + "\n\n" + markdown;
  return { result: { "ok": true }, markdown, info };
}

// component_getVariablesGroups.js
import { createComponent as createComponent6, console_warn as console_warn4 } from "omni-utils";
var group_id6 = "utilities";
var id6 = "get_variables_groups";
var title6 = `Get variables groups`;
var category6 = "Database";
var description6 = `Get info on variables and their groups in the db`;
var summary6 = description6;
var inputs6 = [
  { name: "group_name", type: "string", description: "Optional. If specified, give information on the variable stored in that group alone. Otherwise gives information about all groups in the db" }
];
var outputs6 = [
  { name: "groups_info", type: "string", description: "Informations about the groups of variables in the database" },
  { name: "info", type: "string", customSocket: "text", description: "Information about the block execution" }
];
var links6 = {};
var controls6 = null;
var get_variables_groups_component = createComponent6(group_id6, id6, title6, category6, description6, summary6, links6, inputs6, outputs6, controls6, parsePayload6);
async function parsePayload6(payload, ctx) {
  let info = "";
  let groups_info = "";
  let group_name = payload.group_name;
  if (!group_name && group_name != "")
    group_name = sanitizeName(group_name);
  const groups = await loadVariablesGroups(ctx);
  if (groups) {
    if (group_name) {
      groups_info = GetVariablesInfo(groups, group_name);
    } else {
      const group_names = Object.keys(groups);
      for (const group_name2 of group_names) {
        groups_info += GetVariablesInfo(groups, group_name2);
      }
    }
  }
  if (groups_info == "")
    info = `No variable groups found in the database`;
  if (info != "")
    console_warn4(info);
  else
    info = "ok";
  return { result: { "ok": true }, groups_info, info };
}

// component_PassthroughString.js
import { createComponent as createComponent7 } from "omni-utils";
var group_id7 = "utilities";
var id7 = "passthrough_string";
var title7 = "Passthrough String";
var category7 = "JSON";
var description7 = "Passthrough a string. By naming this block and moving it, a cleaner recipe can be achieved.";
var summary7 = description7;
var inputs7 = [
  { name: "input_string", type: "string", customSocket: "text", description: "The string to be passed through." }
];
var outputs7 = [
  { name: "output_string", type: "string", customSocket: "text", description: "The string that was passed through." },
  { name: "json", title: "{<block_name>:<output_string}", type: "object", customSocket: "object", description: "A json with the format { <blockname>: <output_string> }" }
];
var controls7 = null;
var links7 = {};
var passthrough_string_component = createComponent7(group_id7, id7, title7, category7, description7, summary7, links7, inputs7, outputs7, controls7, parsePayload7);
async function parsePayload7(payload, ctx) {
  const output_string = payload.input_string;
  const json = {};
  const blockname = ctx.node.data["x-omni-title"] || "Passthrough String";
  json[blockname] = output_string;
  return { result: { "ok": true }, output_string, json };
}

// component_TextTemplateWithJsons.js
import { createComponent as createComponent8 } from "omni-utils";
var group_id8 = "utilities";
var id8 = "text_template_with_jsons";
var title8 = `Text Template with JSONs`;
var category8 = "Blocks";
var description8 = `Replace texts in a template based on the names of the blocks connected to the <replace_with> mulitple inputs.`;
var summary8 = description8;
var inputs8 = [
  { name: "template", title: "Template with {{pattern}} {{other_pattern}}, etc.", type: "string", customSocket: "text" },
  { name: "replacements", title: "{pattern:replacement}", type: "object", customSocket: "object", allowMultiple: true, description: "Replace {{<key>}} patterns in the template with <value> when fed with {<key>:<value>} objects. Support multiple inputs." }
];
var outputs8 = [
  { name: "output_string", type: "string", customSocket: "text", description: "The string output after the replacements." },
  { name: "json", title: "{<block_name>:<output_string}", type: "object", customSocket: "object", description: "A json with the format { <blockname>: <output_string> }" },
  { name: "info", type: "string", customSocket: "text", description: "Information about the block execution" }
];
var controls8 = null;
var links8 = {};
var text_template_with_jsons_component = createComponent8(group_id8, id8, title8, category8, description8, summary8, links8, inputs8, outputs8, controls8, parsePayload8);
function replaceSubstrings(str, block_name, replace_with) {
  const regex = new RegExp(`\\{\\{\\s*${block_name}\\s*\\}\\}`, "g");
  const matches = str.match(regex);
  const count = matches ? matches.length : 0;
  const replacedStr = str.replace(regex, replace_with);
  return [replacedStr, count];
}
async function parsePayload8(payload, ctx) {
  let info = "";
  const template = payload.template;
  if (!template || template == "")
    throw new Error(`No template specified`);
  const blockname = ctx.node.data["x-omni-title"] || "Text Template with JSONs";
  let replacements = ctx.inputs.replacements;
  if (!replacements)
    throw new Error(`No replacements specified`);
  if (Array.isArray(replacements) == false)
    replacements = [replacements];
  if (replacements.length == 0)
    throw new Error(`No replacements specified`);
  const regex = /\{\{(.*?)\}\}/g;
  let match;
  let sanitized_template = template;
  const template_patterns = [];
  let replacement_count = 0;
  while ((match = regex.exec(template)) !== null) {
    template_patterns.push(match[1].trim());
  }
  for (const pattern of template_patterns) {
    const sanitized_pattern = sanitizeName(pattern);
    if (sanitized_pattern != pattern) {
      [sanitized_template, replacement_count] = replaceSubstrings(sanitized_template, pattern, `{{${sanitized_pattern}}}`);
      info += `Swapped pattern {{${pattern}}} for {{${sanitized_pattern}}} #${replacement_count} times; `;
    }
  }
  let output_string = sanitized_template;
  for (const replacement of replacements) {
    const replacements_names = Object.keys(replacement);
    for (const replacement_name of replacements_names) {
      const replacement_value = replacement[replacement_name];
      const sanitized_replacement_name = sanitizeName(replacement_name);
      if (replacement_name != sanitized_replacement_name) {
        info += `Using replacement {{${sanitized_replacement_name}}} instead of {{${replacement_name}}}; `;
      }
      [output_string, replacement_count] = replaceSubstrings(output_string, sanitized_replacement_name, replacement_value);
      info += `Replaced {{${replacement_name}}} #${replacement_count} times with [${replacement_value}];
 `;
    }
  }
  const json = {};
  json[blockname] = output_string;
  return { result: { "ok": true }, output_string, json, info };
}

// extension.js
async function CreateComponents() {
  const components = [
    load_variable_component,
    save_variable_component,
    loop_block_component,
    stringarray_to_json_component,
    images_to_markdown_component,
    get_variables_groups_component,
    passthrough_string_component,
    text_template_with_jsons_component
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
