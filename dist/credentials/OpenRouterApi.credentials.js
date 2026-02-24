"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterApi = void 0;
class OpenRouterApi {
    constructor() {
        this.name = 'openRouterApi';
        this.displayName = 'OpenRouter API';
        this.documentationUrl = 'https://openrouter.ai/docs';
        this.properties = [
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                required: true,
                default: '',
                description: 'Your OpenRouter API key. Get it from https://openrouter.ai/keys',
            },
        ];
    }
}
exports.OpenRouterApi = OpenRouterApi;
