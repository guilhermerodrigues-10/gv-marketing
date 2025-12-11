import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('alex@taskflow.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      login(email);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-8 bg-black border-b-4 border-primary-500">
          <div className="flex justify-center mb-6">
             <img
               src="/logo.png"
               alt="GV Marketing Logo"
               className="h-32 w-auto object-contain"
             />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo</h1>
            <p className="text-slate-400">Acesse sua área exclusiva</p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Endereço de Email" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              required
            />
            
            <Input 
              label="Senha" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-sm">
               <label className="flex items-center text-slate-600 dark:text-slate-400 cursor-pointer">
                 <input type="checkbox" className="mr-2 rounded border-slate-300 text-primary-500 focus:ring-primary-500" />
                 Lembrar-me
               </label>
               <Link to="/forgot-password" className="text-primary-500 hover:text-primary-600 font-medium">Esqueceu a senha?</Link>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};