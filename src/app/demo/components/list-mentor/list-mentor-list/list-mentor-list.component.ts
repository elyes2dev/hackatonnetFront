import { Component, OnInit } from "@angular/core";
import { MessageService } from "primeng/api";

import { Router } from "@angular/router";
import { Hackathon } from "src/app/demo/models/hackathon.model";
import { ListMentor } from "src/app/demo/models/list-mentor.model";
import { ListMentorService } from "src/app/demo/services/list-mentor.service";
import { CsvExportService } from "src/app/demo/services/csv-export.service";

interface HackathonWithMentors {
  hackathon: Hackathon;
  mentors: ListMentor[];
}

@Component({
  selector: "app-list-mentor-list",
  templateUrl: "./list-mentor-list.component.html",
  styleUrls: ["./list-mentor-list.component.scss"],
  providers: [MessageService],
})
export class ListMentorListComponent implements OnInit {
  listMentors: ListMentor[] = [];
  hackathonGroups: HackathonWithMentors[] = [];
  expandedRows: { [key: string]: boolean } = {};
  isExpanded = false;
  exportInProgress: { [key: number]: boolean } = {};


  constructor(
    private listMentorService: ListMentorService, // Updated service name
    private csvExportService: CsvExportService, // Add the CSV export service
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMentors();
  }

  loadMentors() {
    // Now using the correct service with the correct method
    this.listMentorService.getAllListMentors().subscribe({
      next: (data: ListMentor[]) => {
        this.listMentors = data;
        this.groupMentorsByHackathon();
      },
      error: (error: any) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load mentor listings",
        });
        console.error("Error loading mentor listings:", error);
      },
    });
  }

  groupMentorsByHackathon() {
    // Create a map to group mentors by hackathon ID
    const hackathonMap = new Map<number, HackathonWithMentors>();

    this.listMentors.forEach((mentor) => {
      if (!hackathonMap.has(mentor.hackathon.id)) {
        hackathonMap.set(mentor.hackathon.id, {
          hackathon: mentor.hackathon,
          mentors: [],
        });
      }

      hackathonMap.get(mentor.hackathon.id)?.mentors.push(mentor);
    });

    // Convert map to array
    this.hackathonGroups = Array.from(hackathonMap.values());
  }

  expandAll() {
    if (!this.isExpanded) {
      this.hackathonGroups.forEach((group) => {
        this.expandedRows[group.hackathon.id] = true;
      });
    } else {
      this.expandedRows = {};
    }
    this.isExpanded = !this.isExpanded;
  }

  editMentor(mentor: ListMentor) {
    // Navigate to the new edit route
    this.router.navigate(['/mentor/edit', mentor.id]);
  }

  deleteMentor(mentor: ListMentor) {
    if (confirm('Are you sure you want to delete this mentor listing?')) {
      // Call your service method to delete
      this.listMentorService.deleteListMentor(mentor.id!).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Mentor listing deleted successfully'
          });
          // Reload the list
          this.loadMentors();
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete mentor listing'
          });
          console.error('Error deleting mentor listing:', error);
        }
      });
    }
  }

    // New method for CSV export
    exportMentorsCSV(hackathonId: number, hackathonName: string) {
      this.exportInProgress[hackathonId] = true;
      
      this.csvExportService.exportMentorsToCSV(hackathonId).subscribe({
        next: (data: Blob) => {
          const url = window.URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = url;
          // Create a filename with the hackathon name (sanitized)
          const safeFileName = hackathonName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
          a.download = `mentors-${safeFileName}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Mentors list exported to CSV'
          });
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to export mentors list'
          });
          console.error('Error exporting mentors list:', error);
        },
        complete: () => {
          this.exportInProgress[hackathonId] = false;
        }
      });
    }
}