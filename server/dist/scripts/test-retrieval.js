"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const retrieval_service_1 = require("../services/retrieval.service");
async function main() {
    const result = await retrieval_service_1.RetrievalService.retrieve("What is this document about?", 3);
    //console.log(JSON.stringify(result, null, 2));
}
main().catch(console.error);
