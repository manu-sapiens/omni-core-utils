//@ts-check
import { load_variable_component } from "./component_LoadVariable.js";
import { save_variable_component } from "./component_SaveVariable.js";
import { loop_block_component } from "./component_LoopBlock.js"
import { stringarray_to_json_component } from "./component_StringArrayToJson.js"
import { images_to_markdown_component } from "./component_ImagesToMarkdown.js"
import { get_variables_groups_component } from "./component_getVariablesGroups.js";
import { passthrough_string_component } from "./component_PassthroughString.js";
import { text_template_with_jsons_component } from "./component_TextTemplateWithJsons.js";
import { json_combiner_component } from "./component_JsonCombiner.js";
import { label_string_component } from "./label_string_component.js";
import { label_object_component } from "./label_object_component.js";
import { loop_recipe_component } from "./component_LoopRecipe.js";

async function CreateComponents() 
{
  const components = [
    load_variable_component,
    save_variable_component,
    loop_block_component,
    stringarray_to_json_component,
    images_to_markdown_component,
    get_variables_groups_component,
    passthrough_string_component,
    text_template_with_jsons_component,
    json_combiner_component,
    label_string_component,
    label_object_component,
    loop_recipe_component
    ];

  return {
    blocks: components,
    patches: []
  }
}

export default {createComponents: CreateComponents}