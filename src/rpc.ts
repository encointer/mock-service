import { ApiPromise } from "@polkadot/api";
import { WebSocket, RawData } from "ws";
import { logMessage } from "./lib/util";
import {
    advancePhase,
    author_submitAndWatchExtrinsic,
    author_unwatchExtrinsic,
    chain_getBlock,
    encointer_getAggregatedAccountData,
    encointer_getAllBalances,
    encointer_getAllCommunities,
    encointer_getLocations,
    encointer_getReputations,
    state_getStorage,
    state_subscribeStorage,
} from "./rpcMethods";
import { getStorage } from "./storage";

function relay(ws: WebSocket, data: RawData, encointer_rpc: WebSocket) {
    encointer_rpc.send(data);
}

export async function handleMessage(
    api: ApiPromise,
    ws: WebSocket,
    data: RawData,
    encointer_rpc: WebSocket
) {
    try {
        let request = JSON.parse(data.toString());
        let method = request.method;

        // if(method == "state_getStorage") {
        //     await getStorage(api, request.params);
        // }
        // if(method == "state_subscribeStorage") {
        //     await getStorage(api, request.params[0]);
        // }

        // relay(ws, data, encointer_rpc);
        // return

        switch (method) {
            case "encointer_getLocations":
                encointer_getLocations(api, ws, data);
                break;
            case "encointer_getAllBalances":
                encointer_getAllBalances(api, ws, data);
                break;
            case "encointer_getReputations":
                encointer_getReputations(api, ws, data);
                break;
            case "encointer_getAggregatedAccountData":
                encointer_getAggregatedAccountData(api, ws, data);
                break;
            case "encointer_getAllCommunities":
                encointer_getAllCommunities(api, ws, data);
                break;
            case "author_submitAndWatchExtrinsic":
                author_submitAndWatchExtrinsic(api, ws, data);
                break;
            case "author_unwatchExtrinsic":
                author_unwatchExtrinsic(api, ws, data);
                break;
            case "state_subscribeStorage":
                state_subscribeStorage(api, ws, data);
                break;
            case "state_getStorage":
                state_getStorage(api, ws, data);
                break;
            case "advancePhase":
                advancePhase(api, ws, data);
                break;
            case "chain_getBlock":
                chain_getBlock(api, ws, data);
                break;
            case "chain_getBlockHash":
            case "chain_getFinalizedHead":
            case "chain_getHeader":
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
        logMessage("ERROR", msg);
        ws.send("ERROR:" + msg);
    }
}
