"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { loginAdmin } from "@/lib/services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      await loginAdmin(email, password);

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-auto flex flex-col gap-4 border p-6 rounded-xl">
        <h1 className="text-2xl font-bold">StockTrack Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-black text-white p-2 rounded-md"
        >
          {loading ? "Loading..." : "Login"}
        </button>
      </div>
    </div>
  );
}
