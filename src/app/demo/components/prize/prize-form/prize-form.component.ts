// src/app/components/prize-form/prize-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Prize, PrizeCategory, PrizeType } from 'src/app/demo/models/prize';
import { PrizeService } from 'src/app/demo/services/prize.service';
import { MessageService, ConfirmationService } from 'primeng/api'; // Import PrimeNG services
import { StorageService } from 'src/app/demo/services/storage.service';

@Component({
  selector: 'app-prize-form',
  templateUrl: './prize-form.component.html',
  styleUrls: ['./prize-form.component.scss']
})
export class PrizeFormComponent implements OnInit {
  prizeForm!: FormGroup;
  prizeTypes = Object.values(PrizeType);
  prizeCategories = Object.values(PrizeCategory);
  prize!: Prize;
  
  // Form states
  submitting = false;
  submitted = false;
  
  constructor(
    private fb: FormBuilder,
    private prizeService: PrizeService,
    private router: Router,
    private messageService: MessageService, // Add PrimeNG MessageService
    private storageService: StorageService, // ✅ Inject here
    private route: ActivatedRoute // ✅ Inject this
  ) { }

  hackathonId!: number; // ✅ store dynamic hackathon ID

  ngOnInit(): void {
    this.hackathonId = +this.route.snapshot.paramMap.get('hackathonId')!;
    this.initForm();
    
    // Listen for prize type changes to adjust form validation
    this.prizeForm.get('prizeType')?.valueChanges.subscribe(
      (prizeType: PrizeType) => {
        this.updateFormValidators(prizeType);
      }
    );
  }

  initForm(): void {
    this.prizeForm = this.fb.group({
      prizeType: [PrizeType.MONEY, Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      productName: [''],
      productDescription: [''],
      prizeCategory: ['', Validators.required]
    });
  }

  updateFormValidators(prizeType: PrizeType): void {
    const amountControl = this.prizeForm.get('amount');
    const productNameControl = this.prizeForm.get('productName');
    const productDescriptionControl = this.prizeForm.get('productDescription');

    if (prizeType === PrizeType.MONEY) {
      amountControl?.setValidators([Validators.required, Validators.min(0)]);
      productNameControl?.clearValidators();
      productDescriptionControl?.clearValidators();
    } else {
      amountControl?.clearValidators();
      productNameControl?.setValidators([Validators.required]);
      productDescriptionControl?.setValidators([Validators.required]);
    }

    amountControl?.updateValueAndValidity();
    productNameControl?.updateValueAndValidity();
    productDescriptionControl?.updateValueAndValidity();
  }

  // Helper method to check if a field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const field = this.prizeForm.get(fieldName);
    return !!field && (field.invalid && (field.touched || this.submitted));
  }

  // Format category display
  formatCategory(category: string): string {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // These methods are no longer needed as we use PrimeNG toast
  // But keep them empty for compatibility with existing code
  clearSuccessMessage(): void {}
  clearErrorMessage(): void {}

  onSubmit(): void {
    this.submitted = true;
  
    if (this.prizeForm.invalid) {
      Object.keys(this.prizeForm.controls).forEach(key => {
        this.prizeForm.get(key)?.markAsTouched();
      });
      return;
    }
  
    // ✅ Get dynamic user ID
    const userId = this.storageService.getLoggedInUserId();
    if (!userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'User Not Logged In',
        detail: 'You must be logged in to create a prize.'
      });
      return;
    }
  
    this.submitting = true;
    const formValue = this.prizeForm.value;
    const prize: Prize = {
      prizeType: formValue.prizeType,
      prizeCategory: formValue.prizeCategory
    };
  
    if (formValue.prizeType === PrizeType.MONEY) {
      prize.amount = formValue.amount;
    } else {
      prize.productName = formValue.productName;
      prize.productDescription = formValue.productDescription;
    }
  
    this.prizeService.createPrize(prize, this.hackathonId) // pass dynamic hackathonId
      .pipe(finalize(() => {
        this.submitting = false;
      }))
      .subscribe(
        (createdPrize) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Prize created successfully!'
          });
  
          setTimeout(() => {
            this.router.navigate(['/sponsor-prizes']);
          }, 2000);
        },
        (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to create prize. Please try again.'
          });
        }
      );
  }
  
}

