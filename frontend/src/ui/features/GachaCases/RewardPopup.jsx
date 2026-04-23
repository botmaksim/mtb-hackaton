import { useState } from "react";
import { ModalBase } from "../../components/ModalBase";
import { Button } from "../../components/Button";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayerStore } from "../../../store/usePlayerStore";
import { Sparkles, PackageOpen, BatteryCharging, Zap, Ticket, Gift } from "lucide-react";
import { cityApi } from "../../../api/cityApi";

// Маппинг типов дропа для фронтенда
const DROP_TYPES = {
    mtCoins: { icon: Zap, label: 'МТКоины', color: 'from-indigo-400 to-indigo-600', textColors: 'from-indigo-600 to-purple-600' },
    promoCoins: { icon: Ticket, label: 'Промокоины', color: 'from-emerald-400 to-emerald-600', textColors: 'from-emerald-600 to-teal-600' },
    coins: { icon: Sparkles, label: 'Коины', color: 'from-amber-400 to-orange-500', textColors: 'from-orange-500 to-yellow-500' },
    energy: { icon: BatteryCharging, label: 'Энергия', color: 'from-rose-400 to-red-500', textColors: 'from-red-500 to-rose-600' },
    promocode: { icon: Gift, label: 'Промокод', color: 'from-red-500 to-pink-600', textColors: 'from-red-600 to-pink-600' }
};

