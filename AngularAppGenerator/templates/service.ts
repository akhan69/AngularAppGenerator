import {of as observableOf,  Observable ,  Subject, throwError } from 'rxjs';
import {map, shareReplay,  catchError, retry } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { IRegisteredService } from '../util/IRegisteredService';
import { AppStateService } from '../app-state.service';
import { AppSettings } from '../config/appSettings';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import 'rxjs/Rx';

import { %model } from '../models/%filename';

@Injectable()
export class %modelService implements IRegisteredService {
    private _needRefresh: boolean = true;
    private _serviceName: string = '%filename';
    private %array: %model[];
    private lastUpdated: number = null;
    private _promise: Observable<%model[]>;
    private URL = AppSettings.API_ENDPOINT + '%filename.php/';

    constructor(private http: HttpClient, private appState: AppStateService) {
    // This is excessive because global objects don't need to be cleared
       this.appState.registerService(this);
    }

    public get%models(): Observable<%model[]> {
        if (this.%array && this._needRefresh === false) {
            this._promise = null;
            return  Observable.of(this.%array);
        } else if (this._promise) {
            return this._promise;
        } else {
           this._promise = this.http.get<%model[]>(this.URL).pipe(
               map((response) => {
                  this.lastUpdated = Math.floor(Date.now() / 1000);
                  this._promise = null;
                  this._needRefresh = false;
                  this.%array = response;
                  return this.%array;
               }),
               shareReplay(),)
               .pipe(catchError(this.handleError));
        }
        return this._promise;
    }

    public get%modelById(id: number): Observable<%model>  {
        return this.get%models()
           .map((list) =>
                list.filter(
                    (instance) => instance.%idfield === id)[0]);
    }

    public save(%item: %model): Observable<%model> {
        if (%item.%idfield === -1) {
            return this.post(%item).pipe(
                map(
                // append the item to the list
                (my%item) => {
                    this.%array.push(my%item);
                    return my%item;
                }));
        } else {
            return this.put(%item).pipe(
                map(
                // update the item in the list
                (item) => {
                    const index = this.%array.findIndex((i) =>
                    i.%idfield == item.%idfield);
                    this.%array[index] = %item;
                    return this.%array[index];
                }
                ));
        }
    }

    public delete(%item: %model): Observable<%model> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const url = `${this.URL}/${%item.%idfield}`;

        return this.http
            .delete<%model>(url, { headers }).pipe(
            map((item) => {
                const index = this.%array.findIndex((i) =>
                i.%idfield == item.%idfield);
                this.%array.splice(index, 1);
                return item;
            }),
            shareReplay(),)
            .pipe(catchError(this.handleError));
    }

    public clear(): void {
        this.%array = null;
    }
    public updateCache(name: string, updateTime: number): void {
        if (name == this._serviceName && this.lastUpdated < updateTime) {
            this._needRefresh = true;
            this.get%models().subscribe();
        }
    }

    private post(%item: %model): Observable<%model> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        return this.http
            .post<%model>(this.URL, JSON.stringify(%item), { headers }).pipe(
                shareReplay())
            .pipe(catchError(this.handleError));
    }
    private put(%item: %model): Observable<%model> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const url = `${this.URL}/${%item.%idfield}`;

        return this.http
            .put(url, JSON.stringify(%item), { headers }).pipe(
                shareReplay())
            .pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse): Observable<any> {
      if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred. Handle it accordingly.
        console.error('An error occurred:', error.error.message);
      } else {
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong,
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${error.error}`);
      }
      // return an ErrorObservable with a user-facing error message
      return throwError(
        'Something bad happened; please try again later.');
    }
}