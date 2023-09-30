
import { user_db_get, user_db_put, is_valid } from 'omni-utils';
const VARIABLES_GROUPS = "omni_variable_groups";

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
        groups = {}
        await user_db_put(ctx, groups, VARIABLES_GROUPS);
    }
    return groups;
}

export function saveVariableToGroup(ctx, groups, group_name, variable_name, variable_value)
{
    let group = null;
    if (group_name in groups === false || groups[group_name] === null || groups[group_name] === undefined )
    {
        groups[group_name] = {};
    }
    group = groups[group_name];
    group[variable_name] = variable_value;
    saveGroupsToDb(ctx, groups);
}

export function readVariableFromGroup(ctx, groups, group_name, variable_name)
{

    if (group_name in groups === false || groups[group_name] === null || groups[group_name] === undefined ) return null;
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
    if (group_name in groups === false || groups[group_name] === null || groups[group_name] === undefined ) return "";
    const group = groups[group_name];    
    const variables_names = Object.keys(group);
    if (!variables_names || variables_names.length == 0) return "";
    
    let variables = "";
    for (const variable in variables_names)
    {
        variables += variable + ", ";
    }

    const variables_info = `Group ${group_name} contains ${variables_names.length} variables: ${variables}`
    return variables_info;
}