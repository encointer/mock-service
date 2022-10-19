const { xxhashAsHex } = require("@polkadot/util-crypto");
const { ApiPromise, WsProvider } = require("@polkadot/api");
const encointer_rpc_endpoint = "ws://127.0.0.1:9945";
const { getSiName } = require("@polkadot/types/metadata/util");

const wsProvider = new WsProvider(encointer_rpc_endpoint);
ApiPromise.create({ provider: wsProvider }).then((api) => {
    let lookupCode =
        "const modules: {[key: string]: { [key: string]: { call: Function; paramTypes: string[] } }} = {\n";
    let functionCode = "";
    let pallets = api.runtimeMetadata.asV14.pallets.toHuman();
    for (let pallet of pallets) {
        if (pallet.storage) {
            let prefix = pallet.storage.prefix;
            lookupCode += `// ${prefix}\n`;
            let prefixHash = xxhashAsHex(prefix, 128).substring(2);
            lookupCode += `    "${prefixHash}": {\n`;
            for (let item of pallet.storage.items) {
                let method = item.name;
                let functionName = `${prefix}_${method}`;
                let methodHash = xxhashAsHex(method, 128).substring(2);
                lookupCode += getLookupCode(
                    methodHash,
                    functionName,
                    getParamTypesCode(api, item)
                );
                functionCode += getFunctionCode(functionName);
            }
            lookupCode += "    },\n";
        }
    }
    lookupCode += "}\n";
    console.log(lookupCode);
    console.log(functionCode);
});

function getLookupCode(methodHash, functionName, typeParamsCode) {
    return `        "${methodHash}": {
            call: ${functionName},
            paramTypes: ${typeParamsCode}
        },
`;
}

function getParamTypesCode(api, storageItem) {
    if ("Map" in storageItem.type) {
        let paramTypeIndex = storageItem.type.Map.key;
        let typeDef = api.registry.lookup.getSiType(
            parseInt(paramTypeIndex)
        ).def;
        let types =
            storageItem.type.Map.hashers.length === 1
                ? getSiName(api.registry.lookup, parseInt(paramTypeIndex))
                : typeDef.asTuple
                      .map((k) => getSiName(api.registry.lookup, k))
                      .join('", "');
        return `["${types}"]`;
    }

    return "[]";
}

function getFunctionCode(functionName) {
    return `function ${functionName}(params: any[]) { \n    console.log(params) \n}\n`;
}
