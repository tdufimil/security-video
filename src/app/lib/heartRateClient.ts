"use client";

import io, { Socket } from "socket.io-client";

type AddDataPayload = { devName: string; heartRate: number };

export type HeartRateSample = {
  t: number; // epoch ms
  hr: number; // bpm
  devName: string;
};

export class HeartRateClient {
  private socket: Socket | null = null;
  private baseUrl: string;
  private deviceName: string | null = null;

  constructor(baseUrl = "") {
    this.baseUrl = baseUrl;
  }

  async fetchDevices(): Promise<string[]> {
    const res = await fetch(`${this.baseUrl}/api/devices`, { method: "GET" });
    if (!res.ok) throw new Error(`fetchDevices failed: ${res.status}`);
    // デバイス名はソケット 'updateDevices' から届く設計なので、ここでは一旦空配列を返すか、
    return [];
  }

  connectSocket({
    onDevices,
    onData,
    query = {},
  }: {
    onDevices?: (names: string[]) => void;
    onData?: (s: HeartRateSample) => void;
    query?: Record<string, string>;
  }) {
    if (this.socket) return;

    // CORS/同一オリジンの都合で必要に応じて withCredentials や transports を指定
    // ベースURLを使って Socket.IO / fetch を叩く
    this.socket = io(this.baseUrl, {
      path: "/socket.io", // サーバがデフォルトならこれでOK
      transports: ["polling", "websocket"], // まずは polling 優先で確実に接続
      withCredentials: true,
    });

    this.socket.on("connect", () => {
      // console.log("[HR] socket connected");
    });

    this.socket.on("updateDevices", (payload: { devNames: string[] }) => {
      onDevices?.(payload.devNames || []);
    });

    this.socket.on("addData", (payload: AddDataPayload) => {
      const s: HeartRateSample = {
        t: Date.now(),
        hr: payload.heartRate,
        devName: payload.devName,
      };
      if (!this.deviceName || payload.devName === this.deviceName) {
        onData?.(s);
      }
    });

    this.socket.on("disconnect", () => {
      // console.log("[HR] socket disconnected");
    });
  }

  async subscribe(name: string) {
    this.deviceName = name;
    const res = await fetch(
      `${this.baseUrl}/api/subscribe/${encodeURIComponent(name)}`
    );
    if (!res.ok) throw new Error(`subscribe failed: ${res.status}`);
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.deviceName = null;
  }
}
