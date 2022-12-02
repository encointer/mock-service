import { ApiPromise } from "@polkadot/api";
import { RawData, WebSocket } from "ws";
import { AnyJson } from "@polkadot/types-codec/types";
import { blake2AsHex } from "@polkadot/util-crypto";
import Geohash from "latlon-geohash";
import {
    advancePhaseForCommunity,
    getAggregatedAccountData,
    getAllBalances,
    getAllCommunites,
    getReputations,
    registerParticipant,
} from "./lib/runtime";

import {
    getCommunityObject,
    putCommunityObject,
    getAllCommunitiyObjects,
} from "./db";
import { CommunityIdentifierObject } from "./types";
import { cidToString, getRpcSubscriptionHash, logMessage } from "./lib/util";
import { getStorage } from "./storage";
import { systemAccountStorageSubscriptionHash } from "./consts";

function send(ws: WebSocket, message: AnyJson | string) {
    logMessage('Response from Mock Service', message)
    ws.send(JSON.stringify(message));
}
function sendResponse(ws: WebSocket, id: number, result: AnyJson | string) {
    let response = { jsonrpc: "2.0", result, id };
    send(ws, response);
}

function getLocations(cid: CommunityIdentifierObject) {
    // compute center of geohash
    let geohash = Buffer.from(cid.geohash.slice(2), "hex").toString();
    let location = Geohash.decode(geohash);
    return [{ lat: location.lat, lon: location.lon }];
}

export async function encointer_getLocations(
    api: ApiPromise,
    ws: WebSocket,
    data: RawData
) {
    let request = JSON.parse(data.toString());
    let cid = request.params[0];
    sendResponse(ws, request.id, getLocations(cid));
}

export async function encointer_getReputations(
    api: ApiPromise,
    ws: WebSocket,
    data: RawData
) {
    let request = JSON.parse(data.toString());
    let accountId = request.params[0];
    sendResponse(
        ws,
        request.id,
        getReputations(await getAllCommunitiyObjects(), accountId)
    );
}

export async function encointer_getAllBalances(
    api: ApiPromise,
    ws: WebSocket,
    data: RawData
) {
    let request = JSON.parse(data.toString());
    let accountId = request.params[0];
    sendResponse(
        ws,
        request.id,
        getAllBalances(await getAllCommunitiyObjects(), accountId)
    );
}

export async function encointer_getAggregatedAccountData(
    api: ApiPromise,
    ws: WebSocket,
    data: RawData
) {
    let request = JSON.parse(data.toString());
    let cid = cidToString(request.params[0]);
    let accountId = request.params[1];
    sendResponse(
        ws,
        request.id,
        getAggregatedAccountData(await getCommunityObject(cid), accountId)
    );
}

export async function encointer_getAllCommunities(
    api: ApiPromise,
    ws: WebSocket,
    data: RawData
) {
    let request = JSON.parse(data.toString());
    let allCommunities = await getAllCommunitiyObjects();
    sendResponse(ws, request.id, getAllCommunites(allCommunities));
}

export async function author_unwatchExtrinsic(
    api: ApiPromise,
    ws: WebSocket,
    data: RawData
) {
    let request = JSON.parse(data.toString());
    sendResponse(ws, request.id, true);
}

export async function author_submitAndWatchExtrinsic(
    api: ApiPromise,
    ws: WebSocket,
    data: RawData
) {
    let request = JSON.parse(data.toString());
    let extrinsic = api.tx(request.params[0]);
    let method = extrinsic.method.method;
    let pallet = extrinsic.method.section;
    let args = extrinsic.method.args;
    let signer = extrinsic.signer.toString();
    const extrinsicSubscriptionHash = getRpcSubscriptionHash();

    switch (method) {
        case "registerParticipant":
            let cid = cidToString(
                args[0].toHuman() as CommunityIdentifierObject
            );
            let participant = signer;
            let communityObject = registerParticipant(
                await getCommunityObject(cid),
                participant,
                "Bootstrapper"
            );
            await putCommunityObject(cid, communityObject);
            break;
    }
    sendResponse(ws, request.id, extrinsicSubscriptionHash);

    send(ws, {
        jsonrpc: "2.0",
        method: "author_extrinsicUpdate",
        params: {
            subscription: extrinsicSubscriptionHash,
            result: "ready",
        },
    });

    let systemAccountStorageKey =
        "0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9";

    let accountId = api.createType("AccountId32", signer);
    systemAccountStorageKey +=
        blake2AsHex(accountId.toU8a(), 128).slice(2) +
        accountId.toHex().slice(2);
    let { result, subscriptionHash } = await getStorage(
        api,
        systemAccountStorageKey
    );
    const block = (await api.rpc.chain.getFinalizedHead()).toHuman()

    send(ws, {
        jsonrpc: "2.0",
        method: "state_storage",
        params: {
            subscription: subscriptionHash,
            result: {
                block,
                changes: [[systemAccountStorageKey, result]],
            },
        },
    });

    send(ws, {
        jsonrpc: "2.0",
        method: "author_extrinsicUpdate",
        params: {
            subscription: extrinsicSubscriptionHash,
            result: {
                inBlock: block,
            },
        },
    });

    // await new Promise((r) => setTimeout(r, 100));
    //     send(ws,
    //    {
    //         jsonrpc: "2.0",
    //         method: "author_extrinsicUpdate",
    //         params: {
    //             subscription: extrinsicSubscriptionHash,
    //             result: {
    //                 finalized: block,
    //             },
    //         },
    //     }
    // );
}

export async function state_subscribeStorage(
    api: ApiPromise,
    ws: WebSocket,
    data: RawData
) {
    let request = JSON.parse(data.toString());
    let { result, subscriptionHash } = await getStorage(
        api,
        request.params[0][0]
    );
    sendResponse(ws, request.id, subscriptionHash);
    send(ws, {
        jsonrpc: "2.0",
        method: "state_storage",
        params: {
            subscription: subscriptionHash,
            result: {
                block: (await api.rpc.chain.getFinalizedHead()).toHuman(),
                changes: [[request.params[0][0], result]],
            },
        },
    });
}

export async function state_getStorage(
    api: ApiPromise,
    ws: WebSocket,
    data: RawData
) {
    let request = JSON.parse(data.toString());
    sendResponse(
        ws,
        request.id,
        (await getStorage(api, request.params[0])).result
    );
}

export async function advancePhase(
    api: ApiPromise,
    ws: WebSocket,
    data: RawData
) {
    let request = JSON.parse(data.toString());
    let cid = request.params[0];
    let communityObject = await getCommunityObject(cid);
    communityObject = advancePhaseForCommunity(communityObject);
    await putCommunityObject(cid, communityObject);
    send(ws, communityObject.currentPhase);
}
