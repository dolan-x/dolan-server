import { Status, STATUS_TEXT } from "../../deps.ts";

type SuccessOptions = {
  code?: Status;
  message?: string;
  data?: unknown;
  metas?: Record<string, unknown>;
};
export function success({
  code = Status.OK,
  message = STATUS_TEXT.get(code),
  data = {},
  metas = {},
}: SuccessOptions = {}) {
  return {
    code,
    message,
    data,
    metas,
  };
}

type FailOptions = {
  code?: Status;
  message?: string;
  error?: string;
};
export function fail({
  code = Status.InternalServerError,
  message = STATUS_TEXT.get(code),
  error = message,
}: FailOptions = {}) {
  return {
    code,
    message,
    error,
  };
}
