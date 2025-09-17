import { store } from "../store.js";

// nhận sự kiện từ client
// socket.on("event", (payload, cb) => {})
// payload dữ liệu client gửi
// cb callback client gửi lên, có thể gọi cb() để trả về kết quả
// gửi sự kiện đến client
// socket.emit("")

// cho socket tham gia room
// socket.join(ROOM)
// cho socket rời room
// socket.leave(ROOM)
// gửi sự kiện đến tất cả client trong room
// ns.to(ROOM).emit("")

export default function patientsNamespace(ns) {
  ns.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    // TODO: verify token nếu cần
    return next();
  });

  // tự động - khi client connect
  ns.on("connection", (socket) => {
    console.log("client connected:", socket.id);
    const ROOM = "patients-room";
    socket.join(ROOM);

    // gửi snapshot
    socket.emit("snapshot", Object.values(store.patients));

    // tạo patient
    socket.on("patient:create", (payload, cb) => {
      const id = "p_" + Date.now();
      const patient = {
        id,
        name: payload?.name ?? "Unnamed",
        vitals: { hr: 72, spo2: 98, bp: "120/80" },
      };
      store.patients[id] = patient;
      cb?.({ ok: true, id });

      // thông báo tất cả client trong room có patient mới
      ns.to(ROOM).emit("patient:created", patient);
      // thông báo tất cả client trong room ko có patient mới
      // socket.to(ROOM).emit("patient:created", patient);
    });

    // update vitals
    socket.on("patient:vitals:update", ({ id, vitals }, cb) => {
      const p = store.patients[id];
      if (!p) return cb?.({ ok: false, error: "NOT_FOUND" });
      p.vitals = { ...p.vitals, ...vitals };
      cb?.({ ok: true });
      ns.to(ROOM).emit("patient:vitals:updated", { id, vitals: p.vitals });
    });

    // xóa patient
    socket.on("patient:delete", ({ id }, cb) => {
      if (!store.patients[id]) return cb?.({ ok: false, error: "NOT_FOUND" });
      delete store.patients[id];
      cb?.({ ok: true });
      ns.to(ROOM).emit("patient:deleted", { id });
    });

    // tự động - khi client disconnect
    socket.on("disconnect", (reason) => {
      console.log("socket disconnected:", socket.id, reason);
    });
  });
}
