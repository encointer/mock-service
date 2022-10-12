import { exportedForTesting, getParticipantsEligibleForReward } from "./meetupValidation";
import { describe, expect } from "@jest/globals";

const { getMajorityVote, getNumIncomingAttestations } = exportedForTesting;

describe("getMajorityVote", () => {
    it("should work with majority", async () => {
        expect(getMajorityVote([1, 1, 1, 1, 2])).toBe(1);
    });

    it("should throw exception if no majority", async () => {
        expect(() => getMajorityVote([1, 1, 1, 1, 2, 2, 2, 2])).toThrow();
    });
});

describe("getNumIncomingAttestations", () => {
    it("works", async () => {
        expect(
            getNumIncomingAttestations(
                {
                    a: ["a", "b", "c"],
                    b: ["c", "d"],
                    c: ["a", "d"],
                    d: ["a", "c"],
                },
                "a"
            )
        ).toBe(2);
    });
});

describe("getParticipantsEligibleForReward", () => {
    it("works", async () => {
        expect(
            getParticipantsEligibleForReward(
                {
                    a: 3,
                    b: 3,
                    c: 3,
                    d: 1,
                },
                {
                    a: ["a", "b", "c", "d"],
                    b: ["c", "d", "d"],
                    c: ["a", "b", "d"],
                    d: ["b", "c"],
                },
                
            )
        ).toStrictEqual(["b", "c"]);
    });
});