import { advancePhase } from "./lib/runtime";
import { getCommunityObject, putCommunityObject } from "./db";
import { ApiPromise } from "@polkadot/api";
import { encointer_rpc_endpoint } from "./consts";
import { getStorage } from "./storage";
import { WebSocket, RawData } from "ws";

function relay(ws: WebSocket, data: RawData) {
    const encointer_rpc = new WebSocket(encointer_rpc_endpoint);
    encointer_rpc.on("open", function open() {
        encointer_rpc.send(data);
    });
    encointer_rpc.on("message", function message(data) {
        ws.send(data.toString());
    });
}
export async function handleMessage(
    api: ApiPromise,
    ws: WebSocket,
    data: RawData
) {
    let request = JSON.parse(data.toString());
    let method = request.method;
    switch (method) {
        case "encointer_getReputations":
            break;
        case "encointer_getLocations":
            break;
        case "encointer_getAllBalances":
            break;
        case "encointer_getReputations":
            break;
        case "encointer_getAggregatedAccountData":
            break;
        case "encointer_getAllCommunities":
            break;
        case "author_submitAndWatchExtrinsic":
            break;
        case "author_unwatchExtrinsic":
            break;
        case "state_subscribeStorage":
            break;
        case "state_getStorage":
            getStorage(api, request.params[0]);
            break;
        case "advancePhase":
            let cid = request.params[0];
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
            relay(ws, data);
    }
}
