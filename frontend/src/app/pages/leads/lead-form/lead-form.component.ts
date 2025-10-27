import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { Lead, LeadCreateDto, LeadUpdateDto } from '@app/core/models';
import { LeadService } from '@app/core/services/lead.service';
import { TaskFormComponent } from '@app/components/task-form/task-form.component';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    TaskFormComponent,
  ],
  templateUrl: './lead-form.component.html',
  styleUrls: ['./lead-form.component.scss'],
})
export class LeadFormComponent implements OnChanges {
  // lead pode ser null quando criando; no modo edit o parent deve garantir que exista
  @Input() lead?: Lead | null;

  // modo explícito — parent/route/dialog define se é 'create' ou 'edit'
  @Input() mode: 'create' | 'edit' = 'create';

  @Output() saved = new EventEmitter<Lead>();

  form!: FormGroup;

  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private leadService: LeadService, public router: Router) {
    this.form = this.fb.group({
      firstName: this.fb.control<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)],
      }),
      lastName: this.fb.control<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      email: this.fb.control<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      phone: this.fb.control<string>('', { nonNullable: true }),
      company: this.fb.control<string>('', { nonNullable: true }),
      jobTitle: this.fb.control<string>('', { nonNullable: true }),
      source: this.fb.control<string>('Other', { nonNullable: true }),
      status: this.fb.control<string>('New', { nonNullable: true }),
      notes: this.fb.control<string>('', { nonNullable: true }),
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['lead']) {
      if (this.lead) {
        this.form.patchValue({
          firstName: this.lead.firstName ?? '',
          lastName: this.lead.lastName ?? '',
          email: this.lead.email ?? '',
          phone: this.lead.phone ?? '',
          company: this.lead.company ?? '',
          jobTitle: this.lead.jobTitle ?? '',
          source: this.lead.source ?? 'Other',
          status: this.lead.status ?? 'New',
          notes: this.lead.notes ?? '',
        });
      } else {
        this.form.reset({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          jobTitle: '',
          source: 'Other',
          status: 'New',
          notes: '',
        });
      }
    }
  }

  submit() {
    this.error = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const f = this.form.getRawValue();
    this.loading = true;
    this.form.disable();

    // --- CREATE path (explicit mode) ---
    if (this.mode === 'create') {
      const payload: LeadCreateDto = {
        firstName: f.firstName,
        lastName: f.lastName,
        email: f.email,
        phone: f.phone || undefined,
        company: f.company || undefined,
        jobTitle: f.jobTitle || undefined,
        source: (f.source as any) || 'Other',
        status: (f.status as any) || 'New',
        notes: f.notes || undefined,
      };

      this.leadService
        .createLead(payload)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.form.enable();
          })
        )
        .subscribe({
          next: (res: Lead) => {
            this.saved.emit(res);
            this.router.navigate([`/leads/${res.id}`]);
          },
          error: (err: any) => {
            this.error = this.extractError(err, 'Falha ao criar lead');
            console.error(err);
          },
        });

      return;
    }

    if (this.mode === 'edit') {
      if (
        !this.lead ||
        this.lead.id === undefined ||
        this.lead.id === null ||
        this.lead.id === ''
      ) {
        // erro claro para o dev / usuário
        this.loading = false;
        this.form.enable();
        this.error = 'Lead inválido para edição (id ausente).';
        console.error('Attempted update but lead.id is missing', this.lead);
        return;
      }

      const payload: Partial<LeadUpdateDto> = {};
      if ((f.firstName ?? '') !== (this.lead!.firstName ?? '')) payload.firstName = f.firstName;
      if ((f.lastName ?? '') !== (this.lead!.lastName ?? '')) payload.lastName = f.lastName;
      if ((f.email ?? '') !== (this.lead!.email ?? '')) payload.email = f.email;
      if ((f.phone ?? '') !== (this.lead!.phone ?? '')) payload.phone = f.phone || undefined;
      if ((f.company ?? '') !== (this.lead!.company ?? ''))
        payload.company = f.company || undefined;
      if ((f.jobTitle ?? '') !== (this.lead!.jobTitle ?? ''))
        payload.jobTitle = f.jobTitle || undefined;
      if ((f.source ?? '') !== (this.lead!.source ?? ''))
        payload.source = (f.source as any) || undefined;
      if ((f.status ?? '') !== (this.lead!.status ?? ''))
        payload.status = (f.status as any) || undefined;
      if ((f.notes ?? '') !== (this.lead!.notes ?? '')) payload.notes = f.notes || undefined;

      if (Object.keys(payload).length === 0) {
        this.loading = false;
        this.form.enable();
        this.error = 'Nenhuma alteração detectada.';
        return;
      }

      this.leadService
        .updateLead(this.lead!.id, payload as LeadUpdateDto)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.form.enable();
          })
        )
        .subscribe({
          next: (res: Lead) => {
            this.saved.emit(res);
            this.router.navigate([`/leads/${res.id}`]);
          },
          error: (err: any) => {
            this.error = this.extractError(err, 'Falha ao atualizar lead');
            console.error(err);
          },
        });

      return;
    }

    // fallback inesperado
    this.loading = false;
    this.form.enable();
    this.error = 'Modo desconhecido do formulário.';
  }

  private extractError(err: any, fallback: string) {
    try {
      if (!err) return fallback;
      if (typeof err === 'string') return err;
      if (err.error && typeof err.error === 'string') return err.error;
      if (err.error && err.error.message) return err.error.message;
      if (err.message) return err.message;
      return fallback;
    } catch {
      return fallback;
    }
  }
}
