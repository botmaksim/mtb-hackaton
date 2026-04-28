import { useState } from "react";
import { usePlayerStore } from "../../../store/usePlayerStore";
import { RefreshCcw } from "lucide-react";
import { bankApi } from "../../../api/bankApi";

export function SyncBtn() {
    const [syncing, setSyncing] = useState(false);
    const { addTransaction, addMtCoins } = usePlayerStore();

    const handleSync = async () => {
        setSyncing(true);
        try {
            const data = await bankApi.syncPurchases();
            addTransaction({ title: "Оплата: Яндекс МКБ", amount: -15.00, mcc: '7832' });
            if (data.reward) {
                // addMtCoins не вызываем дважды, так как addTransaction уже начисляет бонус локально
                alert(data.message + `\nВам начислено ${data.reward} МТКоинов!`);
            }
        } catch (error) {
            alert('Ошибка синхронизации транзакций!');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <button
            onClick={handleSync}
            disabled={syncing}
            className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors pointer-events-auto cursor-pointer disabled:opacity-50"
            title="Синхронизировать транзакции"
        >
            <RefreshCcw size={16} className={syncing ? "animate-spin" : ""} />
        </button>
    );
}
