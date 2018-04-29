import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {PasswordReset} from '../models/passwordReset'

@Injectable()
export class PasswordResetService {
    private _passwordResets : PasswordReset[] = [];
    private lastUpdated: Date = null;
    private URL = 'http://localhost:8080/evtest/rest/passwordReset.php/';


    constructor (private http: Http) 
    {   
    
    }
    
    getPasswordResets (): Promise<PasswordReset[]> {
    	if (this._passwordResets.length === 0) {
    		return this.http.get(this.URL)
               .toPromise()
               .then(response => response.json())
               .catch(this.handleError);
    	}
    
        return Promise.resolve(this._passwordResets);
    }

    getPasswordResetById (id: number): Promise<PasswordReset>  {
        return Promise.resolve(this._passwordResets.filter(
            instance => instance.id===id)[0]);
    }
    
    
    
    private handleError(error: any) {
    	console.error('An error occurred', error);
    	return Promise.reject(error.message || error);
  	}
}
