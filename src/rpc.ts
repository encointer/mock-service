import { advancePhase } from "./lib/runtime";
import { getCommunityObject, putCommunityObject } from "./db";
import { ApiPromise } from "@polkadot/api";
import { encointer_rpc_endpoint } from "./consts";
import { getStorage } from "./storage";
import { WebSocket, RawData } from "ws";
import { SubmittableExtrinsics } from "@polkadot/api/types";

function relay(ws: WebSocket, data: RawData) {
    const encointer_rpc = new WebSocket(encointer_rpc_endpoint);
    let request = JSON.parse(data.toString());
    console.log(`${request.method} request:`)
    console.log(request)
    encointer_rpc.on("open", function open() {
        encointer_rpc.send(data);
    });
    encointer_rpc.on("message", function message(data) {
        console.log(`${request.method} response:`)
        console.log(data.toString())
        ws.send(data.toString());
    });
}
export async function handleMessage(
    api: ApiPromise,
    ws: WebSocket,
    data: RawData
) {
    let request = JSON.parse(data.toString());
    //relay(ws, data);
    let method = request.method;
    switch (method) {
        case "encointer_getLocations":
            let cid = request.params[0];
            // {"jsonrpc":"2.0","result":[{"lat":"47.3860442609734562325","lon":"8.5167555883526802063"},{"lat":"47.3863389067466229676","lon":"8.5233766213059425354"},{"lat":"47.3869987892637922755","lon":"8.51989746093749822364"},{"lat":"47.3885922795468204072","lon":"8.51957626640796661377"},{"lat":"47.3891715535333091225","lon":"8.5129961371421813965"},{"lat":"47.3895923857361651699","lon":"8.5164836794137954712"},{"lat":"47.3896700146103739826","lon":"8.52360427379608154297"},{"lat":"47.39043449402448260344","lon":"8.51080611348152160645"},{"lat":"47.3922230783101596785","lon":"8.51907670497894109474"},{"lat":"47.39408059955918872674","lon":"8.5130444169044494629"},{"lat":"47.38784547884539222196","lon":"8.52683097124099731445"}],"id":92}
            break;
        case "encointer_getAllBalances":
            let accountId = request.params[0]
            // {"jsonrpc":"2.0","result":[[{"geohash":"0x7530716a39","digest":"0x77f79df7"},{"principal":"17.9322839837634529508","lastUpdate":1449018}]],"id":11}
            break;
        case "encointer_getReputations":
            accountId = request.params[0]
            // "result": [
            //     [
            //         2,
            //         {
            //             "communityIdentifier": {
            //                 "geohash": "0x73716d3176",
            //                 "digest": "0xf08c911c"
            //             },
            //             "reputation": "VerifiedLinked"
            //         }
            //     ],
            //     [
            //         3,
            //         {
            //             "communityIdentifier": {
            //                 "geohash": "0x73716d3176",
            //                 "digest": "0xf08c911c"
            //             },
            //             "reputation": "VerifiedLinked"
            //         }
            //     ],
            //     [
            //         1,
            //         {
            //             "communityIdentifier": {
            //                 "geohash": "0x73716d3176",
            //                 "digest": "0xf08c911c"
            //             },
            //             "reputation": "VerifiedLinked"
            //         }
            //     ],
            //     [
            //         4,
            //         {
            //             "communityIdentifier": {
            //                 "geohash": "0x73716d3176",
            //                 "digest": "0xf08c911c"
            //             },
            //             "reputation": "UnverifiedReputable"
            //         }
            //     ]
            // ],
            break;
        case "encointer_getAggregatedAccountData":
            cid = request.params[0];
            accountId = request.params[1];
            // "result": {
            //     "global": {
            //         "ceremonyPhase": "Assigning",
            //         "ceremonyIndex": 3
            //     },
            //     "personal": {
            //         "participantType": "Bootstrapper",
            //         "meetupIndex": 1,
            //         "meetupLocationIndex": 3,
            //         "meetupTime": null,
            //         "meetupRegistry": [
            //             "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
            //             "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
            //             "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
            //         ]
            //     }
            // },
            break;
        case "encointer_getAllCommunities":
            //{"jsonrpc":"2.0","result":[{"cid":{"geohash":"0x7530716a39","digest":"0x77f79df7"},"name":"Leu Zurich"},{"cid":{"geohash":"0x6b78746b76","digest":"0x45387a38"},"name":"Aslah"}],"id":30}
            break;
        case "author_submitAndWatchExtrinsic":
            let extrinsic = api.tx(request.params[0]);
            let method = extrinsic.method.method;
            let pallet = extrinsic.method.section;
            let args = extrinsic.method.args;
            let signer = extrinsic.signer.toString()
            console.log(method, pallet, args, signer)
            break;
        case "author_unwatchExtrinsic":
            break;
        case "state_subscribeStorage":
            break;
        case "state_getStorage":
            getStorage(api, request.params[0]);
            break;
        case "advancePhase":
            cid = request.params[0];
            let communityObject = await getCommunityObject(cid);
            communityObject = advancePhase(communityObject);
            await putCommunityObject(cid, communityObject);
            ws.send(communityObject.currentPhase);
            break;
        case "chain_getBlockHash":
        case "state_getRuntimeVersion":
        case "system_chain":
        case "system_properties":
        case "rpc_methods":
        case "state_getMetadata":
        case "system_health":
        case "system_properties":
            relay(ws, data);
    }
}
