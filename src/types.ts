export type Address = string;
export type ParticipantRole = "bootstrapper" | "reputable" | "newbie" | "endorsee";
export type Phase = 'registering' | 'assigning' | 'attesting';
export type CommunityIdentifier = string;

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
        votes: {
            [key: Address]: number;
        };
        attestations: {
            [key: Address]: Address;
        };
    }>;
};
