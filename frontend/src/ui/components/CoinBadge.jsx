import { cn } from "../../lib/utils";

export function CoinBadge({ amount, type = 'coin', className }) {
  const configs = {
    coin: { icon: '🪙', bg: 'bg-amber-100 border-amber-200', text: 'text-amber-700' },
    mtcoin: { icon: '💎', bg: 'bg-indigo-100 border-indigo-200', text: 'text-indigo-700' },
    promocoin: { icon: '🎟️', bg: 'bg-emerald-100 border-emerald-200', text: 'text-emerald-700' },
  };

  const config = configs[type] || configs.coin;

  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full border shadow-sm font-bold text-sm", config.bg, className)}>
      <span className="text-sm drop-shadow-sm leading-none">{config.icon}</span>
      <span className={config.text}>{amount.toLocaleString('ru-RU')}</span>
    </div>
  );
}
