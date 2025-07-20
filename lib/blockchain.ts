import { ethers } from "ethers";
import contractABI from "@/contracts/VotingSystem.json";

// Make sure this matches your deployed contract's address
const CONTRACT_ADDRESS = "0x265392de776245eAA3492944aBbad60D047E16cd"; // ← use your actual deployed address

export const getEthereum = (): any => {
  if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
    return window.ethereum;
  }
  throw new Error("MetaMask is not installed.");
};

export const getProvider = () => {
  const ethereum = getEthereum();
  return new ethers.BrowserProvider(ethereum);
};

export const getContract = async () => {
  const provider = await getProvider();
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
  return contract;
};

// Example function: add an election on-chain
export const addElectionOnChain = async (
  title: string,
  description: string,
  startDate: number,
  endDate: number
) => {
  const contract = await getContract();
  const tx = await contract.createElection(title, description, startDate, endDate);
  await tx.wait();
};
