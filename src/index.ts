import { ApiPromise, WsProvider } from "@polkadot/api";
import { encointer_rpc_endpoint } from "./consts";
import { handleMessage } from "./rpc";
import { getCommunityObject, putCommunityObject } from "./db";
import { CommunityObject, Scenario } from "./types";
import { decodeParams, getStorage } from "./storage";
import { WebSocketServer, WebSocket, RawData } from "ws";
import { newCommunity } from "./lib/runtime";

async function main() {
    const wsProvider = new WsProvider(encointer_rpc_endpoint);
    const api = await ApiPromise.create({ provider: wsProvider });

    getStorage(
        api,
        "0xa7d291a8132b2cc65c41da45f4de76797f0adfa903215393e9b5557e5aa6fb6480da1a598da1af38c09c736af452123a7530716a3977f79df7130000007893a8800ee642af41e41f005478199c246068b38f2dd35b1a9e4808edd102affdbb142f290b9d97ada61a944813db73"
    );
    //console.log(decodeParams(api, ["EncointerPrimitivesCommunitiesCommunityIdentifier"], "7ecf9737e928fd81ba70d87bba5f962d7530716a3977f79df7"));

    // TODO find how to read storage type in order to automate the param lookup
    //console.log(api.runtimeMetadata.asV14.pallets[0].storage.registry)
    // console.log(api.runtimeMetadata.asV14.lookup.types[182].type.def.toString())
    // console.log(api.registry.lookup.getSiType(14).initialU8aLength)
    // console.log(api.runtimeMetadata.asV14.lookup.types[182].type.toString())
    // //console.log(getSiName(api.registry.lookup, 182))
    // //console.log(api.runtimeMetadata.asV14.pallets[0].storage.entries)
    //console.log(api.registry.lookup.getSiType(182).def.asTuple.map((k) => getSiName(api.registry.lookup, k)))
    //console.log(api.registry.lookup.getSiType(182).def.tu)

    const wss = new WebSocketServer({ port: 8080 });

    wss.on("connection", function connection(ws) {
        const encointer_rpc = new WebSocket(encointer_rpc_endpoint);
        encointer_rpc.on("open", function open() {
            encointer_rpc.on("message", function message(data) {
                ws.send(data.toString());
            });
            ws.on("message", async function message(data) {
                await handleMessage(api, ws, data, encointer_rpc);
            });
        });
    });

    await newCommunity(
        "0x7530716a390x77f79df7",
        "Test Community",
        Scenario.AllBootstrappersAllAssigned
    );
    let c = await getCommunityObject("0x7530716a390x77f79df7");
    c.participants = {
        "5CtQDjtR43EiawMwG6K7QGFrdx9aiTddZefkBAGzWNXf7GEP": 0,
        "5Hq1naLbJFSYzeVxPySmxH2qHgUBULQW9hPyNxKSuBGEJzSZ": 0,
    };
    c.ceremonies[0].participants = {
        "5CtQDjtR43EiawMwG6K7QGFrdx9aiTddZefkBAGzWNXf7GEP": "Bootstrapper",
        "5Hq1naLbJFSYzeVxPySmxH2qHgUBULQW9hPyNxKSuBGEJzSZ": "Bootstrapper",
    };
    await putCommunityObject("0x7530716a390x77f79df7", c);
}

(async () => {
    await main();
})();
