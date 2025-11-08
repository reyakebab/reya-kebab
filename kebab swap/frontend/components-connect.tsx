"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({ connector: injected() });
  const { disconnect } = useDisconnect();
  if (isConnected) {
    return <button onClick={()=>disconnect()} style={{ padding: 10, borderRadius: 12, border: '1px solid #222' }}>
      {address?.slice(0,6)}…{address?.slice(-4)} (Disconnect)
    </button>;
  }
  return <button onClick={()=>connect()} style={{ padding: 10, borderRadius: 12, border: '1px solid #222' }}>Connect</button>;
}
