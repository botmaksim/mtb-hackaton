import { ModalBase } from "../../components/ModalBase";
import { Button } from "../../components/Button";
import { usePlayerStore } from "../../../store/usePlayerStrore";
import { Trophy, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cityApi } from "../../../api/cityApi";

export function AchievementsModal({ isOpen, onClose }) {
    const { coins, addPromoCoins } = usePlayerStore();
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [claiming, setClaiming] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            cityApi.getAchievements()
                .then(data => {
                    setQuests(data?.achievements || []);
                })
                .catch(err => {
                    console.error('Error fetching achievements', err);
                    // Fallback
                    setQuests([
                        { id: 'q1', title: 'Миллионер из трущоб', desc: 'Накопите 5,000 обычных коинов', condition: coins >= 5000, reward: 50, claimed: false },
                        { id: 'q2', title: 'Тотальная застройка', desc: 'Постройте 5 зданий', condition: false, reward: 100, claimed: false }, // Demo false
                        { id: 'q3', title: 'Первая инвестиция', desc: 'Вложите коины в бизнес друга', condition: true, reward: 25, claimed: false }, // Demo true
                    ]);
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen, coins]);

    const handleClaim = async (id, amount) => {
        try {
            setClaiming(id);
            await cityApi.claimAchievement(id);
            addPromoCoins(amount);
            
            // Локальный апдейт
            setQuests(prev => prev.map(q => q.id === id ? { ...q, claimed: true } : q));
        } catch (err) {
            alert(err?.response?.data?.error || 'Ошибка при получении награды');
        } finally {
            setClaiming(null);
        }
    };

    return (
        <ModalBase isOpen={isOpen} onClose={onClose} title="Сезонные Ачивки">
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 -mt-2 -mx-2 mb-4 p-4 rounded-xl flex items-center gap-4 text-white shadow-lg">
                <Trophy size={40} className="drop-shadow-md border-2 border-white/30 rounded-full p-1" />
                <div>
                    <h3 className="font-black text-lg leading-tight">Сезон 1: Neon Lights</h3>
                    <p className="text-xs font-medium text-orange-100">Фарми ачивки — лутай промокоины!</p>
                </div>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="flex justify-center p-6"><Loader2 className="animate-spin text-orange-500" /></div>
                ) : quests.map(q => (
                    <div key={q.id} className={`p-3 rounded-2xl border ${q.claimed ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-200 shadow-sm'} flex items-center justify-between`}>
                        <div className="flex-1 pr-2">
                            <h4 className={`font-bold text-sm ${q.claimed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{q.title}</h4>
                            <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{q.desc}</p>
                        </div>
                        
                        {q.claimed ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <CheckCircle2 size={16} />
                            </div>
                        ) : q.condition ? (
                            <Button 
                                size="sm" 
                                variant="success" 
                                className="shrink-0 text-[10px] px-2 py-1 shadow-emerald-200" 
                                onClick={() => handleClaim(q.id, q.reward)}
                                disabled={claiming === q.id}
                            >
                                {claiming === q.id ? <Loader2 size={14} className="animate-spin" /> : `Получить ${q.reward} 🎟️`}
                            </Button>
                        ) : (
                            <div className="bg-gray-100 text-gray-400 font-bold text-[10px] px-2 py-1 rounded-lg shrink-0">
                                В процессе
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-4">Новые ачивки появляются каждый день!</p>
        </ModalBase>
    );
}
