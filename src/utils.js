
import { user_db_get, user_db_put, is_valid } from 'omni-utils';
const VARIABLES_GROUPS = "omni_variable_groups";
export const LABEL_GROUP = "reserved_omni_labels";

export function sanitizeName(name)
{
    if (is_valid(name) == false) return null;
    const sanetized_name = name.trim().toLowerCase().replace(/[ '"`\\]/g, '_');
    return sanetized_name;
}

export function getGroup(groups, group_name)
{
    let group = groups[group_name];
    if (!group) groups[group_name] = {};
    return group;
}

export async function loadVariablesGroups(ctx) 
{
    let groups = await user_db_get(ctx, VARIABLES_GROUPS);
    if (!groups) 
    {
        groups = {};
        await user_db_put(ctx, groups, VARIABLES_GROUPS);
    }
    return groups;
}

export async function saveVariableToGroup(ctx, groups, group_name, variable_name, variable_value)
{
    let group = null;
    if (group_name in groups === false || groups[group_name] === null || groups[group_name] === undefined)
    {
        groups[group_name] = {};
    }
    group = groups[group_name];
    group[variable_name] = variable_value;
    await saveGroupsToDb(ctx, groups);
}

export async function wipeVariableFromGroup(ctx, groups, group_name, variable_name)
{
    let group = null;
    if (group_name in groups === false || groups[group_name] === null || groups[group_name] === undefined) return;
    
    group = groups[group_name];
    if (variable_name in group === false || group[variable_name] === null || group[variable_name] === undefined) return;
    
    let variable = group[variable_name];
    if (Array.isArray(variable)) {group[variable_name] = [];} else {group[variable_name] = null;}
    
    await saveGroupsToDb(ctx, groups);
}

export async function readVariableFromGroup(ctx, groups, group_name, variable_name)
{

    if (group_name in groups === false || groups[group_name] === null || groups[group_name] === undefined) return null;
    const group = groups[group_name];
    const variable_value = group[variable_name];

    return variable_value;
}

export async function saveGroupsToDb(ctx, groups)
{
    await user_db_put(ctx, groups, VARIABLES_GROUPS);
}

export function GetVariablesInfo(groups, group_name)
{
    if (group_name in groups === false || groups[group_name] === null || groups[group_name] === undefined) return "";
    const group = groups[group_name];
    const variables_names = Object.keys(group);
    if (!variables_names || variables_names.length == 0) return "";

    let variables = "";
    for (const variable in variables_names)
    {
        variables += variable + ", ";
    }

    const variables_info = `Group ${group_name} contains ${variables_names.length} variables: ${variables}`;
    return variables_info;
}

export function combineValues(existing_value, new_value)
{
    // if the existing entry is an array and the new entry is an array, concat them
    // if the existing entry is an array and the new entry is not an array, push the new entry
    // if the existing entry is not an array and the new entry is an array, make the old entry an array with a single element and and concat the new entry
    // if the existing entry is not an array and the new entry is not an array, build an array with both entries
    let result = null;
    if (Array.isArray(existing_value) && Array.isArray(new_value))
    {
        result = existing_value.concat(new_value);
    } else if (Array.isArray(existing_value) && !Array.isArray(new_value))
    {
        existing_value.push(new_value);
        result = existing_value;
    } else if (!Array.isArray(existing_value) && Array.isArray(new_value))
    {
        result = [existing_value].concat(new_value);
    } else if (!Array.isArray(existing_value) && !Array.isArray(new_value))
    {
        result = [existing_value, new_value];
    }

    return result;
}


export async function useLabel(payload, ctx) 
{

    let info = "";

    const json = {};
    const block_name = ctx.node.data["x-omni-title"];
    if (!block_name || block_name == "") throw new Error(`No block name specified`);

    let sanitized_block_name = sanitizeName(block_name);
    if (sanitized_block_name != block_name) info += `Block name sanitized from ${block_name} to ${sanitized_block_name} | `;
    if (!sanitized_block_name) throw new Error(`No variable name specified`);
    info += `Saving ${sanitized_block_name} label | `;

    const append = payload.append;
    
    let existing_value = null;
    if (!append) await wipeLabelValue(ctx, sanitized_block_name);
    else existing_value = await getLabelValue(ctx, sanitized_block_name);

    let value = null;
    let inputs = ctx.inputs.input; // We can't use payload. as we want to support multiple inputs on the same socket.
    if (inputs)
    {
        if (Array.isArray(inputs))
        {
            if (inputs.length == 0)
            {
                inputs = null;
            }
            else
            {
                if (inputs.length == 1) inputs = inputs[0];
                info += `Array with single element provided, converting to a non-array value | `;
            }
        }
        if (append)
        {
            value = combineValues(existing_value, inputs);
            info += `Appending ${inputs} to existing value ${existing_value} | `;
        }
        else
        {
            value = inputs;
            if (existing_value) info += `Overwriting existing value ${existing_value} with ${inputs} | `;
        }

        await setLabelValue(ctx, sanitized_block_name, value);
        info += `Saving ${sanitized_block_name} label under groupname: ${LABEL_GROUP} | `;
    }
    else
    {
        value = existing_value;
        if (!value) info += (`No value specified and no existing value found for ${sanitized_block_name} label under groupname: ${LABEL_GROUP} | `);
    }

    json[block_name] = value;
    return { result: { "ok": true }, value, json, info };
}

export async function setLabelValue(ctx, label, value)
{
    const groups = await loadVariablesGroups(ctx);
    if (!groups) throw new Error(`No variable groups found in the database and error creating the groups object`);

    const sanitized_label = sanitizeName(label);
    await saveVariableToGroup(ctx, groups, LABEL_GROUP, sanitized_label, value);
}

export async function getLabelValue(ctx, label)
{
    const groups = await loadVariablesGroups(ctx);
    if (!groups) throw new Error(`No variable groups found in the database and error creating the groups object`);

    const sanitized_label = sanitizeName(label);
    const value = await readVariableFromGroup(ctx, groups, LABEL_GROUP, sanitized_label);
    return value;
}

export async function wipeLabelValue(ctx, label)
{
    const groups = await loadVariablesGroups(ctx);
    if (!groups) throw new Error(`No variable groups found in the database and error creating the groups object`);

    const sanitized_label = sanitizeName(label);
    await wipeVariableFromGroup(ctx, groups, LABEL_GROUP, sanitized_label);
}

export async function runRecipe(ctx, recipe_id, args) 
{
    if (!recipe_id) throw new Error(`No recipe id specified`);

    const integration = ctx.app.integrations.get('workflow');
    const recipe_json = await integration.getRecipe(recipe_id, ctx.userId, true);
    if (!recipe_json) throw new Error(`Recipe ${recipe_id} not found`);
    const jobService = ctx.app.services.get('jobs');
    const job = await jobService.startRecipe(recipe_json, ctx.sessionId, ctx.userId, args, 0, 'system');

    await new Promise((resolve, reject) =>
    {
        console.log('waiting for job', job.jobId);
        ctx.app.events.once('jobs.job_finished_' + job.jobId).then((job) =>
        {
            resolve(job);
        });
    });

    return true;
}
