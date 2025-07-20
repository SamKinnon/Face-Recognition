import { BrowserProvider} from "ethers"
import { ethers } from "ethers"
import contractAbi from "../build/contracts/VotingSystem.json"

export function getContract() {
  if (typeof window === "undefined" || !window.ethereum) return null

  const provider = new BrowserProvider(window.ethereum)
  const signer = provider.getSigner()

  const contractAddress = "0x265392de776245eAA3492944aBbad60D047E16cd" // 👈 your deployed address
  return new ethers.Contract(contractAddress, contractAbi.abi, signer)
}
