import {
    advancePhase,
    claimRewards,
    getAggregatedAccountData,
    getAllBalances,
    getAllCommunites,
    getBalance,
    getReputations,
    registerParticipant,
    submitAttestationsAndVote,
    transfer,
    transferAll,
} from "./runtime";
import { describe, expect } from "@jest/globals";
import { AllCommunities, CommunityObject } from "../types";
import {
    InsufficientBalance,
    ParticipantNotRegistered,
    WrongPhaseForClaimingRewards,
    WrongPhaseForRegistering,
    WrongPhaseForSubmittingAttestations,
} from "../errors";

function getBaseCommunityObject(): CommunityObject {
    return {
        name: "TestCommunity",
        currentPhase: "registering",
        income: 10,
        participants: {},
        ceremonies: [
            {
                participants: {},
                attestations: {},
                votes: {},
                reputations: {},
            },
        ],
    };
}

function getBaseAllCommunities(): AllCommunities {
    return {
        "0xaaaaaaaaaa0xbbbbbbbb": getBaseCommunityObject(),
        "0xcccccccccc0xdddddddd": getBaseCommunityObject(),
    };
}

describe("advancePhase", () => {
    it("works", async () => {
        let co = getBaseCommunityObject();
        expect(co.currentPhase).toBe("registering");
        expect(co.ceremonies.length).toBe(1);
        co = advancePhase(co);
        expect(co.currentPhase).toBe("assigning");
        expect(co.ceremonies.length).toBe(1);
        co = advancePhase(co);
        expect(co.currentPhase).toBe("attesting");
        expect(co.ceremonies.length).toBe(2);
        co = advancePhase(co);
        expect(co.currentPhase).toBe("registering");
        expect(co.ceremonies.length).toBe(2);
    });
});

describe("registerParticipant", () => {
    it("works", async () => {
        let co = getBaseCommunityObject();
        expect(co.ceremonies[0].participants).toEqual({});
        registerParticipant(co, "0xaddress", "Reputable");
        expect(co.ceremonies[0].participants["0xaddress"]).toBe("Reputable");
        expect(co.ceremonies[0].reputations["0xaddress"]).toBe(
            "UnverifiedReputable"
        );

        co = advancePhase(co);
        expect(() =>
            registerParticipant(co, "0xaddress1", "Reputable")
        ).toThrowError(WrongPhaseForRegistering);
    });
});

describe("submitAttestationsAndVote", () => {
    it("works", async () => {
        let co = getBaseCommunityObject();
        expect(() =>
            submitAttestationsAndVote(co, "0xaddress", [], 0)
        ).toThrowError(WrongPhaseForSubmittingAttestations);
        co = advancePhase(co);
        co = advancePhase(co);
        expect(() =>
            submitAttestationsAndVote(co, "0xaddress", [], 0)
        ).toThrowError(ParticipantNotRegistered);
        co.ceremonies[0] = {
            participants: { "0xaddress": "Reputable" },
            attestations: {},
            votes: {},
            reputations: { "0xaddress": "UnverifiedReputable" },
        };
        co = submitAttestationsAndVote(
            co,
            "0xaddress",
            ["0xaddress1", "0xaddress3"],
            13
        );
        expect(co.ceremonies[0].attestations["0xaddress"]).toStrictEqual([
            "0xaddress1",
            "0xaddress3",
        ]);
        expect(co.ceremonies[0].votes["0xaddress"]).toEqual(13);
    });
});

