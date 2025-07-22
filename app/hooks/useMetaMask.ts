"use client"

import { useEffect, useState } from "react"
import { ethers } from "ethers"

export function useMetaMask() {
  const [wallet, setWallet] = useState<string | null>(null)

  useEffect(() => {
    async function connect() {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
          setWallet(accounts[0])
        } catch (err) {
          console.error("MetaMask connection failed:", err)
        }
      }
    }

    connect()
  }, [])

  return { wallet }
}
