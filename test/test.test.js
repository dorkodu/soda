import { logger } from "../src/index";

test("logger output", () => {
    expect(logger()).toBe(5)
})