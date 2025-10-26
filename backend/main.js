import { WebSocketServer } from 'ws';
import EventEmitter from "node:events";
import { regionNames, getRegion } from './region.js';

const wss = new WebSocketServer({ port: 3000 });

const rateLimitMS = 1000;

const colors = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple", "White", "Brown", "Gray", "Black"];
const animals = ["Dog", "Cat", "Horse", "Tiger", "Lion", "Rabbit", "Fox", "Bear", "Wolf", "Deer", "Cow", "Goat", "Sheep", "Pig", "Eagle", "Hawk", "Owl", "Crow", "Dolphin", "Whale", "Shark", "Seal", "Bat", "Frog", "Snake", "Lizard", "Camel", "Moose", "Otter", "Raccoon", "Squirrel", "Kangaroo", "Koala", "Panda", "Hedgehog", "Porcupine", "Cheetah", "Jaguar", "Leopard", "Buffalo", "Hyena", "Goose", "Swan", "Pigeon", "Turkey", "Parrot", "Pelican", "Penguin", "Flamingo", "Alligator", "Crocodile", "Turtle", "Tortoise", "Crab", "Lobster", "Squid", "Octopus", "Shrimp", "Clam"];

const chats = new Map(regionNames.map(name => [name, new EventEmitter()]));

wss.on('connection', async function connection(ws, req) {
  const i = Math.floor(Math.random()*(colors.length-1));
  const j = Math.floor(Math.random()*(animals.length-1));
  const k = Math.floor(Math.random()*1000);
  const alias = `${colors[i]}${animals[j]}${k}`;
  ws.send(JSON.stringify({
    type: "alias",
    alias:  alias
  }));
  let lastMessageTime = Date.now();
  console.log(`user "${alias}" connected (${req.socket.remoteAddress})`);
  let region = "Off Campus";

  const dispatchMsg = (msg) => {
    ws.send(JSON.stringify(msg));
  };
  {
    const em = chats.get("Off Campus");
    if (em != undefined) {
      em.emit("chat", {
        type: "incoming message",
        message: {
          alias: "system",
          message: `${alias} is here!`
        }
      });
      em.addListener("chat", dispatchMsg);
        ws.send(JSON.stringify({
        type: "region",
        region: region,
        count: em.listenerCount("chat")
      }));
    }
  }

  ws.on('message', function message(data) {
    const msg = JSON.parse(data);

    switch (msg.type) {
      case "location":
        const lat = msg.coords.latitude;
        const long = msg.coords.longitude;
        const newRegion = getRegion(lat, long);
        if (newRegion != region) {
          if (dispatchMsg != undefined) {
            chats.forEach(emitter => {
              emitter.removeListener(dispatchMsg);
            });
          }
          region = newRegion;
          console.log(`"${region}"`);
          const newEmitter = chats.get(region);
          if (newEmitter != undefined) {
            newEmitter.emit("chat", {
              type: "incoming message",
              message: {
                alias: "system",
                message: `"${alias}" is here!`
              }
            })
            newEmitter.addListener("chat", dispatchMsg);

            ws.send(JSON.stringify({
              type: "region",
              region: region,
              count: newEmitter.listenerCount("chat")
            }));
          }

          console.log(`user "${alias}" connected to region "${region}"`);
        }
        break;
      case "chat":
        if (Date.now() - lastMessageTime < rateLimitMS) {
          lastMessageTime = Date.now()
          break;
        }
        lastMessageTime = Date.now()

        const eventEmitter = chats.get(region);
        if (eventEmitter != undefined) {
          eventEmitter.emit("chat", {
            type: "incoming message",
            message: {
              alias: alias,
              message: msg.message
            }
          });
        }
        break;
      default:
        console.error(`invalid message sent from user "${alias}`)
    }
  });
  ws.on('error', console.error);
  ws.on('close', (n, r) => {
    let emitter = chats.get(region);
    if (emitter != undefined) {
      emitter.removeListener("chat", dispatchMsg);
      emitter.emit("chat", {
        type: "incoming message",
        message: {
          alias: "system", 
          message: `"${alias}" left region "${region}"`
        }
      })
    }
    if (dispatchMsg != undefined) {
      chats.forEach(em => {
        em.removeListener(dispatchMsg);
      })
    }
  });
});
