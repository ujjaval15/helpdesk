import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function Home() {
  const [status, setStatus] = useState<string>("Checking...");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Helpdesk</h1>
        <p className="mt-2 text-gray-600">AI-Powered Ticket Management System</p>
        <p className={`mt-4 text-sm font-medium ${status === "ok" ? "text-green-600" : "text-red-600"}`}>
          Server status: {status}
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
