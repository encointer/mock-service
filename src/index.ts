import { ApiPromise, WsProvider } from "@polkadot/api";
import { encointer_rpc_endpoint } from "./consts";
import { handleMessage } from "./rpc";
import { putCommunityObject } from "./db";
import { CommunityObject } from "./types";
import { getStorage } from "./storage";
import { WebSocketServer, WebSocket, RawData } from "ws";

async function main() {
    const wsProvider = new WsProvider(encointer_rpc_endpoint);
    const api = await ApiPromise.create({ provider: wsProvider });

    let test = api.createType(
        "Vec<EncointerPrimitivesCommunitiesCommunityIdentifier>",
        [
            {
                geohash: "sqm1v",
                digest: "0xf08c911c",
            },
        ]
    );
    console.log(test.toHex());

    let test2 = api.createType(
        "Vec<EncointerPrimitivesCommunitiesCommunityIdentifier>",
        "0x0473716d3176f08c911c"
    );
    console.log(test2.toHuman());

    const wss = new WebSocketServer({ port: 8080 });

    wss.on("connection", function connection(ws) {
        ws.on("message", async function message(data) {
            //console.log(data.toString());
            await handleMessage(api, ws, data);
        });
    });

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
