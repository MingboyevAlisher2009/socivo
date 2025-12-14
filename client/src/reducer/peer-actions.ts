import type { IPeer } from "@/types";


export const ADD_PEER_STREAM = "ADD_PEER" as const;
export const REMOVE_PEER_STREAM = "REMOVE_PEER" as const;
export const ADD_PEER_NAME = "ADD_PEER_NAME" as const;
export const ADD_ALL_PEERS = "ADD_ALL_PEERS" as const;

export const addPeerStreamAction = (peerId: string, stream: MediaStream) => {
    return {
        type: ADD_PEER_STREAM,
        payload: { peerId, stream },
    }
};

export const removePeerStreamAction = (peerId: string) => ({
    type: REMOVE_PEER_STREAM,
    payload: { peerId },
});

export const addAllPeersAction = (peers: Record<string, IPeer>) => ({
    type: ADD_ALL_PEERS,
    payload: { peers },
});

