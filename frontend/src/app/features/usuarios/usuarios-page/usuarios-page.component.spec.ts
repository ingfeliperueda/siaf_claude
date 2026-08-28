import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { UsuariosPageComponent } from './usuarios-page.component';

describe('UsuariosPageComponent', () => {
  let component: UsuariosPageComponent;
  let fixture: ComponentFixture<UsuariosPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosPageComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
