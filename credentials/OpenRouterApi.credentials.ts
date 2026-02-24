import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class OpenRouterApi implements ICredentialType {
	name = 'openRouterApi';

	displayName = 'OpenRouter API';

	documentationUrl = 'https://openrouter.ai/docs';

	properties: INodeProperties[] = [
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
