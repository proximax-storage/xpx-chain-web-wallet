import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder,Validators } from "@angular/forms";
import { WalletService } from 'src/app/shared/services/wallet.service';
@Component({
  selector: 'app-create-namespace',
  templateUrl: './create-namespace.component.html',
  styleUrls: ['./create-namespace.component.scss']
})
export class CreateNamespaceComponent implements OnInit {
  private namespaceForm: FormGroup;
  constructor(  private fb: FormBuilder,
    private walletService: WalletService) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {

    this.namespaceForm = this.fb.group({
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
  
    });

  }

  /**
   * 
   * @param param 
   * @param formControl 
   */

  getError(param, formControl?) {
    if (this.namespaceForm.get(param).getError('required')) {
      return `This field is required`;
    } else if (this.namespaceForm.get(param).getError('minlength')) {
      return `This field must contain minimum ${this.namespaceForm.get(param).getError('minlength').requiredLength} characters`;
    } else if (this.namespaceForm.get(param).getError('maxlength')) {
      return `This field must contain maximum ${this.namespaceForm.get(param).getError('maxlength').requiredLength} characters`;
    }
  }


  create() {

    if (this.namespaceForm.valid) {

      const common = {
        password: this.namespaceForm.get('password').value
      }
      if (this.walletService.decrypt(common)) {

        




      }
    }
  }

}
