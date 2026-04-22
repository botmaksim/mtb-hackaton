import { useState } from "react";
import { ModalBase } from "../../components/ModalBase";
import { Button } from "../../components/Button";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayerStore } from "../../../store/usePlayerStore";
import { Sparkles, PackageOpen, BatteryCharging, Zap, Ticket } from "lucide-react";
import { cityApi } from "../../../api/cityApi";

// Маппинг типов дропа для фронтенда
const DROP_TYPES = {
    mtCoins: { icon: Zap, label: 'МТКоины', color: 'from-indigo-400 to-indigo-600', textColors: 'from-indigo-600 to-purple-600' },
    promoCoins: { icon: Ticket, label: 'Промокоины', color: 'from-emerald-400 to-emerald-600', textColors: 'from-emerald-600 to-teal-600' },
    coins: { icon: Sparkles, label: 'Коины', color: 'from-amber-400 to-orange-500', textColors: 'from-orange-500 to-yellow-500' },
    energy: { icon: BatteryCharging, label: 'Энергия', color: 'from-rose-400 to-red-500', textColors: 'from-red-500 to-rose-600' }
};

export function RewardPopup({ isOpen, onClose }) {
    const { mtCoins, subtractMtCoins, addPromoCoins, addMtCoins, addCoins } = usePlayerStore();
    const [opening, setOpening] = useState(false);
    const [reward, setReward] = useState(null);

    const handleOpen = async () => {
        if (mtCoins >= 10) {
            setOpening(true);
            subtractMtCoins(10); // Списываем локально для гладкости
            
            try {
                // Реальный вызов к Django: ожидаем { drop_type: 'promoCoins', amount: 50 }
                const response = await cityApi.openCase('elite_case');
                const dropData = response?.drop || { drop_type: 'promoCoins', amount: 150 }; // Fallback
                
                const dropMatch = DROP_TYPES[dropData.drop_type] || DROP_TYPES.promoCoins;
                const drop = { ...dropMatch, type: dropData.drop_type, amount: dropData.amount };
                
                // Делаем красивую паузу для анимации даже если бэк ответил мгновенно
                setTimeout(() => {
                    setReward(drop);
                    
                    // Начисляем дроп в глобальный стейт игрока
                    switch(drop.type) {
                        case 'mtCoins': addMtCoins(drop.amount); break;
                        case 'promoCoins': addPromoCoins(drop.amount); break;
                        case 'coins': addCoins(drop.amount); break;
                        case 'energy': usePlayerStore.setState(s => ({ energy: s.energy + drop.amount })); break;
                    }
                    setOpening(false);
                }, 1500);

            } catch (err) {
                console.error(err);
                alert(err?.response?.data?.error || 'Произошла ошибка при открытии кейса');
                setOpening(false);
                addMtCoins(10); // Возвращаем монеты при ошибке
            }
        } else {
            alert('Не хватает МТКоинов! Вы можете получить их за реальные покупки по карте МТБанка.');
        }
    };

    const handleClose = () => {
        setReward(null);
        setOpening(false);
        onClose();
    };

    return (
        <ModalBase isOpen={isOpen} onClose={handleClose} title="Элитный Кейс">
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-6">
                
                <AnimatePresence mode="wait">
                    {!reward && !opening && (
                        <motion.div key="ready" exit={{ opacity: 0, scale: 0.8 }} className="flex flex-col items-center w-full">
                            <div className="w-32 h-32 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-3xl shadow-2xl shadow-purple-500/40 flex items-center justify-center mb-6 border-4 border-purple-400 rotate-6 transform hover:rotate-12 transition-transform cursor-pointer" onClick={handleOpen}>
                                <PackageOpen className="w-16 h-16 text-white" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-900 mb-2">Рискни и выиграй</h3>
                            <p className="text-sm text-gray-500 mb-6">Скины на здания, бустеры дохода, гора Промокоинов или Энергия!</p>
                            
                            <Button size="lg" className="w-full relative overflow-hidden" onClick={handleOpen}>
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                                Открыть за 10 💎
                            </Button>
                        </motion.div>
                    )}

                    {opening && (
                        <motion.div key="opening" initial={{ scale: 0.8 }} animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 0.4 }} className="flex flex-col items-center h-[280px] justify-center w-full">
                            <div className="w-32 h-32 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-3xl shadow-2xl flex items-center justify-center border-4 border-purple-400">
                                <PackageOpen className="w-16 h-16 text-white animate-ping" />
                            </div>
                            <p className="mt-8 font-bold text-indigo-600 animate-pulse uppercase tracking-widest text-sm">Открываем...</p>
                        </motion.div>
                    )}

                    {reward && !opening && (
                        <motion.div key="reward" initial={{ scale: 0.5, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="flex flex-col items-center w-full">
                            <div className="relative mb-4 mt-2">
                                <div className={`absolute inset-0 bg-gradient-to-tr ${reward.color} blur-3xl opacity-40 animate-pulse`} />
                                <div className={`w-32 h-32 bg-gradient-to-tr ${reward.color} rounded-full shadow-2xl flex items-center justify-center border-4 border-white relative z-10`}>
                                    {reward.icon && <reward.icon className="w-16 h-16 text-white drop-shadow-md" />}
                                </div>
                                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-100 z-20 animate-bounce">
                                    <span className="font-black text-gray-900 text-sm">+{reward.amount > 1000 ? (reward.amount/1000).toFixed(1)+'K' : reward.amount}</span>
                                </div>
                            </div>
                            
                            <h2 className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${reward.textColors || 'from-gray-500 to-gray-700'} mt-4 mb-2`}>
                                Легендарный Дроп!
                            </h2>
                            <p className="text-gray-500 font-medium mb-8 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">И на этот раз это... <strong className="text-gray-900">{reward.label}</strong></p>
                            
                            <div className="flex gap-2 w-full">
                                <Button onClick={handleClose} variant="secondary" className="flex-1">
                                    В Главное меню
                                </Button>
                                <Button onClick={handleOpen} className="flex-1 relative overflow-hidden bg-indigo-600">
                                    Еще за 10 💎
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </ModalBase>
    );
}
