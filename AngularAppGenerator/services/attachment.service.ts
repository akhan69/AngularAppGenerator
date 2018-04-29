import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {Attachment} from '../models/attachment'

@Injectable()
export class AttachmentService {
    private _attachments : Attachment[] = [];
    private lastUpdated: Date = null;
    private URL = 'http://localhost:8080/evtest/rest/attachment.php/';


    constructor (private http: Http) 
    {   
    
    }
    
    getAttachments (): Promise<Attachment[]> {
    	if (this._attachments.length === 0) {
    		return this.http.get(this.URL)
               .toPromise()
               .then(response => response.json())
               .catch(this.handleError);
    	}
    
        return Promise.resolve(this._attachments);
    }

    getAttachmentById (id: number): Promise<Attachment>  {
        return Promise.resolve(this._attachments.filter(
            instance => instance.attachmentId===id)[0]);
    }
    
    
    
    private handleError(error: any) {
    	console.error('An error occurred', error);
    	return Promise.reject(error.message || error);
  	}
}
