import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-card',
  standalone: true,
  imports: [FormsModule],
  template: `
    <textarea
      #textArea
      [(ngModel)]="text"
      (ngModelChange)="onTextChange($event)"
      (input)="adjustHeight()"
      (keydown.enter)="onEnter($event)"
      [placeholder]="placeholder"
      class="text-input"
      rows="1"
    ></textarea>
  `,
  styles: [`
    .text-input {
      width: 100%;
      border: none;
      background: transparent;
      outline: none;
      resize: none;
      font-size: 16px;
      color: #e8e4dc;
      padding: 0;
      line-height: 1.5;
      overflow: hidden;
      display: block;
      min-height: 24px;

      &::placeholder {
        color: rgba(232, 228, 220, 0.2);
      }
    }
  `]
})
export class TextCard implements AfterViewInit {
  @Input() text: string = '';
  @Input() placeholder: string = 'Schreibe etwas...';
  @Output() textChange = new EventEmitter<string>();

  @ViewChild('textArea') textArea!: ElementRef<HTMLTextAreaElement>;

  ngAfterViewInit() {
    this.adjustHeight();
  }

  adjustHeight() {
    const textarea = this.textArea.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  onTextChange(newValue: string) {
    this.textChange.emit(newValue);
  }

  onEnter(event: any) {
    // Normal Enter behavior is allowed, we just need to make sure height adjusts
    setTimeout(() => this.adjustHeight(), 0);
  }
}
