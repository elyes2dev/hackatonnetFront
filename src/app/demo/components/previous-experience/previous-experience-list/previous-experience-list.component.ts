import { Component, Input, OnInit } from '@angular/core';
import { PreviousExperience } from 'src/app/demo/models/previous-experience.model';

@Component({
  selector: 'app-previous-experience-list',
  templateUrl: './previous-experience-list.component.html',
  styleUrls: ['./previous-experience-list.component.scss']
})
export class PreviousExperienceListComponent implements OnInit {
  @Input() experiences: PreviousExperience[] = [];
  rowGroupMetadata: any;

  ngOnInit() {
    this.updateRowGroupMetaData();
  }

  ngOnChanges() {
    this.updateRowGroupMetaData();
  }

  updateRowGroupMetaData() {
    this.rowGroupMetadata = {};
    
    if (this.experiences) {
      // Sort by year descending (newest first)
      this.experiences.sort((a, b) => b.year - a.year);
      
      for (let i = 0; i < this.experiences.length; i++) {
        const rowData = this.experiences[i];
        const year = rowData.year;
        
        if (i == 0) {
          this.rowGroupMetadata[year] = { index: 0, size: 1 };
        } else {
          const previousRowData = this.experiences[i - 1];
          const previousRowGroup = previousRowData.year;
          
          if (year === previousRowGroup) {
            this.rowGroupMetadata[year].size++;
          } else {
            this.rowGroupMetadata[year] = { index: i, size: 1 };
          }
        }
      }
    }
  }
}