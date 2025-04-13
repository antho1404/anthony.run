import { webhooks } from "@octokit/openapi-webhooks-types";
export type Event<E extends keyof webhooks> =
  webhooks[E]["post"]["requestBody"]["content"]["application/json"];
