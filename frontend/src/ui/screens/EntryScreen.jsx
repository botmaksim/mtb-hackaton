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
                } catch (e) { /* mock fallback */ }
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
        <div className="w-full h-screen bg-mtb-gradient-dark bg-noise flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background decorations */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-mtb-blue/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-mtb-red/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/10 z-10 text-center relative overflow-hidden">
                <div className="w-20 h-20 bg-mtb-gradient-blue rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-8 transform cursor-pointer transition-transform hover:scale-105 active:scale-95 border border-white/10" onClick={handlePreviewGame} title="Превью Игры">
                    {mode === 'reset' ? <KeyRound className="w-10 h-10 text-white" /> : <img src="/src/assets/icons/mtcoin.png" className="w-12 h-12" alt="MTBank Coin" />}
                </div>

                <h1 className="text-3xl font-serif font-bold text-white mb-2 tracking-tight leading-tight">MTBank</h1>
                <p className="text-white/60 text-xs mb-8 uppercase tracking-widest font-semibold">
                    {mode === 'login' ? 'Tycoon Edition' :
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
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/30 outline-none focus:border-mtb-blue focus:bg-white/10 transition-all font-medium"
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
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/30 outline-none focus:border-mtb-blue focus:bg-white/10 transition-all font-medium"
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
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/30 outline-none focus:border-mtb-blue focus:bg-white/10 transition-all font-medium"
                            />
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full py-4 text-lg mt-2 bg-white text-mtb-dark border-none hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-mtb-blue" /> :
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
                            <button onClick={() => setMode('register')} className="text-sm font-medium text-white/60 hover:text-white transition-colors cursor-pointer bg-transparent border-none">Нет аккаунта? Зарегистрироваться</button>
                            <button onClick={() => setMode('reset')} className="text-xs text-white/40 hover:text-white transition-colors cursor-pointer bg-transparent border-none">Сбросить пароль</button>
                        </>
                    ) : (
                        <button onClick={() => setMode('login')} className="text-sm font-medium text-white/60 hover:text-white transition-colors cursor-pointer bg-transparent border-none">Назад ко входу</button>
                    )}
                </div>
            </div>

            <p className="fixed bottom-6 text-white/30 text-xs font-bold z-10 uppercase tracking-widest leading-none">Powered by MTBank</p>
        </div>
    );
}
