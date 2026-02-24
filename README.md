# n8n-nodes-openrouter-transcribe

This is an n8n community node that transcribes audio to text using the OpenRouter API.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) to install this community node.

If you're using npm, run:

```bash
npm install n8n-nodes-openrouter-transcribe
```

If you're using pnpm, run:

```bash
pnpm add n8n-nodes-openrouter-transcribe
```

## Usage

### Credentials

1. Get an API key from [OpenRouter](https://openrouter.ai/keys)
2. In n8n, create new credentials for **OpenRouter API**
3. Enter your API key

### Node Configuration

1. Add the **OpenRouter Transcribe** node to your workflow
2. Configure the following parameters:
   - **Input Data**: Choose whether to provide audio as binary data or base64 text
   - **Binary Property**: If using binary input, specify the property name containing the audio
   - **Audio Format**: Select the format of your audio file or choose "Auto-detect from filename" to automatically determine the format from the file extension
   - **Model**: Enter the model ID (default: `openai/gpt-4o-audio-preview`). Must be a model that supports audio input.
   - **Prompt**: Optional instruction to send along with the audio
   - **Options**: Additional parameters like max tokens, temperature, top P, and raw response option

### Supported Audio Formats

- WAV (`.wav`)
- MP3 (`.mp3`)
- AIFF (`.aiff`, `.aif`)
- AAC (`.aac`)
- OGG/OGA (`.ogg`, `.oga`)
- FLAC (`.flac`)
- M4A (`.m4a`)
- PCM16 (`.pcm16`)
- PCM24 (`.pcm24`)

When using "Auto-detect from filename", the format is determined by the file extension.

### Example

1. Use a **Read Binary File** node to load an audio file
2. Connect it to the **OpenRouter Transcribe** node
3. Set **Binary Property** to `data` (or whatever property your binary file uses)
4. Set **Audio Format** to match your file format
5. The output will contain the `transcription` text

## Operations

The node returns:
- `transcription`: The transcribed text
- `model`: The model used for transcription
- `usage`: Token usage information from the API

If **Return Raw Response** is enabled, the complete API response is returned instead.

## Models

Only models with audio processing capabilities can transcribe audio. Find compatible models on the [OpenRouter Models page](https://openrouter.ai/models?modality=audio).

Popular models include:
- `openai/gpt-4o-audio-preview`
- `openai/whisper-large-v3`

Check individual model documentation for supported audio formats and capabilities.

## Resources

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [OpenRouter Models](https://openrouter.ai/models)
- [n8n Documentation](https://docs.n8n.io)

## License

MIT
