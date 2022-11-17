import { CommunityIdentifierObject } from "../types";

export function getRpcSubscriptionHash() {
    var result = "";
    var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 16; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}

export function maybeHexToString(s: string) {
    if (s.startsWith("0x")) return Buffer.from(s.slice(2), "hex").toString();
    else return s;
}

export function maybeStringToHex(s: string) {
    if (s.startsWith("0x")) return s;
    else return "0x" + Buffer.from(s, "utf8").toString("hex");
}

export function parseCid(cid: string): CommunityIdentifierObject {
    return {
        geohash: cid.substring(0, 12),
        digest: cid.substring(12, 22),
    };
}

export function cidToString(cid: CommunityIdentifierObject): string {
    return maybeStringToHex(cid.geohash) + maybeStringToHex(cid.digest);
}
