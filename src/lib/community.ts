import { getCommunityObject, putCommunityObject } from "../db";
import { CommunityIdentifier, Phase } from "../types";

export async function advancePhase(cid: CommunityIdentifier) {
    let communityObject = await getCommunityObject(cid);
    let phase = communityObject.currentPhase;
    const phases: Phase[] = ["registering", "assigning", "attesting"];
    let nextPhase = phases[(phases.indexOf(phase) + 1) % 3];
    communityObject.currentPhase = nextPhase;
    await putCommunityObject(cid, communityObject);
    return nextPhase;
}
