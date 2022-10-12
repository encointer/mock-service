import { Server as WebSocketServer } from "rpc-websockets";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { encointer_rpc_endpoint } from "./consts";
import { register_rpc_methods } from "./rpc";
import {Level} from 'level';

async function main() {
    var server = new WebSocketServer({
        port: 8080,
        host: "localhost",
    });
    console.log("start");
    const wsProvider = new WsProvider(encointer_rpc_endpoint);
    const api = await ApiPromise.create({ provider: wsProvider });

    register_rpc_methods(server, api);

    const db = new Level<string, object>('db', { valueEncoding: 'json' });
    await db.put('a', {"abcd": 'eeeeiiies'});
    console.log(await db.get('a'))
}

(async () => {
    await main();
})();
