import { ModalBase } from "../../components/ModalBase";
import { Button } from "../../components/Button";
import { ShieldAlert, TrendingUp, Loader2, Eye, Search } from "lucide-react";
import { socialApi } from "../../../api/socialApi";
import { useState, useEffect } from "react";
import { usePlayerStore } from "../../../store/usePlayerStore";
import { useCityStore } from "../../../store/useCityStore";

export function Leaderboard({ isOpen, onClose }) {
    const { subtractCoins } = usePlayerStore();
    const { setViewingUser } = useCityStore();
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Загрузка реальных данных лидерборда с бэкенда
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            socialApi.getLeaderboard()
                .then(data => {
                    // Ожидаем массив: [{ id: 1, name: "Иван", rank: 1, score: 1000, investable: true, isMe: false }, ...]
                    setFriends(data?.leaderboard || []);
                })
                .catch(err => {
                    console.error(err);
                    // Fallback для хакатона, если бэк не отвечает
                    setFriends([
                        { id: 101, name: "Степан (API Error Demo)", rank: 1, score: 15400, investable: false },
                        { id: 102, name: "Аня_Трейдер", rank: 2, score: 12050, investable: true },
                        { id: 103, name: "Я (Ты)", rank: 3, score: 8400, investable: false, isMe: true },
                        { id: 104, name: "Иван Завод", rank: 4, score: 5300, investable: true },
                    ]);
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    const handleInvest = async (friendId) => {
        try {
            setActionLoading(`invest_${friendId}`);
            const investAmount = 500;
            // Делаем реальный API вызов
            await socialApi.investInFriend(friendId, investAmount);
            subtractCoins(investAmount);
            alert('Успешно инвестировали! Доход придет, когда друг соберет налоги.');
        } catch (error) {
            alert(error?.response?.data?.error || 'Ошибка при инвестировании!');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAudit = async (friendId) => {
        try {
            setActionLoading(`audit_${friendId}`);
            // Делаем реальный API вызов
            await socialApi.sendAudit(friendId);
            alert('Налоговая проверка отправлена! Его доход упадет, пока он не зайдет в игру.');
        } catch (error) {
            alert(error?.response?.data?.error || 'Ошибка. Возможно, проверка уже активна!');
        } finally {
            setActionLoading(null);
        }
    };

    const handleViewCity = (userId, userName) => {
        setViewingUser(userId, userName);
        onClose(); // Закрываем модалку - игрок переместится в чужой город
    };

    const filteredFriends = friends.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <ModalBase isOpen={isOpen} onClose={onClose} title="Друзья & Синдикаты">

            {/* Mechanics Highlights */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 snap-x">
                <div className="min-w-[85%] snap-center shrink-0 bg-gradient-to-br from-rose-50 to-red-50 border border-red-200 p-4 rounded-3xl shadow-sm">
                    <div className="bg-red-100 text-red-600 w-10 h-10 flex items-center justify-center rounded-xl mb-3 shadow-inner">
                        <ShieldAlert size={20} />
                    </div>
                    <h4 className="font-bold text-red-900 leading-tight">Налоговая Проверка</h4>
                    <p className="text-xs text-red-700/80 mt-1 leading-relaxed">Нашли город конкурента? Врежьте ему проверку! Его доход упадет, пока он не зайдет в игру.</p>
                </div>

                <div className="min-w-[85%] snap-center shrink-0 bg-gradient-to-br from-emerald-50 to-teal-50 border border-teal-200 p-4 rounded-3xl shadow-sm">
                    <div className="bg-teal-100 text-teal-600 w-10 h-10 flex items-center justify-center rounded-xl mb-3 shadow-inner">
                        <TrendingUp size={20} />
                    </div>
                    <h4 className="font-bold text-teal-900 leading-tight">Инвестиции в бизнес</h4>
                    <p className="text-xs text-teal-700/80 mt-1 leading-relaxed">Вложи 50% коинов в здание друга. Ты получишь прибыль только если друг сам зайдет и соберет кассу.</p>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <Search size={18} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Найти игрока..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm text-gray-800 w-full placeholder:text-gray-400"
                />
            </div>

            <h4 className="font-bold text-gray-900 mb-3 px-1">Рейтинг Сезона</h4>
            <div className="bg-white border text-gray-800 border-gray-100 rounded-3xl shadow-sm overflow-hidden divide-y divide-gray-50">
                {loading ? (
                    <div className="p-6 flex justify-center"><Loader2 className="animate-spin text-mtb-blue" /></div>
                ) : filteredFriends.map((f, i) => (
                    <div key={f.id || i} className={`p-4 flex items-center gap-3 ${f.isMe ? 'bg-mtb-blue/5' : ''}`}>
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'}`}>
                            {f.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm truncate ${f.isMe ? 'text-mtb-blue font-serif' : 'text-gray-900 font-serif'}`}>{f.name}</p>
                            <p className="text-xs text-gray-500 font-medium flex items-center gap-1">{f.score.toLocaleString()} <img src="/src/assets/icons/coin.png" className="w-3 h-3" /></p>
                        </div>

                        {!f.isMe && (
                            <div className="flex shrink-0 items-center gap-2">
                                <button onClick={() => handleViewCity(f.id, f.name)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex flex-shrink-0 items-center justify-center text-gray-500 transition-colors" title="Смотреть город">
                                    <Eye size={16} />
                                </button>
                                {f.investable ? (
                                    <Button
                                        size="sm" variant="success"
                                        className="text-[10px] px-2 py-1 h-auto rounded-lg shadow-none flex-shrink-0 w-24"
                                        onClick={() => handleInvest(f.id)}
                                        disabled={actionLoading === `invest_${f.id}`}
                                    >
                                        {actionLoading === `invest_${f.id}` ? <Loader2 size={12} className="animate-spin" /> : 'Инвестировать'}
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm" variant="danger"
                                        className="text-[10px] px-2 py-1 h-auto rounded-lg shadow-none flex-shrink-0 w-24"
                                        onClick={() => handleAudit(f.id)}
                                        disabled={actionLoading === `audit_${f.id}`}
                                    >
                                        {actionLoading === `audit_${f.id}` ? <Loader2 size={12} className="animate-spin" /> : 'Проверка!'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {!loading && filteredFriends.length === 0 && (
                    <div className="p-6 text-center text-gray-500 text-sm">Никого не найдено</div>
                )}
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">Топ-10 разделят призовой фонд МТКоинов в конце месяца</p>
        </ModalBase>
    );
}
