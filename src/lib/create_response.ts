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
  code = shared.STATUS_CODES.get(shared.Codes.Success),
  message = shared.STATUS_MESSAGES.get(shared.Codes.Success),
  data = {},
  error,
}: CreateResponseArguments = {}): CreateResponseResult {
  const response: CreateResponseResult = {
    code,
    message,
  } as CreateResponseResult;
  !error && (response.data = data);
  error && (response.error = error);

  return response;
}
