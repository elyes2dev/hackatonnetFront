import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements AfterViewInit {

  ngAfterViewInit() {
    // Simple animation on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, {
      threshold: 0.1
    });
    
    document.querySelectorAll('.timeline-item, .feature-card, .team-card').forEach(el => {
      observer.observe(el);
    });
  }
}