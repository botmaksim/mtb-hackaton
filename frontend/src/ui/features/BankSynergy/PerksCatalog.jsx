import { ModalBase } from "../../components/ModalBase";
import { Button } from "../../components/Button";
import { usePlayerStore } from "../../../store/usePlayerStrore";
import { CreditCard, Rocket, Coffee, ArrowRightLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { cityApi } from "../../../api/cityApi";

export function PerksCatalog({ isOpen, onClose }) {
    const { mtCoins, subtractMtCoins, addCoins } = usePlayerStore();
    const [loading, setLoading] = useState(false);

    const handleExchange = async () => {
        if (mtCoins >= 1) {
            try {
                setLoading(true);
                // Call DJANGO API
                await cityApi.exchangeCurrency('mtCoins', 'coins', 1);
                subtractMtCoins(1);
                addCoins(100);
                alert('Обмен произведен: -1 МТКоин, +100 Коинов!');
            } catch (err) {
                alert(err?.response?.data?.error || 'Ошибка при обмене валют!');
            } finally {
                setLoading(false);
            }
        } else {
            alert('У вас нет МТКоинов для обмена!');
        }
    };

    return (
        <ModalBase isOpen={isOpen} onClose={onClose} title="Синергия МТБанк">
            <div className="bg-gradient-to-r from-gray-900 to-indigo-900 rounded-3xl p-5 text-white shadow-xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20"><CreditCard size={100} /></div>
                <div className="relative z-10">
                    <p className="text-white/70 text-sm mb-1 uppercase tracking-widest font-bold">Уровень карты</p>
                    <h2 className="text-3xl font-black mb-4">Tycoon Black</h2>
                    <p className="text-sm text-indigo-200 leading-relaxed max-w-[80%]">Ваша карта прокачивается вместе с городом. Тратьте MTКоины на реальные фишки!</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Bank Perks */}
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b pb-1">Реальные привилегии</h4>
                <div className="bg-white border border-gray-200 p-4 rounded-2xl flex gap-4 items-center text-gray-800 shadow-sm">
                    <div className="bg-orange-100 text-orange-600 w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl shadow-inner">
                        <Coffee />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold">Бесплатный Кофе</h4>
                        <p className="text-xs text-gray-500 leading-tight mt-0.5">Купон в кофейню "Зерно". Активация карты.</p>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0 w-20">100 💎</Button>
                </div>

                <div className="bg-white border border-gray-200 p-4 rounded-2xl flex gap-4 items-center text-gray-800 shadow-sm opacity-50 grayscale pointer-events-none">
                    <div className="bg-emerald-100 text-emerald-600 w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl shadow-inner">
                        <Rocket />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold">+1% Манибэка</h4>
                        <p className="text-xs text-gray-500 leading-tight mt-0.5">Требуется 5 ур. города</p>
                    </div>
                    <Button size="sm" variant="secondary" className="shrink-0 w-20">Locked</Button>
                </div>

                {/* Currency Exchange */}
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b pb-1 mt-6">Обменник валют</h4>
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-indigo-900">МТКоины ➡️ Коины</h4>
                        <p className="text-[10px] text-indigo-600 font-bold uppercase mt-1 flex items-center gap-1">
                            1 💎 = 100 🪙
                        </p>
                    </div>
                    <Button size="sm" className="bg-indigo-600 whitespace-nowrap" onClick={handleExchange} disabled={loading}>
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <><ArrowRightLeft size={14} className="mr-1" /> Обменять</>}
                    </Button>
                </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <p className="text-sm font-bold text-gray-900 mb-1">МСС Синхронизация работает!</p>
                <p className="text-xs text-gray-500">Покупая билеты в кино (MCC 7832), вы автоматически получите +5 МТКоинов в игре.</p>
            </div>
        </ModalBase>
    );
}
