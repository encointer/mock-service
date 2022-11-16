import { getCommunityObject } from "./db";
import { cidToString } from "./lib/util";
import { ParticipantType } from "./types";

export async function getParticipantIndex(params: any[], type: ParticipantType) {
    try {
        let communityObject = await getCommunityObject(
            cidToString(params[0][0])
        );
        let ceremonyObject = communityObject.ceremonies[params[0][1]];
        let participants = ceremonyObject.participants;
        let index = Object.entries(participants)
            .filter((e) => e[1] == type)
            .map(e => e[0])
            .indexOf(params[1]);
        // if not present, indexOf returns -1, so -1 + 1 = 0, which is the expected return value for a non-present key in subst
        return index + 1;
    } catch {
        return 0;
    }
}

export async function getNumParticipants(params: any[], type: ParticipantType) {
    try {
        let communityObject = await getCommunityObject(
            cidToString(params[0])
        );
        let ceremonyObject = communityObject.ceremonies[params[1]];
        let participants = ceremonyObject.participants;
        return Object.entries(participants)
            .filter((e) => e[1] == type)
            .length
    } catch {
        return 0;
    }
}
