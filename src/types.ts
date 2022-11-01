import { WrongPhaseForClaimingRewards } from "./errors";

export type Address = string;
export type ParticipantType =
    | "Bootstrapper"
    | "Reputable"
    | "Newbie"
    | "Endorsee";
export type Reputation =
    | "Unverified"
    | "UnverifiedReputable"
    | "VerifiedUnlinked"
    | "VerifiedLinked";
export type Phase = "registering" | "assigning" | "attesting";
export type CommunityIdentifier = string;
export type CommunityIdentifierObject = { geohash: string; digest: string };
export type AttestationArray = Array<Address>;
export type Attestations = { [key: Address]: AttestationArray };
export type Votes = { [key: Address]: number };
export type AllCommunities = { [key: string]: CommunityObject };

export type CommunityObject = {
    currentPhase: Phase;
    income: number;
    participants: {
        [key: Address]: number;
    };
    ceremonies: Array<{
        participants: {
            [key: Address]: ParticipantType;
        };
        votes: Votes;
        attestations: Attestations;
        reputations: { [key: Address]: Reputation };
    }>;
};

export type ReputationRpcItem = [
    number,
    { communityIdentifier: CommunityIdentifierObject; reputation: Reputation }
];

export type BalanceRpcItem = [
    CommunityIdentifierObject,
    { principal: number; lastUpdate: number }
];

export type AggregatedAccountData = {
    global: {
        ceremonyPhase: Phase;
        ceremonyIndex: number;
    };
    personal: null | {
        participantType: ParticipantType;
        meetupIndex: number;
        meetupLocationIndex: number;
        meetupTime: null | number;
        meetupRegistry: Address[];
    };
};
