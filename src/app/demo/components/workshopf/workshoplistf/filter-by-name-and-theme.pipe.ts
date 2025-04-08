import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByNameAndTheme',
  pure: false
})
export class FilterByNameAndThemePipe implements PipeTransform {
  transform(items: any[], name: string, theme: string): any[] {
    if (!items) return [];
    return items.filter((item) => {
      const matchesName =
        !name ||
        item.name?.toLowerCase().includes(name.toLowerCase());
      const matchesTheme = !theme || item.theme === theme;
      return matchesName && matchesTheme;
    });
  }
}
