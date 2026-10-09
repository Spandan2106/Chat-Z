import ws from "k6/ws";
import { check } from "k6";
import { Counter, Trend } from "k6/metrics";


// ==========================================
// CUSTOM METRICS
// ==========================================

const socketConnections =
  new Counter("socket_connections");

const socketFailures =
  new Counter("socket_failures");

const typingEvents =
  new Counter("typing_events");

const connectionTime =
  new Trend("socket_connection_time");


// ==========================================
// TEST CONFIGURATION
// ==========================================

export const options = {

  // Start with only 10 virtual users
  vus: 10,

  // Run for 10 seconds
  duration: "10s",

  thresholds: {

    socket_failures: [
      "count<1"
    ],

    socket_connection_time: [
      "p(95)<1000"
    ]

  }

};


// ==========================================
// CHAT-Z SOCKET.IO SERVER
// ==========================================

const BASE_URL =
  "ws://localhost:5001/socket.io/?EIO=4&transport=websocket";


// ==========================================
// TEST CHAT ROOM
// ==========================================

const CHAT_ID =
  "k6-test-room";


// ==========================================
// MAIN K6 TEST
// ==========================================

export default function () {

  // ----------------------------------------
  // Create unique virtual user
  // ----------------------------------------

  const userId =
    "507f1f77bcf86cd79943" +
    String(__VU).padStart(4, "0");

  const username =
    `k6-user-${__VU}`;


  const user = {

    _id: userId,

    username: username

  };


  const start =
    Date.now();


  // ========================================
  // CONNECT TO SOCKET.IO
  // ========================================

  const response = ws.connect(
    BASE_URL,
    {},
    function (socket) {


      // ======================================
      // CONNECTION OPENED
      // ======================================

      socket.on("open", function () {

        console.log(
          `VU ${__VU}: WebSocket connection opened`
        );


        /*
         * Socket.IO CONNECT packet
         */
        socket.send("40");

      });


      // ======================================
      // RECEIVE SOCKET.IO MESSAGE
      // ======================================

      socket.on("message", function (message) {

        /*
         * Socket.IO CONNECTED packet
         *
         * Example:
         *
         * 40{"sid":"xxxx"}
         */

        if (message.startsWith("40")) {


          // ----------------------------------
          // Connection successful
          // ----------------------------------

          connectionTime.add(
            Date.now() - start
          );

          socketConnections.add(1);


          // ==================================
          // SETUP USER
          // ==================================

          /*
           * Chat-Z backend:
           *
           * socket.on("setup", ...)
           */

          socket.send(
            "42[\"setup\"," +
            JSON.stringify(user) +
            "]"
          );


          // ==================================
          // JOIN CHAT
          // ==================================

          /*
           * Chat-Z backend:
           *
           * socket.on("join-chat", ...)
           */

          socket.send(
            "42[\"join-chat\",\"" +
            CHAT_ID +
            "\"]"
          );


          // ==================================
          // TYPING
          // ==================================

          socket.setTimeout(
            function () {

              socket.send(
                "42[\"typing\"," +
                JSON.stringify({
                  chatId: CHAT_ID
                }) +
                "]"
              );


              typingEvents.add(1);


            },
            1000
          );


          // ==================================
          // STOP TYPING
          // ==================================

          socket.setTimeout(
            function () {

              socket.send(
                "42[\"stop-typing\"," +
                JSON.stringify({
                  chatId: CHAT_ID
                }) +
                "]"
              );


              // ------------------------------
              // Close connection
              // ------------------------------

              socket.close();

            },
            2000
          );

        }

      });


      // ======================================
      // SOCKET ERROR
      // ======================================

      socket.on("error", function (error) {

        console.log(
          `VU ${__VU}: Socket error`,
          error
        );

        socketFailures.add(1);

      });


      // ======================================
      // SOCKET CLOSED
      // ======================================

      socket.on("close", function () {

        console.log(
          `VU ${__VU}: Socket connection closed`
        );

      });

    }
  );


  // ========================================
  // VERIFY CONNECTION
  // ========================================

  check(response, {

    "Socket.IO connection established":
      (r) => r && r.status === 101

  });


  // ========================================
  // COUNT FAILED CONNECTION
  // ========================================

  if (
    !response ||
    response.status !== 101
  ) {

    socketFailures.add(1);

  }

}