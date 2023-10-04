//@ts-check
import { createComponent } from 'omni-utils';
import { blockOutput, textSocket, imagesSocket, audioSocket, documentsSocket, videosSocket, filesSocket, objectSocket, RECIPE_OUTPUT_GROUP, combineValues,  loadVariablesGroups, saveVariableToGroup, readVariableFromGroup } from "./utils";

const group_id = 'utilities';
const id = 'recipe_output';
const title ='Recipe Output'
const category = 'Data Manipulation';
const description = 'Save recipe output in the database';
const summary = description;

const inputs = [
    textSocket("text"),
    imagesSocket("images"),
    audioSocket("audio"),
    documentsSocket("documents"),
    videosSocket("videos"),
    filesSocket("files"),
    objectSocket("objects"),
];
const outputs = [
    textSocket("info", "Information about the block execution."),
];
const controls = null;
const links = {}

export const recipe_output_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, parsePayload );


async function parsePayload(payload, ctx) 
{
    const text = payload.text;
    const images = payload.images;
    const audio = payload.audio;
    const documents = payload.documents;
    const videos = payload.videos;
    const files = payload.files;
    const objects = payload.objects;
    let info = "";
    // ---------------------
    debugger;
    const recipe_id  = ctx.recipe_id;
    if (!recipe_id) throw new Error(`No recipe id found in the context`);

    const groups = await loadVariablesGroups(ctx);
    if (!groups) throw new Error(`No variable groups found in the database and error creating the groups object`);

    const json = {};
    const outputs = json.outputs;
    if (text) outputs.text = text;
    if (images) outputs.images = images;
    if (audio) outputs.audio = audio;
    if (documents) outputs.documents = documents;
    if (videos) outputs.videos = videos;
    if (files) outputs.files = files;
    if (objects) outputs.objects = objects;

    info += `Recipe: ${recipe_id}: Saving outputs ${JSON.stringify(outputs)} to the database; | `;
   
    const existing_value = await readVariableFromGroup(ctx, groups, RECIPE_OUTPUT_GROUP, recipe_id);
    let value = outputs;
    if (existing_value) 
    {
        info += `Existing value: ${JSON.stringify(existing_value)}; | `;
        value = combineValues(existing_value, outputs);
    }

    await saveVariableToGroup(ctx, groups, RECIPE_OUTPUT_GROUP, recipe_id, value);
    // ---------------------
    const result = blockOutput({info});
    return result;
}