describe("claimRewards", () => {
    it("works", async () => {
        let co = getBaseCommunityObject();
        co = advancePhase(co);
        expect(() => claimRewards(co)).toThrowError(
            WrongPhaseForClaimingRewards
        );
        co = advancePhase(co);
        co = advancePhase(co);

        co.ceremonies[0] = {
            participants: {
                "0xaddress": "Reputable",
                "0xaddress1": "Reputable",
                "0xaddress2": "Reputable",
            },
            attestations: {
                "0xaddress": ["0xaddress1", "0xaddress2"],
                "0xaddress1": ["0xaddress2", "0xaddress"],
                "0xaddress2": ["0xaddress1", "0xaddress"],
            },
            votes: {
                "0xaddress": 3,
                "0xaddress1": 3,
                "0xaddress2": 3,
            },
            reputations: {
                "0xaddress": "UnverifiedReputable",
                "0xaddress1": "UnverifiedReputable",
                "0xaddress2": "UnverifiedReputable",
            },
        };
        co.participants["0xaddress"] = 20;
        co = claimRewards(co);
        expect(co.participants["0xaddress"]).toEqual(30);
        expect(co.participants["0xaddress1"]).toEqual(10);
        expect(co.participants["0xaddress2"]).toEqual(10);

        expect(co.ceremonies[0].reputations["0xaddress"]).toEqual(
            "VerifiedUnlinked"
        );
        expect(co.ceremonies[0].reputations["0xaddress1"]).toEqual(
            "VerifiedUnlinked"
        );
        expect(co.ceremonies[0].reputations["0xaddress2"]).toEqual(
            "VerifiedUnlinked"
        );
    });
});

describe("transfer", () => {
    it("works", async () => {
        let co = getBaseCommunityObject();
        co.participants["0xaddress"] = 10;
        expect(() => transfer(co, "0xaddress", "0xaddress1", 20)).toThrowError(
            InsufficientBalance
        );
        expect(() => transfer(co, "0xaddress2", "0xaddress1", 1)).toThrowError(
            InsufficientBalance
        );
        co = transfer(co, "0xaddress", "0xaddress1", 7);
        expect(co.participants["0xaddress"]).toEqual(3);
        expect(co.participants["0xaddress1"]).toEqual(7);
    });
});

describe("transferAll", () => {
    it("works", async () => {
        let co = getBaseCommunityObject();
        co.participants["0xaddress"] = 13;

        co = transferAll(co, "0xaddress", "0xaddress1");
        expect(co.participants["0xaddress"]).toEqual(0);
        expect(co.participants["0xaddress1"]).toEqual(13);
    });
});

describe("getBalance", () => {
    it("works", async () => {
        let co = getBaseCommunityObject();
        co.participants["0xaddress"] = 13;

        expect(getBalance(co, "0xaddress")).toEqual(13);
        expect(getBalance(co, "0xaddress1")).toEqual(0);
    });
});

describe("getAggregatedAccountData", () => {
    it("works", async () => {
        let co = getBaseCommunityObject();
        co = advancePhase(co);
        co = advancePhase(co);

        co.ceremonies[0] = {
            participants: {
                "0xaddress": "Reputable",
                "0xaddress1": "Reputable",
            },
            attestations: {},
            votes: {},
            reputations: {
                "0xaddress": "UnverifiedReputable",
                "0xaddress1": "UnverifiedReputable",
            },
        };

        co.ceremonies[1] = {
            participants: {
                "0xaddress": "Bootstrapper",
            },
            attestations: {},
            votes: {},
            reputations: {
                "0xaddress": "UnverifiedReputable",
            },
        };

        expect(getAggregatedAccountData(co, "0xaddress")).toEqual({
            global: {
                ceremonyPhase: "attesting",
                ceremonyIndex: 0,
            },
            personal: {
                participantType: "Reputable",
                meetupIndex: 1,
                meetupLocationIndex: 1,
                meetupTime: null,
                meetupRegistry: ["0xaddress", "0xaddress1"],
            },
        });

        co = advancePhase(co);

        expect(
            getAggregatedAccountData(co, "0xaddress").personal?.participantType
        ).toEqual("Bootstrapper");
        expect(
            getAggregatedAccountData(co, "0xaddress").global.ceremonyIndex
        ).toEqual(1);
        expect(
            getAggregatedAccountData(co, "0xaddress").global.ceremonyPhase
        ).toEqual("registering");
    });
});

