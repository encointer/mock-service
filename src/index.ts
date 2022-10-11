import { Server as WebSocketServer } from "rpc-websockets";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { encointer_rpc_endpoint } from "./consts";

async function main() {
    // instantiate Server and start listening for requests
    var server = new WebSocketServer({
        port: 8080,
        host: "localhost",
    });
    console.log("start");
    const wsProvider = new WsProvider(encointer_rpc_endpoint);
    const api = await ApiPromise.create({ provider: wsProvider });
    let ex = await api.tx(
        "0xc9018400d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d01f0cc59d3dca94a5281a25f376227851f9c02966fa6327a71b9422e5e92d51d714cc3e59aa844c48a6f52505b14ebb805507abacdb328f1668153c67631e5d58e35011400003d0b3200000000000000"
    );

    console.log(JSON.stringify(ex.toHuman()));

    // register an RPC method
    server.register("sum", function (params) {
        return params[0] + params[1];
    });
}

(async () => {
    await main();
})().catch((e) => {
    console.log(e)
});
