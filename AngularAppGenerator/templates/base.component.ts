import { Component, OnInit, ViewChild } from '@angular/core';
import { %model } from '../models/%filename';
import { %modelDetailComponent } from './%filename-detail.component';

@Component({
    selector: '%selector',
    templateUrl: '%filename.component.html',
    styleUrls: ['%filename.component.css'],
    providers: []
})

export class %modelComponent {
    public %keyField: number;
    public searchValue: string;
    public showRequirementsSelector: boolean = false;
    @ViewChild(%modelDetailComponent) public %filename: %modelDetailComponent ;

    public on%modelSelected(%keyField: number) {
        if (%keyField === this.%keyField) {
            this.%keyField = null;
        } else {
            this.%keyField = %keyField;
        }
    }

    public onAddNew%model(event) {
        this.%keyField = event;
    }
    public on%modelSaved() {
        this.%keyField = null;
    }
    public on%modelCancelled() {
        this.%keyField = null;
    }
}