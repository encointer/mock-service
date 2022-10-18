fs = require("fs");
const { xxhashAsHex } = require("@polkadot/util-crypto");

let lookupCode = '{\n'
let functionCode = ''
fs.readFile("./metadata.json", "utf8", function (err, data) {
    if (err) {
        return console.log(err);
    }
    let pallets = JSON.parse(data).metadata.v14.pallets;
    for (let pallet of pallets) {
        if (pallet.storage) {
            let prefix = pallet.storage.prefix;
            lookupCode += `// ${prefix}\n`
            let prefixHash = xxhashAsHex(prefix, 128).substring(2);
            lookupCode += `    "${prefixHash}": {\n`
            for (let item of pallet.storage.items) {
                let method = item.name;
                let functionName = `${prefix}_${method}`;
                let methodHash = xxhashAsHex(method, 128).substring(2);
                lookupCode += `        "${methodHash}": ${functionName},\n`
                functionCode += `function ${functionName}(params: string) { \n    // TODO \n}\n`
            }
            lookupCode += '    },\n';
        }
    }
    lookupCode += '}\n';
    console.log(lookupCode)
    console.log(functionCode)
});

