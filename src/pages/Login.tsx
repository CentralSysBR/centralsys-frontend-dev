import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo_full_color.svg";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm w-full max-w-md p-8 border border-[#E2E8F0]">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="CentralSys" className="h-10" />
        </div>

        <h1 className="text-2xl font-bold text-[#2D3748] mb-2 text-center">
          Acesse sua conta
        </h1>
        <p className="text-[#4A5568] text-sm mb-6 text-center">
          Utilize e-mail e senha de cadastro.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#4A5568] uppercase mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border border-[#CBD5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F9D58]"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#4A5568] uppercase mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border border-[#CBD5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F9D58]"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F9D58] text-white font-semibold py-3 rounded-lg hover:bg-[#0B7F46] transition disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
