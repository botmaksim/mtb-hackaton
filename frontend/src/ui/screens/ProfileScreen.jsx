import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CreditCard, Landmark, ScanLine, ArrowDownLeft, ShoppingCart, Copy, PlayCircle, Settings } from 'lucide-react';
import { Button } from '../components/Button';

export default function ProfileScreen() {
    const navigate = useNavigate();
    const { profile, logout, fetchProfile } = useAuthStore();
    const { realBalance, transactions } = usePlayerStore();

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return (
        <div className="w-full h-[100dvh] bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl relative">
            
            <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24 space-y-6">
                {/* Отдельный Header под банковский профиль */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Привет, {profile?.username || 'Студент'}! 👋</h1>
                        <p className="text-gray-500 text-sm">Ваш карточный счет</p>
                    </div>
                    <button 
                        onClick={() => navigate('/dev')}
                        className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition shadow-sm"
                        title="Dev Panel"
                    >
                        <Settings size={20} />
                    </button>
                </div>

                {/* Виртуальная карта */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-mtb-gradient-dark bg-noise rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-mtb-blue/30 rounded-full blur-3xl"></div>
                    
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                            <p className="text-white/60 text-sm mb-1 font-medium">Ваш баланс</p>
                            <h2 className="text-3xl font-black tracking-tight">{realBalance.toFixed(2)} <span className="text-xl text-white/70">BYN</span></h2>
                        </div>
                        <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md">
                            <Landmark className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    <div className="flex justify-between items-end relative z-10">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-white/80 font-mono text-sm tracking-widest bg-black/20 w-fit px-3 py-1 rounded-lg">
                                <span>•••• 4209</span>
                                <Copy className="w-3 h-3 text-white/50 cursor-pointer hover:text-white" />
                            </div>
                            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">MTBank Tycoon Edition</p>
                        </div>
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full border-2 border-black bg-mtb-red opacity-90 mix-blend-screen shadow-lg"></div>
                            <div className="w-10 h-10 rounded-full border-2 border-black bg-orange-400 opacity-90 mix-blend-screen shadow-lg"></div>
                        </div>
                    </div>
                </motion.div>

                {/* Быстрые действия (Bank UI) */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { icon: ArrowDownLeft, label: 'Пополнить', color: 'bg-emerald-100 text-emerald-600' },
                        { icon: ScanLine, label: 'Оплата QR', color: 'bg-purple-100 text-purple-600' },
                        { icon: CreditCard, label: 'Счета', color: 'bg-orange-100 text-orange-600' },
                        { icon: ShoppingCart, label: 'Услуги', color: 'bg-blue-100 text-blue-600' },
                    ].map((action, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <button className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${action.color} transition-transform hover:scale-105 active:scale-95 cursor-pointer`}>
                                <action.icon className="w-6 h-6" />
                            </button>
                            <span className="text-[11px] font-bold text-gray-600 tracking-wide">{action.label}</span>
                        </div>
                    ))}
                </div>

                {/* История транзакций */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 text-lg font-serif">История операций</h3>
                        <button className="text-mtb-blue text-sm font-bold bg-mtb-blue/5 px-3 py-1 rounded-full cursor-pointer hover:bg-mtb-blue/10 transition-colors border border-mtb-blue/10">Все</button>
                    </div>
                    <div className="space-y-3">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 transition-all hover:bg-gray-50">
                                <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center shadow-inner ${
                                    tx.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-600'
                                }`}>
                                    {tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-gray-900 truncate">{tx.title}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                        <span>{format(new Date(tx.date), 'dd MMMM, HH:mm', { locale: ru })}</span>
                                        {tx.mcc && <span className="bg-mtb-blue/10 text-mtb-blue font-bold px-1.5 py-0.5 rounded-md text-[9px] uppercase">МСС {tx.mcc}</span>}
                                    </div>
                                </div>
                                <div className={`font-black tracking-tight ${tx.amount > 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Имитация логаута (для отладки) */}
                <div className="text-center pt-4">
                    <button onClick={() => { logout(); navigate('/'); }} className="text-gray-400 text-sm underline cursor-pointer">Выйти из профиля</button>
                </div>

            </div>

            {/* Плавающая кнопка перехода в игру (Синергия!) */}
            <div className="absolute bottom-6 left-0 right-0 px-4">
                <Button 
                    size="lg" 
                    className="w-full relative overflow-hidden group py-4 text-lg bg-mtb-blue hover:opacity-90 border-2 border-mtb-blue/80 shadow-[0_10px_30px_rgba(0,33,243,0.3)]"
                    onClick={() => navigate('/game')}
                >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                    <PlayCircle className="mr-1" /> Построить Город
                </Button>
            </div>
            
        </div>
    );
}
