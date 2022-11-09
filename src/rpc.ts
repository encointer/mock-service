import { advancePhase, getAllCommunites } from "./lib/runtime";
import { getCommunityObject, putCommunityObject, getAllCommunitiyObjects } from "./db";
import { ApiPromise } from "@polkadot/api";
import { encointer_rpc_endpoint } from "./consts";
import { getStorage } from "./storage";
import { WebSocket, RawData } from "ws";

function relay(ws: WebSocket, data: RawData) {
    const encointer_rpc = new WebSocket(encointer_rpc_endpoint);
    let request = JSON.parse(data.toString());
    console.log(`${request.method} request:`)
    console.log(request)
    encointer_rpc.on("open", function open() {
        encointer_rpc.send(data);
    });
    encointer_rpc.on("message", function message(data) {
        console.log(`${request.method} response:`)
        console.log(data.toString())
        ws.send(data.toString());
    });
}
export async function handleMessage(
    api: ApiPromise,
    ws: WebSocket,
    data: RawData
) {
    let request = JSON.parse(data.toString());
    //relay(ws, data);
    let method = request.method;
    switch (method) {
        case "encointer_getLocations":
            let cid = request.params[0];
            break;
        case "encointer_getAllBalances":
            let accountId = request.params[0]
            break;
        case "encointer_getReputations":
            accountId = request.params[0]

            break;
        case "encointer_getAggregatedAccountData":
            cid = request.params[0];
            accountId = request.params[1];
            break;
        case "encointer_getAllCommunities":
            let allCommunities = await getAllCommunitiyObjects();
            let result = getAllCommunites(allCommunities);
            ws.send(JSON.stringify(result));
            break;
        case "author_submitAndWatchExtrinsic":
            let extrinsic = api.tx(request.params[0]);
            let method = extrinsic.method.method;
            let pallet = extrinsic.method.section;
            let args = extrinsic.method.args;
            let signer = extrinsic.signer.toString()
            console.log(method, pallet, args, signer)
            break;
        case "author_unwatchExtrinsic":
            break;
        case "state_subscribeStorage":
            break;
        case "state_getStorage":
            getStorage(api, request.params[0]);
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
            relay(ws, data);
    }
}
