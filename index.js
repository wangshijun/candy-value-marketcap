/**
 * 计算 Candy 的市值和 Candy 锁定代币的价值，来计算 Candy 的溢价比例
 */
const qs = require('querystring');
const moment = require('moment');
const request = require('request-promise');

(async () => {
  try {
    // calculate candy real value
    const assetResponse = await request.get({
      url: 'https://candy.one/api/asset',
      json: true,
    });

    const assets = assetResponse.data;
    if (!Array.isArray(assets)) {
      throw new Error('asset list fetch error');
    }

    console.log('asset list fetched!');
    const symbolMap = assets.reduce((memo, x) => {
      memo[x.code] = x;
      return memo;
    }, {});

    const symbols = Object.keys(symbolMap);
    const valueResponse = await request.get({
      url: `https://market.candy.one/latest?${qs.stringify({ symbols: symbols.join(',') })}`,
      json: true,
      headers: {
        origin: 'https://candy.one',
        referer: 'https://candy.one/candy/box',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',
      },
    });

    // console.log(valueResponse);
    console.log('asset price fetched!');
    const values = symbols
      .map(x => {
        const coin = symbolMap[x];
        if (valueResponse[x]) {
          coin.price_usd = valueResponse[x].USD;
          coin.price_cny = valueResponse[x].CNY;
          coin.trading_pair = valueResponse[x].EXCHANGE;
        } else {
          coin.price_usd = coin.price;
          coin.price_cny = coin.price * valueResponse.USD.CNY;
          coin.trading_pair = '';
        }

        return coin;
      })
      .filter(x => !!x);

    // 计算净价值
    const coinValueUSD = values.reduce((total, x) => {
      total += x.price_usd * x.amount;
      return total;
    }, 0);
    const coinValueCNY = values.reduce((total, x) => {
      total += x.price_cny * x.amount;
      return total;
    }, 0);
    console.log('total value calculated', { coinValueUSD, coinValueCNY });

    // 从 coinmarketcap.com 拉取报价然后计算市值
    const priceResponse = await request.get({
      url: 'https://api.coinmarketcap.com/v1/ticker/candy/',
      json: true,
    });

    const price = priceResponse[0];
    const marketCapUSD = Number(price.price_usd) * Number(price.total_supply);
    const marketCapCNY = marketCapUSD * Number(valueResponse.USD.CNY);
    console.log('market cap calculated: ', { marketCapUSD, marketCapCNY });

    console.log(`
      Candy 市值、价值数据播报(${moment().format('YYYY年MM月DD日')})：

      1. 代币总值：${coinValueUSD.toFixed(2)} 美元，合 ${coinValueCNY.toFixed(2)} 人民币；
      2. 市场价值：${marketCapUSD.toFixed(2)} 美元，合 ${marketCapCNY.toFixed(2)} 人民币；

      市值/价值 = ${(marketCapUSD / coinValueUSD).toFixed(2)}。
    `);
  } catch (err) {
    console.error(err);
  }
})();
