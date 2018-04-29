import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {TaskAssignments} from '../models/taskAssignments'

@Injectable()
export class TaskAssignmentsService {
    private _taskAssignmentss : TaskAssignments[] = [];
    private lastUpdated: Date = null;
    private URL = 'http://localhost:8080/evtest/rest/taskAssignments.php/';


    constructor (private http: Http) 
    {   
    
    }
    
    getTaskAssignmentss (): Promise<TaskAssignments[]> {
    	if (this._taskAssignmentss.length === 0) {
    		return this.http.get(this.URL)
               .toPromise()
               .then(response => response.json())
               .catch(this.handleError);
    	}
    
        return Promise.resolve(this._taskAssignmentss);
    }

    getTaskAssignmentsById (id: number): Promise<TaskAssignments>  {
        return Promise.resolve(this._taskAssignmentss.filter(
            instance => instance.taskId===id)[0]);
    }
    
    
    
    private handleError(error: any) {
    	console.error('An error occurred', error);
    	return Promise.reject(error.message || error);
  	}
}
