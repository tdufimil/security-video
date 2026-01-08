"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HeartRateClient, HeartRateSample } from "../src/app/lib/heartRateClient";

export function useHeartRate(baseUrl: string) {
  const clientRef = useRef<HeartRateClient | null>(null);
  const [devices, setDevices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [samples, setSamples] = useState<HeartRateSample[]>([]);

  // 直近 N 件だけ保持（無限に増やさない）
  const MAX_KEEP = 600; // 例: 10分*1Hz 相当
  const pushSample = useCallback((s: HeartRateSample) => {
    setSamples((prev) => {
      const next = [...prev, s];
      if (next.length > MAX_KEEP) next.splice(0, next.length - MAX_KEEP);
      return next;
    });
  }, []);

  useEffect(() => {
    const client = new HeartRateClient(baseUrl);
    clientRef.current = client;
    client.connectSocket({
      onDevices: (names) => setDevices(names),
      onData: pushSample,
    });
    setConnected(true);

    // Request device list once after connection
    setTimeout(() => {
      client.fetchDevices().catch(() => { /* ignore */ });
    }, 100);

    return () => {
      client.disconnect();
      clientRef.current = null;
      setConnected(false);
    };
  }, [baseUrl, pushSample]);

  const subscribe = useCallback(async (name: string) => {
    if (!clientRef.current) throw new Error("client not ready");
    setSelected(name);
    setSamples([]);
    await clientRef.current.subscribe(name);
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
    setSelected(null);
    setConnected(false);
  }, []);

  const sendStepChange = useCallback((stepId: string, stepName?: string) => {
    if (clientRef.current) {
      clientRef.current.sendStepChange(stepId, stepName);
    }
  }, []);

  const hr = samples.length ? samples[samples.length - 1].hr : null;

  return {
    // 状態
    devices,
    selected,
    connected,
    hr,
    samples,
    // 操作
    subscribe,
    disconnect,
    sendStepChange,
  };
}
