import { CommunityIdentifierObject } from "../types";

export function parseCid(cid: string): CommunityIdentifierObject {
    return {
        geohash: cid.substring(0, 12),
        digest: cid.substring(12, 22),
    };
}

export function cidToString(cid: CommunityIdentifierObject): string {
    return cid.geohash + cid.digest;
}
