import React, { useState } from "react";
import authApi from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";

import logo from "../assets/4c9e612a-0575-4bb7-9906-84d085c8dc90.png";

const AIVisionHireLogo = () => (
  <div className="relative w-full h-40 flex items-center justify-center mb-1">
    <img
      src={logo}
      alt="AIVisionHire Logo"
      className="h-full object-contain drop-shadow-xl"
    />
  </div>
);

const InputField = ({ icon, ...props }) => (
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400/70">
      {icon}
    </span>
    <input
      {...props}
      required
      className="
        w-full pl-12 pr-4 py-3 rounded-xl
        bg-[#0F172A] border border-white/10
        text-white placeholder-slate-400
        focus:ring-2 focus:ring-indigo-500
        outline-none transition
      "
    />
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(form);
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch {
      setError("Giriş başarısız. Bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-indigo-900/30 blur-[180px]" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-900/25 blur-[180px]" />

      <div className="relative w-full max-w-md -translate-y-6">
        <div className="bg-[#11162A]/85 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl">

          <AIVisionHireLogo />

          <h1 className="text-3xl font-black text-center text-white -mt-1">
            AIVisionHire
          </h1>
          <p className="text-center text-slate-300/80 text-sm mt-1 mb-5">
            Yapay zeka destekli mülakat platformu
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              icon={<Mail size={18} />}
              type="email"
              name="email"
              placeholder="Email adresiniz"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />

            <InputField
              icon={<Lock size={18} />}
              type="password"
              name="password"
              placeholder="Şifreniz"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />

            <button
              disabled={loading}
              className="
                w-full py-3 rounded-xl font-semibold text-white
                bg-gradient-to-r from-indigo-500 to-purple-700
                hover:from-indigo-400 hover:to-purple-600
                transition shadow-lg shadow-indigo-900/40
              "
            >
              Giriş Yap
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            Hesabın yok mu?{" "}
            <Link to="/register" className="text-indigo-400 font-semibold">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
