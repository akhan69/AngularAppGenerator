import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {EvidenceTask} from '../models/evidenceTask'

@Injectable()
export class EvidenceTaskService {
    private _evidenceTasks : EvidenceTask[] = [];
    private lastUpdated: Date = null;
    private URL = 'http://localhost:8080/evtest/rest/evidenceTask.php/';


    constructor (private http: Http) 
    {   
    
    }
    
    getEvidenceTasks (): Promise<EvidenceTask[]> {
    	if (this._evidenceTasks.length === 0) {
    		return this.http.get(this.URL)
               .toPromise()
               .then(response => response.json())
               .catch(this.handleError);
    	}
    
        return Promise.resolve(this._evidenceTasks);
    }

    getEvidenceTaskById (id: number): Promise<EvidenceTask>  {
        return Promise.resolve(this._evidenceTasks.filter(
            instance => instance.taskId===id)[0]);
    }
    
    
    
    private handleError(error: any) {
    	console.error('An error occurred', error);
    	return Promise.reject(error.message || error);
  	}
}
