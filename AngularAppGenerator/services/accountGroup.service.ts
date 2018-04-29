import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {AccountGroup} from '../models/accountGroup'

@Injectable()
export class AccountGroupService {
    private _accountGroups : AccountGroup[] = [];
    private lastUpdated: Date = null;
    private URL = 'http://localhost:8080/evtest/rest/accountGroup.php/';


    constructor (private http: Http) 
    {   
    
    }
    
    getAccountGroups (): Promise<AccountGroup[]> {
    	if (this._accountGroups.length === 0) {
    		return this.http.get(this.URL)
               .toPromise()
               .then(response => response.json())
               .catch(this.handleError);
    	}
    
        return Promise.resolve(this._accountGroups);
    }

    getAccountGroupById (id: number): Promise<AccountGroup>  {
        return Promise.resolve(this._accountGroups.filter(
            instance => instance.groupId===id)[0]);
    }
    
    
    
    private handleError(error: any) {
    	console.error('An error occurred', error);
    	return Promise.reject(error.message || error);
  	}
}
