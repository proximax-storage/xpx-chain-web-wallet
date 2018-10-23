import { catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
// import { Listener } from "nem2-sdk/dist";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private headers: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  websocketIsOpen = false;
  // connectionWs: Listener;

  constructor(private http: HttpClient) { }

  // openConnectionWs() {
  //   this.websocketIsOpen = true;
  //   const listener = new Listener(environment.socket, WebSocket);
  //   return listener;
  // }

  // getConnectionWs() {
  //   if (!this.websocketIsOpen) {
  //     this.connectionWs = this.openConnectionWs();
  //     return this.connectionWs;
  //   }
  //   return this.connectionWs;
  // }

  get(path?: string, headers = {}): Observable<HttpResponse<any>> {
    this.appendHeader(headers);
    return this
      .http
      .get(`${environment.apiUrl}${path}`, { headers: this.headers, observe: 'response' })
      .pipe(tap(res => res), catchError(error => this.handleError(error)));
  }

  put(path: string, body: Object = {}): Observable<HttpResponse<any>> {
    return this
      .http
      .put(`${environment.apiUrl}${path}`, JSON.stringify(body), { headers: this.headers, observe: 'response' })
      .pipe(tap(res => res), catchError(error => this.handleError(error)));
  }

  post(path: string, body: Object = {}): Observable<HttpResponse<any>> {
    return this
      .http
      .post<any>(`${environment.apiUrl}${path}`, JSON.stringify(body), { headers: this.headers, observe: 'response' })
      .pipe(tap(res => res), catchError(error => this.handleError(error)));
  }

  delete(path): Observable<HttpResponse<any>> {
    return this
      .http
      .delete(`${environment.apiUrl}${path}`, { headers: this.headers, observe: 'response' })
      .pipe(tap(res => res), catchError(error => this.handleError(error)));
  }

  appendHeader(headers): void {
    if (Object.keys(headers).length){
      Object.keys(headers).forEach(element => {
        this.headers = this.headers.append(element, headers[element]);
      });
    }
  }

  private handleError(error: Response | any) {
    return throwError(new Error(error));
  }
}
