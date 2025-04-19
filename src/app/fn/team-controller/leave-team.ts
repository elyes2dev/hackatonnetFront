import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface LeaveTeam$Params {
  userId: number;
  teamId: number; // Add teamId
}

export function leaveTeam(http: HttpClient, rootUrl: string, params: LeaveTeam$Params, context?: HttpContext): Observable<StrictHttpResponse<{}>> {
  const rb = new RequestBuilder(rootUrl, leaveTeam.PATH, 'post');
  if (params) {
    rb.path('userId', params.userId, {});
    rb.path('teamId', params.teamId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => r as StrictHttpResponse<{}>)
  );
}

leaveTeam.PATH = '/api/teams/leave/{userId}/{teamId}'; // Updated path