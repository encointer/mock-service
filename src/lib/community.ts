import { InsufficientBalance, ParticipantNotRegistered, WrongPhaseForClaimingRewards, WrongPhaseForRegistering, WrongPhaseForSubmittingAttestations } from "../errors";
import { Phase, Address, ParticipantRole, AttestationArray, CommunityObject } from "../types";
import { getParticipantsEligibleForReward } from "./meetupValidation";

export function advancePhase(communityObject: CommunityObject) {
    let phase = communityObject.currentPhase;
    const phases: Phase[] = ["registering", "assigning", "attesting"];
    let nextPhase = phases[(phases.indexOf(phase) + 1) % 3];
    if (nextPhase === 'attesting') {
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
        participantsEligibleForReward: []
    })
    communityObject.ceremonies = ceremonies;
    return communityObject;
}

export function registerParticipant(communityObject: CommunityObject, participant: Address, role: ParticipantRole) {
    if(communityObject.currentPhase === 'assigning') throw new WrongPhaseForRegistering();
    let ceremonies = communityObject.ceremonies;
    ceremonies[ceremonies.length - 1].participants[participant] = role;
    communityObject.ceremonies = ceremonies;
    return communityObject;
}

export function submitAttestations(communityObject: CommunityObject, participant: Address, attestations: AttestationArray) {
    if(communityObject.currentPhase !== 'attesting') throw new WrongPhaseForSubmittingAttestations();
    if(!(participant in communityObject.participants)) throw new ParticipantNotRegistered();
    let ceremonies = communityObject.ceremonies;
    ceremonies[ceremonies.length - 2].attestations[participant] = attestations;
    communityObject.ceremonies = ceremonies;
    return communityObject;
}

export function claimRewards(communityObject: CommunityObject) {
    // early rewards not possible for simplicity
    if(communityObject.currentPhase !== 'registering') throw new WrongPhaseForClaimingRewards();
    let ceremonies = communityObject.ceremonies;
    let ceremonyIndex = ceremonies.length - 2;
    let ceremony = ceremonies[ceremonyIndex];
    let participantsEligibleForReward = getParticipantsEligibleForReward(ceremony.votes, ceremony.attestations);
    ceremony.participantsEligibleForReward = participantsEligibleForReward;
    ceremonies[ceremonyIndex] = ceremony;
    for(let p of participantsEligibleForReward) {
        if(p in communityObject.participants) communityObject.participants[p] += communityObject.income;
        else communityObject.participants[p] = communityObject.income;
    }
    communityObject.ceremonies = ceremonies;
    return communityObject;
}

export function transfer(communityObject: CommunityObject, from: Address, to: Address, amount: number) {
    if(!(from in communityObject.participants) || communityObject.participants[from] - amount < 0) throw new InsufficientBalance();
    communityObject.participants[from] -= amount;
    communityObject.participants[to] += amount;
    return communityObject;
}