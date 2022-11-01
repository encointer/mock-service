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
    ParticipantRole,
    AttestationArray,
    CommunityObject,
    CommunityIdentifier,
} from "../types";
import { getParticipantsEligibleForReward } from "./meetupValidation";

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
    role: ParticipantRole
) {
    if (communityObject.currentPhase === "assigning")
        throw new WrongPhaseForRegistering();
    let ceremonies = communityObject.ceremonies;
    ceremonies[ceremonies.length - 1].participants[participant] = role;
    ceremonies[ceremonies.length - 1].reputations[participant] = ["Bootstrapper", "Reputable"].includes(role) ? "UnverifiedReputable" : "Unverified";
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
    if (!(participant in communityObject.participants))
        throw new ParticipantNotRegistered();
    let ceremonies = communityObject.ceremonies;
    ceremonies[ceremonies.length - 2].attestations[participant] = attestations;
    ceremonies[ceremonies.length - 2].votes[participant] = vote;
    communityObject.ceremonies = ceremonies;
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
    participantsEligibleForReward.forEach(p => ceremony.reputations[p] = 'VerifiedUnlinked')
    ceremonies[ceremonyIndex] = ceremony;
    for (let p of participantsEligibleForReward) {
        if (p in communityObject.participants)
            communityObject.participants[p] += communityObject.income;
        else communityObject.participants[p] = communityObject.income;
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
    communityObject.participants[to] += amount;
    return communityObject;
}

export function transferAll(
    communityObject: CommunityObject,
    from: Address,
    to: Address
) {
    if (!(from in communityObject.participants)) return;
    communityObject.participants[to] += communityObject.participants[from];
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

export async function newCommunity(cid: CommunityIdentifier) {
    if (await getCommunityObject(cid)) throw new CommuniyAlreadyExists();
    const communityObject: CommunityObject = {
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
