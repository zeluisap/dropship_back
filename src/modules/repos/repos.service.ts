import { Injectable } from '@nestjs/common';
import { HttpReposService } from './http-repos.service';

@Injectable()
export class ReposService {
  constructor(private http: HttpReposService) {}

  async get(id) {
    return await this.http.get('/repositorio/' + id);
  }
}
