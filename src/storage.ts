import { ApiPromise } from "@polkadot/api";
import { systemAccountStorageSubscriptionHash } from "./consts";
import { getAllCommunitiyObjects, getCommunityObject } from "./db";
import {
    cidToString,
    getRpcSubscriptionHash,
    maybeHexToString,
    parseCid,
} from "./lib/util";
import { getNumParticipants, getParticipantIndex } from "./storageHelpers";
import { Scenario } from "./types";
import util from "util";

let nonce00 = 0;
export async function getStorage(api: ApiPromise, key: string) {
    key = key.substring(2);
    let module = key.substring(0, 32);
    let method = key.substring(32, 64);
    let params = key.substring(64);
    let methodObject = modules[module][method];
    console.log("Getting mock storage: " + methodObject.call.name);
    console.log("Key: " + key);
    console.log("Params:");
    console.log(
        util.inspect(decodeParams(api, methodObject.paramTypes, params), {
            showHidden: false,
            depth: null,
            colors: true,
        })
    );

    let result = await methodObject.call(
        decodeParams(api, methodObject.paramTypes, params)
    );
    return {
        result: api.createType(methodObject.returnType, result).toHex(true),
        subscriptionHash:
            methodObject.call.name == "System_Account"
                ? systemAccountStorageSubscriptionHash
                : getRpcSubscriptionHash(),
    };
}

export function decodeParams(
    api: ApiPromise,
    paramTypes: string[],
    params: string
): any[] {
    let typeString = `(${paramTypes.join(", ")})`;
    let tuple = [];

    for (let param of paramTypes) {
        params = params.substring(32);
        let l = api.createType(param).encodedLength * 2;
        tuple.push("0x" + params.substring(0, l));
        params = params.substring(l);
    }

    if (paramTypes.length === 1)
        return [api.createType(paramTypes[0], tuple[0]).toHuman()];

    let result: any[] = JSON.parse(
        api.createType(typeString, tuple).toString()
    );
    return result;
}

