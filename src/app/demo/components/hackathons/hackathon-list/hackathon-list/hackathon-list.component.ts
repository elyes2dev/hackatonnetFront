
import { Component, OnInit } from '@angular/core';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';
import { CategorizationService } from 'src/app/demo/services/categorization/categorization.service';
import { Hackathon } from 'src/app/demo/models/hackathon';
import { HackathonWithCategories, CategoryType } from 'src/app/demo/models/hackathon-category';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hackathon-list',
  templateUrl: './hackathon-list.component.html',
  styleUrls: ['./hackathon-list.component.scss']
})
export class HackathonListComponent implements OnInit {
  hackathons: HackathonWithCategories[] = [];  
  selectedHackathon: HackathonWithCategories | null = null;  
  visibleSidebar2 = false;  
  filteredHackathons: HackathonWithCategories[] = [];
  searchTerm = '';
  selectedEventType: string | null = null;
  
  // New properties for category filtering
  themeOptions: any[] = [];
  audienceOptions: any[] = [];
  techOptions: any[] = [];
  selectedTheme: string | null = null;
  selectedAudience: string | null = null;
  selectedTech: string | null = null;

  eventTypeOptions = [
    { label: 'Online', value: 'online' },
    { label: 'Onsite', value: 'onsite' }
  ];

  constructor(
    private hackathonService: HackathonService,
    private categorizationService: CategorizationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadHackathons();
    this.initializeCategoryOptions();
  }

  initializeCategoryOptions() {
    // Create dropdown options for categories
    this.themeOptions = this.categorizationService.getAllCategories(CategoryType.THEME)
      .map(theme => ({ label: this.capitalizeFirstLetter(theme), value: theme }));
    
    this.audienceOptions = this.categorizationService.getAllCategories(CategoryType.AUDIENCE)
      .map(audience => ({ label: this.capitalizeFirstLetter(audience), value: audience }));
    
    this.techOptions = this.categorizationService.getAllCategories(CategoryType.TECH)
      .map(tech => ({ label: this.capitalizeFirstLetter(tech), value: tech }));
  }

  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  loadHackathons() {
    this.hackathonService.getHackathons().subscribe((data: Hackathon[]) => {
      // Apply categorization to each hackathon
      this.hackathons = data.map(hackathon => 
        this.categorizationService.categorizeHackathon(hackathon)
      );
      this.filteredHackathons = [...this.hackathons];
    });
  }

  showAddHackathonForm(hackathon?: HackathonWithCategories) {
    // Deep clone the hackathon object
    this.selectedHackathon = hackathon ? JSON.parse(JSON.stringify(hackathon)) : null;
    
    console.log('Editing hackathon with ID:', this.selectedHackathon?.id);
    this.visibleSidebar2 = true;
  }

  hideSidebar() {
    this.visibleSidebar2 = false;
    this.selectedHackathon = null;  // Reset selection after closing sidebar
  }

  deleteHackathon(id: number) {
    if (confirm('Are you sure you want to delete this hackathon?')) {
      this.hackathonService.deleteHackathon(id).subscribe({
        next: () => this.loadHackathons(),
        error: (err) => console.error('Error:', err)
      });
    }
    location.reload();
  }

  filterHackathons() {
    this.filteredHackathons = this.hackathons.filter(hackathon => {
      const matchesSearch = hackathon.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.selectedEventType || 
                         (this.selectedEventType === 'online' && hackathon.isOnline) || 
                         (this.selectedEventType === 'onsite' && !hackathon.isOnline);
      
      const matchesTheme = !this.selectedTheme || 
                          (hackathon.categories?.theme?.includes(this.selectedTheme));
      
      const matchesAudience = !this.selectedAudience || 
                             (hackathon.categories?.audience?.includes(this.selectedAudience));
      
      const matchesTech = !this.selectedTech || 
                         (hackathon.categories?.tech?.includes(this.selectedTech));
      
      return matchesSearch && matchesType && matchesTheme && matchesAudience && matchesTech;
    });
  }

  navigateToAnalytics() {
    this.router.navigate(['/hackathon-analytics']);
  }

  // Reset all filters
  resetFilters() {
    this.searchTerm = '';
    this.selectedEventType = null;
    this.selectedTheme = null;
    this.selectedAudience = null;
    this.selectedTech = null;
    this.filteredHackathons = [...this.hackathons];
  }
}