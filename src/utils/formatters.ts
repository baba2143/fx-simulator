/**
 * 通貨フォーマッター
 */
export const formatCurrency = (amount: number, currency: string = 'JPY'): string => {
  if (isNaN(amount)) return '¥0';

  const formatter = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'JPY' ? 0 : 4,
  });

  return formatter.format(amount);
};

/**
 * パーセント フォーマッター
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  if (isNaN(value)) return '0.0%';

  return `${value.toFixed(decimals)}%`;
};

/**
 * 数値フォーマッター（カンマ区切り）
 */
export const formatNumber = (value: number, decimals: number = 0): string => {
  if (isNaN(value)) return '0';

  return new Intl.NumberFormat('ja-JP', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * 価格フォーマッター（通貨ペアに応じた小数点桁数）
 */
export const formatPrice = (price: number, currencyPair?: string): string => {
  if (isNaN(price)) return '0.0000';

  let decimals = 4;

  // JPY関連ペアは小数点2桁
  if (currencyPair && currencyPair.includes('JPY')) {
    decimals = 2;
  }

  return price.toFixed(decimals);
};

/**
 * 損益フォーマッター（プラス/マイナス表示）
 */
export const formatProfit = (profit: number, showSign: boolean = true): string => {
  if (isNaN(profit)) return '¥0';

  const sign = profit >= 0 ? '+' : '';
  const formatted = formatCurrency(Math.abs(profit));

  return showSign ? `${sign}${formatted}` : formatted;
};

/**
 * 時間フォーマッター
 */
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 日付フォーマッター（日付のみ）
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * 短縮数値フォーマッター（1K, 1M, 1Bなど）
 */
export const formatCompactNumber = (value: number): string => {
  if (isNaN(value)) return '0';

  const formatter = new Intl.NumberFormat('ja-JP', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  return formatter.format(value);
};

/**
 * 期間フォーマッター（経過時間）
 */
export const formatDuration = (startTime: number, endTime?: number): string => {
  const end = endTime || Date.now();
  const duration = end - startTime;

  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}日${hours % 24}時間`;
  } else if (hours > 0) {
    return `${hours}時間${minutes % 60}分`;
  } else if (minutes > 0) {
    return `${minutes}分`;
  } else {
    return `${seconds}秒`;
  }
};

/**
 * 勝率フォーマッター
 */
export const formatWinRate = (winCount: number, totalCount: number): string => {
  if (totalCount === 0) return '0.0%';

  const winRate = (winCount / totalCount) * 100;
  return formatPercentage(winRate, 1);
};

/**
 * pipsフォーマッター
 */
export const formatPips = (pips: number): string => {
  if (isNaN(pips)) return '0.0 pips';

  const sign = pips >= 0 ? '+' : '';
  return `${sign}${pips.toFixed(1)} pips`;
};

/**
 * ロット数フォーマッター
 */
export const formatLots = (lots: number): string => {
  if (isNaN(lots)) return '0.00';

  return lots.toFixed(2);
};