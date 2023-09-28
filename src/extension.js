//@ts-check
import { load_variable_component } from "./component_LoadVariable.js";
import { save_variable_component } from "./component_SaveVariable.js";

async function CreateComponents() 
{
  const components = [
    load_variable_component,
    save_variable_component,
    ];

  return {
    blocks: components,
    patches: []
  }
}

export default {createComponents: CreateComponents}