# コミットメッセージ例

## 新機能追加
```bash
git commit -m "feat(chart): implement candlestick chart display

- Add ChartWrapper component using react-native-charts-wrapper
- Implement zoom and pan functionality
- Add timeframe switching (1H, 4H, 1D)
- Include volume indicator

Closes #15"
```

## バグ修正
```bash
git commit -m "fix(trade): correct profit calculation for sell orders

The profit calculation was incorrect for sell positions.
Fixed the formula: (openPrice - closePrice) * amount

Fixes #23"
```

## ドキュメント更新
```bash
git commit -m "docs: update installation instructions

- Add iOS setup requirements
- Update dependency versions
- Add troubleshooting section"
```

## リファクタリング
```bash
git commit -m "refactor(database): simplify SQLite query methods

- Extract common query patterns into base methods
- Reduce code duplication
- Improve type safety"
```

## UI改善
```bash
git commit -m "style(ui): improve chart loading animation

- Add skeleton loader while fetching data
- Improve transition between timeframes
- Update color scheme for better contrast"
```

## パフォーマンス改善
```bash
git commit -m "perf(chart): optimize price data rendering

- Implement data virtualization for large datasets
- Reduce memory usage by 40%
- Cache calculated indicators"
```

## テスト追加
```bash
git commit -m "test(trade): add unit tests for order execution

- Test buy/sell order creation
- Test profit calculation scenarios
- Add mock data for testing"
```