import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {AccountUser} from '../models/accountUser'

@Injectable()
export class AccountUserService {
    private _accountUsers : AccountUser[] = [];
    private lastUpdated: Date = null;
    private URL = 'http://localhost:8080/evtest/rest/accountUser.php/';


    constructor (private http: Http) 
    {   
    
    }
    
    getAccountUsers (): Promise<AccountUser[]> {
    	if (this._accountUsers.length === 0) {
    		return this.http.get(this.URL)
               .toPromise()
               .then(response => response.json())
               .catch(this.handleError);
    	}
    
        return Promise.resolve(this._accountUsers);
    }

    getAccountUserById (id: number): Promise<AccountUser>  {
        return Promise.resolve(this._accountUsers.filter(
            instance => instance.accountId===id)[0]);
    }
    
    
    
    private handleError(error: any) {
    	console.error('An error occurred', error);
    	return Promise.reject(error.message || error);
  	}
}
