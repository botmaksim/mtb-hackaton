import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useCityStore } from '../../store/useCityStore';
import { useNavigate } from 'react-router-dom';
import { CoinBadge } from '../components/CoinBadge';
import {
    LogOut,
    ShoppingCart,
    Users,
    Wallet,
    Store as StoreIcon,
    TrendingUp,
    LayoutGrid
} from 'lucide-react';
import MainCityScene from '../../game/MainCityScene';

// Modals
import { ShopModal } from '../features/CityShop/ShopModal';
import { Leaderboard } from '../features/SocialGrowth/Leaderboard';
import { PerksCatalog } from '../features/BankSynergy/PerksCatalog';
import { MarketModal } from '../features/Market/MarketModal';
import { AchievementsModal } from '../features/Achievements/AchievementsModal';
import { RewardPopup } from '../features/GachaCases/RewardPopup';

export default function MainGameScreen() {
    const navigate = useNavigate();
    const { logout, fetchProfile } = useAuthStore();
    const { coins, mtCoins, promoCoins, level } = usePlayerStore();
    const { buildings, viewingUserId, viewingUserName } = useCityStore();
    const isSpectator = viewingUserId !== null;

    useEffect(() => {
        if (!isSpectator) fetchProfile();
    }, [fetchProfile, isSpectator]);

    const [modals, setModals] = useState({
        shop: false, social: false, bank: false, market: false, achievements: false, cases: false
    });

    const totalIncomePerSec = buildings.reduce((acc, b) => {
        return acc + ((b.incomeRate || 0) * (2 ** ((b.level || 1) - 1))) / 10;
    }, 0);

    const toggleModal = (key) => setModals(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="relative w-full h-screen bg-mtb-gradient-dark bg-noise overflow-hidden flex flex-col text-white font-sans">

            {/* --- ВЕРХНЯЯ ПАНЕЛЬ (HUD TOP) --- */}
            <header className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
                <div className="flex justify-between items-start w-full px-4">

                    {/* ЛЕВАЯ ЧАСТЬ: Профиль в самом углу */}
                    <div className="pt-4 pointer-events-auto">
                        <div className="relative group cursor-pointer" onClick={() => navigate('/profile')}>
                            <div className="w-14 h-14 rounded-2xl border-2 border-white/20 bg-mtb-gradient-blue shadow-[0_10px_20px_rgba(0,33,243,0.3)] flex items-center justify-center overflow-hidden transition-transform active:scale-95">
                                <img src="/api/placeholder/60/60" alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            {/* Уровень справа у аватара */}
                            <div className="absolute -bottom-1 -right-2 w-7 h-7 bg-amber-500 border-2 border-slate-900 rounded-lg flex items-center justify-center shadow-lg">
                                <span className="text-[12px] font-black text-slate-900">{level}</span>
                            </div>
                        </div>
                    </div>

                    {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ: Монеты и Доход */}
                    <div className="flex flex-col items-center pointer-events-auto">
                        {/* Монеты (Полуовалы, уходящие вверх) */}
                        <div className="flex gap-1 items-start">
                            {[
                                { val: coins, type: 'coin' },
                                { val: mtCoins, type: 'mtcoin' },
                                { val: promoCoins, type: 'promocoin' }
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-slate-800/90 backdrop-blur-md border-x border-b border-white/10 px-4 pb-2 pt-1 rounded-b-[2rem] shadow-xl flex items-center justify-center min-w-[90px]"
                                >
                                    <CoinBadge
                                        amount={item.val}
                                        type={item.type}
                                        className="bg-transparent border-none shadow-none p-0 scale-125"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Доход прямо под монетами */}
                        <div className="mt-2 bg-black/40 backdrop-blur-md px-4 py-1 rounded-full border border-emerald-500/30 flex items-center gap-2">
                            <TrendingUp size={14} className="text-emerald-400" />
                            <span className="text-xs font-mono font-bold text-emerald-400">
                                +{totalIncomePerSec > 1000 ? (totalIncomePerSec / 1000).toFixed(1) + 'k' : totalIncomePerSec.toFixed(1)}/с
                            </span>
                        </div>
                    </div>

                    {/* ПРАВАЯ ЧАСТЬ: Выход */}
                    <div className="pt-4 pointer-events-auto">
                        <button
                            onClick={() => { logout(); navigate('/'); }}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all active:scale-90"
                        >
                            <LogOut size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* --- ИГРОВАЯ СЦЕНА --- */}
            <main className="absolute inset-0 z-0">
                <MainCityScene />
            </main>

            {/* --- НИЖНЯЯ ПАНЕЛЬ (NAVIGATION) --- */}
            <nav className="absolute bottom-6 left-0 right-0 z-40 px-6 pointer-events-none">
                <div className="max-w-lg mx-auto w-full bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/10 p-2 pointer-events-auto flex justify-around items-center">

                    <NavBtn
                        icon={StoreIcon}
                        label="Магазин"
                        onClick={() => toggleModal('shop')}
                        active={modals.shop}
                    />

                    <NavBtn
                        icon={ShoppingCart}
                        label="Рынок"
                        onClick={() => toggleModal('market')}
                        active={modals.market}
                    />

                    {/* Центральная кнопка (Заблокирована/Кейсы) */}
                    <div className="relative -top-5">
                        <div className="relative group">
                            <button
                                onClick={() => toggleModal('cases')}
                                className="w-18 h-18 bg-mtb-gradient-blue rounded-3xl flex items-center justify-center text-white border-4 border-slate-900 shadow-xl transition-transform active:scale-95 hover:rotate-6 cursor-pointer"
                            >
                                <LayoutGrid size={32} />
                            </button>
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-mtb-red text-[8px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap border border-slate-900">
                                Кейсы
                            </div>
                        </div>
                    </div>

                    <NavBtn
                        icon={Users}
                        label="Друзья"
                        onClick={() => toggleModal('social')}
                        active={modals.social}
                    />

                    <NavBtn
                        icon={Wallet}
                        label="Банк"
                        onClick={() => toggleModal('bank')}
                        active={modals.bank}
                    />
                </div>
            </nav>

            {/* Modals */}
            <ShopModal isOpen={modals.shop} onClose={() => toggleModal('shop')} />
            <Leaderboard isOpen={modals.social} onClose={() => toggleModal('social')} />
            <PerksCatalog isOpen={modals.bank} onClose={() => toggleModal('bank')} />
            <MarketModal isOpen={modals.market} onClose={() => toggleModal('market')} />
            <AchievementsModal isOpen={modals.achievements} onClose={() => toggleModal('achievements')} />
            <RewardPopup isOpen={modals.cases} onClose={() => toggleModal('cases')} />

            {/* Режим зрителя */}
            {isSpectator && (
                <div className="absolute top-28 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                    <div className="bg-amber-500 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-2xl">
                        🏠 В гостях: {viewingUserName || viewingUserId}
                    </div>
                </div>
            )}
        </div>
    );
}

function NavBtn({ icon: Icon, label, onClick, active }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-all rounded-2xl ${active ? 'text-mtb-red bg-mtb-red/10' : 'text-slate-500 hover:text-white'
                }`}
        >
            <Icon size={24} />
            <span className={`text-[10px] mt-1 font-bold uppercase tracking-tighter ${active ? 'opacity-100' : 'opacity-60'}`}>
                {label}
            </span>
        </button>
    );
}