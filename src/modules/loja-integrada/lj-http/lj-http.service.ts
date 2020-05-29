import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as _ from 'lodash';

@Injectable()
export class LjHttpService {
  constructor(private config: ConfigService, private http: HttpService) {}

  async listarTodos(url, params = {}) {
    const limit = 20;
    let offset = 0;
    let total = 0;
    let contador = 0;

    let items = [];

    do {
      const response = await this.get(url, {
        ...params,
        limit,
        offset,
      });

      if (!total) {
        total = _.get(response, 'meta.total_count');
      }

      const objs = _.get(response, 'objects');
      if (!objs) {
        break;
      }

      items = [...items, ...objs];

      contador++;

      offset = contador * limit;
    } while (items.length < total);

    return items;
  }

  async get(path, params = {}) {
    return await this.request(path, params);
  }

  async post(path, params = {}) {
    return await this.request(path, params, 'post');
  }

  async put(path, params = {}) {
    return await this.request(path, params, 'put');
  }

  async request(path, params = {}, method = 'get') {
    const url = this.config.get('LOJA_INTEGRADA_URL') + path;
    const api_chave = this.config.get('LOJA_INTEGRADA_CHAVE_API');
    const aplicacao = this.config.get('LOJA_INTEGRADA_APLICACAO');

    const headers = {
      Authorization: 'chave_api ' + api_chave + ' aplicacao ' + aplicacao,
    };

    let response = null;
    if (method.toLowerCase() === 'get') {
      response = await this.http.get(url, { params, headers }).toPromise();
    } else {
      response = await this.http[method](url, params, { headers }).toPromise();
    }

    return _.get(response, 'data');
  }
}
