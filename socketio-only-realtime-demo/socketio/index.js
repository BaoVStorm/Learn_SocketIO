import { Server } from "socket.io";
import patientsNamespace from "./namespaces/patients.js";

export default function initSocketIO(server) {
  const io = new Server(server, {
    cors: { origin: process.env.ALLOW_ORIGIN?.split(",") || "*" },
  });

  // namespace /patients
  const nsPatients = io.of("/patients");
  patientsNamespace(nsPatients);
}
