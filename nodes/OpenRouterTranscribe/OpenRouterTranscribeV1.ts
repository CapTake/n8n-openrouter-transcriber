import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodePropertyOptions,
} from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
import axios from "axios";
import * as path from "path";

const audioFormats: INodePropertyOptions[] = [
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

const audioFormatMap: Record<string, string> = {
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

function getAudioFormatFromFileName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase().slice(1);
  const format = audioFormatMap[ext];
  if (!format) {
    throw new Error(`Unsupported audio format: ${ext}`);
  }
  return format;
}

export class OpenRouterTranscribeV1 implements INodeType {
  description: INodeTypeDescription = {
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
        description:
          "The format of the audio file. Auto-detect extracts the format from the filename extension.",
      },
      {
        displayName: "Model",
        name: "model",
        type: "string",
        default: "google/gemini-2.5-flash-lite",
        required: true,
        description:
          'The model to use for transcription. Must be a model that supports audio input. Check <a href="https://openrouter.ai/models?modality=audio" target="_blank">available models</a>.',
      },
      {
        displayName: "Prompt",
        name: "prompt",
        type: "string",
        typeOptions: {
          rows: 3,
        },
        default:
          "Please transcribe this audio file. Return exact transcription.",
        description:
          "The instruction to send along with the audio to the model",
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
            description:
              "Controls randomness in the output. Lower values are more deterministic.",
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
            description:
              "Whether to return the complete raw API response instead of just the transcription",
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const credentials = await this.getCredentials("openRouterApi");
    const apiKey = credentials.apiKey as string;

    for (let i = 0; i < items.length; i++) {
      try {
        const inputData = this.getNodeParameter("inputData", i) as string;
        let audioFormat = this.getNodeParameter("audioFormat", i) as string;
        const model = this.getNodeParameter("model", i) as string;
        const prompt = this.getNodeParameter("prompt", i) as string;
        const options = this.getNodeParameter("options", i) as {
          maxTokens?: number;
          temperature?: number;
          topP?: number;
          returnRawResponse?: boolean;
        };

        let base64Audio: string;
        let fileName = "";

        if (inputData === "binary") {
          const binaryPropertyName = this.getNodeParameter(
            "binaryPropertyName",
            i,
          ) as string;
          const binaryData = await this.helpers.getBinaryDataBuffer(
            i,
            binaryPropertyName,
          );
          base64Audio = binaryData.toString("base64");

          // Get filename from binary data metadata for auto-detection
          const inputDataItem = items[i];
          if (inputDataItem.binary?.[binaryPropertyName]) {
            fileName = inputDataItem.binary[binaryPropertyName].fileName || "";
          }

          // Auto-detect format from filename if selected
          if (audioFormat === "auto") {
            if (!fileName) {
              throw new NodeOperationError(
                this.getNode(),
                "Cannot auto-detect audio format: filename not available",
                {
                  itemIndex: i,
                },
              );
            }
            audioFormat = getAudioFormatFromFileName(fileName);
          }
        } else {
          base64Audio = this.getNodeParameter("inputTextField", i) as string;

          // Auto-detect not available for text input
          if (audioFormat === "auto") {
            throw new NodeOperationError(
              this.getNode(),
              "Auto-detect format is not available for text input mode. Please select a specific audio format.",
              {
                itemIndex: i,
              },
            );
          }
        }

        if (!base64Audio || base64Audio.trim() === "") {
          throw new NodeOperationError(this.getNode(), "Audio data is empty", {
            itemIndex: i,
          });
        }

        const requestBody: Record<string, unknown> = {
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

        const response = await axios.post(
          `${credentials.url}/chat/completions`,
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${credentials.apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://n8n.io",
              "X-Title": "n8n-openrouter-transcribe",
            },
          },
        );

        const returnRawResponse = options.returnRawResponse ?? false;

        if (returnRawResponse) {
          returnData.push({
            json: {
              ...response.data,
            },
            pairedItem: { item: i },
          });
        } else {
          const transcription =
            response.data.choices?.[0]?.message?.content ?? "";
          returnData.push({
            json: {
              transcription,
              model,
              usage: response.data.usage,
            },
            pairedItem: { item: i },
          });
        }
      } catch (error) {
        if (error instanceof NodeOperationError) {
          throw error;
        }
        const axiosError = error as {
          response?: { data?: { error?: { message?: string } } };
        };
        const errorMessage =
          axiosError.response?.data?.error?.message ||
          (error as Error).message ||
          "Unknown error occurred";
        throw new NodeOperationError(this.getNode(), errorMessage, {
          itemIndex: i,
        });
      }
    }

    return [returnData];
  }
}
