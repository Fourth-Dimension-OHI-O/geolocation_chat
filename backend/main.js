import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3000 });

const colors = ["red", "orange", "yellow", "green", "blue", "purple", "white", "brown", "gray", "black"];
const animals = ["dog", "cat", "horse", "tiger", "lion", "rabbit", "fox", "bear", "wolf", "deer", "cow", "goat", "sheep", "pig", "eagle", "hawk", "owl", "crow", "dolphin", "whale", "shark", "seal", "bat", "frog", "snake", "lizard", "camel", "moose", "otter", "raccoon", "squirrel", "kangaroo", "koala", "panda", "hedgehog", "porcupine", "cheetah", "jaguar", "leopard", "buffalo", "hyena", "goose", "swan", "pigeon", "turkey", "parrot", "pelican", "penguin", "flamingo", "alligator", "crocodile", "turtle", "tortoise", "crab", "lobster", "squid", "octopus", "shrimp", "clam"];
let users = {};

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  let message = 0;
  setInterval(() => ws.send(`message: ${message++}`), 1000);
});

class User {
  constructor(hashedIP) {
    this.id = hashedIP;
    let i = Math.floor(Math.random()*(length(colors)-1));
    let j = Math.floor(Math.random()*(length(animals)-1));
    this.alias = colors[i] + " " + animals[j];
    this.region = "None";
  }

  sendAlias() {
    // TODO: Send alias to user
  }

  getAlias() {
    return this.alias
  }

  setRegion(region) {
    this.region = region
    // TODO: Send region packet
  }

  getRegion() {
    return this.region
  }
}

async function handleInboundMessage(message, ip) {
  const messageJSON = JSON.parse(message);
  let id = hashIP(ip);
  if (!(id in users)) {
    users[id] = new User(id);
  }
  type = messageJSON.type;
  let user = users[id];

  switch (type) {
    case "location":
      const lat = messageJSON.coords.latitude;
      const long = messageJSON.coords.longitude;
      user.setRegion(getRegion(lat, long));
    case "chat":
      const region = user.getRegion();
      const alias = user["alias"];
      const userMessage = messageJSON.message;
      broadcastChat(region, alias, userMessage);
  }
}

async function hashIP(ip) {
  const msgBuffer = new TextEncoder().encode(ip);
  
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  
  return hashHex;
}

async function getRegion(latitude, longitude) {
  return "Oval"; // TODO: Write region getting logic
}

async function broadcastChat(region, alias, message) {

}