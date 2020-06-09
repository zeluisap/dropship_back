import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as _ from 'lodash';

@Injectable()
export class HttpReposService {
  constructor(private config: ConfigService, private http: HttpService) {}

  async get(path, params = {}) {
    return await this.request(path, params);
  }

  async post(path, params = {}) {
    return await this.request(path, params, 'post');
  }

  async request(path, params = {}, method = 'get') {
    const url = this.config.get('REPOSITORIO_URL') + path;

    let response = null;
    if (method.toLowerCase() === 'get') {
      response = await this.http.get(url, { params }).toPromise();
    } else {
      response = await this.http[method](url, params).toPromise();
    }

    return _.get(response, 'data');
  }
}
