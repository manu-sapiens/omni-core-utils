//@ts-check
import { createComponent } from 'omni-utils';
import { user_db_get } from 'omni-utils';

const group_id = 'utilities';
const id = 'load_variable';
const title = `Load a variable`;
const category = 'Database';
const description = `Load a variable from the database`;
const summary = description;

const inputs = [
    { name: 'variable_name', type: 'string', customSocket: 'text'},
];
const outputs = [
    { name: 'variable_name', type: 'string', customSocket: 'text'},
    { name: 'variable_value', type: 'string', customSocket: 'text'},
]
const controls = null;
const links = {}

export const load_variable_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, parsePayload );


async function parsePayload(payload, ctx) 
{

    const variable_name = payload.variable_name;
    const variable_id = `${ctx.user}_string_${variable_name}`;
    let variable_value = await user_db_get(ctx, variable_id) || "";
    const return_value = { result: { "ok": true }, variable_name, variable_value};
    return return_value;
}