import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCityStore } from '../../store/useCityStore';
import { Building2, Loader2, KeyRound, Eye } from 'lucide-react';
import { Button } from '../components/Button';
import { authApi } from '../../api/authApi';

export default function EntryScreen() {
    const navigate = useNavigate();
    const { login, register } = useAuthStore();
    const { setViewingUser } = useCityStore();
    const [isLoading, setIsLoading] = useState(false);
    
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // Режимы: 'login', 'register', 'reset'
    const [mode, setMode] = useState('login'); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (mode === 'login') {
                await login(username || 'Demo', password);
                navigate('/profile'); // После входа идем в банковский профиль
            } else if (mode === 'register') {
                await register(email, username, password);
                navigate('/profile');
            } else if (mode === 'reset') {
                // Имитация сброса пароля
                try {
                    await authApi.resetPassword(email);
                } catch(e) { /* mock fallback */ }
                alert('Ссылка для сброса отправлена на ' + email);
                setMode('login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreviewGame = () => {
        // Устанавливаем режим зрителя (демо города)
        setViewingUser('guest', 'Город-Витрина (Preview)');
        
        // Отправляем в игру (минуя банковский профиль)
        navigate('/game');
    };

    return (
        <div className="w-full h-screen bg-gradient-to-b from-indigo-900 to-indigo-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
            
            <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-[32px] p-8 shadow-2xl border border-white/20 z-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 rotate-3 transform cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={handlePreviewGame} title="Превью Игры">
                    {mode === 'reset' ? <KeyRound className="w-10 h-10 text-white" /> : <Building2 className="w-10 h-10 text-white" />}
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">MTBank Tycoon</h1>
                <p className="text-indigo-200 text-sm mb-8">
                    {mode === 'login' ? 'Строй город. Инвестируй. Побеждай.' : 
                     mode === 'register' ? 'Создай аккаунт для старта' : 
                     'Восстановление доступа'}
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    {(mode === 'register' || mode === 'reset') && (
                        <div>
                            <input 
                                required
                                placeholder="Email" 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder:text-indigo-200/50 outline-none focus:border-indigo-400 focus:bg-white/10 transition-all font-medium" 
                            />
                        </div>
                    )}
                    {mode !== 'reset' && (
                        <div>
                            <input 
                                required
                                placeholder={mode === 'login' ? "Юзернейм или Email" : "Юзернейм"}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder:text-indigo-200/50 outline-none focus:border-indigo-400 focus:bg-white/10 transition-all font-medium" 
                            />
                        </div>
                    )}
                    {mode !== 'reset' && (
                        <div>
                            <input 
                                required
                                placeholder="Пароль" 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder:text-indigo-200/50 outline-none focus:border-indigo-400 focus:bg-white/10 transition-all font-medium" 
                            />
                        </div>
                    )}
                    
                    <Button 
                        type="submit" 
                        className="w-full py-4 text-lg mt-2 bg-white text-indigo-900 border-none hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-indigo-600" /> : 
                            (mode === 'login' ? 'Войти' : 
                             mode === 'register' ? 'Создать профиль' : 
                             'Сбросить пароль')}
                    </Button>
                </form>

                <div className="mt-4">
                    <Button 
                        variant="secondary" 
                        className="w-full py-3 bg-white/10 text-white border-white/10 hover:bg-white/20 flex gap-2 justify-center" 
                        disabled={isLoading}
                        onClick={handlePreviewGame}
                        type="button"
                    >
                        <Eye size={18} /> Превью игры (Гость)
                    </Button>
                </div>
                
                <div className="mt-6 flex flex-col items-center gap-3">
                     {mode === 'login' ? (
                         <>
                             <button onClick={() => setMode('register')} className="text-sm font-medium text-indigo-300 hover:text-white transition-colors cursor-pointer">Нет аккаунта? Зарегистрироваться</button>
                             <button onClick={() => setMode('reset')} className="text-xs text-indigo-400/70 hover:text-indigo-300 transition-colors cursor-pointer">Сбросить пароль</button>
                         </>
                     ) : (
                         <button onClick={() => setMode('login')} className="text-sm font-medium text-indigo-300 hover:text-white transition-colors cursor-pointer">Назад ко входу</button>
                     )}
                </div>
            </div>
            
            <p className="fixed bottom-6 text-indigo-300/40 text-xs font-medium z-10 uppercase tracking-widest">Powered by MTBank</p>
        </div>
    );
}
