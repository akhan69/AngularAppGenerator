import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {EvidenceInstance} from '../models/evidenceInstance'

@Injectable()
export class EvidenceInstanceService {
    private _evidenceInstances : EvidenceInstance[] = [];
    private lastUpdated: Date = null;
    private URL = 'http://localhost:8080/evtest/rest/evidenceInstance.php/';


    constructor (private http: Http) 
    {   
    
    }
    
    getEvidenceInstances (): Promise<EvidenceInstance[]> {
    	if (this._evidenceInstances.length === 0) {
    		return this.http.get(this.URL)
               .toPromise()
               .then(response => response.json())
               .catch(this.handleError);
    	}
    
        return Promise.resolve(this._evidenceInstances);
    }

    getEvidenceInstanceById (id: number): Promise<EvidenceInstance>  {
        return Promise.resolve(this._evidenceInstances.filter(
            instance => instance.instanceId===id)[0]);
    }
    
    
    
    private handleError(error: any) {
    	console.error('An error occurred', error);
    	return Promise.reject(error.message || error);
  	}
}
