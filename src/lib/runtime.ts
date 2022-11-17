import { reputationLifetime } from "../consts";
import { getCommunityObject, putCommunityObject } from "../db";
import {
    CommuniyAlreadyExists,
    InsufficientBalance,
    ParticipantNotRegistered,
    WrongPhaseForClaimingRewards,
    WrongPhaseForRegistering,
    WrongPhaseForSubmittingAttestations,
} from "../errors";
import {
    Phase,
    Address,
    ParticipantType,
    AttestationArray,
    CommunityObject,
    CommunityIdentifier,
    AllCommunities,
    ReputationRpcItem,
    BalanceRpcItem,
    AggregatedAccountData,
    AllCommunitiesRpcItem,
    Scenario,
} from "../types";
import { getParticipantsEligibleForReward } from "./meetupValidation";
import { parseCid } from "./util";

export async function newCommunity(
    cid: CommunityIdentifier,
    name: string,
    scenario: Scenario
) {
    try {
        if (await getCommunityObject(cid)) throw new CommuniyAlreadyExists();
    } catch {}
    const communityObject: CommunityObject = {
        scenario,
        createdAt: new Date().toISOString(),
        name,
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

    await putCommunityObject(cid, communityObject);
}

export function advancePhase(communityObject: CommunityObject) {
    let phase = communityObject.currentPhase;
    const phases: Phase[] = ["registering", "assigning", "attesting"];
    let nextPhase = phases[(phases.indexOf(phase) + 1) % 3];
    if (nextPhase === "attesting") {
        // create a new ceremony such that people can already register for the next ceremony.
        initCeremony(communityObject);
    }
    communityObject.currentPhase = nextPhase;
    return communityObject;
}

function initCeremony(communityObject: CommunityObject) {
    let ceremonies = communityObject.ceremonies;
    ceremonies.push({
        participants: {},
        attestations: {},
        votes: {},
        reputations: {},
    });
    communityObject.ceremonies = ceremonies;
    return communityObject;
}

export function registerParticipant(
    communityObject: CommunityObject,
    participant: Address,
    type: ParticipantType
) {
    if (communityObject.currentPhase === "assigning")
        throw new WrongPhaseForRegistering();
    let ceremonies = communityObject.ceremonies;
    ceremonies[ceremonies.length - 1].participants[participant] = type;
    ceremonies[ceremonies.length - 1].reputations[participant] = [
        "Bootstrapper",
        "Reputable",
    ].includes(type)
        ? "UnverifiedReputable"
        : "Unverified";
    communityObject.ceremonies = ceremonies;
    return communityObject;
}

export function submitAttestationsAndVote(
    communityObject: CommunityObject,
    participant: Address,
    attestations: AttestationArray,
    vote: number
) {
    if (communityObject.currentPhase !== "attesting")
        throw new WrongPhaseForSubmittingAttestations();
    let ceremonies = communityObject.ceremonies;
    let cindex = ceremonies.length - 2;
    if (!(participant in ceremonies[cindex].participants))
        throw new ParticipantNotRegistered();
    ceremonies[cindex].attestations[participant] = attestations;
    ceremonies[cindex].votes[participant] = vote;
    communityObject.ceremonies = ceremonies;
    return communityObject;
}

function addBalance(
    communityObject: CommunityObject,
    address: Address,
    amount: number
) {
    if (address in communityObject.participants)
        communityObject.participants[address] += amount;
    else communityObject.participants[address] = amount;
    return communityObject;
}
export function claimRewards(communityObject: CommunityObject) {
    // early rewards not possible for simplicity
    if (communityObject.currentPhase !== "registering")
        throw new WrongPhaseForClaimingRewards();
    let ceremonies = communityObject.ceremonies;
    let ceremonyIndex = ceremonies.length - 2;
    let ceremony = ceremonies[ceremonyIndex];
    let participantsEligibleForReward = getParticipantsEligibleForReward(
        ceremony.votes,
        ceremony.attestations
    );
    participantsEligibleForReward.forEach(
        (p) => (ceremony.reputations[p] = "VerifiedUnlinked")
    );
    ceremonies[ceremonyIndex] = ceremony;
    for (let p of participantsEligibleForReward) {
        communityObject = addBalance(
            communityObject,
            p,
            communityObject.income
        );
    }
    communityObject.ceremonies = ceremonies;
    return communityObject;
}

export function transfer(
    communityObject: CommunityObject,
    from: Address,
    to: Address,
    amount: number
) {
    if (
        !(from in communityObject.participants) ||
        communityObject.participants[from] - amount < 0
    )
        throw new InsufficientBalance();
    communityObject.participants[from] -= amount;
    communityObject = addBalance(communityObject, to, amount);
    return communityObject;
}

export function transferAll(
    communityObject: CommunityObject,
    from: Address,
    to: Address
) {
    if (!(from in communityObject.participants)) return communityObject;
    communityObject = addBalance(
        communityObject,
        to,
        communityObject.participants[from]
    );
    communityObject.participants[from] = 0;
    return communityObject;
}

export function getBalance(
    communityObject: CommunityObject,
    participant: Address
) {
    if (!(participant in communityObject.participants)) return 0;
    return communityObject.participants[participant];
}

export function getAggregatedAccountData(
    communityObject: CommunityObject,
    participant: Address
): AggregatedAccountData {
    let cindex = communityObject.ceremonies.length - 1;
    if (communityObject.currentPhase === "attesting") cindex -= 1;
    let global = {
        ceremonyPhase: communityObject.currentPhase,
        ceremonyIndex: cindex,
    };

    let personal = null;

    let ceremony = communityObject.ceremonies[cindex];
    if (participant in ceremony.participants) {
        personal = {
            participantType: ceremony.participants[participant],
            meetupIndex: 1,
            meetupLocationIndex: 1,
            meetupTime: null,
            meetupRegistry: Object.keys(ceremony.participants),
        };
    }
    return { global, personal };
}

export function getReputations(
    allCommunities: AllCommunities,
    participant: Address
) {
    let reputations: ReputationRpcItem[] = [];
    for (const [cid, community] of Object.entries(allCommunities)) {
        let maxCeremonyIndex = community.ceremonies.length - 1;
        for (let i = 0; i < reputationLifetime; i++) {
            let cindex = maxCeremonyIndex - i;
            if (cindex < 0) break;
            let ceremony = community.ceremonies[cindex];
            let reputation = ceremony.reputations[participant];
            if (reputation) {
                reputations.push([
                    cindex,
                    { communityIdentifier: parseCid(cid), reputation },
                ]);
            }
        }
    }
    return reputations;
}

export function getAllBalances(
    allCommunities: AllCommunities,
    participant: Address
) {
    let balances: BalanceRpcItem[] = [];
    for (const [cid, community] of Object.entries(allCommunities)) {
        let balance = community.participants[participant];
        if (balance) {
            balances.push([
                parseCid(cid),
                { principal: balance, lastUpdate: 1 },
            ]);
        }
    }
    return balances;
}

export function getAllCommunites(allCommunities: AllCommunities) {
    let communites: AllCommunitiesRpcItem[] = [];
    for (const [cid, community] of Object.entries(allCommunities)) {
        communites.push({ cid: parseCid(cid), name: community.name });
    }
    return communites;
}
