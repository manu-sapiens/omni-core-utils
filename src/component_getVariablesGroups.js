//@ts-check
import { createComponent, console_warn} from 'omni-utils'; //'omnilib-utils/component.js';
import { loadVariablesGroups, sanitizeName, GetVariablesInfo } from './utils';

const group_id = 'utilities';
const id = 'get_variables_groups';
const title = `Get variables groups`;
const category = 'Data Manipulation';
const description = `Get info on variables and their groups in the db`;
const summary = description;

const inputs = [
    { name: 'group_name', type: 'string', description: 'Optional. If specified, give information on the variable stored in that group alone. Otherwise gives information about all groups in the db' },
];
const outputs = [
    { name: 'groups_info', type: 'string', description: 'Informations about the groups of variables in the database'},
    { name: 'info', type: 'string', customSocket: 'text', description: 'Information about the block execution'},
  ];

const links = {};

const controls = null;

export const get_variables_groups_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, parsePayload );

async function parsePayload(payload, ctx)
{
    let info = "";
    let groups_info = "";
    let group_name = payload.group_name;
    if (!group_name && group_name != "") group_name = sanitizeName(group_name);

    const groups = await loadVariablesGroups(ctx);
    if (groups)
    {
        if (group_name)
        {
            groups_info = GetVariablesInfo(groups, group_name);
        }
        else
        {
            const group_names = Object.keys(groups);
            for (const group_name of group_names)
            {
                groups_info += GetVariablesInfo(groups, group_name);
            }
        }
    }

    if (groups_info == "") info = `No variable groups found in the database`;
    if (info != "") console_warn(info); else info = "ok";    

    return { result: { "ok": true }, groups_info, info };
}

