<template>
  <ul>
    <li v-for="msg in messages">
      {{  msg }}
    </li>
  </ul>
</template>

<script setup>
  import { ref } from "vue";

  const messages = ref([]);

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

</script>
