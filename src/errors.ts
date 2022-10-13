export class CommunityDoesNotExist extends Error {
    message = "Community does not exitst.";
}
export class WrongPhaseForRegistering extends Error {
    message = "Wrong phase for registering.";
}

export class WrongPhaseForSubmittingAttestations extends Error {
    message = "Wrong phase for submitting attestations.";
}


export class WrongPhaseForClaimingRewards extends Error {
    message = "Wrong phase for claiming rewards.";
}


export class ParticipantNotRegistered extends Error {
    message = "Participant is not registered.";
}

export class InsufficientBalance extends Error {
    message = "Insufficient balance";
}

export class CommuniyAlreadyExists extends Error {
    message = "Commmunity already exists";
}
