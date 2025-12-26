import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import logo from '../assets/logo_full_color.svg';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/login', { email, password });
      const { token, usuario } = response.data;

      localStorage.setItem('@centralsys:token', token);
      localStorage.setItem('@centralsys:user', JSON.stringify(usuario));
      
      navigate('/dashboard');
    } catch (error) {
      alert('Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#F8FAFC]">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        
        <div className="mb-10 flex justify-center">
          <img 
            src={logo} 
            alt="CentralSys Logo" 
            className="h-14 w-auto object-contain"
          />
        </div>

        <h1 className="text-xl font-semibold text-[#1A2B3C] mb-1">
          Acesse sua conta
        </h1>
        <p className="text-[#4A5568] text-sm mb-6">
          Entre com suas credenciais para operar o sistema.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#4A5568] uppercase mb-1">
              E-mail
            </label>
            <input 
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1A2B3C] text-[#1A2B3C] bg-[#F8FAFC]"
              placeholder="exemplo@centralsys.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#4A5568] uppercase mb-1">
              Senha
            </label>
            <input 
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1A2B3C] text-[#1A2B3C] bg-[#F8FAFC]"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#2D6A4F] hover:opacity-90 text-white font-medium py-2.5 rounded-md transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>

      <p className="mt-8 text-[10px] text-[#4A5568] opacity-40 uppercase tracking-[0.2em] font-medium">
        Controle e Eficiência, sem complicação
      </p>
    </div>
  );
}