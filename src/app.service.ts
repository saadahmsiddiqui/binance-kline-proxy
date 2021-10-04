import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  getBinanceKLines(
    symbol: string,
    interval:
      | '1m'
      | '3m'
      | '5m'
      | '15m'
      | '30m'
      | '1h'
      | '2h'
      | '4h'
      | '6h'
      | '8h'
      | '12h'
      | '1d'
      | '3d'
      | '1w'
      | '1M',
    startTime: number,
    endTime: number,
    limit: number,
  ): Promise<any[][]> {
    return new Promise((res, rej) => {
      let query = `symbol=${symbol}&startTime=${startTime}&endTime=${endTime}&interval=${interval}&limit=${limit}`;
      axios
        .get(`https://api3.binance.com/api/v3/klines?${query}`)
        .then((axiosRes) => {
          if (axiosRes.status === 200) {
            res(axiosRes.data);
          } else {
            rej(new HttpException(axiosRes.data, axiosRes.status));
          }
        })
        .catch((err) => {
          if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            rej(new HttpException(err.response.data, err.response.status));
          } else if (err.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(err.request);
            rej(new HttpException(err.response.data, err.response.status));
          } else {
            // Something happened in setting up the request that triggered an Error
             rej(new HttpException(err.message, 500));
          }
        });
    });
  }
}
