# 计算 Candy 市值和价值的脚本

## 计算方法

1. 从 candy.one 拉取 Candy 内涵代币的数量；
2. 从 candy.one 拉取 Candy 内涵代币的最新价格，价格来自 big.one；
3. 根据 1 和 2 的结果计算 Candy 的价值；
4. 从 coinmarketcap.com 拉取 Candy 的最新市价；
5. 根据 3 和 4 的结果计算 Candy 的溢价比例；

## 自己运行

```
git clone git@github.com:wangshijun/candy-value-marketcap.git
yarn
node index.js
```

