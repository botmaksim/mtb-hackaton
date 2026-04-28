import { cn } from "../../lib/utils";
import coinIcon from '../../assets/icons/coin.png';
import mtcoinIcon from '../../assets/icons/mtcoin.png';
import promocoinIcon from '../../assets/icons/promocoin.png';

export function CoinBadge({ amount, type = 'coin', className }) {
  const configs = {
    coin: { icon: coinIcon, bg: 'bg-amber-100 border-amber-200', text: 'text-amber-700' },
    mtcoin: { icon: mtcoinIcon, bg: 'bg-mtb-blue/10 border-mtb-blue/20', text: 'text-mtb-blue' },
    promocoin: { icon: promocoinIcon, bg: 'bg-emerald-100 border-emerald-200', text: 'text-emerald-700' },
  };

  const config = configs[type] || configs.coin;

  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full border shadow-sm font-bold text-sm", config.bg, className)}>
      <img src={config.icon} alt={type} className="w-5 h-5 drop-shadow-sm" />
      <span className={config.text}>{amount.toLocaleString('ru-RU')}</span>
    </div>
  );
}
