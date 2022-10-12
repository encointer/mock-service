import { Level } from "level";
import { CommunityObject, CommunityIdentifier } from "./types";
import {CommunityDoesNotExist} from "./errors"

const db = new Level<CommunityIdentifier, CommunityObject>("db", {
    valueEncoding: "json",
});

export async function getCommunityObject(cid: CommunityIdentifier) {
    try {
        return await db.get(cid);
    } catch (e) {
        throw new CommunityDoesNotExist();
    }
}

export async function putCommunityObject(
    cid: CommunityIdentifier,
    communityObject: CommunityObject
) {
    await db.put(cid, communityObject);
}
