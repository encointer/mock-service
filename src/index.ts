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

    getStorage(api, '0xa7d291a8132b2cc65c41da45f4de76797f0adfa903215393e9b5557e5aa6fb6480da1a598da1af38c09c736af452123a7530716a3977f79df7130000007893a8800ee642af41e41f005478199c246068b38f2dd35b1a9e4808edd102affdbb142f290b9d97ada61a944813db73');

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
