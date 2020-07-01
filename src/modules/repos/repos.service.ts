import { Injectable } from '@nestjs/common';
import { HttpReposService } from './http-repos.service';

@Injectable()
export class ReposService {
  constructor(private http: HttpReposService) {}

  async get(id) {
    const info = await this.http.get('/repositorio/' + id);

    if (info && info.link_download) {
      info.link_download = this.url(info.link_download);
    }

    return info;
  }

  url(path) {
    return this.http.getBaseUrl() + path;
  }
}
