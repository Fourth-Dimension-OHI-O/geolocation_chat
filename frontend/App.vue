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
  <span class="alias">location accuracy: {{ Math.round(locationAccuracy.toFixed(2)) }}m</span>
</template>

<style scoped>
  .title {
    background: linear-gradient(20deg, rgb(56, 194, 56), 20%, rgb(40, 126, 247));
    background-clip: text;
    color: transparent;
    font-size: 5vh;
  }

  .chatBox {
    height: 50vh; 
    border: 1px solid black;
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
</style>  

<script setup>
  import { ref } from "vue";

  const messages = ref([]);
  const msg = ref("");
  const alias = ref("");
  const locationAccuracy = ref(0.0);

  const socket = new WebSocket("ws://localhost:3000");

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

        socket.send(JSON.stringify({
          type: "location",
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          }
        }));
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
