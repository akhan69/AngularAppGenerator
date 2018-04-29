import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {UserGroup} from '../models/userGroup'

@Injectable()
export class UserGroupService {
    private _userGroups : UserGroup[] = [];
    private lastUpdated: Date = null;
    private URL = 'http://localhost:8080/evtest/rest/userGroup.php/';


    constructor (private http: Http) 
    {   
    
    }
    
    getUserGroups (): Promise<UserGroup[]> {
    	if (this._userGroups.length === 0) {
    		return this.http.get(this.URL)
               .toPromise()
               .then(response => response.json())
               .catch(this.handleError);
    	}
    
        return Promise.resolve(this._userGroups);
    }

    getUserGroupById (id: number): Promise<UserGroup>  {
        return Promise.resolve(this._userGroups.filter(
            instance => instance.userId===id)[0]);
    }
    
    
    
    private handleError(error: any) {
    	console.error('An error occurred', error);
    	return Promise.reject(error.message || error);
  	}
}
