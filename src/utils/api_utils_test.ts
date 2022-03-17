import { assertEquals } from "../../test_deps.ts";

import { createResponse } from "./api_utils.ts";

Deno.test({
  name: "Utils(API Utils): Create Response",
  fn() {
    assertEquals(createResponse(), {
      code: 200,
      data: {},
      message: "OK",
    });
    assertEquals(
      createResponse({
        code: 200,
      }),
      {
        code: 200,
        data: {},
        message: "OK",
      },
    );
    assertEquals(
      createResponse({
        code: 200,
        message: "Test",
      }),
      {
        code: 200,
        data: {},
        message: "Test",
      },
    );
    assertEquals(
      createResponse({
        error: null,
      }),
      {
        code: 500,
        error: "Internal Server Error",
        message: "Internal Server Error",
      },
    );
    assertEquals(
      createResponse({
        error: null,
        message: "Test",
      }),
      {
        code: 500,
        error: "Internal Server Error",
        message: "Test",
      },
    );
    assertEquals(
      createResponse({
        error: "Test Error",
        message: "Test",
      }),
      {
        code: 200,
        error: "Test Error",
        message: "Test",
      },
    );
    assertEquals(
      createResponse({
        code: 400,
        error: "Test Error",
        message: "Test",
      }),
      {
        code: 400,
        error: "Test Error",
        message: "Test",
      },
    );
  },
});
