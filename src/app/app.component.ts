import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
export class Customer {

  constructor(
    public firstName = '',
    public lastName = '',
    public email = '',
    public sendCatalog = false,
    public addressType = 'home',
    public street1?: string,
    public street2?: string,
    public city?: string,
    public state = '',
    public zip?: string) { }
}

function emailMatcher(c: AbstractControl): { [key: string]: boolean } | null {
  const emailControl = c.get('email');
  const confirmControl = c.get('confirmEmail');

  if (emailControl.pristine || confirmControl.pristine) {
    return null;
  }

  if (emailControl.value === confirmControl.value) {
    return null;
  }
  return { match: true };
}

function ratingRange(min: number, max: number): ValidatorFn {
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    if (c.value !== null && (isNaN(c.value) || c.value < min || c.value > max)) {
      return { range: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'reactive-form';
  customerForm: FormGroup;
  customer = new Customer();
  emailMessage: string;

  value: Date;

  get addresses(): FormArray {
    return this.customerForm.get('addresses') as FormArray;
  }

  private validationMessages = {
    required: 'Please enter your email address.',
    email: 'Please enter a valid email address.'
  };

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      emailGroup: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', Validators.required],
      }, { validator: emailMatcher }),
      phone: '',
      notification: 'email',
      rating: [null, ratingRange(1, 5)],
      sendCatalog: true,
      addresses: this.fb.array([this.buildAddress()])
    });

    this.customerForm.get('notification').valueChanges.subscribe(
      value => this.setNotification(value)
    );

    const emailControl = this.customerForm.get('emailGroup.email');
    emailControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setMessage(emailControl)
    );

    // this.customerForm.valueChanges.subscribe(console.log);
  }

  addAddress(): void {
    const formGroup = this.buildAddress();
    formGroup.valueChanges.subscribe(console.log);
    this.addresses.push(formGroup);
  }

  buildAddress(): FormGroup {
    // return this.fb.group({
    //   addressType: 'home',
    //   street1: ['', Validators.required],
    //   street2: ['', ],
    //   city: '',
    //   state: '',
    //   zip: [{value: '1234', disabled: true}]
    // });

    const formGroup = new FormGroup({
      addressType: new FormControl({ value: 'home', disabled: false }),
      street1: new FormControl({ value: '', disabled: false }, Validators.required),
      street2: new FormControl({ value: '', disabled: false }),
      city: new FormControl({ value: '', disabled: false }),
      state: new FormControl({ value: '', disabled: false }),
      zip: new FormControl({ value: '1234', disabled: true })
    });
    return formGroup;
  }

  populateTestData(): void {
    this.customerForm.patchValue({
      firstName: 'Jack',
      lastName: 'Harkness',
      emailGroup: { email: 'jack@torchwood.com', confirmEmail: 'jack@torchwood.com' }
    });

    const addressGroup1 = this.fb.group({
      addressType: 'work1',
      street1: 'Mermaid Quay',
      street2: '',
      city: 'Cardiff Bay',
      state: 'CA',
      zip: ''
    });

    const addressGroup2 = this.fb.group({
      addressType: 'work2',
      street1: 'Mermaid Quay',
      street2: '',
      city: 'Cardiff Bay',
      state: 'CA',
      zip: ''
    });

    const addressGroup3 = this.fb.group({
      addressType: 'work3',
      street1: 'Mermaid Quay',
      street2: '',
      city: 'Cardiff Bay',
      state: 'CA',
      zip: ''
    });
    
    this.customerForm.setControl('addresses', this.fb.array([addressGroup1, addressGroup2, addressGroup3]));
  }

  save(): void {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  setMessage(c: AbstractControl): void {
    this.emailMessage = '';
    if ((c.touched || c.dirty) && c.errors) {
      this.emailMessage = Object.keys(c.errors).map(
        key => this.validationMessages[key]).join(' ');
    }
  }

  setNotification(notifyVia: string): void {
    const phoneControl = this.customerForm.get('phone');
    if (notifyVia === 'text') {
      phoneControl.setValidators(Validators.required);
    } else {
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }

  getAddress(index: number): FormGroup {
    return this.addresses.controls[index] as FormGroup;
  }

  disableAddress1() {
    this.addresses.controls[0].disable();
  }

  enableAddress1() {
    this.addresses.controls[0].enable();
  }
}

