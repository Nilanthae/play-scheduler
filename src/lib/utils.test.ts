import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins class names and skips empty values", () => {
    expect(cn("p-2", undefined, false, "m-1")).toBe("p-2 m-1");
  });
});
