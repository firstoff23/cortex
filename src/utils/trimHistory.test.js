import { describe, it, expect } from "vitest";
import { trimHistory } from "../utils/trimHistory";

describe("trimHistory", () => {
  it("should return all messages if count is less than max", () => {
    const msgs = [
      { role: "user", content: "1" },
      { role: "assistant", content: "2" },
    ];
    expect(trimHistory(msgs, 10)).toHaveLength(2);
  });

  it("should truncate conversation but preserve system prompt", () => {
    const msgs = [
      { role: "system", content: "sys" },
      { role: "user", content: "1" },
      { role: "assistant", content: "2" },
      { role: "user", content: "3" },
      { role: "assistant", content: "4" },
    ];
    // Limit to 2 conversation messages
    const result = trimHistory(msgs, 2);
    expect(result).toHaveLength(3); // 1 system + 2 conversation
    expect(result[0].role).toBe("system");
    expect(result[1].content).toBe("3");
    expect(result[2].content).toBe("4");
  });

  it("should work with 20 messages and limit 12", () => {
    const msgs = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: String(i),
    }));
    const result = trimHistory(msgs, 12);
    expect(result).toHaveLength(12);
    expect(result[0].content).toBe("8");
    expect(result[11].content).toBe("19");
  });
});
