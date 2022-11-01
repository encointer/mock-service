export type Address = string;
export type ParticipantRole =
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
export type AttestationArray = Array<Address>;
export type Attestations = { [key: Address]: AttestationArray };
export type Votes = { [key: Address]: number };

export type CommunityObject = {
    currentPhase: Phase;
    income: number;
    participants: {
        [key: Address]: number;
    };
    ceremonies: Array<{
        participants: {
            [key: Address]: ParticipantRole;
        };
        votes: Votes;
        attestations: Attestations;
        reputations: {[key: Address]: Reputation;}
    }>;
};
