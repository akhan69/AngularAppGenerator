import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { IRegisteredService } from '../util/IRegisteredService';
import { AppStateService } from '../app-state.service';
import { AppSettings } from '../config/appSettings';

import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, retry } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Rx } from 'rx';
import 'rxjs/Rx';

import { %model } from '../models/%filename';

@Injectable()
export class %modelService implements IRegisteredService {
    private %array: %model[];
    private lastUpdated: Date = null;
    private _promise: Observable<%model[]>;
    private URL = AppSettings.API_ENDPOINT + '%filename.php/';

    constructor(private http: HttpClient, private appState: AppStateService) {
    // This is excessive because global objects don't need to be cleared
       this.appState.registerService(this);
    }

    public get%models(): Observable<%model[]> {
        if (this.%array) {
            this._promise = null;
            return  Observable.of(this.%array);
        } else if (this._promise) {
            return this._promise;
        } else {
           this._promise = this.http.get<%model[]>(this.URL)
               .map((response) => {
                  this.lastUpdated = new Date();
                  this._promise = null;
                  this.%array = response;
                  return this.%array;
               })
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
            return this.post(%item)
                .map(
                // append the item to the list
                (my%item) => {
                    this.%array.push(my%item);
                    return my%item;
                });
        } else {
            return this.put(%item).
                map(
                // update the item in the list
                (my%item) => {
                    const index = this.%array.findIndex((item) =>
                    item.%idfield == %item.%idfield);
                    this.%array[index] = %item;
                    return this.%array[index];
                }
                );
        }
    }

    public delete(%item: %model): Observable<%model> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const url = `${this.URL}/${%item.%idfield}`;

        return this.http
            .delete(url, { headers })
            .pipe(catchError(this.handleError));
    }

    public clear() {
        this.%array = null;
    }

    private post(%item: %model): Observable<%model> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        return this.http
            .post<%model>(this.URL, JSON.stringify(%item), { headers })
            .pipe(catchError(this.handleError));
    }
    private put(%item: %model): Observable<%model> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const url = `${this.URL}/${%item.%idfield}`;

        return this.http
            .put(url, JSON.stringify(%item), { headers })
            .pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse) {
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
      return new ErrorObservable(
        'Something bad happened; please try again later.');
    }
}