import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

import { %model } from '../models/%filename';
import { %modelService } from '../services/%filename.service';
import { %modelDetailComponent } from './%filename-detail.component';
import { SearchBoxComponent } from '../util/searchBox.component';
import { SearchFilterPipe } from '../util/searchFilter.pipe';

@Component ({
    selector: '%selector-list',
    templateUrl: '%filename-list.component.html',
    styleUrls: ['%filename-list.component.css'],
    providers: []
})

export class %modelListComponent implements OnInit {

    public isSelected: boolean;
    public %filenames: %model[];
    public selectedId: number;

    @Input() public filterValue: string;
    @Input() public isEmbedded: boolean = false;
    @Output() public selectedItem = new EventEmitter();

    constructor(private service: %modelService) {}

    public ngOnInit() {
        this.getList();
        this.isSelected = false;
    }

    public getList() {
        this.service.get%models().subscribe(
            (%filenames) => this.%filenames = %filenames);
    }
   public onSelect(%keyField: number) {
       this.selectedItem.emit(%keyField);
   }

   public onAddNew() {
      // Create a new object
       this.onSelect(-1);
   }

   public onDetailSaved(%filename: %model) {
      // Call the save service
       this.clearSelection();
   }

   public onDetailCancelled() {
      // do nothing
       this.clearSelection();
   }

   public clearSelection() {
       this.selectedId = null;
       this.isSelected = false;
   }
}