const modules: {
    [key: string]: {
        [key: string]: {
            call: Function;
            paramTypes: string[];
            returnType: string;
        };
    };
} = {
    // System
    "26aa394eea5630e07c48ae0c9558cef7": {
        b99d880ec681799c0cf30e8886371da9: {
            call: System_Account,
            paramTypes: ["AccountId32"],
            returnType: "FrameSystemAccountInfo",
        },
        bdc0bd303e9855813aa8a30d4efc5112: {
            call: System_ExtrinsicCount,
            paramTypes: [],
            returnType: "u32",
        },
        "34abf5cb34d6244378cddbf18e849d96": {
            call: System_BlockWeight,
            paramTypes: [],
            returnType: "FrameSupportWeightsPerDispatchClassU64",
        },
        a86da5a932684f199539836fcb8c886f: {
            call: System_AllExtrinsicsLen,
            paramTypes: [],
            returnType: "u32",
        },
        a44704b568d21667356a5a050c118746: {
            call: System_BlockHash,
            paramTypes: ["u32"],
            returnType: "H256",
        },
        df1daeb8986837f21cc5d17596bb78d1: {
            call: System_ExtrinsicData,
            paramTypes: ["u32"],
            returnType: "Bytes",
        },
        "02a5c1b19ab7a04f536c519aca4983ac": {
            call: System_Number,
            paramTypes: [],
            returnType: "u32",
        },
        "8a42f33323cb5ced3b44dd825fda9fcc": {
            call: System_ParentHash,
            paramTypes: [],
            returnType: "H256",
        },
        "99e7f93fc6a98f0874fd057f111c4d2d": {
            call: System_Digest,
            paramTypes: [],
            returnType: "SpRuntimeDigest",
        },
        "80d41e5e16056765bc8461851072c9d7": {
            call: System_Events,
            paramTypes: [],
            returnType: "Vec<FrameSystemEventRecord>",
        },
        "0a98fdbe9ce6c55837576c60c7af3850": {
            call: System_EventCount,
            paramTypes: [],
            returnType: "u32",
        },
        bb94e1c21adab714983cf06622e1de76: {
            call: System_EventTopics,
            paramTypes: ["H256"],
            returnType: "Vec<(u32,u32)>",
        },
        f9cce9c888469bb1a0dceaa129672ef8: {
            call: System_LastRuntimeUpgrade,
            paramTypes: [],
            returnType: "FrameSystemLastRuntimeUpgradeInfo",
        },
        "5684a022a34dd8bfa2baaf44f172b710": {
            call: System_UpgradedToU32RefCount,
            paramTypes: [],
            returnType: "bool",
        },
        a7fd6c28836b9a28522dc924110cf439: {
            call: System_UpgradedToTripleRefCount,
            paramTypes: [],
            returnType: "bool",
        },
        ff553b5a9862a516939d82b3d3d8661a: {
            call: System_ExecutionPhase,
            paramTypes: [],
            returnType: "FrameSystemPhase",
        },
    },
    // RandomnessCollectiveFlip
    bd2a529379475088d3e29a918cd47872: {
        "1a39ec767bd5269111e6492a1675702a": {
            call: RandomnessCollectiveFlip_RandomMaterial,
            paramTypes: [],
            returnType: "Vec<H256>",
        },
    },
    // Timestamp
    f0c365c3cf59d671eb72da0e7a4113c4: {
        "9f1f0515f462cdcf84e0f1d6045dfcbb": {
            call: Timestamp_Now,
            paramTypes: [],
            returnType: "u64",
        },
        bbd108c4899964f707fdaffb82636065: {
            call: Timestamp_DidUpdate,
            paramTypes: [],
            returnType: "bool",
        },
    },
    // Sudo
    "5c0d1176a568c1f92944340dbfed9e9c": {
        "530ebca703c85910e7164cb7d1c9e47b": {
            call: Sudo_Key,
            paramTypes: [],
            returnType: "AccountId32",
        },
    },
    // Balances
    c2261276cc9d1f8598ea4b6a74b15c2f: {
        "57c875e4cff74148e4628f264b974c80": {
            call: Balances_TotalIssuance,
            paramTypes: [],
            returnType: "u128",
        },
        b99d880ec681799c0cf30e8886371da9: {
            call: Balances_Account,
            paramTypes: ["AccountId32"],
            returnType: "PalletBalancesAccountData",
        },
        "218f26c73add634897550b4003b26bc6": {
            call: Balances_Locks,
            paramTypes: ["AccountId32"],
            returnType: "Vec<PalletBalancesBalanceLock>",
        },
        "60c9ab7384f36f3de79a685fa22b4491": {
            call: Balances_Reserves,
            paramTypes: ["AccountId32"],
            returnType: "Vec<PalletBalancesReserveData>",
        },
        "308ce9615de0775a82f8a94dc3d285a1": {
            call: Balances_StorageVersion,
            paramTypes: [],
            returnType: "PalletBalancesReleases",
        },
    },
    // TransactionPayment
    "3f1467a096bcd71a5b6a0c8155e20810": {
        "3f2edf3bdf381debe331ab7446addfdc": {
            call: TransactionPayment_NextFeeMultiplier,
            paramTypes: [],
            returnType: "u128",
        },
        "308ce9615de0775a82f8a94dc3d285a1": {
            call: TransactionPayment_StorageVersion,
            paramTypes: [],
            returnType: "PalletTransactionPaymentReleases",
        },
    },
    // AssetTxPayment
    "267ada16405529c2f7ef2727d71edbde": {},
    // Grandpa
    "5f9cc45b7a00c5899361e1c6099678dc": {
        f39a107f2d8d3854c9aba9b021f43d9c: {
            call: Grandpa_State,
            paramTypes: [],
            returnType: "PalletGrandpaStoredState",
        },
        "2ff65991b1c915dd6cc8d4825eacfcb4": {
            call: Grandpa_PendingChange,
            paramTypes: [],
            returnType: "PalletGrandpaStoredPendingChange",
        },
        "01d7818126bd9b3074803e91f4c91b59": {
            call: Grandpa_NextForced,
            paramTypes: [],
            returnType: "u32",
        },
        "7ddd013461b72c3004f9c0ca3faf9ebe": {
            call: Grandpa_Stalled,
            paramTypes: [],
            returnType: "u32,u32",
        },
        "8a2d09463effcc78a22d75b9cb87dffc": {
            call: Grandpa_CurrentSetId,
            paramTypes: [],
            returnType: "u64",
        },
        d47cb8f5328af743ddfb361e7180e7fc: {
            call: Grandpa_SetIdSession,
            paramTypes: ["u64"],
            returnType: "u32",
        },
    },
    // Proxy
    "1809d78346727a0ef58c0fa03bafa323": {
        "1d885dcfb277f185f2d8e62a5f290c85": {
            call: Proxy_Proxies,
            paramTypes: ["AccountId32"],
            returnType: "Vec<PalletProxyProxyDefinition>,u128",
        },
        a20a5b2f6b19a88cf22a45d869c2bc1b: {
            call: Proxy_Announcements,
            paramTypes: ["AccountId32"],
            returnType: "Vec<PalletProxyAnnouncement>,u128",
        },
    },
    // Scheduler
    "3db7a24cfdc9de785974746c14a99df9": {
        "1643f5419718219c95679ddd2d825574": {
            call: Scheduler_Agenda,
            paramTypes: ["u32"],
            returnType: "Vec<Option<PalletSchedulerScheduledV3>>",
        },
        "891ad457bf4da54990fa84a2acb148a2": {
            call: Scheduler_Lookup,
            paramTypes: ["Bytes"],
            returnType: "u32,u32",
        },
    },
    // EncointerScheduler
    "26dc3fa0a77526a8494180a4789f6883": {
        "4d03567cbac6404a5303f63909f6a2d8": {
            call: EncointerScheduler_CurrentCeremonyIndex,
            paramTypes: [],
            returnType: "u32",
        },
        b531216b22f0f23f5235be314d479d35: {
            call: EncointerScheduler_LastCeremonyBlock,
            paramTypes: [],
            returnType: "u32",
        },
        d9764401941df7f707a47ba7db64a6ea: {
            call: EncointerScheduler_CurrentPhase,
            paramTypes: [],
            returnType: "EncointerPrimitivesSchedulerCeremonyPhaseType",
        },
        "3cedfb7f662d3fd6652b937dee0cbd06": {
            call: EncointerScheduler_NextPhaseTimestamp,
            paramTypes: [],
            returnType: "u64",
        },
        "2a7f6eb65c9144427bbe5fb524080d70": {
            call: EncointerScheduler_PhaseDurations,
            paramTypes: ["EncointerPrimitivesSchedulerCeremonyPhaseType"],
            returnType: "u64",
        },
    },
    // EncointerCeremonies
    a7d291a8132b2cc65c41da45f4de7679: {
        "1b6b4f4f01f5df2248ac9332974a4273": {
            call: EncointerCeremonies_BurnedBootstrapperNewbieTickets,
            paramTypes: [
                "EncointerPrimitivesCommunitiesCommunityIdentifier",
                "AccountId32",
            ],
            returnType: "u8",
        },
        "79ec0813348ee99c3ac826fed223b847": {
            call: EncointerCeremonies_BootstrapperRegistry,
            paramTypes: [
                "(EncointerPrimitivesCommunitiesCommunityIdentifier,u32)",
                "u64",
            ],
            returnType: "AccountId32",
        },
        "7f0adfa903215393e9b5557e5aa6fb64": {
            call: EncointerCeremonies_BootstrapperIndex,
            paramTypes: [
                "(EncointerPrimitivesCommunitiesCommunityIdentifier,u32)",
                "AccountId32",
            ],
            returnType: "u64",
        },
        a44c3a625c24f2b24bdef0e2d56da6d0: {
            call: EncointerCeremonies_BootstrapperCount,
            paramTypes: [
                "EncointerPrimitivesCommunitiesCommunityIdentifier",
                "u32",
            ],
            returnType: "u64",
        },
        "4eafc427de86f208df3b178fe79d47e4": {
            call: EncointerCeremonies_ReputableRegistry,
            paramTypes: [
                "(EncointerPrimitivesCommunitiesCommunityIdentifier,u32)",
                "u64",
            ],
            returnType: "AccountId32",
        },
        bc2f6a38e501a7f8b98b8ea2ee4f735b: {
            call: EncointerCeremonies_ReputableIndex,
            paramTypes: [
                "(EncointerPrimitivesCommunitiesCommunityIdentifier,u32)",
                "AccountId32",
            ],
            returnType: "u64",
        },
        "6ba96d23b346bf8f4f23cf9b2be90b1c": {
            call: EncointerCeremonies_ReputableCount,
            paramTypes: [
                "EncointerPrimitivesCommunitiesCommunityIdentifier",
                "u32",
            ],
            returnType: "u64",
        },
        "9ac1b471648c29a2edc5ee7424651b24": {
            call: EncointerCeremonies_EndorseeRegistry,
            paramTypes: [
                "(EncointerPrimitivesCommunitiesCommunityIdentifier,u32)",
                "u64",
            ],
            returnType: "AccountId32",
        },
        ecb94723afdfc49e593570aa419d1241: {
            call: EncointerCeremonies_EndorseeIndex,
            paramTypes: [
                "(EncointerPrimitivesCommunitiesCommunityIdentifier,u32)",
                "AccountId32",
            ],
            returnType: "u64",
        },
        d64065520cca04a517da597c8458cdf0: {
            call: EncointerCeremonies_EndorseeCount,
            paramTypes: [
                "EncointerPrimitivesCommunitiesCommunityIdentifier",
                "u32",
            ],
            returnType: "u64",
        },
        "27fcc505f9f2f75363adfed14f8e3f44": {
            call: EncointerCeremonies_NewbieRegistry,
            paramTypes: [
                "(EncointerPrimitivesCommunitiesCommunityIdentifier,u32)",
                "u64",
            ],
            returnType: "AccountId32",
        },
        "2ab63020a701ac8bacecd83d91fb1af6": {
            call: EncointerCeremonies_NewbieIndex,
            paramTypes: [
                "(EncointerPrimitivesCommunitiesCommunityIdentifier,u32)",
                "AccountId32",
            ],
            returnType: "u64",
        },
        "51dd50a514b4dec8e344f8f7f4f51171": {
            call: EncointerCeremonies_NewbieCount,
            paramTypes: [
                "EncointerPrimitivesCommunitiesCommunityIdentifier",
                "u32",
            ],
            returnType: "u64",
        },
        "90846fb531cbbf3ffc6ca1c9c0201beb": {
            call: EncointerCeremonies_AssignmentCounts,
            paramTypes: [
                "EncointerPrimitivesCommunitiesCommunityIdentifier",
                "u32",
            ],
            returnType: "EncointerPrimitivesCeremoniesAssignmentCount",
        },
        "29d2cd3dc23c8f16a6e4ffaa9ad1f9cf": {
            call: EncointerCeremonies_Assignments,
            paramTypes: [
                "EncointerPrimitivesCommunitiesCommunityIdentifier",
                "u32",
            ],
            returnType: "EncointerPrimitivesCeremoniesAssignment",
        },
        "2a1d07bbb100ca14e56bd0804262911a": {
            call: EncointerCeremonies_ParticipantReputation,
            paramTypes: [
                "(EncointerPrimitivesCommunitiesCommunityIdentifier,u32)",
                "AccountId32",
            ],
            returnType: "EncointerPrimitivesCeremoniesReputation",
        },
        ea19361dcbb6f5212955f453fc346dab: {
            call: EncointerCeremonies_Endorsees,
            paramTypes: [
                "(EncointerPrimitivesCommunitiesCommunityIdentifier,u32)",
                "AccountId32",
            ],
            returnType: "",
        },
        f4393b85eac8d7c18f60dc098f4b7464: {
            call: EncointerCeremonies_EndorseesCount,
            paramTypes: [
                "EncointerPrimitivesCommunitiesCommunityIdentifier",
                "u32",
            ],
            returnType: "u64",
        },
        "3d0a4546eaac23dd36cdccac770ea247": {
            call: EncointerCeremonies_MeetupCount,
            paramTypes: [
                "EncointerPrimitivesCommunitiesCommunityIdentifier",
                "u32",
            ],
            returnType: "u64",
        },
        a9da909ff34c290eb0d55873949258b2: {
            call: EncointerCeremonies_AttestationRegistry,
            paramTypes: [
                "(EncointerPrimitivesCommunitiesCommunityIdentifier,u32)",
                "u64",
            ],
            returnType: "Vec<AccountId32>",
        },
        f095cc95279ea7aa42da1a699074a0fe: {
            call: EncointerCeremonies_AttestationIndex,
            paramTypes: [
                "(EncointerPrimitivesCommunitiesCommunityIdentifier,u32)",
                "AccountId32",
            ],
            returnType: "u64",
        },
        d1df70899fe5fc5d1b6f2fe60a4e8241: {
            call: EncointerCeremonies_AttestationCount,
            paramTypes: [
                "EncointerPrimitivesCommunitiesCommunityIdentifier",
                "u32",
            ],
            returnType: "u64",
        },
        "502c24e19a326404a8142b87f5ad101f": {
            call: EncointerCeremonies_MeetupParticipantCountVote,
            paramTypes: [
                "(EncointerPrimitivesCommunitiesCommunityIdentifier,u32)",
                "AccountId32",
            ],
            returnType: "u32",
        },
        "352722e2c08a2f281f21247cbac030f0": {
            call: EncointerCeremonies_CeremonyReward,
            paramTypes: [],
            returnType: "SubstrateFixedFixedI128",
        },
        "5badfe0f2fbf3bdc834d3f4942c9a198": {
            call: EncointerCeremonies_LocationTolerance,
            paramTypes: [],
            returnType: "u32",
        },
        "1cd1a1157f8ecfa77f4b328693671260": {
            call: EncointerCeremonies_TimeTolerance,
            paramTypes: [],
            returnType: "u64",
        },
        f80f22519a4d3f9ab07d845624b01e1b: {
            call: EncointerCeremonies_IssuedRewards,
            paramTypes: [
                "(EncointerPrimitivesCommunitiesCommunityIdentifier,u32)",
                "u64",
            ],
            returnType: "",
        },
        "3d367c0032be4bb40cc7ab34aeda32ae": {
            call: EncointerCeremonies_InactivityCounters,
            paramTypes: ["EncointerPrimitivesCommunitiesCommunityIdentifier"],
            returnType: "u32",
        },
        faa6d24e2eac60688f05caa165a83643: {
            call: EncointerCeremonies_InactivityTimeout,
            paramTypes: [],
            returnType: "u32",
        },
        "5c03954ec993845da1c7ff36c91390da": {
            call: EncointerCeremonies_EndorsementTicketsPerBootstrapper,
            paramTypes: [],
            returnType: "u8",
        },
        "5b9f3fcf38b37a818f89b07b85604d63": {
            call: EncointerCeremonies_ReputationLifetime,
            paramTypes: [],
            returnType: "u32",
        },
        "55736ceb9d103a26198891982974f8fe": {
            call: EncointerCeremonies_MeetupTimeOffset,
            paramTypes: [],
            returnType: "i32",
        },
    },
    // EncointerCommunities
    "385e522434d0fcd4d6f7ac9825fc853e": {
        "09ddb29e2135d0bb2fcf29ccdc228db4": {
            call: EncointerCommunities_CommunityIdentifiersByGeohash,
            paramTypes: ["GeoHash"],
            returnType:
                "Vec<EncointerPrimitivesCommunitiesCommunityIdentifier>",
        },
        db2bb9522a3355121031ac01f0c7a80e: {
            call: EncointerCommunities_Locations,
            paramTypes: [
                "EncointerPrimitivesCommunitiesCommunityIdentifier",
                "GeoHash",
            ],
            returnType: "Vec<EncointerPrimitivesCommunitiesLocation>",
        },
        c02befc6a61949c466271d825e069487: {
            call: EncointerCommunities_Bootstrappers,
            paramTypes: ["EncointerPrimitivesCommunitiesCommunityIdentifier"],
            returnType: "Vec<AccountId32>",
        },
        c146a0b15c1cb180ee0017da80ac43cc: {
            call: EncointerCommunities_CommunityIdentifiers,
            paramTypes: [],
            returnType:
                "Vec<EncointerPrimitivesCommunitiesCommunityIdentifier>",
        },
        "2fcbb14bacf659b59d4332845a5d7097": {
            call: EncointerCommunities_CommunityMetadata,
            paramTypes: ["EncointerPrimitivesCommunitiesCommunityIdentifier"],
            returnType: "EncointerPrimitivesCommunitiesCommunityMetadata",
        },
        "24a811bb1e5ebd8cb51dca6fc01cfcf4": {
            call: EncointerCommunities_NominalIncome,
            paramTypes: ["EncointerPrimitivesCommunitiesCommunityIdentifier"],
            returnType: "SubstrateFixedFixedI128",
        },
        b57b711155e19a81a6cc0cb3d34bacc0: {
            call: EncointerCommunities_MinSolarTripTimeS,
            paramTypes: [],
            returnType: "u32",
        },
        "9324b6d2ba2832f145bd82d7272f828a": {
            call: EncointerCommunities_MaxSpeedMps,
            paramTypes: [],
            returnType: "u32",
        },
    },
    // EncointerBalances
    da1c278283c2287f6c7474ab9b82f51b: {
        "57c875e4cff74148e4628f264b974c80": {
            call: EncointerBalances_TotalIssuance,
            paramTypes: ["EncointerPrimitivesCommunitiesCommunityIdentifier"],
            returnType: "EncointerPrimitivesBalancesBalanceEntry",
        },
        "4ea8ea0c01faa42b6eb344a85c47b387": {
            call: EncointerBalances_Balance,
            paramTypes: [
                "EncointerPrimitivesCommunitiesCommunityIdentifier",
                "AccountId32",
            ],
            returnType: "EncointerPrimitivesBalancesBalanceEntry",
        },
        "6fceb44b6fa28dbef2a4a5fc9eb774ae": {
            call: EncointerBalances_DemurragePerBlock,
            paramTypes: ["EncointerPrimitivesCommunitiesCommunityIdentifier"],
            returnType: "SubstrateFixedFixedI128",
        },
        "40e616be63276ad8307aa70e63acc0d7": {
            call: EncointerBalances_FeeConversionFactor,
            paramTypes: [],
            returnType: "u128",
        },
    },
    // EncointerBazaar
    "19891a8d19ea8a5c38a9546956ac70ee": {
        "89c93dc3a7e6426ec56d6b9f947fd40d": {
            call: EncointerBazaar_BusinessRegistry,
            paramTypes: [
                "EncointerPrimitivesCommunitiesCommunityIdentifier",
                "AccountId32",
            ],
            returnType: "EncointerPrimitivesBazaarBusinessData",
        },
        "96bc3ba1b2295380bb15e6e446bc228d": {
            call: EncointerBazaar_OfferingRegistry,
            paramTypes: ["EncointerPrimitivesBazaarBusinessIdentifier", "u32"],
            returnType: "EncointerPrimitivesBazaarOfferingData",
        },
    },
};

