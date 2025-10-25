<template>
  <h1 class="title">geolocation chat</h1>
  <div class="chatBox">
    <ul>
      <li class="msg" v-for="msg in messages">
        {{  msg }}
      </li>
    </ul>
  </div>
  <form @submit.prevent="sendMsg" class="messageForm">
    <input placeholder="send a message" required maxlength="50" v-model="msg">
    <button>send</button>
  </form>
</template>

<style scoped>
  .title {
    background: linear-gradient(20deg, rgb(56, 194, 56), 20%, rgb(40, 126, 247));
    background-clip: text;
    color: transparent;
    font-size: 3vw;
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
    content: "> ";
    font-weight: 700;
  }

  .messageForm {
    padding-top: 1em;
  }
  .messageForm > input, button {
        font-size: 2.5vh;
  }
</style>  

<script setup>
  import { ref } from "vue";

  const messages = ref([]);
  const msg = ref("");

  const socket = new WebSocket("ws://localhost:3000");

  socket.addEventListener("open", (event) => {
    socket.send("Hello Server!");
  });

  socket.addEventListener("message", (event) => {
    messages.value.push(event.data);
  });

  if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(
      (pos) => {
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
