import type { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class OpenRouterApi implements ICredentialType {
  name = "openRouterApi";

  displayName = "OpenRouter API";

  documentationUrl = "https://openrouter.ai/docs";

  properties: INodeProperties[] = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: {
        password: true,
      },
      required: true,
      default: "",
      description:
        "Your OpenRouter API key. Get it from https://openrouter.ai/keys",
    },
    {
      displayName: "Base URL",
      name: "url",
      type: "hidden",
      default: "https://openrouter.ai/api/v1",
    },
  ];
  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: {
        Authorization: "=Bearer {{$credentials.apiKey}}",
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: "={{ $credentials.url }}",
      url: "/key",
    },
  };
}