export function RewardPopup({ isOpen, onClose }) {
    const { mtCoins, promoCoins, subtractMtCoins, addPromoCoins, addMtCoins, addCoins } = usePlayerStore();
    const [opening, setOpening] = useState(false);
    const [reward, setReward] = useState(null);
    const [lastOpenedCase, setLastOpenedCase] = useState(null);

    const handleOpen = async (caseId, cost, currency) => {
        if (currency === 'mtCoins' && mtCoins < cost) {
            alert('Не хватает МТКоинов!');
            return;
        }
        if (currency === 'promoCoins' && promoCoins < cost) {
            alert('Не хватает Промокоинов!');
            return;
        }

        setOpening(true);
        setLastOpenedCase({ id: caseId, cost, currency });

        // Локальное списание
        if (currency === 'mtCoins') subtractMtCoins(cost);
        if (currency === 'promoCoins') usePlayerStore.setState(s => ({ promoCoins: s.promoCoins - cost }));

        try {
            const response = await cityApi.openCase(caseId);
            const dropData = response?.data?.drop || { drop_type: 'coins', amount: 100, name: "Коины" };

            const dropMatch = DROP_TYPES[dropData.drop_type] || DROP_TYPES.coins;
            const drop = { ...dropMatch, type: dropData.drop_type, amount: dropData.amount, name: dropData.name, text: dropData.text };

            setTimeout(() => {
                setReward(drop);

                // Начисляем дроп в глобальный стейт игрока
                switch (drop.type) {
                    case 'mtCoins': addMtCoins(drop.amount || 0); break;
                    case 'promoCoins': addPromoCoins(drop.amount || 0); break;
                    case 'coins': addCoins(drop.amount || 0); break;
                    case 'energy': usePlayerStore.setState(s => ({ energy: s.energy + (drop.amount || 0) })); break;
                }
                setOpening(false);
            }, 1000);

        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.error || 'Произошла ошибка при открытии кейса');
            setOpening(false);
            // Возврат
            if (currency === 'mtCoins') addMtCoins(cost);
            if (currency === 'promoCoins') addPromoCoins(cost);
        }
    };

    const handleClose = () => {
        setReward(null);
        setOpening(false);
        onClose();
    };

    return (
        <ModalBase isOpen={isOpen} onClose={handleClose} title="Кейсы и Награды">
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-6">

                <AnimatePresence mode="wait">
                    {!reward && !opening && (
                        <motion.div key="ready" exit={{ opacity: 0, scale: 0.8 }} className="flex flex-col items-center w-full gap-6">

                            {/* Обычный Кейс */}
                            <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm w-full flex flex-col items-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-[10px] px-3 py-1 font-bold rounded-bl-xl">Базовый</div>
                                <div className="w-24 h-24 bg-gradient-to-tr from-blue-400 to-sky-400 rounded-2xl shadow-lg flex items-center justify-center mb-4 border-2 border-blue-300 group-hover:rotate-6 transition-transform cursor-pointer" onClick={() => handleOpen('normal', 10, 'mtCoins')}>
                                    <PackageOpen className="w-12 h-12 text-white" />
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 mb-1">Обычный Кейс</h3>
                                <p className="text-xs text-gray-500 mb-4 h-8">Дропает Коины или Промокоины</p>
                                <Button size="sm" className="w-full" onClick={() => handleOpen('normal', 10, 'mtCoins')}>
                                    Открыть за 10 💎 (МТ)
                                </Button>
                            </div>

                            {/* Промо Кейс */}
                            <div className="bg-white rounded-3xl p-6 border-2 border-mtb-red/20 shadow-sm w-full flex flex-col items-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 bg-mtb-red text-white text-[10px] px-3 py-1 font-bold rounded-bl-xl">Реальный дроп</div>
                                <div className="w-24 h-24 bg-gradient-to-tr from-mtb-red to-orange-500 rounded-2xl shadow-lg flex items-center justify-center mb-4 border-2 border-red-300 group-hover:rotate-6 transition-transform cursor-pointer" onClick={() => handleOpen('promo', 50, 'promoCoins')}>
                                    <Gift className="w-12 h-12 text-white" />
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 mb-1">Промо Кейс</h3>
                                <p className="text-xs text-gray-500 mb-4 h-8">Сертификаты KFC, Манибэк от МТБ!</p>
                                <Button size="sm" variant="danger" className="w-full" onClick={() => handleOpen('promo', 50, 'promoCoins')}>
                                    Открыть за 50 🎟️ (Промо)
                                </Button>
                            </div>

                        </motion.div>
                    )}

                    {opening && (
                        <motion.div key="opening" initial={{ scale: 0.8 }} animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 0.4 }} className="flex flex-col items-center h-[280px] justify-center w-full">
                            <div className="w-32 h-32 bg-mtb-gradient-mixed rounded-3xl shadow-2xl flex items-center justify-center border-4 border-mtb-red/50">
                                <PackageOpen className="w-16 h-16 text-white animate-ping" />
                            </div>
                            <p className="mt-8 font-bold text-mtb-blue animate-pulse uppercase tracking-widest text-sm">Открываем...</p>
                        </motion.div>
                    )}

                    {reward && !opening && (
                        <motion.div key="reward" initial={{ scale: 0.5, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="flex flex-col items-center w-full">

                            {/* Анимация вспышки */}
                            <motion.div
                                initial={{ opacity: 1, scale: 0 }}
                                animate={{ opacity: 0, scale: 3 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="absolute inset-0 bg-white z-0 rounded-full pointer-events-none"
                            />

                            <div className="relative mb-4 mt-2 z-10">
                                <div className={`absolute inset-0 bg-gradient-to-tr ${reward.color} blur-3xl opacity-40 animate-pulse`} />
                                <div className={`w-32 h-32 bg-gradient-to-tr ${reward.color} rounded-full shadow-2xl flex items-center justify-center border-4 border-white relative z-10`}>
                                    {reward.icon && <reward.icon className="w-16 h-16 text-white drop-shadow-md" />}
                                </div>
                                {reward.amount && (
                                    <div className="absolute -top-4 -right-4 min-w-12 h-12 px-2 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-100 z-20 animate-bounce">
                                        <span className="font-black text-gray-900 text-sm">+{reward.amount > 1000 ? (reward.amount / 1000).toFixed(1) + 'K' : reward.amount}</span>
                                    </div>
                                )}
                            </div>

                            <h2 className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${reward.textColors || 'from-gray-500 to-gray-700'} mt-4 mb-2 relative z-10`}>
                                Твоя награда!
                            </h2>

                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 w-full mb-6 relative z-10 shadow-inner">
                                <p className="text-gray-800 font-bold text-lg">{reward.name}</p>
                                {reward.text && (
                                    <div className="mt-3 bg-white border-2 border-dashed border-mtb-red/30 p-3 rounded-xl">
                                        <span className="font-mono text-mtb-red font-bold text-xl tracking-widest select-all">{reward.text}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 w-full relative z-10">
                                <Button onClick={() => setReward(null)} variant="secondary" className="flex-1">
                                    К кейсам
                                </Button>
                                {lastOpenedCase && (
                                    <Button onClick={() => handleOpen(lastOpenedCase.id, lastOpenedCase.cost, lastOpenedCase.currency)} className="flex-1 relative overflow-hidden bg-mtb-blue text-white hover:opacity-90">
                                        Еще за {lastOpenedCase.cost}
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </ModalBase>
    );
}
