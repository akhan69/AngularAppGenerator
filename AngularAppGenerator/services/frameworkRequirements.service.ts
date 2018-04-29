import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {FrameworkRequirements} from '../models/frameworkRequirements'

@Injectable()
export class FrameworkRequirementsService {
    private _frameworkRequirementss : FrameworkRequirements[] = [];
    private lastUpdated: Date = null;
    private URL = 'http://localhost:8080/evtest/rest/frameworkRequirements.php/';


    constructor (private http: Http) 
    {   
    
    }
    
    getFrameworkRequirementss (): Promise<FrameworkRequirements[]> {
    	if (this._frameworkRequirementss.length === 0) {
    		return this.http.get(this.URL)
               .toPromise()
               .then(response => response.json())
               .catch(this.handleError);
    	}
    
        return Promise.resolve(this._frameworkRequirementss);
    }

    getFrameworkRequirementsById (id: number): Promise<FrameworkRequirements>  {
        return Promise.resolve(this._frameworkRequirementss.filter(
            instance => instance.requirementId===id)[0]);
    }
    
    
    
    private handleError(error: any) {
    	console.error('An error occurred', error);
    	return Promise.reject(error.message || error);
  	}
}
