import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {Framework} from '../models/framework'

@Injectable()
export class FrameworkService {
    private _frameworks : Framework[] = [];
    private lastUpdated: Date = null;
    private URL = 'http://localhost:8080/evtest/rest/framework.php/';


    constructor (private http: Http) 
    {   
    
    }
    
    getFrameworks (): Promise<Framework[]> {
    	if (this._frameworks.length === 0) {
    		return this.http.get(this.URL)
               .toPromise()
               .then(response => response.json())
               .catch(this.handleError);
    	}
    
        return Promise.resolve(this._frameworks);
    }

    getFrameworkById (id: number): Promise<Framework>  {
        return Promise.resolve(this._frameworks.filter(
            instance => instance.frameworkId===id)[0]);
    }
    
    
    
    private handleError(error: any) {
    	console.error('An error occurred', error);
    	return Promise.reject(error.message || error);
  	}
}
