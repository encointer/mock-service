import { Server as WebSocketServer } from "rpc-websockets";
import { ApiPromise } from "@polkadot/api";

async function processExtrinsic(api: ApiPromise, encodedExtrinsic: string) {
    let ex = await api.tx(
        encodedExtrinsic
    ).toHuman();
    

}


export function register_rpc_methods(server: WebSocketServer, api: ApiPromise) {
    server.register("sum", function (params) {
        return params[0] + params[1];
    });

    server.register("author_submitAndWatchExtrinsic", async function (params) {
        return await processExtrinsic(api, params[0])
    });
}