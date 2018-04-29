import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToDatePipe } from '../util/to-date.pipe';
import { ChangeEvent, ActionType } from '../util/changeEvent';
import { SearchBoxModule } from '../util/searchBox.module';
import { PipesModule } from '../util/pipes.module';
import { TabsModule } from '../util/tabs/tabs.module';
import { AutocompleteModule } from '../util/autocomplete.module';
import { Ng2PaginationModule } from 'ng2-pagination';

%imports
@NgModule({
    imports: [CommonModule, FormsModule, PipesModule, AutocompleteModule,
       TabsModule, SearchBoxModule, Ng2PaginationModule],
    declarations: [ %declarations
        ],
    exports: [ %exports ],
    providers: []
})

export class %modelsModule {}
