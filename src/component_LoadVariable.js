//@ts-check
import { createComponent } from "omni-utils";
import { sanitizeName, loadVariablesGroups, readVariableFromGroup } from "./utils";

const group_id = "utilities";
const id = "load_variable";
const title = "Load a variable";
const category = "Data Manipulation";
const description = "Load a variable from the database";
const summary = description;

const inputs = [
    { name: "group_name", type: "string", customSocket: "text", defaultValue: "default_group", description: "The name of the group where the variable is stored"},
    { name: "variable_name", type: "string", customSocket: "text", description: "The name of the variable to load"},
];
const outputs = [
    { name: "group_name", type: "string", customSocket: "text", description: "The name of the group the variable was loaded from."},
    { name: "variable_name", type: "string", customSocket: "text", description: "The name of the variable loaded."},
    { name: "string_value", type: "string", customSocket: "text", description: "The value of the variable loaded if it is a string."},
    { name: "number_value", type: "number", customSocket: "number", description: "The value of the variable loaded if it is a number."},
    { name: "boolean_value", type: "boolean", customSocket: "boolean", description: "The value of the variable loaded if it is a boolean."},
    { name: "object_value", type: "object", customSocket: "object", description: "The value of the variable loaded if it is a object."},
    { name: "info", type: "string", customSocket: "text", description: "Information about the block execution."},
]
const controls = null;
const links = {}

export const load_variable_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, parsePayload );


async function parsePayload(payload, ctx) 
{
    let info = "";
    let variable_name = payload.variable_name;
    if (!variable_name) throw new Error(`No variable name specified`);
    
    variable_name = sanitizeName(variable_name);
    let group_name = payload.group_name;
    group_name = sanitizeName(group_name);
    if (!group_name || group_name == "") 
    {
        group_name = "default_group";
        info += `No group name specified, using default_group`;
    }
    const groups = await loadVariablesGroups(ctx);
    if (!groups) throw new Error(`No variable groups found in the database and error creating the groups object`);

    const variable_value = await readVariableFromGroup(ctx, groups, group_name, variable_name);
    if (!variable_value) 
    {   
        info += `No variable ${variable_name} found in the group ${group_name}, returning null`;    
        const return_value = { result: { "ok": false }, group_name, variable_name, string_value:null, number_value:null, boolean_value:null, object_value:null, info};
        return return_value;
    }
    
    let string_value = variable_value.string_value;
    const number_value = variable_value.number_value;
    const boolean_value = variable_value.boolean_value || false;
    const object_value = variable_value.object_value;

    if (string_value == "<empty>") string_value == "";

    const return_value = { result: { "ok": true }, group_name, variable_name, string_value, number_value, boolean_value, object_value, info};
    return return_value;
}