import { ApiPromise } from "@polkadot/api";

export function getStorage(api: ApiPromise, key: string) {
    key = key.substring(2);
    let module = key.substring(0, 32);
    let method = key.substring(32, 64);
    let params = key.substring(64);
    try {
        console.log(modules[module][method].name);
        modules[module][method](api, params);
    } catch (e) {
        console.log(e);
        console.log("-----");
        console.log("ERROR");
        console.log(module);
        console.log(method);
        console.log("-----");
    }
}

function LEToNum(hex: string) {
    return Buffer.from(hex.substring(2), "hex").readUint32LE();
}

function stripHash(hex: string) {
    return hex.substring(32);
}

function parseCommunityIdentifier(api: ApiPromise, params: string) {
    let cid = api
        .createType(
            "EncointerPrimitivesCommunitiesCommunityIdentifier",
            "0x" + params.substring(0, 18)
        )
        .toHuman();
    let remaining = params.substring(18);
    return { cid, remaining };
}

function parseCindex(api: ApiPromise, params: string) {
    let cindex = LEToNum(
        api.createType("u32", "0x" + params.substring(0, 8)).toHex()
    );
    let remaining = params.substring(8);
    return { cindex, remaining };
}

function parseCommunityCeremony(api: ApiPromise, params: string) {
    let { cid, remaining: rest } = parseCommunityIdentifier(api, params);
    let { cindex, remaining } = parseCindex(api, rest);
    return { cid, cindex, remaining };
}

function parseAccountId(api: ApiPromise, params: string) {
    let accountId = api
        .createType("AccountId32", "0x" + params.substring(0, 64))
        .toHuman();
    let remaining = params.substring(64);
    return { accountId, remaining };
}

