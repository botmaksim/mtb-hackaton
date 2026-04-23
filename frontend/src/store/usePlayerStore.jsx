import { create } from 'zustand';

export const usePlayerStore = create((set) => ({
    // Balances
    coins: 0,
    mtCoins: 0,
    promoCoins: 0,
    energy: 0,
    level: 1,

    // Real Bank (Mocked for Dev)
    realBalance: 0,
    transactions: [
        { id: 'tx1', title: 'Оплата картой: Кофейня "Зерно"', amount: -5.50, date: new Date().toISOString(), mcc: '5814' },
        { id: 'tx2', title: 'Перевод от: Мама', amount: 100.00, date: new Date(Date.now() - 86400000).toISOString() },
    ],

    updateFromProfile: (profile) => set({
        coins: profile.coins,
        mtCoins: profile.mtCoins,
        promoCoins: profile.promoCoins,
        energy: profile.energy,
        level: profile.level,
        realBalance: profile.realBalance,
    }),

    addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
    addMtCoins: (amount) => set((state) => ({ mtCoins: state.mtCoins + amount })),
    addPromoCoins: (amount) => set((state) => ({ promoCoins: state.promoCoins + amount })),
    subtractCoins: (amount) => set((state) => ({ coins: state.coins - amount })),
    subtractMtCoins: (amount) => set((state) => ({ mtCoins: state.mtCoins - amount })),

    updateBalance: (amount) => set({ coins: amount }), // Called by collectIncome API

    addTransaction: (tx) => set((state) => {
        // Mock checking MCC for game bonuses (synergy!)
        let bonusMtCoins = 0;
        let bonusEnergy = 0;
        if (tx.mcc === '5814') bonusEnergy = 50; // Coffee = energy
        if (tx.mcc === '7832') bonusMtCoins += 5; // Cinema = mtcoins

        // Любая трата дает МТКоины (1 МТКоин за каждый потраченный рубль)
        if (tx.amount < 0) {
            bonusMtCoins += Math.floor(Math.abs(tx.amount));
        }

        return {
            transactions: [{ ...tx, id: Math.random().toString(), date: new Date().toISOString() }, ...state.transactions],
            realBalance: state.realBalance + tx.amount,
            mtCoins: state.mtCoins + bonusMtCoins,
            energy: state.energy + bonusEnergy,
        };
    }),
}));
