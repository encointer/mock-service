import { KeyObject } from "crypto";

export function getParticipantsEligibleForReward(
    votes: object,
    attestations: object
) {
    let participants = Object.keys(votes);
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
    }
}

export const exportedForTesting = {
    getMajorityVote,
};
