import { getCommunityObject, putCommunityObject } from "../db";
import { ParticipantNotRegistered, WrongPhaseForClaimingRewards, WrongPhaseForRegistering, WrongPhaseForSubmittingAttestations } from "../errors";
import { CommunityIdentifier, Phase, Address, ParticipantRole, Attestations, AttestationArray } from "../types";
import { getParticipantsEligibleForReward } from "./meetupValidation";

export async function advancePhase(cid: CommunityIdentifier) {
    let communityObject = await getCommunityObject(cid);
    let phase = communityObject.currentPhase;
    const phases: Phase[] = ["registering", "assigning", "attesting"];
    let nextPhase = phases[(phases.indexOf(phase) + 1) % 3];
    if (nextPhase === 'attesting') {
        // create a new ceremony such that people can already register for the next ceremony.
        initCeremony(cid);
    }
    communityObject.currentPhase = nextPhase;
    await putCommunityObject(cid, communityObject);
    return nextPhase;
}

async function initCeremony(cid: CommunityIdentifier) {
    let communityObject = await getCommunityObject(cid);
    let ceremonies = communityObject.ceremonies;
    ceremonies.push({
        participants: {},
        attestations: {},
        votes: {},
        participantsEligibleForReward: []
    })
    communityObject.ceremonies = ceremonies;
    await putCommunityObject(cid, communityObject);
}

export async function registerParticipant(cid: CommunityIdentifier, participant: Address, role: ParticipantRole) {
    let communityObject = await getCommunityObject(cid);
    if(communityObject.currentPhase === 'assigning') throw new WrongPhaseForRegistering();
    let ceremonies = communityObject.ceremonies;
    ceremonies[ceremonies.length - 1].participants[participant] = role;
    communityObject.ceremonies = ceremonies;
    await putCommunityObject(cid, communityObject);
}

export async function submitAttestations(cid: CommunityIdentifier, participant: Address, attestations: AttestationArray) {
    let communityObject = await getCommunityObject(cid);
    if(communityObject.currentPhase !== 'attesting') throw new WrongPhaseForSubmittingAttestations();
    if(!(participant in communityObject.participants)) throw new ParticipantNotRegistered();
    let ceremonies = communityObject.ceremonies;
    ceremonies[ceremonies.length - 2].attestations[participant] = attestations;
    communityObject.ceremonies = ceremonies;
    await putCommunityObject(cid, communityObject);
}

export async function claimRewards(cid: CommunityIdentifier) {
    let communityObject = await getCommunityObject(cid);
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
    await putCommunityObject(cid, communityObject);
}