import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {Account} from '../models/account'

@Injectable()
export class AccountService {
    private _accounts : Account[] = [];
    private lastUpdated: Date = null;
    private URL = 'http://localhost:8080/evtest/rest/account.php/';


    constructor (private http: Http) 
    {   
    
    }
    
    getAccounts (): Promise<Account[]> {
    	if (this._accounts.length === 0) {
    		return this.http.get(this.URL)
               .toPromise()
               .then(response => response.json())
               .catch(this.handleError);
    	}
    
        return Promise.resolve(this._accounts);
    }

    getAccountById (id: number): Promise<Account>  {
        return Promise.resolve(this._accounts.filter(
            instance => instance.accountId===id)[0]);
    }
    
    
    
    private handleError(error: any) {
    	console.error('An error occurred', error);
    	return Promise.reject(error.message || error);
  	}
}
