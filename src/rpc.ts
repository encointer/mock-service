import { Server as WebSocketServer } from "rpc-websockets";
import { ApiPromise } from "@polkadot/api";
import { advancePhase } from "./lib/community";

async function getResultOrErr<T>(promise: Promise<T>) {
    try {
        return await promise;
    } catch (e) {
        let message = 'Unknown Error'
        if (e instanceof Error) message = e.message
        return {error: message}
        
    }
}

async function processExtrinsic(api: ApiPromise, encodedExtrinsic: string) {
    let ex = await api.tx(encodedExtrinsic).toHuman();
}

export function register_rpc_methods(server: WebSocketServer, api: ApiPromise) {
    server.register("sum", function (params) {
        return params[0] + params[1];
    });

    server.register("author_submitAndWatchExtrinsic", async function (params) {
        return await processExtrinsic(api, params[0]);
    });

    server.register("advancePhase", async function (params) {
        return getResultOrErr(advancePhase(params[0]));
    });
}
