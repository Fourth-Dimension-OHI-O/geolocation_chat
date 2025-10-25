<template>
  <ul>
    <li v-for="msg in messages">
      {{  msg }}
    </li>
  </ul>
</template>

<script setup>
  import { ref } from "vue";

  console.log("[Startup Marker]");

  if (!("geolocation" in navigator)) {
    console.log("Warning: Geolocation disabled in this browser");
  }

  const messages = ref([]);

  const socket = new WebSocket("ws://localhost:3000");

  socket.addEventListener("open", (event) => {
    socket.send("Hello Server!");
  });

  socket.addEventListener("message", (event) => {
    messages.value.push(event.data);
  });

  setInterval(() => {
    send_location()
  }, 5000);

  async function send_location() {
    if (!("geolocation" in navigator)) {
      return [0,0];
    }
    var lat = 0;
    var long = 0;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        lat = pos.coords.latitude;
        long = pos.coords.longitude;
        socket.send("Lat: " + lat + ", Long: " + long)
      },
      (e) => {
        console.log("Warning: Geolocation returned error");
        return;
      }
    );
  }

</script>
