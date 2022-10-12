import { Server as WebSocketServer } from "rpc-websockets";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { encointer_rpc_endpoint } from "./consts";
import { register_rpc_methods } from "./rpc";
import { putCommunityObject } from "./db";
import { CommunityObject } from "./types";

async function main() {
    var server = new WebSocketServer({
        port: 8080,
        host: "localhost",
    });
    const wsProvider = new WsProvider(encointer_rpc_endpoint);
    const api = await ApiPromise.create({ provider: wsProvider });

    register_rpc_methods(server, api);

    const communityObject: CommunityObject = {
        currentPhase: "attesting",
        income: 100,
        participants: {},
        ceremonies: [],
    };

    putCommunityObject("abc", communityObject);
}

(async () => {
    await main();
})();
