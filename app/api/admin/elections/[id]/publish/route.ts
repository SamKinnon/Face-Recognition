import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/config";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const electionId = parseInt(params.id);
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545"); // Ganache
    const signer = provider.getSigner(); // default signer (admin)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI.abi, signer);

    const tx = await contract.publishResults(electionId);
    await tx.wait();

    return NextResponse.json({ message: "Results published" });
  } catch (error) {
    console.error("❌ Failed to publish results:", error);
    return NextResponse.json({ message: "Error publishing results" }, { status: 500 });
  }
}
