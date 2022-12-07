import { ApiPromise, WsProvider } from "@polkadot/api";
import { encointer_rpc_endpoint } from "./consts";
import { handleMessage } from "./rpc";
import { getCommunityObject, putCommunityObject } from "./db";
import { Scenario } from "./types";
import { WebSocketServer, WebSocket } from "ws";
import { newCommunity } from "./lib/runtime";
import { logMessage } from "./lib/util";
async function main() {
    const types = {
        CommunityIdentifier: {
            geohash: "GeoHash",
            digest: "CidDigest",
        },
        GeoHash: "[u8; 5]",
        CidDigest: "[u8; 4]",
    };
    const signedExtensions = {
        ChargeAssetTxPayment: {
            extrinsic: {
                tip: "Compact<Balance>",
                assetId: "Option<CommunityIdentifier>",
            },
            payload: {},
        },
    };

    const wsProvider = new WsProvider(encointer_rpc_endpoint);
    const api = await ApiPromise.create({
        provider: wsProvider,
        signedExtensions,
        types,
    });

    const wss = new WebSocketServer({ port: 8080 });

    wss.on("connection", function connection(ws) {
        const encointer_rpc = new WebSocket(encointer_rpc_endpoint);
        encointer_rpc.on("open", function open() {
            encointer_rpc.on("message", function message(data) {
                logMessage(
                    `Response relayed from ${encointer_rpc_endpoint}`,
                    JSON.parse(data.toString())
                );
                ws.send(data.toString());
            });
            ws.on("message", async function message(data) {
                logMessage(`Received message`, JSON.parse(data.toString()));
                handleMessage(api, ws, data, encointer_rpc);
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

    await newCommunity(
        "0x73716d31760xf08c911c",
        "Meditarranea",
        Scenario.AllBootstrappersAllAssigned
    );

    c = await getCommunityObject("0x73716d31760xf08c911c");
    c.participants = {
        "5CtQDjtR43EiawMwG6K7QGFrdx9aiTddZefkBAGzWNXf7GEP": 1.337,
    };
    c.ceremonies[0].participants = {
        //"5CtQDjtR43EiawMwG6K7QGFrdx9aiTddZefkBAGzWNXf7GEP": "Bootstrapper",
    };
    await putCommunityObject("0x73716d31760xf08c911c", c);
}

(async () => {
    await main();
})();
