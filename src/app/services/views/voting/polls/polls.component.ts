import { Component, OnInit, createPlatformFactory } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl, FormArray } from "@angular/forms";
import { WalletService } from '../../../../shared/services/wallet.service';
import { NemProvider } from '../../../../shared/services/nem.provider';
import { SharedService } from '../../../../shared';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Address, UInt64, Account, TransferTransaction, Transaction } from 'nem2-sdk';
import { first } from "rxjs/operators";


@Component({
  selector: 'app-polls',
  templateUrl: './polls.component.html',
  styleUrls: ['./polls.component.scss']
})
export class PollsComponent implements OnInit { 
  public chartType:string;

 public chartData:Array<any>;

  public chartLabels:Array<any> ;

  public chartColors:Array<any>= [{
    hoverBorderColor: ['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.1)'],
    hoverBorderWidth: 0,
    backgroundColor: ["#F7464A", "#46BFBD", "#FDB45C", "#949FB1"],
    hoverBackgroundColor: ["#FF5A5E", "#5AD3D1", "#FFC870", "#A8B3C5"]
}];

  public chartOptions:any = {
      responsive: true
  };
  public chartClicked(e: any): void { }
  public chartHovered(e: any): void { }
  
  privateKey: string = '01E4B2794BD5EAC9A2A20C1F8380EF79EBB7F369A5A6040291DB3875867F4727';
  listPoll: Array<any>;
  account: Account
  listPolloption: Array<any>;
  showDetail = false;
  address: string;
  doe: string;
  publicKey: string;
  title: string;
  type: string;
  description: any;
  formData: any
  createpollsForm: FormGroup;
  options: any;
  link: any;
  radioSelected: any
  radio: any
  keyObject = Object.keys;
  validateform = false;
  stringsPubliKey: any
  strings:any
  @BlockUI() blockUI: NgBlockUI;
  constructor(

    private fb: FormBuilder,
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private sharedService: SharedService,
  ) {
    this.chartData = [];
  }

  ngOnInit() {
  

    this.blockUI.start('Loading...'); // Start blocking

    this.nemProvider.getAllTransactionsFromAccount(this.nemProvider.getPublicAccountFromPrivateKey(this.privateKey, this.walletService.network)
    ).subscribe(
      (infTrans: Transaction[]) => {

        this.listPoll = infTrans.map((tran: any) => {
          return JSON.parse(tran.message.payload);
        });
        this.blockUI.stop();
      },
      error => {
        this.sharedService.showError('Error', '¡unexpected error!');
        this.blockUI.stop(); // Stop blocking
        console.error(error);
      })
  }

  getDataPull(data) {
 
    this.blockUI.start('Loading...'); // Start blocking
    this.address = data['address']
    this.doe = data['doe']
    this.publicKey = data['publicKey']
    this.title = data['title']
    this.type = data['type']

    const publicAccount = this.nemProvider.createPublicAccount(this.publicKey, this.walletService.network);

    this.nemProvider.getAllTransactionsFromAccount(publicAccount).subscribe(
      (infTrans: Transaction[]) => {
        let data: any
        infTrans.map((tran: any) => {
          return JSON.parse(tran.message.payload);
        }).forEach(element => {
          if (Object.keys(element)[0] === 'formData') {
            this.formData = element['formData'];

          } else if (Object.keys(element)[0] === 'description') {
            this.description = element['description'];

          } else if (Object.keys(element)[0] === 'options') {
            this.options = element['options'];
            this.link = this.options.link;
            this.stringsPubliKey = this.options.stringsPubliKey;

            this.strings =this.options.strings;
          }
        });



        this.blockUI.stop();
        this.showDetail = true;
        // 
        this.createForm()
        this.result()
      },
      error => {
        this.sharedService.showError('Error', '¡unexpected error!');
        this.blockUI.stop(); // Stop blocking
        console.error(error);;
      }
    );




  }

  valuechek(value: string) {

    this.radio = value.replace(/['"]+/g, '')
  }

  create() {

    if (this.createpollsForm.valid && !this.validateform) {

      const common = {
        password: this.createpollsForm.get('password').value
      }
      if (this.walletService.decrypt(common)) {
        this.preparepoll(common)
      }
    }


  }
  createForm() {
    console.log()

    this.createpollsForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    });



  }
  getError(param, formControl?) {
    if (this.createpollsForm.get(param).getError('required')) {
      return `This field is required`;
    } else if (this.createpollsForm.get(param).getError('minlength')) {
      return `This field must contain minimum ${this.createpollsForm.get(param).getError('minlength').requiredLength} characters`;
    } else if (this.createpollsForm.get(param).getError('maxlength')) {
      return `This field must contain maximum ${this.createpollsForm.get(param).getError('maxlength').requiredLength} characters`;
    }
  }

  preparepoll(common) {
    const adders = Address.createFromRawAddress(this.radio).plain()
    let transferTransaction: any
    transferTransaction = this.nemProvider.sendTransaction(this.walletService.network, adders, '')
    transferTransaction.fee = UInt64.fromUint(0);
    const account = Account.createFromPrivateKey(common.privateKey, this.walletService.network);
    const signedTransaction = account.sign(transferTransaction);
    this.blockUI.start('Loading...'); // Start blocking
    this.nemProvider.announce(signedTransaction).subscribe(
      x => {
        this.blockUI.stop(); // Stop blocking
        console.log("exis=", x)
        this.validateform = true;
        this.sharedService.showSuccess('success', 'voting created')
        this.result()
      },
      err => {
        this.sharedService.showError('Error', '¡unexpected error!');
        console.error(err)
      });

  }

  result() {

    console.log( this.strings)
    this.chartType= 'pie';
    this.chartData = [];
    this.chartLabels =  this.strings 
   
   

   const valor= []
    this.stringsPubliKey.forEach((element,index) => {
      const publicAccount = this.nemProvider.createPublicAccount(element, this.walletService.network);
      this.nemProvider.getAllTransactionsFromAccount(publicAccount).subscribe(
        (infTrans: Transaction[]) => {

          this.chartData.push(infTrans.length)
          console.log(
            this.chartData)
        },
        error => {
          this.sharedService.showError('Error', '¡unexpected error!');
          this.blockUI.stop(); // Stop blocking
          console.error(error);
        })
    })


  }

}

