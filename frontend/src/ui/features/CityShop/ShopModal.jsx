import { ModalBase } from "../../components/ModalBase";
import { Button } from "../../components/Button";
import { useCityStore, BUILDING_CATALOG } from "../../../store/useCityStore";
import { usePlayerStore } from "../../../store/usePlayerStore";
import { MapPin, Hammer, ArrowUpCircle, Landmark, Users, Loader2 } from "lucide-react";
import { useState } from "react";
import { cityApi } from "../../../api/cityApi";

export function ShopModal({ isOpen, onClose }) {
    const { buildings, upgradeBuilding, setPlacementMode } = useCityStore();
    const { coins, subtractCoins, addPromoCoins } = usePlayerStore();
    const [actionLoading, setActionLoading] = useState(null);

    const handleBuy = (item, price) => {
        if (coins >= price) {
            setPlacementMode(true, item.id, item.name, price, item.width, item.height);
            onClose(); // Закрываем модалку и переходим в режим стройки
        } else {
            alert('Не хватает коинов!');
        }
    };

    const handleUpgrade = async (id, backendCost) => {
        if (coins >= backendCost) {
            try {
                setActionLoading(`upg_${id}`);
                const res = await cityApi.upgradeBuilding(id);
                // Sync data directly from response
                usePlayerStore.getState().updateBalance(res.data.coins);
                usePlayerStore.getState().updateFromProfile({
                    ...usePlayerStore.getState(),
                    coins: res.data.coins,
                    promoCoins: res.data.promoCoins
                });

                // Fetch updated city data to update the local store safely without duplicate local mutations
                useCityStore.getState().fetchCityData();

                alert('Уровень повышен! За апгрейд вы получили +5 Промокоинов 🎟️!');
            } catch (err) {
                alert(err?.response?.data?.error || 'Ошибка при апгрейде');
            } finally {
                setActionLoading(null);
            }
        } else {
            alert('Не хватает коинов для апгрейда!');
        }
    };

    const handleSyndicate = async (item) => {
        try {
            setActionLoading('syndicate');
            const res = await cityApi.createSyndicate(item.id);
            const inviteLink = res?.data?.invite_link || "https://t.me/share/url?url=mtbank_tycoon_bot?start=synd_123";
            alert(`Отправьте инвайт-ссылку 2 друзьям!\n${inviteLink}\nПосле этого Гипермаркет (${item.width}x${item.height}) добавится вам в инвентарь!`);
        } catch (err) {
            alert(err?.response?.data?.error || 'Заблокировано. Требуется API.');
        } finally {
            setActionLoading(null);
        }
    }

    return (
        <ModalBase isOpen={isOpen} onClose={onClose} title="Каталог Строек">
            <div className="space-y-6">
                {/* New Buildings Section */}
                <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 border-b pb-1">Каталог</h4>
                    <div className="space-y-2">
                        {BUILDING_CATALOG.map((item) => (
                            <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-3 flex items-center justify-between shadow-inner">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${item.type === 'mega' ? 'bg-mtb-gradient-mixed' : item.type === 'commercial' ? 'bg-mtb-gradient-blue' : item.type === 'residential' ? 'bg-emerald-500' : 'bg-gray-500'}`}>
                                        {item.type === 'mega' ? <Users /> : item.type === 'commercial' ? <Landmark /> : <Hammer />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 leading-tight">{item.name}</p>
                                        <div className="text-[10px] text-gray-500 flex items-center gap-2 mt-0.5 font-bold">
                                            <span className="bg-white px-1 py-0.5 rounded shadow-sm border">Размер: {item.width}x{item.height}</span>
                                            {item.type !== 'decor' && <span className="flex items-center gap-0.5 text-mtb-blue"><MapPin size={10} /> +доход</span>}
                                        </div>
                                    </div>
                                </div>
                                {item.type === 'mega' ? (
                                    <Button variant="outline" size="sm" onClick={() => handleSyndicate(item)} disabled={actionLoading === 'syndicate'} className="text-xs border-orange-400 text-orange-700 hover:bg-orange-100">
                                        {actionLoading === 'syndicate' ? <Loader2 size={14} className="animate-spin" /> : 'Синдикат'}
                                    </Button>
                                ) : (
                                    <Button variant="success" size="sm" onClick={() => handleBuy(item, item.type === 'decor' ? 50 : 500)} className="font-bold shadow-md shadow-emerald-200/50 relative flex items-center justify-center gap-1">
                                        {item.type === 'decor' ? 50 : 500} <img src="/src/assets/icons/coin.png" className="w-3 h-3" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Existing Buildings Section */}
                <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 border-b pb-1">Ваш город (Апгрейды)</h4>
                    <div className="space-y-2">
                        {buildings.length === 0 && <p className="text-xs text-gray-400 italic">Сначала постройте здание</p>}
                        {buildings.map(b => {
                            const isMaxLevel = b.level >= 3;
                            const upgradeCost = b.base_cost * (b.level + 1); // Real backend calculation logic applied to UI
                            return (
                                <div key={b.id} className="bg-white border text-gray-800 border-gray-100 rounded-2xl p-3 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                    <div className="flex flex-col">
                                        <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">{b.name} <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded-md ml-1 align-middle">{isMaxLevel ? 'MAX' : `Lvl ${b.level}`}</span></span>
                                        <span className="text-xs text-gray-500 mb-1">Доход: {b.incomeRate}/час</span>
                                        {!isMaxLevel && <span className="text-[9px] text-emerald-600 font-bold uppercase flex items-center gap-1">Награда: +5 <img src="/src/assets/icons/promocoin.png" className="w-3 h-3" /></span>}
                                    </div>
                                    <Button
                                        variant={isMaxLevel ? 'secondary' : 'primary'}
                                        size="sm"
                                        onClick={() => handleUpgrade(b.id, upgradeCost)}
                                        disabled={isMaxLevel || actionLoading === `upg_${b.id}`}
                                        className={`gap-1 flex w-24 items-center justify-center ${isMaxLevel ? 'opacity-50' : ''}`}
                                    >
                                        {actionLoading === `upg_${b.id}` ? <Loader2 size={14} className="animate-spin" /> : isMaxLevel ? 'MAX LVL' : <><ArrowUpCircle size={14} /> {upgradeCost} <img src="/src/assets/icons/coin.png" className="w-3 h-3" /></>}
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>
        </ModalBase>
    );
}
