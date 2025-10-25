import { WebSocketServer } from 'ws';
import EventEmitter from "node:events";

const wss = new WebSocketServer({ port: 3000 });

const colors = ["red", "orange", "yellow", "green", "blue", "purple", "white", "brown", "gray", "black"];
const animals = ["dog", "cat", "horse", "tiger", "lion", "rabbit", "fox", "bear", "wolf", "deer", "cow", "goat", "sheep", "pig", "eagle", "hawk", "owl", "crow", "dolphin", "whale", "shark", "seal", "bat", "frog", "snake", "lizard", "camel", "moose", "otter", "raccoon", "squirrel", "kangaroo", "koala", "panda", "hedgehog", "porcupine", "cheetah", "jaguar", "leopard", "buffalo", "hyena", "goose", "swan", "pigeon", "turkey", "parrot", "pelican", "penguin", "flamingo", "alligator", "crocodile", "turtle", "tortoise", "crab", "lobster", "squid", "octopus", "shrimp", "clam"];

const eventEmitter = new EventEmitter();

wss.on('connection', async function connection(ws, req) {
  const i = Math.floor(Math.random()*(colors.length-1));
  const j = Math.floor(Math.random()*(animals.length-1));
  const alias = colors[i] + " " + animals[j];
  ws.send(JSON.stringify({
    type: "alias",
    alias:  alias
  }));
  let region = "";
  console.log(`user "${alias}" connected (${req.socket.remoteAddress})`);

  ws.on('message', function message(data) {
    const msg = JSON.parse(data);

    switch (msg.type) {
      case "location":
        const lat = msg.coords.latitude;
        const long = msg.coords.longitude;
        // TODO: change this to set user region
        console.log(`user "${alias}" sent location ${lat}, ${long}`);
        break;
      case "chat":
        eventEmitter.emit("chat", {
          type: "incoming message",
          message: {
            alias: alias,
            message: msg.message
          }
        })
        break;
      default:
        console.error(`invalid message sent from user "${alias}`)
    }
  });
  ws.on('error', console.error);

  eventEmitter.on("chat", function (msg) {
    ws.send(JSON.stringify(msg));
  });
});