function System_Account(params: any[]) {
    return {
        nonce: nonce00++,
        consumers: 0,
        providers: 0,
        sufficients: 1,
        data: {
            free: 0,
            reserved: 0,
            miscFrozen: 0,
            feeFrozen: 0,
        },
    };
}
function System_ExtrinsicCount(params: any[]) {}
function System_BlockWeight(params: any[]) {}
function System_AllExtrinsicsLen(params: any[]) {}
function System_BlockHash(params: any[]) {}
function System_ExtrinsicData(params: any[]) {}
function System_Number(params: any[]) {}
function System_ParentHash(params: any[]) {}
function System_Digest(params: any[]) {}
function System_Events(params: any[]) {
    // this corresponds to
    // i didnt manage to instanciate this type from an object, so using hex
    // [
    //     {
    //       phase: { applyExtrinsic: 0 },
    //       event: {
    //         index: '0x0000',
    //         data: [ { weight: 0, class: 'Mandatory', paysFee: 'Yes' } ]
    //       },
    //       topics: []
    //     },
    //     {
    //       phase: { applyExtrinsic: 1 },
    //       event: {
    //         index: '0x0000',
    //         data: [ { weight: 136000000, class: 'Mandatory', paysFee: 'Yes' } ]
    //       },
    //       topics: []
    //     }
    //   ]
    return "0x080000000000000000000000000000000200000001000000000000321b0800000000020000";
}
function System_EventCount(params: any[]) {}
function System_EventTopics(params: any[]) {}
function System_LastRuntimeUpgrade(params: any[]) {}
function System_UpgradedToU32RefCount(params: any[]) {}
function System_UpgradedToTripleRefCount(params: any[]) {}
function System_ExecutionPhase(params: any[]) {}
function RandomnessCollectiveFlip_RandomMaterial(params: any[]) {}
function Timestamp_Now(params: any[]) {}
function Timestamp_DidUpdate(params: any[]) {}
function Sudo_Key(params: any[]) {}
function Balances_TotalIssuance(params: any[]) {}
function Balances_Account(params: any[]) {}
function Balances_Locks(params: any[]) {
    return [];
}
function Balances_Reserves(params: any[]) {}
function Balances_StorageVersion(params: any[]) {}
function TransactionPayment_NextFeeMultiplier(params: any[]) {}
function TransactionPayment_StorageVersion(params: any[]) {}
function Grandpa_State(params: any[]) {}
function Grandpa_PendingChange(params: any[]) {}
function Grandpa_NextForced(params: any[]) {}
function Grandpa_Stalled(params: any[]) {}
function Grandpa_CurrentSetId(params: any[]) {}
function Grandpa_SetIdSession(params: any[]) {}
function Proxy_Proxies(params: any[]) {}
function Proxy_Announcements(params: any[]) {}
function Scheduler_Agenda(params: any[]) {}
function Scheduler_Lookup(params: any[]) {}
function EncointerScheduler_CurrentCeremonyIndex(params: any[]) {
    return 0;
}
function EncointerScheduler_LastCeremonyBlock(params: any[]) {}
function EncointerScheduler_CurrentPhase(params: any[]) {
    return "Registering";
}
function EncointerScheduler_NextPhaseTimestamp(params: any[]) {
    var date = new Date();
    date.setDate(date.getDate() + 2);
    date.setHours(0, 0, 0, 0);
    return Math.floor(date.getTime());
}
function EncointerScheduler_PhaseDurations(params: any[]) {
    switch (params[0]) {
        case "Registering":
            return 604800000;
        case "Assigning":
            return 86400000;
        case "Attesting":
            return 172800000;
    }
}
function EncointerCeremonies_BurnedBootstrapperNewbieTickets(params: any[]) {}
function EncointerCeremonies_BootstrapperRegistry(params: any[]) {}
async function EncointerCeremonies_BootstrapperIndex(params: any[]) {
    return await getParticipantIndex(params, "Bootstrapper");
}
function EncointerCeremonies_BootstrapperCount(params: any[]) {}
function EncointerCeremonies_ReputableRegistry(params: any[]) {}
async function EncointerCeremonies_ReputableIndex(params: any[]) {
    return await getParticipantIndex(params, "Reputable");
}
function EncointerCeremonies_ReputableCount(params: any[]) {}
function EncointerCeremonies_EndorseeRegistry(params: any[]) {}
async function EncointerCeremonies_EndorseeIndex(params: any[]) {
    return await getParticipantIndex(params, "Endorsee");
}
function EncointerCeremonies_EndorseeCount(params: any[]) {}
function EncointerCeremonies_NewbieRegistry(params: any[]) {}
async function EncointerCeremonies_NewbieIndex(params: any[]) {
    return await getParticipantIndex(params, "Newbie");
}
function EncointerCeremonies_NewbieCount(params: any[]) {}
async function EncointerCeremonies_AssignmentCounts(params: any[]) {
    return {
        bootstrappers: await getNumParticipants(params, "Bootstrapper"),
        reputables: await getNumParticipants(params, "Reputable"),
        endorsees: await getNumParticipants(params, "Endorsee"),
        newbies: await getNumParticipants(params, "Newbie"),
    };
}
function EncointerCeremonies_Assignments(params: any[]) {
    const fakeAssignment = {
        m: 1,
        s1: 1,
        s2: 1,
    };

    return {
        bootstrappers_repuables: fakeAssignment,
        endorsees: fakeAssignment,
        newbies: fakeAssignment,
    };
}
function EncointerCeremonies_ParticipantReputation(params: any[]) {}
function EncointerCeremonies_Endorsees(params: any[]) {}
function EncointerCeremonies_EndorseesCount(params: any[]) {}
function EncointerCeremonies_MeetupCount(params: any[]) {
    return 1;
}
function EncointerCeremonies_AttestationRegistry(params: any[]) {}
function EncointerCeremonies_AttestationIndex(params: any[]) {}
function EncointerCeremonies_AttestationCount(params: any[]) {}
function EncointerCeremonies_MeetupParticipantCountVote(params: any[]) {}
function EncointerCeremonies_CeremonyReward(params: any[]) {}
function EncointerCeremonies_LocationTolerance(params: any[]) {}
function EncointerCeremonies_TimeTolerance(params: any[]) {}
function EncointerCeremonies_IssuedRewards(params: any[]) {}
function EncointerCeremonies_InactivityCounters(params: any[]) {}
function EncointerCeremonies_InactivityTimeout(params: any[]) {}
function EncointerCeremonies_EndorsementTicketsPerBootstrapper(params: any[]) {}
function EncointerCeremonies_ReputationLifetime(params: any[]) {}
function EncointerCeremonies_MeetupTimeOffset(params: any[]) {
    return -2100000;
}
function EncointerCommunities_CommunityIdentifiersByGeohash(params: any[]) {}
function EncointerCommunities_Locations(params: any[]) {}
async function EncointerCommunities_Bootstrappers(params: any[]) {
    let communityObject = await getCommunityObject(cidToString(params[0]));
    if (communityObject.scenario == Scenario.AllBootstrappersAllAssigned) {
        return Object.keys(communityObject.participants);
    } else return [];
}
async function EncointerCommunities_CommunityIdentifiers(params: any[]) {
    let allCommunities = await getAllCommunitiyObjects();
    let cids = Object.keys(allCommunities).map(parseCid);
    cids.forEach((cid) => (cid.geohash = maybeHexToString(cid.geohash)));
    return cids;
}
async function EncointerCommunities_CommunityMetadata(params: any[]) {
    let name = (await getCommunityObject(cidToString(params[0]))).name;
    return {
        name,
        symbol: "SYM",
        assets: "QmSpwTDiKbRVqHaV2LvaUVkwZkkuF8w1BjTjwXD9PEzHnd",
        theme: null,
        url: null,
    };
}
function EncointerCommunities_NominalIncome(params: any[]) {}
function EncointerCommunities_MinSolarTripTimeS(params: any[]) {}
function EncointerCommunities_MaxSpeedMps(params: any[]) {}
function EncointerBalances_TotalIssuance(params: any[]) {}
function EncointerBalances_Balance(params: any[]) {}
function EncointerBalances_DemurragePerBlock(params: any[]) {
    return {
        bits: 0,
    };
}
function EncointerBalances_FeeConversionFactor(params: any[]) {}
function EncointerBazaar_BusinessRegistry(params: any[]) {}
function EncointerBazaar_OfferingRegistry(params: any[]) {}
