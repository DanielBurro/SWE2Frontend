import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadingCard } from './heading-card';

describe('HeadingCard', () => {
  let component: HeadingCard;
  let fixture: ComponentFixture<HeadingCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeadingCard],
    }).compileComponents();

    fixture = TestBed.createComponent(HeadingCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