describe("getReputations", () => {
    it("works", async () => {
        let aco = getBaseAllCommunities();
        aco["0xaaaaaaaaaa0xbbbbbbbb"].ceremonies[0] = {
            participants: {},
            attestations: {},
            votes: {},
            reputations: {
                "0xaddress": "UnverifiedReputable",
                "0xaddress1": "Unverified",
            },
        };
        aco["0xaaaaaaaaaa0xbbbbbbbb"].ceremonies.push({
            participants: {},
            attestations: {},
            votes: {},
            reputations: {
                "0xaddress": "VerifiedUnlinked",
                "0xaddress1": "VerifiedLinked",
            },
        });

        aco["0xcccccccccc0xdddddddd"].ceremonies[0] = {
            participants: {},
            attestations: {},
            votes: {},
            reputations: {
                "0xaddress": "UnverifiedReputable",
            },
        };
        expect(getReputations(aco, "0xaddress")).toEqual([
            [
                1,
                {
                    communityIdentifier: {
                        geohash: "0xaaaaaaaaaa",
                        digest: "0xbbbbbbbb",
                    },
                    reputation: "VerifiedUnlinked",
                },
            ],
            [
                0,
                {
                    communityIdentifier: {
                        geohash: "0xaaaaaaaaaa",
                        digest: "0xbbbbbbbb",
                    },
                    reputation: "UnverifiedReputable",
                },
            ],
            [
                0,
                {
                    communityIdentifier: {
                        geohash: "0xcccccccccc",
                        digest: "0xdddddddd",
                    },
                    reputation: "UnverifiedReputable",
                },
            ],
        ]);

        expect(getReputations(aco, "0xaddress1")).toEqual([
            [
                1,
                {
                    communityIdentifier: {
                        geohash: "0xaaaaaaaaaa",
                        digest: "0xbbbbbbbb",
                    },
                    reputation: "VerifiedLinked",
                },
            ],
            [
                0,
                {
                    communityIdentifier: {
                        geohash: "0xaaaaaaaaaa",
                        digest: "0xbbbbbbbb",
                    },
                    reputation: "Unverified",
                },
            ],
        ]);
    });
});

describe("getAllBalances", () => {
    it("works", async () => {
        let aco = getBaseAllCommunities();
        aco["0xaaaaaaaaaa0xbbbbbbbb"].participants["0xaddress"] = 13;
        aco["0xaaaaaaaaaa0xbbbbbbbb"].participants["0xaddress1"] = 7;
        aco["0xcccccccccc0xdddddddd"].participants["0xaddress"] = 2;

        expect(getAllBalances(aco, "0xaddress")).toEqual([
            [
                {
                    geohash: "0xaaaaaaaaaa",
                    digest: "0xbbbbbbbb",
                },
                {
                    principal: 13,
                    lastUpdate: 1337,
                },
            ],
            [
                {
                    geohash: "0xcccccccccc",
                    digest: "0xdddddddd",
                },
                {
                    principal: 2,
                    lastUpdate: 1337,
                },
            ],
        ]);

        expect(getAllBalances(aco, "0xaddress1")).toEqual([
            [
                {
                    geohash: "0xaaaaaaaaaa",
                    digest: "0xbbbbbbbb",
                },
                {
                    principal: 7,
                    lastUpdate: 1337,
                },
            ],
        ]);
    });
});

describe("getAllCommunities", () => {
    it("works", async () => {
        let aco = getBaseAllCommunities();
        aco["0xaaaaaaaaaa0xbbbbbbbb"].name = "TestCommunity0";
        expect(getAllCommunites(aco)).toEqual([
            {
                cid: {
                    geohash: "0xaaaaaaaaaa",
                    digest: "0xbbbbbbbb",
                },
                name: "TestCommunity0",
            },
            {
                cid: {
                    geohash: "0xcccccccccc",
                    digest: "0xdddddddd",
                },
                name: "TestCommunity",
            },
        ]);
    });
});
