import { Component, Input, EventEmitter, Output, OnInit, ViewChild } from '@angular/core';

import { %model } from '../models/%filename';
import { %modelService } from '../services/%filename.service';
import { Tabs } from '../util/tabs/tabs.component';
import { Tab } from '../util/tabs/tab.component';
import { RestoreService } from '../util/restore.service';
import { ChangeEvent, ActionType } from '../util/changeEvent';
import { DataHelperService } from '../services2/dataHelper.service';
import * as moment from 'moment/moment';

@Component({
    selector: '%selector-detail',
    templateUrl: '%filename-detail.component.html',
    styleUrls: ['%filename-detail.component.css'],
    providers: [RestoreService]
})

export class %modelDetailComponent implements OnInit {
    @Output() public cancelled = new EventEmitter();
    @Output() public saved = new EventEmitter();

    public frequencyList = [
        'daily', 'weekly', 'monthly', 'quarterly', 'annually'
    ];

    public local%keyField: number = -1;
    public isNewItem: boolean = false;

    @Input() public displayRequirements: boolean = true;

    constructor(private service: %modelService,
                private dataHelperService: DataHelperService,
                private restoreService: RestoreService<%model>) { }

    @Input() set %keyField(id: number) {
        if (id) {
            const tempId = id * 1;

            this.local%keyField = tempId;
            if (id !== -1) {
                this.service.get%modelById(this.local%keyField)
                    .subscribe((t) =>
                        this.%filename = t);
            } else {
                this.isNewItem = true;
                this.service.save(new %model())
                    .subscribe((t) => {
                        this.%filename = t;
                        this.local%keyField = t.%keyField;
                    });
            }
        }
    }

    public ngOnInit() { }

    set %filename(%filename: %model) {
        this.restoreService.setItem(%filename);
    }

    get %filename() {

        return this.restoreService.getItem();
    }

    public onSaved() {
        this.service.save(this.restoreService.getItem())
            .subscribe((t) =>
                this.saved.emit(t)
            );
    }

    public onCancelled() {
        if (this.isNewItem) {
            this.service.delete(this.%filename).subscribe();
        }

        this.cancelled.emit(this.restoreService.restoreItem());
    }
}