"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vote, Shield, Users, BarChart3, CheckCircle, AlertCircle, Camera, Zap } from "lucide-react";

export default function UnifiedHomePage() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState("");

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setIsConnected(true);
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setIsConnected(true);
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask to use this application");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Vote className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">SecureVote & FaceRecognition System</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Secure Online Voting with Blockchain & Face Recognition
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Experience secure, biometric-authenticated voting with blockchain transparency.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
          <Link href="/register">
            <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              Register to Vote
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full bg-transparent">
              Cast Your Vote
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Biometric Security</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Liveness detection and anti-spoofing ensure only real users vote.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <Vote className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Blockchain Integrity</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Immutable, transparent vote records with smart contracts.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <Camera className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Real-time Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Face captured via webcam with instant verification.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Fast Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                High-speed face encoding and matching for quick auth.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
