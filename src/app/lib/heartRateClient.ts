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

    this.socket.on("subscribeSuccess", (payload: { message: string; deviceName: string }) => {
      // console.log(`[HR] Subscribe success: ${payload.deviceName} - ${payload.message}`);
    });

    this.socket.on("subscribeError", (payload: { error: string }) => {
      // console.error(`[HR] Subscribe error: ${payload.error}`);
    });

    this.socket.on("disconnect", () => {
      // console.log("[HR] socket disconnected");
    });
  }

  async subscribe(name: string) {
    this.deviceName = name;

    // Use Socket.IO event instead of REST API to avoid disconnection issues
    if (this.socket && this.socket.connected) {
      this.socket.emit('subscribe', { deviceName: name });
    } else {
      throw new Error('Socket not connected');
    }
  }

  sendStepChange(stepId: string, stepName?: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("stepChange", {
        stepId,
        stepName: stepName || stepId,
        timestamp: Date.now(),
      });
    }
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
