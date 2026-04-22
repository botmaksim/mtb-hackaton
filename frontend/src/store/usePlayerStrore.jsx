import { create } from 'zustand';

export const usePlayerStore = create((set) => ({
    // Balances
    coins: 1500,
    mtCoins: 50,
    promoCoins: 10,
    energy: 100,
    level: 1,

    // Real Bank (Mocked for Dev)
    realBalance: 1540.50,
    transactions: [
        { id: 'tx1', title: 'Оплата картой: Кофейня "Зерно"', amount: -5.50, date: new Date().toISOString(), mcc: '5814' },
        { id: 'tx2', title: 'Перевод от: Мама', amount: 100.00, date: new Date(Date.now() - 86400000).toISOString() },
    ],

    addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
    addMtCoins: (amount) => set((state) => ({ mtCoins: state.mtCoins + amount })),
    addPromoCoins: (amount) => set((state) => ({ promoCoins: state.promoCoins + amount })),
    subtractCoins: (amount) => set((state) => ({ coins: state.coins - amount })),
    subtractMtCoins: (amount) => set((state) => ({ mtCoins: state.mtCoins - amount })),
    
    addTransaction: (tx) => set((state) => {
        // Mock checking MCC for game bonuses (synergy!)
        let bonusMtCoins = 0;
        let bonusEnergy = 0;
        if (tx.mcc === '5814') bonusEnergy = 50; // Coffee = energy
        if (tx.mcc === '7832') bonusMtCoins = 5; // Cinema = mtcoins

        return {
            transactions: [{ ...tx, id: Math.random().toString(), date: new Date().toISOString() }, ...state.transactions],
            realBalance: state.realBalance + tx.amount,
            mtCoins: state.mtCoins + bonusMtCoins,
            energy: state.energy + bonusEnergy,
        };
    }),
}));
