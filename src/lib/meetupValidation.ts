import { NoMajorityVoteFound } from "./errors";

export function getParticipantsEligibleForReward(
    votes: { [key: string]: number },
    attestations: { [key: string]: Array<string> }
) {
    let participants = Object.keys(votes);

    try {
        let majorityVote = getMajorityVote(Object.values(votes));

        // exclude participants with wrong vote
        participants = participants.filter((p) => votes[p] == majorityVote);

        // simplified version of the attestation algorithm
        participants = participants.filter(
            (p) =>
                getNumIncomingAttestations(attestations, p) > majorityVote - 2
        );

        return participants;
    } catch (e) {
        return [];
    }
}

function getNumIncomingAttestations(
    attestations: { [key: string]: Array<string> },
    participant: string
) {
    let numAttestations = 0;
    for (let p in attestations) {
        if (p === participant) continue;
        if (attestations[p].includes(participant)) numAttestations++;
    }
    return numAttestations;
}

function getMajorityVote(votes: Array<number>) {
    let counts: { [key: number]: number } = {};
    for (const vote of votes) {
        counts[vote] = counts[vote] ? counts[vote] + 1 : 1;
    }

    let voteCounts = [];
    for (let key in counts) voteCounts.push([parseInt(key), counts[key]]);
    voteCounts = voteCounts.sort((a, b) => b[1] - a[1]);

    let vote = voteCounts[0][0];
    let numVotes = voteCounts[0][1];
    if (numVotes > votes.length / 2) {
        return vote;
    } else {
        throw NoMajorityVoteFound;
    }
}

export const exportedForTesting = {
    getMajorityVote,
    getNumIncomingAttestations,
};
