import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {User} from '../models/user'

@Injectable()
export class UserService {
    private _users : User[] = [];
    private lastUpdated: Date = null;
    private URL = 'http://localhost:8080/evtest/rest/user.php/';


    constructor (private http: Http) 
    {   
    
    }
    
    getUsers (): Promise<User[]> {
    	if (this._users.length === 0) {
    		return this.http.get(this.URL)
               .toPromise()
               .then(response => response.json())
               .catch(this.handleError);
    	}
    
        return Promise.resolve(this._users);
    }

    getUserById (id: number): Promise<User>  {
        return Promise.resolve(this._users.filter(
            instance => instance.userId===id)[0]);
    }
    
    
    
    private handleError(error: any) {
    	console.error('An error occurred', error);
    	return Promise.reject(error.message || error);
  	}
}
