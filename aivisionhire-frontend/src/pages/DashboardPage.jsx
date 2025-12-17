import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import analyticsApi from "../api/analyticsApi";
import { Link } from "react-router-dom";
import {
  Gauge,
  BookOpen,
  TrendingUp,
  TrendingDown,
  LogOut,
} from "lucide-react";



/* ------------------ UI COMPONENTS ------------------ */

const DashboardCard = ({ title, value, icon }) => (
  <div className="
    bg-[#0E1325]/80
    border border-white/5
    rounded-2xl p-6
    shadow-lg
    hover:border-purple-500/30
    transition
  ">
    <div className="flex justify-between items-center text-sm text-slate-400">
      <span>{title}</span>
      {icon}
    </div>
    <p className="mt-4 text-4xl font-extrabold text-white">{value}</p>
  </div>
);

const DetailCard = ({ title, data, icon, color }) => (
  <div className="
    bg-[#0E1325]/80
    border border-white/5
    rounded-2xl p-6
    shadow-lg
  ">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h3 className="text-lg font-bold">{title}</h3>
    </div>

    {data?.length ? (
      <div className="flex flex-wrap gap-2">
        {data.map((item) => (
          <span
            key={item}
            className={`px-4 py-1 rounded-full text-sm font-semibold ${color}`}
          >
            {item}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-slate-500 italic">Not enough data yet.</p>
    )}
  </div>
);

/* ------------------ PAGE ------------------ */

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await analyticsApi.getDashboardStats();

        setStats({
          totalInterviews: res.data?.totalInterviews,
          averageScore: res.data?.averageScore,
          strengths: res.data?.topStrengths,
          weaknesses: res.data?.topWeaknesses,
        });
      } catch (err) {
        console.error("Dashboard data could not be retrieved", err);
      }
    };

    loadStats();
  }, []);

  if (!stats) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="
        sticky top-0 z-50
        bg-black/70 backdrop-blur-xl
        border-b border-white/5
      ">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold">
              AIVisionHire <span className="text-purple-400">Dashboard</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-slate-400">
              Hi, {user?.name}
            </span>
            <button
              onClick={logout}
              className="
                flex items-center gap-2
                px-4 py-2 rounded-lg
                border border-red-500/30
                text-red-300
                hover:bg-red-500/10
                transition
              "
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <DashboardCard
            title="Total Interview Count"
            value={stats.totalInterviews}
            icon={<BookOpen className="text-purple-400" />}
          />
          <DashboardCard
            title="Average Success Score"
            value={`${stats.averageScore} / 10`}
            icon={<Gauge className="text-green-400" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <DetailCard
            title="Strongest Skills"
            data={stats.strengths}
            icon={<TrendingUp className="text-green-400" />}
            color="bg-green-500/20 text-green-300"
          />
          <DetailCard
            title="Areas to Improve"
            data={stats.weaknesses}
            icon={<TrendingDown className="text-red-400" />}
            color="bg-red-500/20 text-red-300"
          />
        </div>

        <div className="flex gap-4 flex-wrap">
          <Link
            to="/interview/setup"
            className="
              px-8 py-4 rounded-2xl font-bold
              bg-gradient-to-r from-purple-600 to-indigo-600
              hover:opacity-90
              transition
              shadow-lg shadow-purple-600/30
            "
          >
            Start New Interview →
          </Link>
          <Link
            to="/interviews"
            className="
              px-6 py-4 rounded-2xl
              border border-purple-500/30
              text-purple-300
              hover:bg-purple-500/10
              transition
            "
          >
            All Interviews
          </Link>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
