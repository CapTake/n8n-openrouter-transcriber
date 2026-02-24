"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodes = exports.credentials = void 0;
const OpenRouterApi_credentials_1 = require("./credentials/OpenRouterApi.credentials");
const OpenRouterTranscribeV1_1 = require("./nodes/OpenRouterTranscribe/OpenRouterTranscribeV1");
exports.credentials = [OpenRouterApi_credentials_1.OpenRouterApi];
exports.nodes = [OpenRouterTranscribeV1_1.OpenRouterTranscribeV1];
