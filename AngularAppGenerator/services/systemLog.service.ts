import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {SystemLog} from '../models/systemLog'

@Injectable()
export class SystemLogService {
    private _systemLogs : SystemLog[] = [];
    private lastUpdated: Date = null;
    private URL = 'http://localhost:8080/evtest/rest/systemLog.php/';


    constructor (private http: Http) 
    {   
    
    }
    
    getSystemLogs (): Promise<SystemLog[]> {
    	if (this._systemLogs.length === 0) {
    		return this.http.get(this.URL)
               .toPromise()
               .then(response => response.json())
               .catch(this.handleError);
    	}
    
        return Promise.resolve(this._systemLogs);
    }

    getSystemLogById (id: number): Promise<SystemLog>  {
        return Promise.resolve(this._systemLogs.filter(
            instance => instance.logId===id)[0]);
    }
    
    
    
    private handleError(error: any) {
    	console.error('An error occurred', error);
    	return Promise.reject(error.message || error);
  	}
}
