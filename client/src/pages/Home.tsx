import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";

function Home() {
  const [status, setStatus] = useState<string>("Checking...");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Helpdesk</h1>
        <p className="mt-2 text-gray-600">AI-Powered Ticket Management System</p>
        <p
          className={`mt-4 text-sm font-medium ${
            status === "ok" ? "text-green-600" : "text-red-600"
          }`}
        >
          Server status: {status}
        </p>
      </main>
    </div>
  );
}

export default Home;
