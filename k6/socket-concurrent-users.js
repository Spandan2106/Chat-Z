import ws from "k6/ws";
import { check } from "k6";
import { Counter, Trend, Gauge } from "k6/metrics";

const socketConnections = new Counter("socket_connections");
const socketFailures = new Counter("socket_failures");
const connectionTime = new Trend("socket_connection_time");
const activeConnections = new Gauge("active_connections");

export const options = {
    scenarios: {
        concurrent_users: {
            executor: "per-vu-iterations",
            vus: 1000,
            iterations: 1,
            maxDuration: "30s",
        },
    },

    thresholds: {
        socket_failures: ["count<1"],
        socket_connection_time: ["p(95)<1000"],
    },
};

const BASE_URL =
    "ws://localhost:5001/socket.io/?EIO=4&transport=websocket";

const CHAT_ID = "k6-test-room";

export default function () {
    const userId =
        "507f1f77bcf86cd79943" +
        String(__VU).padStart(4, "0");

    const username = `k6-user-${__VU}`;

    const user = {
        _id: userId,
        username: username,
    };

    const start = Date.now();

    const response = ws.connect(
        BASE_URL,
        {},
        function (socket) {

            socket.on("open", function () {
                console.log(
                    `VU ${__VU}: WebSocket connection opened`
                );

                // Socket.IO open packet
                socket.send("40");
            });

            socket.on("message", function (message) {

                // Socket.IO connection established
                if (message.startsWith("40")) {

                    const connectTime = Date.now() - start;

                    connectionTime.add(connectTime);
                    socketConnections.add(1);
                    activeConnections.add(1);

                    console.log(
                        `VU ${__VU}: Connected in ${connectTime} ms`
                    );

                    // Setup user
                    socket.send(
                        "42[\"setup\"," +
                        JSON.stringify(user) +
                        "]"
                    );

                    // Join test chat room
                    socket.send(
                        "42[\"join-chat\",\"" +
                        CHAT_ID +
                        "\"]"
                    );

                    console.log(
                        `VU ${__VU}: Joined room ${CHAT_ID}`
                    );

                    // Keep this connection alive
                    // for 20 seconds.
                    socket.setTimeout(function () {

                        console.log(
                            `VU ${__VU}: Closing connection`
                        );

                        socket.close();

                    }, 20000);
                }
            });

            socket.on("error", function (error) {

                console.log(
                    `VU ${__VU}: Socket error`,
                    error
                );

                socketFailures.add(1);
            });

            socket.on("close", function () {

                activeConnections.add(-1);

                console.log(
                    `VU ${__VU}: Socket connection closed`
                );
            });
        }
    );

    check(response, {
        "Socket.IO connection established":
            (r) => r && r.status === 101,
    });

    if (!response || response.status !== 101) {
        socketFailures.add(1);
    }
}