import { Component, OnInit, createPlatformFactory } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl, FormArray } from "@angular/forms";
import { WalletService } from '../../../../shared/services/wallet.service';
import { NemProvider } from '../../../../shared/services/nem.provider';
import { SharedService } from '../../../../shared';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Address, UInt64, Account, TransferTransaction, Transaction } from 'nem2-sdk';
import { first } from "rxjs/operators";
import * as Highcharts from 'highcharts';
import { Observer, BehaviorSubject, Subject, ReplaySubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-polls',
  templateUrl: './polls.component.html',
  styleUrls: ['./polls.component.scss']
})
export class PollsComponent implements OnInit {
  private _transConfirm = new ReplaySubject(1);
  // private _transConfirm = new Subject<DataStoreService[]>();
  private _transConfirm$: Observable<any> = this._transConfirm.asObservable();
  Highcharts = Highcharts;
  chartOptions: object;
  privateKey: string = '01E4B2794BD5EAC9A2A20C1F8380EF79EBB7F369A5A6040291DB3875867F4727';
  listPoll: Array<any>;
  account: Account
  listPolloption: Array<any>;
  showDetail = false;
  showResult = false;
  address: string;
  doe: string;
  publicKey: string;
  title: string;
  type: string;
  description: any;
  resultinftrans: any
  formData: any
  createpollsForm: FormGroup;
  options: any;
  whiteList: any;
  link: any;
  radioSelected: any
  radio: any
  keyObject = Object.keys;
  validateform = false;
  pollFinished = false;
  voteCast = false;
  showVote = false;
  whitelist = false;
  issueList: any =[]
  stringsPubliKey: any
  strings: any
  @BlockUI() blockUI: NgBlockUI;
  constructor(

    private fb: FormBuilder,
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private sharedService: SharedService,
  ) {


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

  createcharts(data: any) {
    this.showResult = true;
    this.chartOptions = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      title: {
        text: 'results '
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true
          },
          showInLegend: true
        }
      },
      series: [{
        name: 'Brands',
        colorByPoint: true,
        data: data
      }]
    }






  }

  getDataPull(data) {

    while (this.issueList.length > 0) {
      this.issueList.pop();
    }

    this.issueList=[]
    this.blockUI.start('Loading...'); // Start blocking
    this.address = data['address']
    this.doe = data['doe']
    this.publicKey = data['publicKey']
    this.title = data['title'];
    this.type = data['type'];
    this.pollFinished = false;
    this.whitelist = false;
    this.voteCast = false;
    this.showVote = false;
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
            this.strings = this.options.strings;
           
          } else if (Object.keys(element)[0] === 'whiteList') {
            this.whiteList = element['whiteList'];
           
          }
        });

        this.showDetail = true;
        // 
        let now = (new Date()).getTime();
        if (this.formData.doe < now) {
          this.blockUI.stop();
          this.pollFinished = true;
          this.showVote = false;
        } else {
          this.stringsPubliKey.forEach((element, index) => {

            this.ifvoted(element)

          })
          // this._transConfirm.next([])
          this._transConfirm$.subscribe(
            result => {
              if (result.indexOf(this.walletService.currentAccount.address) > -1) {
                this.voteCast = false;
                this.issueList.push("vote cast");
              }
              this.checkValidVote()
            })
        }

        this.result()
      },
      error => {
        this.sharedService.showError('Error', '¡unexpected error!');
        this.blockUI.stop(); // Stop blocking
        console.error(error);;
      }
    );

  }
  //returns wether current use;r can vote on the poll(by whitelist, not by doe)
  isVotable(headerData, whitelist) {
    let type = ("type" in headerData) ? (headerData.type) : (headerData.formData.type);
    if (type === '1') {
      return true;
    }
    let address = this.walletService.currentAccount.address;
    if (type === '2') {
      return (whitelist.indexOf(address) > -1);
    }
  }
  valuechek(value: string) {
    this.radio = value.replace(/['"]+/g, '')
  }
  checkValidVote() {
    if (this.formData.type === "2") {
      if (!this.isVotable(this.formData, this.whiteList)) {
        // console.log("You are not on the Whitelist")
        this.issueList.push("You are not on the Whitelist");
        this.whitelist = true;
      }
    }
    if (this.issueList.length == 0) {
      this.createForm()
      this.showVote = true;
    } else if (this.issueList.length > 0  ) {
      if(this.whitelist){
        this.showVote = false;
      }else{this.voteCast=true;}
     
    }
  }
  ifvoted(element) {
    const publicAccount = this.nemProvider.createPublicAccount(element, this.walletService.network);
    this.nemProvider.getAllTransactionsFromAccount(publicAccount).subscribe(
      (infTrans: Transaction[]) => {
        this.resultinftrans = infTrans.map((tran: any) => {
          return tran.signer.address['address'];
        })
        this.blockUI.stop(); // Stop blocking
        // this.validateVete(this.resultinftrans);
        this._transConfirm.next(this.resultinftrans)

      },
      error => {
        this.sharedService.showError('Error', '¡unexpected error!');
        this.blockUI.stop(); // Stop blocking
        console.error(error);
      })


  }

  validateVete(result) {
    return (result.indexOf(this.walletService.currentAccount.address) > -1)

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

    this.nemProvider.getTransactionStatusError(signedTransaction.hash).subscribe(response => console.log(response))
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
    const datachar = []
    this.stringsPubliKey.forEach((element, index) => {
      const publicAccount = this.nemProvider.createPublicAccount(element, this.walletService.network);
      this.nemProvider.getAllTransactionsFromAccount(publicAccount).subscribe(
        (infTrans: Transaction[]) => {
          datachar.push({ name: this.strings[index], y: infTrans.length })
          this.createcharts(datachar);
        },
        error => {
          this.sharedService.showError('Error', '¡unexpected error!');
          this.blockUI.stop(); // Stop blocking
          console.error(error);
        })
    })

  }

}

