import { useState } from "react";
import { usePlayerStore } from "../../../store/usePlayerStrore";
import { RefreshCcw } from "lucide-react";

export function SyncBtn() {
    const [syncing, setSyncing] = useState(false);
    const { transactions, addTransaction } = usePlayerStore();

    const handleSync = () => {
        setSyncing(true);
        setTimeout(() => {
            // Fake a new bank transaction sync
            addTransaction({ title: "Оплата: Яндекс МКБ", amount: -15.00, mcc: '7832' });
            setSyncing(false);
        }, 1500);
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
