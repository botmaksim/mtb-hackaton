import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../../store/usePlayerStrore';
import { useCityStore } from '../../store/useCityStore';
import { Button } from '../components/Button';
import { ArrowLeft, RefreshCw, Zap, Trash2, Building, DollarSign } from 'lucide-react';

export default function DevScreen() {
    const navigate = useNavigate();
    
    // Подключаем сторы руками для дев-панели
    const playerStore = usePlayerStore();
    const cityStore = useCityStore();

    // Мутация реального баланса "на лету" без экшенов
    const setRealBalance = (val) => usePlayerStore.setState({ realBalance: val });
    const setLevel = (val) => usePlayerStore.setState({ level: val });

    const handleHardReset = () => {
        if(window.confirm('Точно сбросить весь прогресс (кроме авторизации)?')) {
            usePlayerStore.setState({ coins: 1500, mtCoins: 50, promoCoins: 10, energy: 100, level: 1, transactions: [] });
            // Оставляем начальный домик
            useCityStore.setState({ buildings: [{ id: 'b1', type: 'residential_1', name: 'Маленький домик', x: 2, y: 3, level: 1, lastCollected: Date.now() - 3600000, maxCapacity: 100, incomeRate: 10 }] });
            alert('Сброшено!');
        }
    };

    const forceBuildingsReady = () => {
        const past = Date.now() - (1000 * 60 * 60 * 24); // -24 hours
        useCityStore.setState(state => ({
            buildings: state.buildings.map(b => ({ ...b, lastCollected: past }))
        }));
    };

    return (
        <div className="p-4 sm:p-6 max-w-lg mx-auto bg-gray-50 min-h-screen pb-20">
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors">
                    <ArrowLeft size={16} /> В профиль
                </button>
                <Button variant="danger" size="sm" onClick={handleHardReset} className="gap-1">
                    <Trash2 size={14} /> Сброс
                </Button>
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-black text-gray-900 leading-tight">Хакатон<br/><span className="text-indigo-600">Dev Panel</span> 🛠</h1>
                <p className="text-gray-500 text-sm mt-1">Центр управления полетами для демо перед жюри.</p>
            </div>
            
            <div className="space-y-6">
                
                {/* 1. ЭМУЛЯТОР БАНКА */}
                <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                        <DollarSign className="text-emerald-500" />
                        <h2 className="font-bold text-gray-900 text-lg">Банк (Реальный мир)</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Баланс Карты (BYN)</label>
                            <input 
                                type="number"
                                value={playerStore.realBalance}
                                onChange={(e) => setRealBalance(Number(e.target.value))}
                                className="w-full bg-gray-50 rounded-xl px-4 py-3 font-mono outline-none border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-lg"
                            />
                        </div>
                        
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <p className="text-sm font-bold text-indigo-900 mb-2">Генерация транзакций (MCC-синергия)</p>
                            <div className="grid grid-cols-2 gap-2">
                                <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => playerStore.addTransaction({ title: 'Кофейня "Зерно"', amount: -5.50, mcc: '5814' })}>
                                    ☕️ Кофе (MCC: 5814)
                                    <span className="block text-[8px] opacity-70">Дает Энергию</span>
                                </Button>
                                <Button size="sm" className="bg-purple-500 hover:bg-purple-600" onClick={() => playerStore.addTransaction({ title: 'Silver Screen', amount: -15, mcc: '7832' })}>
                                    🎬 Кино (MCC: 7832)
                                    <span className="block text-[8px] opacity-70">Дает МТКоины</span>
                                </Button>
                                <Button size="sm" variant="secondary" className="col-span-2 text-emerald-700" onClick={() => playerStore.addTransaction({ title: 'Зачисление стипендии/ЗП', amount: 350.00, mcc: '0000' })}>
                                    💰 Безымянное пополнение (+350 BYN)
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. ИГРОВАЯ ВАЛЮТА */}
                <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                        <Zap className="text-yellow-500" />
                        <h2 className="font-bold text-gray-900 text-lg">Игровые Ресурсы</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <CurrencyRow 
                            icon="🪙" name="Коины (Строительство)" value={playerStore.coins} 
                            onMinus={() => playerStore.subtractCoins(1000)} 
                            onPlus={() => playerStore.addCoins(1000)} 
                            step="1K" 
                        />
                        <CurrencyRow 
                            icon="💎" name="МТКоины (Донат/Призы)" value={playerStore.mtCoins} color="text-indigo-600"
                            onMinus={() => playerStore.subtractMtCoins(50)} 
                            onPlus={() => playerStore.addMtCoins(50)} 
                            step="50" 
                        />
                        <CurrencyRow 
                            icon="🎟️" name="PromoCoins (Кейсы)" value={playerStore.promoCoins} color="text-emerald-600"
                            onMinus={() => {}} 
                            onPlus={() => playerStore.addPromoCoins(10)} 
                            step="10" 
                        />
                        
                        <div className="flex items-center justify-between pt-2">
                           <span className="font-bold text-sm">Уровень Тайкуна</span>
                           <input 
                               type="number" 
                               value={playerStore.level} 
                               onChange={(e) => setLevel(Number(e.target.value))} 
                               className="w-20 bg-gray-100 rounded-lg px-2 py-1 text-center font-bold outline-none" min="1" max="99" 
                           />
                        </div>
                    </div>
                </section>

                {/* 3. УПРАВЛЕНИЕ ГОРОДОМ */}
                <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                        <Building className="text-sky-500" />
                        <h2 className="font-bold text-gray-900 text-lg">Город / Карта</h2>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between items-center bg-sky-50 p-3 rounded-xl border border-sky-100">
                            <div>
                                <p className="font-bold text-sky-900 text-sm">Смотать время</p>
                                <p className="text-[10px] text-sky-700">Заполняет казну всех зданий на максимум (отматывает сутки назад)</p>
                            </div>
                            <Button size="sm" variant="success" onClick={forceBuildingsReady}>
                                <RefreshCw size={14} /> Push
                            </Button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}

function CurrencyRow({ icon, name, value, onMinus, onPlus, step, color = "text-amber-600" }) {
    return (
        <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
            <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">{name}</span>
                <span className={`font-black font-mono text-lg ${color}`}>{icon} {value.toLocaleString()}</span>
            </div>
            <div className="flex gap-1.5">
                <button onClick={onMinus} className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold hover:bg-gray-100 active:scale-95 transition-transform flex items-center justify-center">-</button>
                <button onClick={onPlus} className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold hover:bg-indigo-100 active:scale-95 transition-transform flex items-center justify-center">+{step}</button>
            </div>
        </div>
    );
}
