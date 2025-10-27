import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LeadFormComponent } from './lead-form.component';
import { LeadService } from '@app/core/services/lead.service';
import { Lead } from '@app/core/models';

// Mock LeadService
class MockLeadService {
  createLead(payload: any) {
    return of({ id: '123', ...payload } as Lead);
  }
  updateLead(id: string, payload: any) {
    return of({ id, ...payload } as any as Lead);
  }
}

describe('LeadFormComponent', () => {
  let component: LeadFormComponent;
  let fixture: ComponentFixture<LeadFormComponent>;
  let leadService: MockLeadService;
  let routerSpy: { navigate: jasmine.Spy };

  beforeEach(async () => {
    routerSpy = { navigate: jasmine.createSpy('navigate') };

    await TestBed.configureTestingModule({
      imports: [LeadFormComponent], // standalone component já importa os módulos de Material que precisa
      providers: [
        { provide: LeadService, useClass: MockLeadService }, // use the class token, not a string
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LeadFormComponent);
    component = fixture.componentInstance;

    // Pegar o mock via tipo
    leadService = TestBed.inject(LeadService) as unknown as MockLeadService;
    fixture.detectChanges();
  });

  it('should create the form with default values', () => {
    expect(component).toBeTruthy();
    const val = component.form.value;
    expect(val.firstName).toBe('');
    expect(val.email).toBe('');
  });

  it('should call createLead on submit when no lead.id', fakeAsync(() => {
    component.form.patchValue({ firstName: 'ACME', lastName: 'Inc', email: 'a@a.com' });
    spyOn(leadService, 'createLead').and.callThrough();
    component.submit();
    tick();
    expect(leadService.createLead).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  }));

  it('should call updateLead when lead.id present and changed', fakeAsync(() => {
    // simulate input lead
    component.lead = {
      id: '5',
      firstName: 'Old',
      lastName: 'Name',
      email: 'old@a.com',
      source: 'Other' as any,
      status: 'New' as any,
      createdAt: new Date().toISOString(),
    } as any;
    component.ngOnChanges({
      lead: { currentValue: component.lead, previousValue: null, firstChange: true } as any,
    });
    fixture.detectChanges();

    component.form.patchValue({ firstName: 'New', email: 'new@a.com' });
    spyOn(leadService, 'updateLead').and.callThrough();
    component.submit();
    tick();
    expect(leadService.updateLead).toHaveBeenCalledWith(
      '5',
      jasmine.objectContaining({ firstName: 'New' })
    );
  }));

  it('should not call updateLead when no changes detected', fakeAsync(() => {
    component.lead = {
      id: '7',
      firstName: 'Same',
      lastName: 'Name',
      email: 'same@a.com',
      source: 'Other' as any,
      status: 'New' as any,
      createdAt: new Date().toISOString(),
    } as any;
    component.ngOnChanges({
      lead: { currentValue: component.lead, previousValue: null, firstChange: true } as any,
    });
    fixture.detectChanges();

    // no change
    component.form.patchValue({ firstName: 'Same', email: 'same@a.com' });
    spyOn(leadService, 'updateLead').and.callThrough();
    component.submit();
    tick();
    expect(leadService.updateLead).not.toHaveBeenCalled();
    expect(component.error).toContain('Nenhuma alteração');
  }));

  it('should show error when createLead fails', fakeAsync(() => {
    spyOn(leadService, 'createLead').and.returnValue(
      throwError(() => ({ error: { message: 'bad' } }))
    );
    component.form.patchValue({ firstName: 'ACME', lastName: 'Inc', email: 'a@a.com' });
    component.submit();
    tick();
    expect(component.error).toContain('bad');
  }));
});
