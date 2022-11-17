import {
    advancePhase,
    getAggregatedAccountData,
    getAllBalances,
    getAllCommunites,
    getReputations,
} from "./lib/runtime";
import {
    getCommunityObject,
    putCommunityObject,
    getAllCommunitiyObjects,
} from "./db";
import { ApiPromise } from "@polkadot/api";
import { encointer_rpc_endpoint } from "./consts";
import { decodeParams, getStorage } from "./storage";
import { WebSocket, RawData } from "ws";
import Geohash from "latlon-geohash";
import { CommunityIdentifierObject } from "./types";
import { cidToString, getRpcSubscriptionHash } from "./lib/util";
import { AnyJson } from "@polkadot/types-codec/types";

function relay(ws: WebSocket, data: RawData, encointer_rpc: WebSocket) {
    let request = JSON.parse(data.toString());
    // console.log(`${request.method} request:`);
    // console.log(request);
    encointer_rpc.send(data);
}

function getLocations(cid: CommunityIdentifierObject) {
    // compute center of geohash
    let geohash = Buffer.from(cid.geohash.slice(2), "hex").toString();
    let location = Geohash.decode(geohash);
    return [{ lat: location.lat, lon: location.lon }];
}

function sendResponse(ws: WebSocket, id: number, result: AnyJson | string) {
    ws.send(JSON.stringify({ jsonrpc: "2.0", result, id }));
}

export async function handleMessage(
    api: ApiPromise,
    ws: WebSocket,
    data: RawData,
    encointer_rpc: WebSocket
) {
    try {
        let request = JSON.parse(data.toString());
        // relay(ws, data, encointer_rpc);

        let method = request.method;
        console.log(method);
        let accountId;
        let cid;
        switch (method) {
            case "encointer_getLocations":
                cid = request.params[0];
                sendResponse(ws, request.id, getLocations(cid));
                break;

            //OK
            case "encointer_getAllBalances":
                accountId = request.params[0];
                sendResponse(
                    ws,
                    request.id,
                    getAllBalances(await getAllCommunitiyObjects(), accountId)
                );
                break;
            case "encointer_getReputations":
                accountId = request.params[0];
                sendResponse(
                    ws,
                    request.id,
                    getReputations(await getAllCommunitiyObjects(), accountId)
                );
                break;
            case "encointer_getAggregatedAccountData":
                console.log(request.params);
                cid = cidToString(request.params[0]);
                accountId = request.params[1];
                sendResponse(
                    ws,
                    request.id,
                    getAggregatedAccountData(
                        await getCommunityObject(cid),
                        accountId
                    )
                );
                break;
            case "encointer_getAllCommunities":
                let allCommunities = await getAllCommunitiyObjects();
                sendResponse(ws, request.id, getAllCommunites(allCommunities));
                break;
            case "author_submitAndWatchExtrinsic":
                let extrinsic = api.tx(request.params[0]);
                let method = extrinsic.method.method;
                let pallet = extrinsic.method.section;
                let args = extrinsic.method.args;
                let signer = extrinsic.signer.toString();
                console.log(request.params[0]);
                console.log(method, pallet, args, signer);
                break;
            case "author_unwatchExtrinsic":
                break;
            case "state_subscribeStorage":
                let subscriptionHash = getRpcSubscriptionHash();
                sendResponse(ws, request.id, subscriptionHash);
                ws.send(
                    JSON.stringify({
                        jsonrpc: "2.0",
                        method: "state_storage",
                        params: {
                            subscription: subscriptionHash,
                            result: {
                                block: (
                                    await api.rpc.chain.getBlock()
                                ).hash.toHex(),
                                changes: [
                                    [
                                        request.params[0][0],
                                        await getStorage(api, request.params[0][0]),
                                    ],
                                ],
                            },
                        },
                    })
                );

                break;
            case "state_getStorage":
                sendResponse(
                    ws,
                    request.id,
                    await getStorage(api, request.params[0])
                );
                break;
            case "advancePhase":
                cid = request.params[0];
                let communityObject = await getCommunityObject(cid);
                communityObject = advancePhase(communityObject);
                await putCommunityObject(cid, communityObject);
                ws.send(communityObject.currentPhase);
                break;
            case "chain_getBlockHash":
            case "state_getRuntimeVersion":
            case "system_chain":
            case "system_properties":
            case "rpc_methods":
            case "state_getMetadata":
            case "system_health":
            case "system_properties":
            case "chain_subscribeNewHead":
                relay(ws, data, encointer_rpc);
        }
    } catch (e) {
        let msg;
        if (e instanceof Error) {
            msg = e.message;
        } else msg = String(e);
        ws.send("ERROR:" + msg);
    }
}
