import { message } from "@src/a";

test("message should return 'Hello, world'", () => {
  const m = message();
  expect(m).toBe("Hello, world");
});
