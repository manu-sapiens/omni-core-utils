//@ts-check

import { createComponent,setComponentInputs, setComponentOutputs, setComponentControls } from 'omni-utils';
import { OAIBaseComponent, OmniComponentMacroTypes, OmniComponentFlags } from 'omni-sockets';
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

//export const recipe_output_component = createComponent(group_id, id, title, category, description, summary, links, inputs, outputs, controls, parsePayload );
let baseComponent = OAIBaseComponent
.create(group_id, id)
.fromScratch()
.set('title', title)
.set('category', category)
.set('description', description)
.setMethod('X-CUSTOM')
.setMeta({
    source: {
        summary,
    }
});

baseComponent = setComponentInputs(baseComponent, inputs);
baseComponent = setComponentOutputs(baseComponent, outputs);
baseComponent.setFlag(OmniComponentFlags.UNIQUE_PER_WORKFLOW, true)
if (controls) baseComponent = setComponentControls(baseComponent, controls);
baseComponent.setMacro(OmniComponentMacroTypes.EXEC, parsePayload);

export const recipe_output_component = baseComponent.toJSON();

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
    const job_id = ctx.jobId;
    if (!job_id) throw new Error(`No recipe id found in the context`);

    const jobs_controller = ctx.app.jobs;
    const jobs = jobs_controller.jobs;
    const workflow_job = jobs.get(job_id);

    const groups = await loadVariablesGroups(ctx);
    if (!groups) throw new Error(`No variable groups found in the database and error creating the groups object`);

    const json = {};
    json.outputs = {};

    const outputs = json.outputs;
    if (text) outputs.text = text;
    if (images) outputs.images = images;
    if (audio) outputs.audio = audio;
    if (documents) outputs.documents = documents;
    if (videos) outputs.videos = videos;
    if (files) outputs.files = files;
    if (objects) outputs.objects = objects;
    info += `job_id: ${job_id}: Saving outputs ${JSON.stringify(outputs)} to the database; | `; 
    workflow_job.artifact = outputs;
    
    const result = blockOutput({info});
    return result;
}