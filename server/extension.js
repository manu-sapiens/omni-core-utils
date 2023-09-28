
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

// extension.js
async function CreateComponents() {
  const components = [
    load_variable_component,
    save_variable_component
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
