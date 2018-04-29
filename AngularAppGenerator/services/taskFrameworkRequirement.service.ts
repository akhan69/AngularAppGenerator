import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {TaskFrameworkRequirement} from '../models/taskFrameworkRequirement'

@Injectable()
export class TaskFrameworkRequirementService {
    private _taskFrameworkRequirements : TaskFrameworkRequirement[] = [];
    private lastUpdated: Date = null;
    private URL = 'http://localhost:8080/evtest/rest/taskFrameworkRequirement.php/';


    constructor (private http: Http) 
    {   
    
    }
    
    getTaskFrameworkRequirements (): Promise<TaskFrameworkRequirement[]> {
    	if (this._taskFrameworkRequirements.length === 0) {
    		return this.http.get(this.URL)
               .toPromise()
               .then(response => response.json())
               .catch(this.handleError);
    	}
    
        return Promise.resolve(this._taskFrameworkRequirements);
    }

    getTaskFrameworkRequirementById (id: number): Promise<TaskFrameworkRequirement>  {
        return Promise.resolve(this._taskFrameworkRequirements.filter(
            instance => instance.===id)[0]);
    }
    
    
    
    private handleError(error: any) {
    	console.error('An error occurred', error);
    	return Promise.reject(error.message || error);
  	}
}
