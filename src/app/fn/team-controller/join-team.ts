import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface JoinTeam$Params {
  teamCode: string;
  userId: number;
}

export function joinTeam(http: HttpClient, rootUrl: string, params: JoinTeam$Params, context?: HttpContext): Observable<StrictHttpResponse<{}>> {
  const rb = new RequestBuilder(rootUrl, joinTeam.PATH, 'post');
  if (params) {
    rb.path('teamCode', params.teamCode, {});
    rb.path('userId', params.userId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context }) // Fixed to JSON
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<{}>;
    })
  );
}

joinTeam.PATH = '/api/teams/join/{teamCode}/{userId}';