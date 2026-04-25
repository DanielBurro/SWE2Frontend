import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BuilderElement } from '../../core/services/event.service';
import { NzIconDirective } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-base-card',
  imports: [NzIconDirective],
  templateUrl: './base-card.html',
  styleUrl: './base-card.scss',
})
export class BaseCard {
  @Input() element!: BuilderElement;
  @Output() delete = new EventEmitter<string>();

  isFocused = false;

  onDelete() {
    this.delete.emit(this.element.id);
  }
}
