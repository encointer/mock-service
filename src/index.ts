import { Server as WebSocketServer } from "rpc-websockets";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { encointer_rpc_endpoint } from "./consts";
import { register_rpc_methods } from "./rpc";

async function main() {
    var server = new WebSocketServer({
        port: 8080,
        host: "localhost",
    });
    console.log("start");
    const wsProvider = new WsProvider(encointer_rpc_endpoint);
    const api = await ApiPromise.create({ provider: wsProvider });

    register_rpc_methods(server, api);
}

(async () => {
    await main();
})();
