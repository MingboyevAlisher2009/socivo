import { PeerServer } from "peer";

const PORT = process.env.PORT || 9000;

const server = PeerServer({ port: PORT, path: "/" });

let connectedPeers = new Set();

server.on("connection", (client) => {
  console.log("Peer connected:", client.id);
  connectedPeers.add(client.id);
  console.log("Total connected peers:", connectedPeers.size);
});
