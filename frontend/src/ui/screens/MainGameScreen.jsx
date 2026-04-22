import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useCityStore } from '../../store/useCityStore';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { CoinBadge } from '../components/CoinBadge';
import { Button } from '../components/Button';
import { LogOut, Map, ShoppingCart, Users, Gift, CreditCard, Trophy, Store as StoreIcon, Home } from 'lucide-react';
import MainCityScene from '../../game/MainCityScene';

// Modals
import { ShopModal } from '../features/CityShop/ShopModal';
import { RewardPopup } from '../features/GachaCases/RewardPopup';
import { Leaderboard } from '../features/SocialGrowth/Leaderboard';
import { SyncBtn } from '../features/BankSynergy/SyncBtn';
import { PerksCatalog } from '../features/BankSynergy/PerksCatalog';
import { MarketModal } from '../features/Market/MarketModal';
import { AchievementsModal } from '../features/Achievements/AchievementsModal';

export default function MainGameScreen() {
    const navigate = useNavigate();
    const logout = useAuthStore(state => state.logout);
    const { coins, mtCoins, promoCoins, level } = usePlayerStore();
    const { viewingUserId, viewingUserName, setViewingUser, setBuildings } = useCityStore();
    const isSpectator = viewingUserId !== null;
    
    // Extends modals state
    const [modals, setModals] = useState({ 
        shop: false, 
        gacha: false, 
        social: false, 
        bank: false,
        market: false,
        achievements: false
    });
    
    const toggleModal = (key) => setModals(prev => {
        // Close others when opening one to prevent overlapping (optional, but good for mobile)
        const newState = { shop: false, gacha: false, social: false, bank: false, market: false, achievements: false };
        newState[key] = !prev[key];
        return newState;
    });

    const closeAll = () => setModals({ shop: false, gacha: false, social: false, bank: false, market: false, achievements: false });

    // Mock load enemy buildings
    useEffect(() => {
        if (isSpectator && viewingUserId !== 'guest') {
            // В идеале делаем API-запрос за городом юзера. Пока мок:
            setBuildings([
               { id: 'sb1', type: 'residential_1', name: 'Дом', x: 3, y: 3, level: 3 },
               { id: 'sb2', type: 'bank_branch', name: 'Банк', x: 2, y: 5, level: 2 },
            ]);
        }
    }, [isSpectator, viewingUserId, setBuildings]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleExitSpectator = () => {
        setViewingUser(null, null);
        if (viewingUserId === 'guest') {
            navigate('/');
        }
    };

    return (
        <div className="relative w-full h-[100dvh] overflow-hidden bg-[#87CEEB]">
            {/* Layer 1: Game Engine */}
            <div className="absolute inset-0 z-0">
                <MainCityScene />
            </div>

            {/* Layer 2: HUD & UI Overlay */}
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between max-w-md mx-auto relative shadow-2xl shadow-black/50 border-x border-white/10 sm:max-w-[400px]">
                
                {/* HUD: Top Bar */}
                <div className="pointer-events-auto p-4 flex flex-col gap-2 pt-6">
                    {isSpectator && (
                        <div className="bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-center shadow-lg border-2 border-orange-400 mb-1 flex items-center justify-between">
                            <span className="truncate">👀 Смотрим: {viewingUserName}</span>
                            <button onClick={handleExitSpectator} className="bg-orange-700 hover:bg-orange-600 px-3 py-1 rounded-lg text-xs ml-2 shrink-0">
                                {viewingUserId === 'guest' ? 'Выйти' : 'Домой'}
                            </button>
                        </div>
                    )}

                    {/* User Profile & Bank Stats */}
                    <div className="flex items-center justify-between bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-inner flex items-center justify-center text-white font-bold text-lg">
                                    {isSpectator ? '?' : level}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center pointer-events-none">
                                    <span className="text-[8px] font-black leading-none pb-px text-amber-900">★</span>
                                </div>
                            </div>
                            <div className="flex flex-col -space-y-0.5">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpectator ? 'Гость' : 'Уровень'}</span>
                                <span className="font-extrabold text-gray-900 text-sm truncate max-w-[100px]">{isSpectator ? 'Наблюдатель' : 'Тайкун'}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                             <SyncBtn />
                             <button onClick={handleLogout} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors pointer-events-auto cursor-pointer">
                                 <LogOut size={16} />
                             </button>
                        </div>
                    </div>

                    {/* Currencies HUD */}
                    {!isSpectator && (
                        <div className="flex justify-between gap-2 mt-1">
                            <CoinBadge amount={coins} type="coin" className="flex-1 justify-center bg-white/90 backdrop-blur" />
                            <CoinBadge amount={mtCoins} type="mtcoin" className="flex-1 justify-center bg-white/90 backdrop-blur" />
                            <CoinBadge amount={promoCoins} type="promocoin" className="flex-1 justify-center bg-white/90 backdrop-blur" />
                        </div>
                    )}
                </div>

                {/* Floating Side Buttons (Achievements & Market) */}
                {!isSpectator && (
                    <div className="absolute right-4 top-40 flex flex-col gap-3 pointer-events-auto">
                        <button 
                            onClick={() => toggleModal('achievements')}
                            className="w-12 h-12 bg-white/90 backdrop-blur border border-white/20 rounded-2xl shadow-lg flex items-center justify-center text-orange-500 hover:scale-105 transition-transform relative"
                        >
                            <Trophy size={22} className="drop-shadow-sm" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">1</span>
                        </button>
                        <button 
                            onClick={() => toggleModal('market')}
                            className="w-12 h-12 bg-indigo-600/90 backdrop-blur border border-indigo-400/50 rounded-2xl shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform"
                        >
                            <StoreIcon size={22} className="drop-shadow-sm" />
                        </button>
                    </div>
                )}

                {/* HUD: Quick Bank Banner */}
                {!isSpectator && (
                    <div className="pointer-events-auto px-4 mt-auto mb-4">
                        <button onClick={() => toggleModal('bank')} className="w-full bg-gradient-to-r from-gray-900 to-indigo-900 rounded-2xl p-4 shadow-xl border border-white/20 relative overflow-hidden group cursor-pointer text-left transition-transform active:scale-[0.98]">
                            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white/10 to-transparent pointer-events-none group-hover:translate-x-4 transition-transform" />
                            <div className="flex items-center justify-between relative z-10 w-full cursor-pointer">
                                <div>
                                    <h4 className="text-white font-bold text-sm tracking-wide">Моя Карта МТБанка</h4>
                                    <p className="text-indigo-200 text-xs mt-0.5">Доступны новые перки!</p>
                                </div>
                                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                    <CreditCard className="text-white w-5 h-5" />
                                </div>
                            </div>
                        </button>
                    </div>
                )}

                {/* HUD: Bottom Navigation */}
                <div className="pointer-events-auto bg-white border-t border-gray-200 pb-safe-bottom rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                    <div className="flex justify-around items-center h-20 px-2 pb-2">
                        {isSpectator ? (
                            <NavBtn icon={Home} label="Вернуться" onClick={handleExitSpectator} active={false} />
                        ) : (
                            <>
                                <NavBtn icon={Map} label="Город" active={!Object.values(modals).some(Boolean)} onClick={closeAll} />
                                <NavBtn icon={ShoppingCart} label="Стройка" onClick={() => toggleModal('shop')} active={modals.shop} />
                                <div className="relative -top-6">
                                    <button 
                                        onClick={() => toggleModal('gacha')}
                                        className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 shadow-xl shadow-orange-500/30 flex items-center justify-center border-4 border-white text-white transition-transform active:scale-95 cursor-pointer hover:shadow-orange-500/50"
                                    >
                                        <span className="text-2xl drop-shadow-md">🎰</span>
                                    </button>
                                </div>
                                <NavBtn icon={Users} label="Друзья" onClick={() => toggleModal('social')} active={modals.social} />
                                <NavBtn icon={Gift} label="МТБанк" onClick={() => toggleModal('bank')} active={modals.bank} />
                            </>
                        )}
                        
                    </div>
                </div>
            </div>

            {/* Modals Container */}
            <ShopModal isOpen={modals.shop} onClose={() => toggleModal('shop')} />
            <RewardPopup isOpen={modals.gacha} onClose={() => toggleModal('gacha')} />
            <Leaderboard isOpen={modals.social} onClose={() => toggleModal('social')} />
            <PerksCatalog isOpen={modals.bank} onClose={() => toggleModal('bank')} />
            <MarketModal isOpen={modals.market} onClose={() => toggleModal('market')} />
            <AchievementsModal isOpen={modals.achievements} onClose={() => toggleModal('achievements')} />
        </div>
    );
}

function NavBtn({ icon: Icon, label, onClick, active }) {
    return (
        <button 
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-16 h-16 transition-colors rounded-2xl cursor-pointer ${active ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-700 font-medium'}`}
        >
            <Icon className={`w-6 h-6 mb-1 ${active ? 'fill-indigo-100' : ''}`} />
            <span className="text-[10px] leading-none">{label}</span>
        </button>
    );
}
