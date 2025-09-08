import { greet } from "../src/index";

test("greet returns correct message", () => {
  expect(greet("World")).toBe("Hello, World");
});
