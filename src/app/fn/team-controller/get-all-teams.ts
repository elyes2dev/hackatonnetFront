import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';
import { Team } from '../../models/team';

export interface GetAllTeams$Params {}

export function getAllTeams(http: HttpClient, rootUrl: string, params?: GetAllTeams$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Team>>> {
  const rb = new RequestBuilder(rootUrl, getAllTeams.PATH, 'get');
  if (params) {}

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context }) // Changed to JSON
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Team>>;
    })
  );
}

getAllTeams.PATH = '/api/teams';