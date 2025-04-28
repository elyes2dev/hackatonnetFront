import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'formatMessage'
})
export class FormatMessagePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(text: string): SafeHtml {
    if (!text) return '';

    // Replace code blocks
    let formattedText = text.replace(/```([a-z]*)\n([\s\S]*?)```/g, (match, language, code) => {
      return `<pre class="code-block ${language}"><code>${this.escapeHtml(code)}</code></pre>`;
    });

    // Replace inline code
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Replace URLs with clickable links
    formattedText = formattedText.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Replace line breaks with <br>
    formattedText = formattedText.replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(formattedText);
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
