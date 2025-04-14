// src/app/services/hackathon-controller.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Hackathon } from '../models/hackathon';
import { ApiConfiguration } from '../api-configuration';
import { BaseService } from '../base-service';
import { StrictHttpResponse } from '../strict-http-response';
import { RequestBuilder } from '../request-builder';

@Injectable({ providedIn: 'root' })
export class HackathonControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  static readonly GetAllHackathonsPath = '/api/hackathons';

  getAllHackathons$Response(): Observable<StrictHttpResponse<Array<Hackathon>>> {
    const rb = new RequestBuilder(this.rootUrl, HackathonControllerService.GetAllHackathonsPath, 'get');
    return this.http.request(rb.build({ responseType: 'json', accept: 'application/json' })).pipe(
      map((r: any) => r as StrictHttpResponse<Array<Hackathon>>)
    );
  }

  getAllHackathons(): Observable<Array<Hackathon>> {
    return this.getAllHackathons$Response().pipe(
      map((r: StrictHttpResponse<Array<Hackathon>>) => r.body)
    );
  }
}