const modules: { [key: string]: { [key: string]: Function } } = {
    // System
    "26aa394eea5630e07c48ae0c9558cef7": {
        b99d880ec681799c0cf30e8886371da9: System_Account,
        bdc0bd303e9855813aa8a30d4efc5112: System_ExtrinsicCount,
        "34abf5cb34d6244378cddbf18e849d96": System_BlockWeight,
        a86da5a932684f199539836fcb8c886f: System_AllExtrinsicsLen,
        a44704b568d21667356a5a050c118746: System_BlockHash,
        df1daeb8986837f21cc5d17596bb78d1: System_ExtrinsicData,
        "02a5c1b19ab7a04f536c519aca4983ac": System_Number,
        "8a42f33323cb5ced3b44dd825fda9fcc": System_ParentHash,
        "99e7f93fc6a98f0874fd057f111c4d2d": System_Digest,
        "80d41e5e16056765bc8461851072c9d7": System_Events,
        "0a98fdbe9ce6c55837576c60c7af3850": System_EventCount,
        bb94e1c21adab714983cf06622e1de76: System_EventTopics,
        f9cce9c888469bb1a0dceaa129672ef8: System_LastRuntimeUpgrade,
        "5684a022a34dd8bfa2baaf44f172b710": System_UpgradedToU32RefCount,
        a7fd6c28836b9a28522dc924110cf439: System_UpgradedToTripleRefCount,
        ff553b5a9862a516939d82b3d3d8661a: System_ExecutionPhase,
    },
    // RandomnessCollectiveFlip
    bd2a529379475088d3e29a918cd47872: {
        "1a39ec767bd5269111e6492a1675702a":
            RandomnessCollectiveFlip_RandomMaterial,
    },
    // Timestamp
    f0c365c3cf59d671eb72da0e7a4113c4: {
        "9f1f0515f462cdcf84e0f1d6045dfcbb": Timestamp_Now,
        bbd108c4899964f707fdaffb82636065: Timestamp_DidUpdate,
    },
    // Sudo
    "5c0d1176a568c1f92944340dbfed9e9c": {
        "530ebca703c85910e7164cb7d1c9e47b": Sudo_Key,
    },
    // Balances
    c2261276cc9d1f8598ea4b6a74b15c2f: {
        "57c875e4cff74148e4628f264b974c80": Balances_TotalIssuance,
        b99d880ec681799c0cf30e8886371da9: Balances_Account,
        "218f26c73add634897550b4003b26bc6": Balances_Locks,
        "60c9ab7384f36f3de79a685fa22b4491": Balances_Reserves,
        "308ce9615de0775a82f8a94dc3d285a1": Balances_StorageVersion,
    },
    // TransactionPayment
    "3f1467a096bcd71a5b6a0c8155e20810": {
        "3f2edf3bdf381debe331ab7446addfdc":
            TransactionPayment_NextFeeMultiplier,
        "308ce9615de0775a82f8a94dc3d285a1": TransactionPayment_StorageVersion,
    },
    // AssetTxPayment
    "267ada16405529c2f7ef2727d71edbde": {},
    // Grandpa
    "5f9cc45b7a00c5899361e1c6099678dc": {
        f39a107f2d8d3854c9aba9b021f43d9c: Grandpa_State,
        "2ff65991b1c915dd6cc8d4825eacfcb4": Grandpa_PendingChange,
        "01d7818126bd9b3074803e91f4c91b59": Grandpa_NextForced,
        "7ddd013461b72c3004f9c0ca3faf9ebe": Grandpa_Stalled,
        "8a2d09463effcc78a22d75b9cb87dffc": Grandpa_CurrentSetId,
        d47cb8f5328af743ddfb361e7180e7fc: Grandpa_SetIdSession,
    },
    // Proxy
    "1809d78346727a0ef58c0fa03bafa323": {
        "1d885dcfb277f185f2d8e62a5f290c85": Proxy_Proxies,
        a20a5b2f6b19a88cf22a45d869c2bc1b: Proxy_Announcements,
    },
    // Scheduler
    "3db7a24cfdc9de785974746c14a99df9": {
        "1643f5419718219c95679ddd2d825574": Scheduler_Agenda,
        "891ad457bf4da54990fa84a2acb148a2": Scheduler_Lookup,
    },
    // EncointerScheduler
    "26dc3fa0a77526a8494180a4789f6883": {
        "4d03567cbac6404a5303f63909f6a2d8":
            EncointerScheduler_CurrentCeremonyIndex,
        b531216b22f0f23f5235be314d479d35: EncointerScheduler_LastCeremonyBlock,
        d9764401941df7f707a47ba7db64a6ea: EncointerScheduler_CurrentPhase,
        "3cedfb7f662d3fd6652b937dee0cbd06":
            EncointerScheduler_NextPhaseTimestamp,
        "2a7f6eb65c9144427bbe5fb524080d70": EncointerScheduler_PhaseDurations,
    },
    // EncointerCeremonies
    a7d291a8132b2cc65c41da45f4de7679: {
        "1b6b4f4f01f5df2248ac9332974a4273":
            EncointerCeremonies_BurnedBootstrapperNewbieTickets,
        "79ec0813348ee99c3ac826fed223b847":
            EncointerCeremonies_BootstrapperRegistry,
        "7f0adfa903215393e9b5557e5aa6fb64":
            EncointerCeremonies_BootstrapperIndex,
        a44c3a625c24f2b24bdef0e2d56da6d0: EncointerCeremonies_BootstrapperCount,
        "4eafc427de86f208df3b178fe79d47e4":
            EncointerCeremonies_ReputableRegistry,
        bc2f6a38e501a7f8b98b8ea2ee4f735b: EncointerCeremonies_ReputableIndex,
        "6ba96d23b346bf8f4f23cf9b2be90b1c": EncointerCeremonies_ReputableCount,
        "9ac1b471648c29a2edc5ee7424651b24":
            EncointerCeremonies_EndorseeRegistry,
        ecb94723afdfc49e593570aa419d1241: EncointerCeremonies_EndorseeIndex,
        d64065520cca04a517da597c8458cdf0: EncointerCeremonies_EndorseeCount,
        "27fcc505f9f2f75363adfed14f8e3f44": EncointerCeremonies_NewbieRegistry,
        "2ab63020a701ac8bacecd83d91fb1af6": EncointerCeremonies_NewbieIndex,
        "51dd50a514b4dec8e344f8f7f4f51171": EncointerCeremonies_NewbieCount,
        "90846fb531cbbf3ffc6ca1c9c0201beb":
            EncointerCeremonies_AssignmentCounts,
        "29d2cd3dc23c8f16a6e4ffaa9ad1f9cf": EncointerCeremonies_Assignments,
        "2a1d07bbb100ca14e56bd0804262911a":
            EncointerCeremonies_ParticipantReputation,
        ea19361dcbb6f5212955f453fc346dab: EncointerCeremonies_Endorsees,
        f4393b85eac8d7c18f60dc098f4b7464: EncointerCeremonies_EndorseesCount,
        "3d0a4546eaac23dd36cdccac770ea247": EncointerCeremonies_MeetupCount,
        a9da909ff34c290eb0d55873949258b2:
            EncointerCeremonies_AttestationRegistry,
        f095cc95279ea7aa42da1a699074a0fe: EncointerCeremonies_AttestationIndex,
        d1df70899fe5fc5d1b6f2fe60a4e8241: EncointerCeremonies_AttestationCount,
        "502c24e19a326404a8142b87f5ad101f":
            EncointerCeremonies_MeetupParticipantCountVote,
        "352722e2c08a2f281f21247cbac030f0": EncointerCeremonies_CeremonyReward,
        "5badfe0f2fbf3bdc834d3f4942c9a198":
            EncointerCeremonies_LocationTolerance,
        "1cd1a1157f8ecfa77f4b328693671260": EncointerCeremonies_TimeTolerance,
        f80f22519a4d3f9ab07d845624b01e1b: EncointerCeremonies_IssuedRewards,
        "3d367c0032be4bb40cc7ab34aeda32ae":
            EncointerCeremonies_InactivityCounters,
        faa6d24e2eac60688f05caa165a83643: EncointerCeremonies_InactivityTimeout,
        "5c03954ec993845da1c7ff36c91390da":
            EncointerCeremonies_EndorsementTicketsPerBootstrapper,
        "5b9f3fcf38b37a818f89b07b85604d63":
            EncointerCeremonies_ReputationLifetime,
        "55736ceb9d103a26198891982974f8fe":
            EncointerCeremonies_MeetupTimeOffset,
    },
    // EncointerCommunities
    "385e522434d0fcd4d6f7ac9825fc853e": {
        "09ddb29e2135d0bb2fcf29ccdc228db4":
            EncointerCommunities_CommunityIdentifiersByGeohash,
        db2bb9522a3355121031ac01f0c7a80e: EncointerCommunities_Locations,
        c02befc6a61949c466271d825e069487: EncointerCommunities_Bootstrappers,
        c146a0b15c1cb180ee0017da80ac43cc:
            EncointerCommunities_CommunityIdentifiers,
        "2fcbb14bacf659b59d4332845a5d7097":
            EncointerCommunities_CommunityMetadata,
        "24a811bb1e5ebd8cb51dca6fc01cfcf4": EncointerCommunities_NominalIncome,
        b57b711155e19a81a6cc0cb3d34bacc0:
            EncointerCommunities_MinSolarTripTimeS,
        "9324b6d2ba2832f145bd82d7272f828a": EncointerCommunities_MaxSpeedMps,
    },
    // EncointerBalances
    da1c278283c2287f6c7474ab9b82f51b: {
        "57c875e4cff74148e4628f264b974c80": EncointerBalances_TotalIssuance,
        "4ea8ea0c01faa42b6eb344a85c47b387": EncointerBalances_Balance,
        "6fceb44b6fa28dbef2a4a5fc9eb774ae": EncointerBalances_DemurragePerBlock,
        "40e616be63276ad8307aa70e63acc0d7":
            EncointerBalances_FeeConversionFactor,
    },
    // EncointerBazaar
    "19891a8d19ea8a5c38a9546956ac70ee": {
        "89c93dc3a7e6426ec56d6b9f947fd40d": EncointerBazaar_BusinessRegistry,
        "96bc3ba1b2295380bb15e6e446bc228d": EncointerBazaar_OfferingRegistry,
    },
};

