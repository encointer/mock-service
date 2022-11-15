import { CommunityIdentifierObject } from "../types";

export function maybeHexToString(s: string) {
    if(s.startsWith("0x")) return Buffer.from(s.slice(2), "hex").toString();
    else return s
}

export function parseCid(cid: string): CommunityIdentifierObject {
    return {
        geohash: cid.substring(0, 5),
        digest: cid.substring(5, 9),
    };
}

export function cidToString(cid: CommunityIdentifierObject): string {
    return maybeHexToString(cid.geohash) + maybeHexToString(cid.digest);
}
