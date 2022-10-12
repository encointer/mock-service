import { exportedForTesting } from "./lib";
import { describe, expect, test } from "@jest/globals";

const { getMajorityVote } = exportedForTesting;

describe("getMajorityVote", () => {
    it("should work with majority", async () => {
        expect(getMajorityVote([1, 1, 1, 1, 2])).toBe(1);
    });

    it("should return undefined if no majority", async () => {
        expect(getMajorityVote([1, 1, 1, 1, 2, 2, 2, 2])).toBe(undefined);
    });
});
