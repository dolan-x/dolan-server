import { shared } from "../../deps.ts";

type CreateResponseArguments = {
  code?: shared.Codes;
  message?: string;
  data?: unknown;
  error?: string;
};
type CreateResponseResult = {
  code: shared.Codes;
  message: string;
  data?: unknown;
  error?: string;
};

export function createResponse({
  code = shared.Codes.Success,
  message = shared.messages[code],
  data = {},
  error,
}: CreateResponseArguments = {}): CreateResponseResult {
  const response: CreateResponseResult = {
    code,
    message,
  };
  console.log(error);
  !error && (response.data = data);
  error && (response.error = error);

  return response;
}
