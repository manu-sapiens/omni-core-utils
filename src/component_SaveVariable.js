//@ts-check
import { createComponent } from 'omni-utils';
import { user_db_put, user_db_get } from 'omni-utils';

const group_id = 'utilities';
const id = 'save_variable';
const title = `Save a variable`;
const category = 'Database';
const description = `Save a variable to the database`;
const summary = description;

const inputs = [
    { name: 'variable_name', type: 'string', customSocket: 'text'},
    { name: 'variable_value', type: 'string', customSocket: 'text'}
];
const outputs = [
    { name: 'variable_value', type: 'string', customSocket: 'text'},
]
const controls = null;
const links = {}

export const save_variable_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, parsePayload );


async function parsePayload(payload, ctx) 
{

    const variable_name = payload.variable_name;
    const variable_value = payload.variable_value;
    const variable_id = `${ctx.user}_string_${variable_name}`;
    await user_db_put(ctx, variable_value, variable_id) || "";
    const check_value = await user_db_get(ctx, variable_id);
    if (check_value != variable_value) throw new Error(`save_variable_component: check_value = ${check_value} != variable_value = ${variable_value}`);

    const return_value = { result: { "ok": true }, variable_value: variable_value};
    return return_value;
}