function System_Account(api: ApiPromise, params: string) {
    // TODO
}
function System_ExtrinsicCount(api: ApiPromise, params: string) {
    // TODO
}
function System_BlockWeight(api: ApiPromise, params: string) {
    // TODO
}
function System_AllExtrinsicsLen(api: ApiPromise, params: string) {
    // TODO
}
function System_BlockHash(api: ApiPromise, params: string) {
    // TODO
}
function System_ExtrinsicData(api: ApiPromise, params: string) {
    // TODO
}
function System_Number(api: ApiPromise, params: string) {
    // TODO
}
function System_ParentHash(api: ApiPromise, params: string) {
    // TODO
}
function System_Digest(api: ApiPromise, params: string) {
    // TODO
}
function System_Events(api: ApiPromise, params: string) {
    // TODO
}
function System_EventCount(api: ApiPromise, params: string) {
    // TODO
}
function System_EventTopics(api: ApiPromise, params: string) {
    // TODO
}
function System_LastRuntimeUpgrade(api: ApiPromise, params: string) {
    // TODO
}
function System_UpgradedToU32RefCount(api: ApiPromise, params: string) {
    // TODO
}
function System_UpgradedToTripleRefCount(api: ApiPromise, params: string) {
    // TODO
}
function System_ExecutionPhase(api: ApiPromise, params: string) {
    // TODO
}
function RandomnessCollectiveFlip_RandomMaterial(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function Timestamp_Now(api: ApiPromise, params: string) {
    // TODO
}
function Timestamp_DidUpdate(api: ApiPromise, params: string) {
    // TODO
}
function Sudo_Key(api: ApiPromise, params: string) {
    // TODO
}
function Balances_TotalIssuance(api: ApiPromise, params: string) {
    // TODO
}
function Balances_Account(api: ApiPromise, params: string) {
    // TODO
}
function Balances_Locks(api: ApiPromise, params: string) {
    // TODO
}
function Balances_Reserves(api: ApiPromise, params: string) {
    // TODO
}
function Balances_StorageVersion(api: ApiPromise, params: string) {
    // TODO
}
function TransactionPayment_NextFeeMultiplier(api: ApiPromise, params: string) {
    // TODO
}
function TransactionPayment_StorageVersion(api: ApiPromise, params: string) {
    // TODO
}
function Grandpa_State(api: ApiPromise, params: string) {
    // TODO
}
function Grandpa_PendingChange(api: ApiPromise, params: string) {
    // TODO
}
function Grandpa_NextForced(api: ApiPromise, params: string) {
    // TODO
}
function Grandpa_Stalled(api: ApiPromise, params: string) {
    // TODO
}
function Grandpa_CurrentSetId(api: ApiPromise, params: string) {
    // TODO
}
function Grandpa_SetIdSession(api: ApiPromise, params: string) {
    // TODO
}
function Proxy_Proxies(api: ApiPromise, params: string) {
    // TODO
}
function Proxy_Announcements(api: ApiPromise, params: string) {
    // TODO
}
function Scheduler_Agenda(api: ApiPromise, params: string) {
    // TODO
}
function Scheduler_Lookup(api: ApiPromise, params: string) {
    // TODO
}
function EncointerScheduler_CurrentCeremonyIndex(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerScheduler_LastCeremonyBlock(api: ApiPromise, params: string) {
    // TODO
}
function EncointerScheduler_CurrentPhase(api: ApiPromise, params: string) {
    // TODO
}
function EncointerScheduler_NextPhaseTimestamp(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerScheduler_PhaseDurations(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_BurnedBootstrapperNewbieTickets(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerCeremonies_BootstrapperRegistry(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerCeremonies_BootstrapperIndex(
    api: ApiPromise,
    params: string
) {
    let {
        cid,
        cindex,
        remaining: rest,
    } = parseCommunityCeremony(api, stripHash(params));
    let { accountId, remaining } = parseAccountId(api, stripHash(rest));
    console.log(cid, cindex, accountId, remaining);
    // TODO
}
function EncointerCeremonies_BootstrapperCount(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerCeremonies_ReputableRegistry(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerCeremonies_ReputableIndex(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_ReputableCount(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_EndorseeRegistry(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_EndorseeIndex(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_EndorseeCount(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_NewbieRegistry(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_NewbieIndex(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_NewbieCount(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_AssignmentCounts(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_Assignments(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_ParticipantReputation(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerCeremonies_Endorsees(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_EndorseesCount(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_MeetupCount(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_AttestationRegistry(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerCeremonies_AttestationIndex(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_AttestationCount(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_MeetupParticipantCountVote(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerCeremonies_CeremonyReward(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_LocationTolerance(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerCeremonies_TimeTolerance(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_IssuedRewards(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCeremonies_InactivityCounters(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerCeremonies_InactivityTimeout(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerCeremonies_EndorsementTicketsPerBootstrapper(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerCeremonies_ReputationLifetime(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerCeremonies_MeetupTimeOffset(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCommunities_CommunityIdentifiersByGeohash(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerCommunities_Locations(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCommunities_Bootstrappers(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCommunities_CommunityIdentifiers(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerCommunities_CommunityMetadata(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerCommunities_NominalIncome(api: ApiPromise, params: string) {
    // TODO
}
function EncointerCommunities_MinSolarTripTimeS(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerCommunities_MaxSpeedMps(api: ApiPromise, params: string) {
    // TODO
}
function EncointerBalances_TotalIssuance(api: ApiPromise, params: string) {
    // TODO
}
function EncointerBalances_Balance(api: ApiPromise, params: string) {
    // TODO
}
function EncointerBalances_DemurragePerBlock(api: ApiPromise, params: string) {
    // TODO
}
function EncointerBalances_FeeConversionFactor(
    api: ApiPromise,
    params: string
) {
    // TODO
}
function EncointerBazaar_BusinessRegistry(api: ApiPromise, params: string) {
    // TODO
}
function EncointerBazaar_OfferingRegistry(api: ApiPromise, params: string) {
    // TODO
}
