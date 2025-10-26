<template>
  <h1 class="title">geolocation chat</h1>
  <div class="chatBox">
    <ul>
      <li class="msg" v-for="msg in messages">
        <span :class="'sender ' + (msg[0] == 'system' ? 'system' : (msg[0] == alias ? 'you' : ''))">
          {{  msg[0] == alias ? "(you)" : msg[0] }}:
        </span> {{ msg[1] }}
      </li>
    </ul>
  </div>
  <form @submit.prevent="sendMsg" class="messageForm">
    <input placeholder="send a message" required maxlength="50" v-model="msg">
    <button>send</button>
  </form>
  <span class="alias">chatting as "{{ alias }}"</span> <br />
  <span v-if="locationAccuracy > 100" class="accuracy">Reduced location accuracy</span>
  <footer style="text-align: center; margin-top: 5em;">
    <small>© 2025 Rohan Nishant, Ethan Grieshop, Pranav Rajesh, Ved Vyas</small>
  </footer>
</template>

<style scoped>
  form > * {
    font-family: InterVariable;
  }

  .title {
    background: linear-gradient(20deg, rgb(56, 194, 56), 20%, rgb(40, 126, 247));
    background-clip: text;
    color: transparent;
    font-size: 5vh;
  }

  .chatBox {
    height: 50vh; 
    border: .1em solid #d1d1d1;
    border-radius: 1em;
    overflow: auto;
    display: flex;
    flex-direction: column-reverse;

    font-size: 3vh;
  }

  .msg {
    padding-bottom: .67em;
  }

  .msg::marker {
    display: none;
  }

  .messageForm {
    padding-top: 1em;
  }
  .messageForm > input, button {
        font-size: 2.5vh;
  }

  .alias {
    font-size: 2vh;
  }

  .sender {
    font-weight: 600;
  }
  .you {
    color: red;
    font-style: italic;
  }
  .system {
    color: blueviolet;
    font-style: italic;
  }

  .accuracy {
    font-size: 2vh;
    color: red;
  }

  form > input {
    height: 2em;
    border: .1em solid lightgray;
    border-radius: .4em;
  }

  form > button {
    color: white;
    background-color: rgb(17, 49, 231);
    border: none;
    border-radius: .5em;
    padding: .4em;
    margin-left: .3em;
  }
</style>  

<style scoped>
  @media (prefers-color-scheme: dark) {
    .chatBox {
      border-color: #676767;
    }

    .system {
      color: violet;
    }
  }
</style>

<script setup>
  import { ref } from "vue";

  const messages = ref([]);
  const msg = ref("");
  const alias = ref("");
  const locationAccuracy = ref(0);

  const socket = new WebSocket(import.meta.env.PROD ? "wss://geolocationchat-production.up.railway.app" : "ws://localhost:3000");

  socket.addEventListener("open", (event) => {
    //socket.send("Hello Server!");
  });

  socket.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);

    switch (msg.type) {
      case "alias":
        alias.value = msg.alias;
        break;
      case "incoming message":
        messages.value.push([msg.message.alias, msg.message.message]);
        break;
      case "region":
        messages.value.push(["system", `now connected to region "${msg.region}"`]);
        break;
      default:
        console.error("invalid message sent from server");
    }
  });

  if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(
      (pos) => {
        locationAccuracy.value = pos.coords.accuracy;

        if (locationAccuracy.value < 100) {
          socket.send(JSON.stringify({
            type: "location",
            coords: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            }
          }));
        }

      },
      (e) => {
        console.error(e.message);
      }, {enableHighAccuracy: true})
  }

  function sendMsg() {
    socket.send(JSON.stringify({
      type: "chat",
      message: msg.value
    }));
    msg.value = "";
  }
</script>
