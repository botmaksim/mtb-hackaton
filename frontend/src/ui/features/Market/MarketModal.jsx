import { useState, useEffect } from "react";
import { ModalBase } from "../../components/ModalBase";
import { Button } from "../../components/Button";
import { usePlayerStore } from "../../../store/usePlayerStrore";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { marketApi } from "../../../api/marketApi";

export function MarketModal({ isOpen, onClose }) {
    const { mtCoins, promoCoins, subtractMtCoins, addMtCoins, subtractPromoCoins } = usePlayerStore();
    const [tab, setTab] = useState('buy'); // buy | sell
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (isOpen && tab === 'buy') {
            setLoading(true);
            marketApi.getListings()
                .then(data => setListings(data?.listings || []))
                .catch(err => {
                    console.error('Market API error', err);
                    // Fallback data
                    setListings([
                        { id: 1, type: 'skin', name: 'Скин "Золотой Банк"', price: 150, seller: 'user_842', color: 'orange', description: 'Редкий декор' },
                        { id: 2, type: 'booster', name: '+50% Бустер дохода', price: 45, seller: 'Anya_Trader', color: 'fuchsia', description: 'На 24 часа' }
                    ]);
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen, tab]);

    const handleBuy = async (price, name, id) => {
        if (mtCoins >= price) {
            try {
                setActionLoading(id);
                await marketApi.buyListing(id);
                subtractMtCoins(price);
                alert(`Успешно куплено: ${name}!`);
                setListings(prev => prev.filter(l => l.id !== id));
            } catch (err) {
                alert(err?.response?.data?.error || 'Ошибка при покупке');
            } finally {
                setActionLoading(null);
            }
        } else {
            alert('Не хватает МТКоинов!');
        }
    };

    const handleSell = async () => {
        if (promoCoins >= 100) {
            try {
                setActionLoading('sell');
                await marketApi.createListing('promoCoins', 100, 10);
                subtractPromoCoins(100);
                alert('Лот успешно выставлен! Ожидайте покупателей.');
            } catch (err) {
                alert(err?.response?.data?.error || 'Ошибка при выставлении лота!');
            } finally {
                setActionLoading(null);
            }
        } else {
            alert('У вас нет 100 Промокоинов на продажу!');
        }
    };

    return (
        <ModalBase isOpen={isOpen} onClose={onClose} title="Торговая площадка P2P">
            <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
                <button 
                    onClick={() => setTab('buy')}
                    className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${tab === 'buy' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >Купить Скины</button>
                <button 
                    onClick={() => setTab('sell')}
                    className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${tab === 'sell' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >Махнуться ресами</button>
            </div>

            {tab === 'buy' && (
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex justify-center p-6"><Loader2 className="animate-spin text-indigo-500" /></div>
                    ) : listings.length === 0 ? (
                        <p className="text-center text-gray-500 p-4">Нет активных лотов</p>
                    ) : listings.map(l => (
                        <div key={l.id} className={`bg-gradient-to-r from-${l.color || 'gray'}-50 to-${l.color || 'gray'}-50 border border-${l.color || 'gray'}-100 p-3 rounded-2xl flex items-center justify-between`}>
                            <div>
                                <p className={`font-bold text-${l.color || 'gray'}-900`}>{l.name}</p>
                                <p className={`text-xs text-${l.color || 'gray'}-700/70`}>{l.description} (продавец: {l.seller})</p>
                            </div>
                            <Button size="sm" onClick={() => handleBuy(l.price, l.name, l.id)} disabled={actionLoading === l.id} className="bg-indigo-600 text-white w-20">
                                {actionLoading === l.id ? <Loader2 size={14} className="animate-spin" /> : `${l.price} 💎`}
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'sell' && (
                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 p-4 rounded-2xl text-center">
                        <ArrowRightLeft className="mx-auto text-indigo-400 w-8 h-8 mb-2" />
                        <h4 className="font-bold text-gray-900">Выставить лот</h4>
                        <p className="text-xs text-gray-500 mb-4 mt-1">Игроки могут покупать ваши сезонные ресурсы (например, Промокоины) за донат-валюту МТКоины.</p>
                        
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between mb-4">
                            <span className="font-bold text-emerald-700">100 🎟️</span>
                            <span className="text-gray-400 text-sm">➡️</span>
                            <span className="font-bold text-indigo-700">10 💎 МТКоинов</span>
                        </div>
                        <Button className="w-full" onClick={handleSell} disabled={actionLoading === 'sell'}>
                            {actionLoading === 'sell' ? <Loader2 className="animate-spin" /> : 'Выставить на маркет'}
                        </Button>
                    </div>
                </div>
            )}
        </ModalBase>
    );
}
