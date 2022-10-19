const { xxhashAsHex } = require("@polkadot/util-crypto");
const { ApiPromise, WsProvider } = require("@polkadot/api");
const encointer_rpc_endpoint = "ws://127.0.0.1:9945";
const { getSiName } = require("@polkadot/types/metadata/util");
const { resolve } = require("path");

const wsProvider = new WsProvider(encointer_rpc_endpoint);
ApiPromise.create({ provider: wsProvider }).then((api) => {
    let lookupCode =
        "const modules: {[key: string]: { [key: string]: { call: Function; paramTypes: string[], returnType: string } }} = {\n";
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
                let { returnTypeCode, paramsTypesCode } =
                    getParamAndReturnTypesCode(api, item);
                lookupCode += getLookupCode(
                    methodHash,
                    functionName,
                    paramsTypesCode,
                    returnTypeCode
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

function getLookupCode(
    methodHash,
    functionName,
    typeParamsCode,
    returnTypeCode
) {
    return `        "${methodHash}": {
            call: ${functionName},
            paramTypes: ${typeParamsCode},
            returnType: ${returnTypeCode}
        },
`;
}

function resolveType(api, typeIndex) {
    let typeDef = api.registry.lookup.getSiType(parseInt(typeIndex)).def;
    let types = [];
    if (typeDef.isTuple) {
        typeDef.asTuple.forEach((k) =>
            types.push(getSiName(api.registry.lookup, k))
        );
    } else {
        let type = getSiName(api.registry.lookup, parseInt(typeIndex));
        types = [type];
    }
    return types;
}

function formatTypeArray(type) {
    return `["${type.join('", "')}"]`;
}
function formatTypeTupleString(type) {
    return `"${type.join(",")}"`;
}
function formatTypeSingleString(type) {
    if (type.length > 0) return `"${type[0]}"`;
    return '""';
}

function formatTypeString(type) {
    return type.length > 1
        ? formatTypeTupleString(type)
        : formatTypeSingleString(type);
}

function getParamAndReturnTypesCode(api, storageItem) {
    let paramsTypesCode = "[]";
    let returnType = "";
    if ("Map" in storageItem.type) {
        let paramTypeIndex = storageItem.type.Map.key;
        let types = resolveType(api, paramTypeIndex);
        paramsTypesCode = formatTypeArray(types);
        returnType = resolveType(api, storageItem.type.Map.value);
    } else {
        returnType = resolveType(api, storageItem.type.Plain);
    }
    let returnTypeCode = formatTypeString(returnType);
    return { returnTypeCode, paramsTypesCode };
}

function getFunctionCode(functionName) {
    return `function ${functionName}(params: any[]) { \n    console.log(params); \n}\n`;
}
