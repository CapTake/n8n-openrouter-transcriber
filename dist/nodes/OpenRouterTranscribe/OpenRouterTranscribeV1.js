"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterTranscribeV1 = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const axios_1 = __importDefault(require("axios"));
const path = __importStar(require("path"));
const audioFormats = [
    { name: "WAV", value: "wav" },
    { name: "MP3", value: "mp3" },
    { name: "AIFF", value: "aiff" },
    { name: "AAC", value: "aac" },
    { name: "OGG", value: "ogg" },
    { name: "FLAC", value: "flac" },
    { name: "M4A", value: "m4a" },
    { name: "PCM16", value: "pcm16" },
    { name: "PCM24", value: "pcm24" },
    { name: "OGA", value: "oga" },
];
const audioFormatMap = {
    wav: "wav",
    mp3: "mp3",
    aiff: "aiff",
    aif: "aiff",
    aac: "aac",
    ogg: "ogg",
    oga: "ogg",
    flac: "flac",
    m4a: "m4a",
    pcm16: "pcm16",
    pcm24: "pcm24",
};
function getAudioFormatFromFileName(fileName) {
    const ext = path.extname(fileName).toLowerCase().slice(1);
    const format = audioFormatMap[ext];
    if (!format) {
        throw new Error(`Unsupported audio format: ${ext}`);
    }
    return format;
}
class OpenRouterTranscribeV1 {
    constructor() {
        this.description = {
            displayName: "OpenRouter Transcribe",
            name: "openRouterTranscribe",
            icon: "file:openrouter.svg",
            group: ["transform"],
            version: 1,
            subtitle: '={{$parameter["model"]}}',
            description: "Transcribe audio to text using OpenRouter API",
            defaults: {
                name: "OpenRouter Transcribe",
            },
            inputs: ["main"],
            outputs: ["main"],
            credentials: [
                {
                    name: "openRouterApi",
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: "Input Data",
                    name: "inputData",
                    type: "options",
                    options: [
                        {
                            name: "Binary",
                            value: "binary",
                            description: "Read audio from binary input data",
                        },
                        {
                            name: "Text (Base64)",
                            value: "text",
                            description: "Provide base64-encoded audio as text",
                        },
                    ],
                    default: "binary",
                    description: "How to provide the audio input",
                },
                {
                    displayName: "Binary Property",
                    name: "binaryPropertyName",
                    type: "string",
                    default: "data",
                    required: true,
                    displayOptions: {
                        show: {
                            inputData: ["binary"],
                        },
                    },
                    description: "Name of the binary property containing the audio data",
                },
                {
                    displayName: "Input Text Field",
                    name: "inputTextField",
                    type: "string",
                    typeOptions: {
                        rows: 4,
                    },
                    default: "",
                    required: true,
                    displayOptions: {
                        show: {
                            inputData: ["text"],
                        },
                    },
                    description: "Base64-encoded audio data",
                },
                {
                    displayName: "Audio Format",
                    name: "audioFormat",
                    type: "options",
                    options: [
                        ...audioFormats,
                        { name: "Auto-detect from filename", value: "auto" },
                    ],
                    default: "auto",
                    required: true,
                    description: "The format of the audio file. Auto-detect extracts the format from the filename extension.",
                },
                {
                    displayName: "Model",
                    name: "model",
                    type: "string",
                    default: "google/gemini-2.5-flash-lite",
                    required: true,
                    description: 'The model to use for transcription. Must be a model that supports audio input. Check <a href="https://openrouter.ai/models?modality=audio" target="_blank">available models</a>.',
                },
                {
                    displayName: "Prompt",
                    name: "prompt",
                    type: "string",
                    typeOptions: {
                        rows: 3,
                    },
                    default: "Please transcribe this audio file. Return exact transcription.",
                    description: "The instruction to send along with the audio to the model",
                },
                {
                    displayName: "Options",
                    name: "options",
                    type: "collection",
                    placeholder: "Add Option",
                    default: {},
                    options: [
                        {
                            displayName: "Max Tokens",
                            name: "maxTokens",
                            type: "number",
                            default: 4096,
                            description: "Maximum number of tokens to generate in the response",
                        },
                        {
                            displayName: "Temperature",
                            name: "temperature",
                            type: "number",
                            typeOptions: {
                                minValue: 0,
                                maxValue: 2,
                            },
                            default: 0,
                            description: "Controls randomness in the output. Lower values are more deterministic.",
                        },
                        {
                            displayName: "Top P",
                            name: "topP",
                            type: "number",
                            typeOptions: {
                                minValue: 0,
                                maxValue: 1,
                            },
                            default: 1,
                            description: "Nucleus sampling parameter",
                        },
                        {
                            displayName: "Return Raw Response",
                            name: "returnRawResponse",
                            type: "boolean",
                            default: false,
                            description: "Whether to return the complete raw API response instead of just the transcription",
                        },
                    ],
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials("openRouterApi");
        const apiKey = credentials.apiKey;
        for (let i = 0; i < items.length; i++) {
            try {
                const inputData = this.getNodeParameter("inputData", i);
                let audioFormat = this.getNodeParameter("audioFormat", i);
                const model = this.getNodeParameter("model", i);
                const prompt = this.getNodeParameter("prompt", i);
                const options = this.getNodeParameter("options", i);
                let base64Audio;
                let fileName = "";
                if (inputData === "binary") {
                    const binaryPropertyName = this.getNodeParameter("binaryPropertyName", i);
                    const binaryData = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
                    base64Audio = binaryData.toString("base64");
                    const inputDataItem = items[i];
                    if (inputDataItem.binary?.[binaryPropertyName]) {
                        fileName = inputDataItem.binary[binaryPropertyName].fileName || "";
                    }
                    if (audioFormat === "auto") {
                        if (!fileName) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), "Cannot auto-detect audio format: filename not available", {
                                itemIndex: i,
                            });
                        }
                        audioFormat = getAudioFormatFromFileName(fileName);
                    }
                }
                else {
                    base64Audio = this.getNodeParameter("inputTextField", i);
                    if (audioFormat === "auto") {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), "Auto-detect format is not available for text input mode. Please select a specific audio format.", {
                            itemIndex: i,
                        });
                    }
                }
                if (!base64Audio || base64Audio.trim() === "") {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), "Audio data is empty", {
                        itemIndex: i,
                    });
                }
                const requestBody = {
                    model,
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: prompt,
                                },
                                {
                                    type: "input_audio",
                                    input_audio: {
                                        data: base64Audio,
                                        format: audioFormat,
                                    },
                                },
                            ],
                        },
                    ],
                    stream: false,
                };
                if (options.maxTokens !== undefined) {
                    requestBody.max_tokens = options.maxTokens;
                }
                if (options.temperature !== undefined) {
                    requestBody.temperature = options.temperature;
                }
                if (options.topP !== undefined) {
                    requestBody.top_p = options.topP;
                }
                const response = await axios_1.default.post(`${credentials.url}/chat/completions`, requestBody, {
                    headers: {
                        Authorization: `Bearer ${credentials.apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://n8n.io",
                        "X-Title": "n8n-openrouter-transcribe",
                    },
                });
                const returnRawResponse = options.returnRawResponse ?? false;
                if (returnRawResponse) {
                    returnData.push({
                        json: {
                            ...response.data,
                        },
                        pairedItem: { item: i },
                    });
                }
                else {
                    const transcription = response.data.choices?.[0]?.message?.content ?? "";
                    returnData.push({
                        json: {
                            transcription,
                            model,
                            usage: response.data.usage,
                        },
                        pairedItem: { item: i },
                    });
                }
            }
            catch (error) {
                if (error instanceof n8n_workflow_1.NodeOperationError) {
                    throw error;
                }
                const axiosError = error;
                const errorMessage = axiosError.response?.data?.error?.message ||
                    error.message ||
                    "Unknown error occurred";
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), errorMessage, {
                    itemIndex: i,
                });
            }
        }
        return [returnData];
    }
}
exports.OpenRouterTranscribeV1 = OpenRouterTranscribeV1;
