
import { Injectable } from '@angular/core';
import { Hackathon } from 'src/app/demo/models/hackathon';
import { HackathonWithCategories, CategoryType } from 'src/app/demo/models/hackathon-category';

interface CategoryDistribution {
  [key: string]: {
    [category: string]: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CategorizationService {
  // Keywords for categorization
  private themeKeywords = {
    'healthcare': ['health', 'medical', 'patient', 'hospital', 'wellness', 'doctor'],
    'education': ['education', 'learning', 'school', 'student', 'teach', 'academic'],
    'fintech': ['finance', 'banking', 'payment', 'transaction', 'blockchain', 'money'],
    'sustainability': ['green', 'environment', 'climate', 'sustainable', 'eco', 'clean'],
    'social impact': ['community', 'social', 'impact', 'nonprofit', 'charity', 'volunteer'],
    'gaming': ['game', 'gaming', 'play', 'esport', 'interactive', 'player']
  };

  private audienceKeywords = {
    'students': ['student', 'university', 'campus', 'college', 'undergrad', 'education'],
    'professionals': ['professional', 'industry', 'career', 'corporate', 'business', 'expert'],
    'beginners': ['beginner', 'starter', 'novice', 'new', 'start', 'learn'],
    'developers': ['developer', 'coder', 'programmer', 'engineer', 'tech', 'dev'],
    'designers': ['design', 'ux', 'ui', 'creative', 'artist', 'graphic']
  };

  private techKeywords = {
    'ai/ml': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural'],
    'blockchain': ['blockchain', 'crypto', 'web3', 'token', 'nft', 'ethereum'],
    'mobile': ['mobile', 'app', 'android', 'ios', 'smartphone', 'tablet'],
    'web': ['web', 'website', 'frontend', 'backend', 'fullstack', 'javascript'],
    'iot': ['iot', 'internet of things', 'sensor', 'device', 'embedded', 'hardware'],
    'cloud': ['cloud', 'aws', 'azure', 'gcp', 'serverless', 'docker']
  };

  constructor() { }

  // Main categorization function
  categorizeHackathon(hackathon: Hackathon): HackathonWithCategories {
    const text = (hackathon.title + ' ' + hackathon.description).toLowerCase();
    
    const hackathonWithCategories: HackathonWithCategories = {
      ...hackathon,
      categories: {
        theme: this.findCategories(text, this.themeKeywords),
        audience: this.findCategories(text, this.audienceKeywords),
        tech: this.findCategories(text, this.techKeywords)
      }
    };
    
    return hackathonWithCategories;
  }

  // Helper function to match keywords to text
  private findCategories(text: string, keywordMap: Record<string, string[]>): string[] {
    const categories = new Set<string>();
    
    Object.entries(keywordMap).forEach(([category, keywords]) => {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          categories.add(category);
          break;
        }
      }
    });
    
    return Array.from(categories);
  }

  // Get all possible categories
  getAllCategories(type: CategoryType): string[] {
    switch(type) {
      case CategoryType.THEME:
        return Object.keys(this.themeKeywords);
      case CategoryType.AUDIENCE:
        return Object.keys(this.audienceKeywords);
      case CategoryType.TECH:
        return Object.keys(this.techKeywords);
      default:
        return [];
    }
  }

  // For analytics: get category distribution
  getCategoryDistribution(hackathons: Hackathon[]): CategoryDistribution {
    const result: CategoryDistribution = {
      'theme': {} as Record<string, number>,
      'audience': {} as Record<string, number>,
      'tech': {} as Record<string, number>
    };
    
    // Initialize all possible categories with zero count
    this.getAllCategories(CategoryType.THEME).forEach(cat => result['theme'][cat] = 0);
    this.getAllCategories(CategoryType.AUDIENCE).forEach(cat => result['audience'][cat] = 0);
    this.getAllCategories(CategoryType.TECH).forEach(cat => result['tech'][cat] = 0);
    
    // Count occurrences
    hackathons.forEach(hackathon => {
      const categorized = this.categorizeHackathon(hackathon);
      
      categorized.categories?.theme?.forEach(theme => {
        result['theme'][theme] = (result['theme'][theme] || 0) + 1;
      });
      
      categorized.categories?.audience?.forEach(audience => {
        result['audience'][audience] = (result['audience'][audience] || 0) + 1;
      });
      
      categorized.categories?.tech?.forEach(tech => {
        result['tech'][tech] = (result['tech'][tech] || 0) + 1;
      });
    });
    
    return result;
  }
}