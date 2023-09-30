//@ts-check
import { createComponent } from 'omni-utils';
import { sanitizeName, loadVariablesGroups, saveVariableToGroup, readVariableFromGroup } from "./variables";

const group_id = 'utilities';
const id = 'save_variable';
const title = `Save a variable`;
const category = 'Database';
const description = `Save a variable to the database`;
const summary = description;

const inputs = [
    { name: "group_name", type: "string", customSocket: "text", defaultValue: "default_group", description: "The name of the group where the variable will be stored"},
    { name: "variable_name", type: "string", customSocket: "text", description: "The name of the variable to save"},
    { name: 'string_value', type: 'string', customSocket: 'text', description: 'The value of the string to save.'},
    { name: 'number_value', type: 'number', description: 'The value of the number to save.'},
    { name: 'boolean_value', type: 'boolean', description: 'The value of the boolean to save.'},
    { name: 'object_value', type: 'object', customSocket: 'object', description: 'The value of the object to save.'},
];
const outputs = [
    { name: "group_name", type: "string", customSocket: "text", defaultValue: "default_group", description: "The name of the group where the variable was stored"},
    { name: "variable_name", type: "string", customSocket: "text", description: "The name of the variable saved"},
    { name: 'string_value', type: 'string', customSocket: 'text', description: 'The value of the string saved.'},
    { name: 'number_value', type: 'number', customSocket: 'number', description: 'The value of the number saved.'},
    { name: 'boolean_value', type: 'boolean', customSocket: 'boolean', description: 'The value of the boolean saved.'},
    { name: 'object_value', type: 'object', customSocket: 'object', description: 'The value of the object saved.'},
    { name: "info", type: "string", customSocket: "text", description: "Information about the block execution."},

]
const controls = null;
const links = {}

export const save_variable_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, parsePayload );


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

    const string_value = payload.string_value;
    const number_value = payload.number_value;
    const boolean_value = payload.boolean_value;
    const object_value = payload.object_value;

    const variable_value = {string_value, number_value, boolean_value, object_value};

    const groups = await loadVariablesGroups(ctx);
    if (!groups) throw new Error(`No variable groups found in the database and error creating the groups object`);

    saveVariableToGroup(ctx, groups, group_name, variable_name, variable_value);
    const read_value = readVariableFromGroup(ctx, groups, group_name, variable_name);

    if (!read_value) throw new Error(`Error saving variable ${variable_name} to group ${group_name}`);
    if (read_value.string_value != string_value) throw new Error(`Error saving variable ${variable_name} to group ${group_name}, string value ${string_value} not saved`);
    if (read_value.number_value != number_value) throw new Error(`Error saving variable ${variable_name} to group ${group_name}, number value ${number_value} not saved`);
    if (read_value.boolean_value != boolean_value) throw new Error(`Error saving variable ${variable_name} to group ${group_name}, boolean value ${boolean_value} not saved`);
    if (read_value.object_value != object_value) throw new Error(`Error saving variable ${variable_name} to group ${group_name}, object value ${object_value} not saved`);    

    const return_value = { result: { "ok": true }, group_name, variable_name, string_value, number_value, boolean_value, object_value, info};
    return return_value;
}