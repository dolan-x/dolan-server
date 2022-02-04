type CreateResponseArguments = {
  code?: number;
  message?: string;
  data?: unknown;
  error?: string;
};
type CreateResponseResult = {
  code: number;
  message: string;
  data?: unknown;
  error?: string;
};

export function createResponse({
  code = 200,
  message = "Success",
  data = {},
  error,
}: CreateResponseArguments = {}): CreateResponseResult {
  const response: CreateResponseResult = {
    code,
    message,
  };
  !error && (response.data = data);
  error && (response.error = error);

  return response;
}
