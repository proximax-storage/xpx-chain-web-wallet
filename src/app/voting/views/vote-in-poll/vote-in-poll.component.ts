import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicAccount, Address, InnerTransaction, UInt64, Account, AggregateTransaction, Deadline, TransactionHttp, SignedTransaction, Transaction, PlainMessage } from 'tsjs-xpx-chain-sdk';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import * as qrcode from 'qrcode-generator';
import { Subscription } from 'rxjs';
import { ModalDirective } from 'ng-uikit-pro-standard';
import * as Highcharts from 'highcharts';
import { CreatePollStorageService, PollInterface } from '../../../servicesModule/services/create-poll-storage.service';
import { AppConfig } from '../../../config/app.config';
import { WalletService } from '../../../wallet/services/wallet.service';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { environment } from '../../../../environments/environment';
import { NodeService } from '../../../servicesModule/services/node.service';
import { DataBridgeService } from '../../../shared/services/data-bridge.service';
import { TransactionsService, TransactionsInterface } from '../../../transactions/services/transactions.service';

@Component({
  selector: 'app-vote-in-poll',
  templateUrl: './vote-in-poll.component.html',
  styleUrls: ['./vote-in-poll.component.css']
})
export class VoteInPollComponent implements OnInit {
  activate: boolean;
  dataTransaction: TransactionsInterface;
  Highcharts = Highcharts;
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    viewAll: `/${AppConfig.routes.polls}`
  };
  configurationForm: ConfigurationForm = {};
  pollSelected: PollInterface;
  optionsSelected: any = [];
  pollResultVoting: any = [];
  pollResultVotingChar: any = [];
  headResults = ['Options', 'Total'];
  searching: boolean;
  incrementOption = 0;
  memberVoted: boolean;
  viewOptions: boolean;
  btnBlock: boolean;
  statusValidate: string = ''
  blockSend: boolean;
  btnResult: boolean;
  transactionStatus: boolean = false;
  showResult = false;
  votingInPoll: FormGroup;
  transactionHttp: TransactionHttp;
  subscribe: Subscription[] = [];
  incrementOptionV = 0;
  hashCertificate: string;
  namePoll: string;
  isMultipe: boolean;
  qrImg: string;
  chartOptions: any
  transaction: Transaction;
  showResultProgress: boolean;
  updateFlag = false;
  passwordMain: string = 'password';
  signedTransaction: SignedTransaction;

  constructor(
    private nodeService: NodeService,
    private activateRoute: ActivatedRoute,
    private createPollStorageService: CreatePollStorageService,
    private walletService: WalletService,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private proximaxProvider: ProximaxProvider,
    private dataBridge: DataBridgeService,
    private transactionService: TransactionsService

  ) {
    this.transactionHttp = new TransactionHttp(environment.protocol + "://" + `${this.nodeService.getNodeSelected()}`);
    this.configurationForm = this.sharedService.configurationForm;
    this.isMultipe = false;
    this.searching = false;
    this.viewOptions = false;
    this.btnBlock = false;
    this.btnResult = true;
    this.blockSend = false;
    this.activate = false;
    this.showResultProgress = false;
    this.createForm()
    this.getPoll(this.activateRoute.snapshot.paramMap.get('id'));


  }
  @ViewChild('modalInfo', { static: true }) modalInfo: ModalDirective;
  @ViewChild('certificationModal', { static: true }) certificationModal: ModalDirective;
  ngOnInit() {
    // this.getConfirmedTransactions();

  }

  ngOnDestroy(): void {
    // this.subscribeAccount.unsubscribe();
    this.subscribe.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  changeInputType(inputType) {
    let newType = this.sharedService.changeInputType(inputType)
    this.passwordMain = newType;
  }

  /**
   *
   *
   * @memberof ConvertAccountMultisignComponent
   */
  createForm() {
    //Form create multisignature default
    this.votingInPoll = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]]
    })

  }
  /**
 *
 *
 * @param {string} [nameInput='']
 * @param {string} [nameControl='']
 * @param {string} [nameValidation='']
 * @returns
 * @memberof CreateMultiSignatureComponent
 */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.votingInPoll.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.votingInPoll.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.votingInPoll.get(nameInput);
    }
    return validation;
  }


  /**
   * Add and remove poll options
   *
   * @param {any} event
   * @param {any} field
   * @memberof VoteInPollComponent
   */
  checkOptionPoll(event: any, field: any) {
    const optionPoll = this.optionsSelected.find(element => element.field === field);
    if (optionPoll === undefined) {
      this.optionsSelected.push({ field: field });
    } else if (optionPoll !== null) {
      this.optionsSelected = this.optionsSelected.filter(e => e.field !== field)
    }
  }


  /**
  * Add and remove poll options
  *
  * @param {any} event
  * @param {any} field
  * @memberof PollsComponent
  */
  radioOptionPoll(event: any, field: any) {
    this.optionsSelected = [];
    this.optionsSelected.push({ field: field });
  }
  getPoll(id) {
    this.pollSelected = this.createPollStorageService.filterPoll(id);
    this.isMultipe = this.pollSelected.isMultiple
    this.verifyVote();
    this.setResultprev(this.pollSelected);
  }

  setResultprev(pollSelected: PollInterface) {

    for (var index = 0; index < pollSelected.options.length; index++) {
      // pollSelected.options.forEach(elem => {
      this.pollResultVoting.push({ name: pollSelected.options[index].name, y: 0 });

      this.pollResultVotingChar.push({ name: pollSelected.options[index].name, y: 0 });
      // })
    }
    this.pollResultVoting.sort().sort((a, b) => b.y - a.y);
    this.setcreatecharts(this.pollResultVotingChar);
  }

  openCertificateModal() {
    if (this.activate) {
      this.dataTransaction;
      this.certificationModal.show();
    } else {
      this.sharedService.showInfo('', 'Transaction Unconfirmed');
    }

  }

  filterTransactions(array: Transaction[]): Transaction[] {
    var hash = {};
    array = array.filter(function (current) {
      var exists = !hash[current.signer.publicKey] || false;
      hash[current.signer.publicKey] = true;
      return exists;
    });
    return array
  }


  getResult(param: string) {

    if (param === 'RESULTS') {
      this.modalInfo.show()
    }
    if (this.incrementOptionV < this.pollSelected.options.length) {
      this.showResultProgress = true;
      if (
        this.pollSelected.options[this.incrementOptionV].publicAccount.publicKey !== undefined &&
        this.isPublicKey(this.pollSelected.options[this.incrementOptionV].publicAccount.publicKey).STATUS
      ) {

        // Del poll seleccionado obtiene los pollOptions y toma la llave publica para crear la cuenta publica
        const publicAccountOfSelectedOption = PublicAccount.createFromPublicKey(this.pollSelected.options[this.incrementOptionV].publicAccount.publicKey, this.walletService.currentAccount.network)
        //Obtiene todas las transacciones del PollOption

        this.proximaxProvider.getTransactionsFromAccount(publicAccountOfSelectedOption).subscribe(
          (next: Transaction[]) => {

            let lengthVote = 0
            if (next.length > 0) {
              next = next.filter(element => element.type === 16705)
              for (var index = 0; index < this.filterTransactions(next).length; index++) {
                const transaction = this.filterTransactions(next)[index];
                // if (this.walletService.currentAccount.publicAccount.publicKey === transaction.signer.publicKey) {
                lengthVote++

                // }
              }

            }
            this.pollResultVoting.filter(elem => elem.name === this.pollSelected.options[this.incrementOptionV].name).map(element => {
              element.y = lengthVote
            })

            this.pollResultVotingChar = this.pollResultVoting
            this.setcreatecharts(this.pollResultVotingChar);
            this.incrementOptionV++;
            this.getResult(param);
          }, dataError => {
            if (dataError && dataError.error.message) {
              this.sharedService.showError('', dataError.error.message);
            } else if (dataError && dataError.message) {
              this.sharedService.showError('', dataError.message);
            } else {
              this.sharedService.showError('', `error`);
            }
          });
      } else {
        this.sharedService.showError('', ` Option ${this.pollSelected.options[this.incrementOption].name} does not have a valid public key`);
      }
    } else {
      this.incrementOptionV = 0
      this.showResultProgress = false;
    }
  }
  setcreatecharts(data: any) {
    const Options = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      title: {
        text: `Results`
      },
      tooltip: {
        valueDecimals: 0,
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
        name: 'percentage',
        colorByPoint: true,
        data
      }], credits: {
        enabled: false
      }
    };
    this.chartOptions = Options;
    this.updateFlag = true;
  }



  /**
   * Validates if the voter already made a vote
   *
   *
   * @memberof PollsComponent
   */
  verifyVote() {
    this.btnResult = true;
    // if (this.statusPoll(this.pollSelected.endDate, this.pollSelected.startDate) === 'Ongoing') {
    if (this.validateWitheList(this.pollSelected.witheList, this.pollSelected.type)) {
      if (this.walletService.canVote) {
        if (this.incrementOption < this.pollSelected.options.length) {
          if (
            this.pollSelected.options[this.incrementOption].publicAccount.publicKey !== undefined &&
            this.isPublicKey(this.pollSelected.options[this.incrementOption].publicAccount.publicKey).STATUS
          ) {
            this.searching = true;
            const publicAccountOfSelectedOption = PublicAccount.createFromPublicKey(this.pollSelected.options[this.incrementOption].publicAccount.publicKey, this.walletService.currentAccount.network)
            //Obtiene todas las transacciones del PollOption
            this.transaction = undefined;
            this.proximaxProvider.getTransactionsFromAccount(publicAccountOfSelectedOption).subscribe(
              next => {

                //La cuenta del PollOption tiene transacciones
                if (next.length > 0) {
                  next = next.filter(element => element.type === 16705)
                  for (var index = 0; index < next.length; index++) {

                    const transactionnext = next[index];
                    if (this.walletService.currentAccount.publicAccount.publicKey === transactionnext.signer.publicKey) {


                      let transaction = this.transactionService.getStructureDashboard(transactionnext['innerTransactions'][0]);
                      transaction.name = this.pollSelected.name;
                      transaction.description = this.pollSelected.desciption;
                      transaction.hash = transactionnext.transactionInfo.hash
                      this.activate = true;
                      this.dataTransaction = transaction;
                      this.transaction = transactionnext;
                      this.memberVoted = true;
                      this.sharedService.showWarning('', `Sorry, you already voted in this poll`);
                      this.searching = false;
                      this.btnResult = false;
                      this.viewCertificate(this.transaction.transactionInfo.hash, this.pollSelected.name, 'memberVoted', this.transaction)
                      break;
                    }
                  }
                }

                if (!this.memberVoted) {
                  this.incrementOption++;
                  this.verifyVote();
                }
              }, dataError => {
                if (dataError && dataError.error.message) {
                  this.sharedService.showError('', dataError.error.message);
                } else if (dataError && dataError.message) {
                  this.sharedService.showError('', dataError.message);
                } else {
                  this.sharedService.showError('', `Sorry, an error has occurred with the connection`);
                }
                this.searching = false;
              });

          } else {
            this.searching = false;
            this.sharedService.showError('', ` Option ${this.pollSelected.options[this.incrementOption].name} does not have a valid public key`);
          }
        } else {

          if (this.statusPoll(this.pollSelected.endDate, this.pollSelected.startDate) === 'Ongoing') {
            this.searching = false;
            this.viewOptions = true;
            this.statusValidate = 'voting'
            this.btnResult = true;
            this.votingInPoll.enable();
          } else if (this.statusPoll(this.pollSelected.endDate, this.pollSelected.startDate) === 'Ended') {
            this.searching = false;
            this.sharedService.showInfo('', `Finished Poll`);
            this.viewCertificate('', this.pollSelected.name, 'Ended', this.transaction)

          }
        }
      } else {
        this.sharedService.showInfo('', `We are validating your vote, please wait a few seconds`);
      }

    } else {
      this.votingInPoll.disable()
      this.statusValidate = 'noWitheList'
    }
    // } else if (this.statusPoll(this.pollSelected.endDate, this.pollSelected.startDate) === 'Future') {
    //   this.votingInPoll.disable()
    //   this.sharedService.showInfo('', `To start poll}`);
    // } else {
    //   this.votingInPoll.disable()
    //   this.btnResult = false;
    //   this.statusValidate = 'finishedPoll'
    //   this.sharedService.showInfo('', `Finished poll`);
    // }
  }
  /**
    * valida public key
    *
    * @param {string} publicKey
    * @returns
    * @memberof WalletService
    */
  isPublicKey(publicKey: string) {
    if (publicKey == null || (publicKey.length !== 64 && publicKey.length !== 66)) {
      return { STATUS: false, DESCRIPTIOn: 'Not a valid public key' }
    }
    return { STATUS: true }
  }

  validateWitheList(witheList: any, type: number): boolean {
    const addressCompare: Address = Address.createFromPublicKey(this.walletService.currentAccount.publicAccount.publicKey, this.walletService.currentAccount.publicAccount.address.networkType)
    if (type == 1)
      return true
    if (type == 0) {
      const valor = witheList.find(elemnt => elemnt.address === addressCompare.plain());
      if (valor) {
        return true;
      } else {
        return false;
      }
    }
  }

  /**
    * validate status date poll
    *
    * @param {any} obj
    * @memberof PollsComponent
    */
  statusPoll(endDate: string | number | Date, starDate: string | number | Date) {
    endDate = new Date(endDate).getTime();
    starDate = new Date(starDate).getTime();
    const now = new Date().getTime();
    if (starDate <= now && endDate >= now) {
      return 'Ongoing';
    } else if (starDate > now) {
      return 'Future';
    } else {
      return 'Ended';
    }
  }

  formtDate(format: string | number | Date) {
    const datefmt = new Date(format);
    const day = (datefmt.getDate() < 10) ? `0${datefmt.getDate()}` : datefmt.getDate();
    const month = (datefmt.getMonth() + 1 < 10) ? `0${datefmt.getMonth() + 1}` : datefmt.getMonth() + 1;
    const hours = (datefmt.getHours() < 10) ? `0${datefmt.getHours()}` : datefmt.getHours();
    const minutes = (datefmt.getMinutes() < 10) ? `0${datefmt.getMinutes()}` : datefmt.getMinutes();
    const seconds = (datefmt.getSeconds() < 10) ? `0${datefmt.getSeconds()}` : datefmt.getSeconds();
    return `${datefmt.getFullYear()}-${month}-${day}  ${hours}:${minutes}:${seconds}`;
  }


  sendForm() {
    // this.statusValidate = 'finishedPoll'
    if (this.votingInPoll.valid) {
      if (this.optionsSelected.length > 0) {
        const common = {
          password: this.votingInPoll.get('password').value,
          privateKey: ''
        }
        if (this.walletService.decrypt(common)) {
          if (!this.blockSend) {
            this.sendTransaction(common)
          }
        }
      } else {
        this.blockSend = false;
        this.sharedService.showError('', `Please select at least one option`);

      }
    } else {
      this.sharedService.showError('', `Enter wallet password`);
    }
  }
  sendTransaction(common: any) {
    this.blockSend = true;
    const publicAccount = PublicAccount.createFromPublicKey(this.walletService.currentAccount.publicAccount.publicKey, this.walletService.currentAccount.network);
    const accountsign: Account = Account.createFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
    const message: PayloadInterface = {
      type: 'voting',
      datetime: (new Date).getTime(),
      name: this.pollSelected.name
    }
    const aggregateTransaction = AggregateTransaction.createComplete(
      Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
      this.transactionToAggregate(publicAccount, message),
      publicAccount.address.networkType,
      []);

    const generationHash = this.dataBridge.blockInfo.generationHash;
    this.signedTransaction = accountsign.sign(aggregateTransaction, generationHash); //Update-sdk-dragon

    this.announceTransaction(this.signedTransaction);

  }

  transactionToAggregate(publicAccount: PublicAccount, message: PayloadInterface): InnerTransaction[] {
    let innerTransaction: InnerTransaction[] = []
    for (let i = 0; i < this.optionsSelected.length; i++) {
      const optionData = this.pollSelected.options.find(e => e.name === this.optionsSelected[i].field);
      message.nameOption = optionData.name;
      const recipient = Address.createFromPublicKey(optionData.publicAccount.publicKey, optionData.publicAccount.address.networkType);
      let transferTransaction: any = this.proximaxProvider.buildTransferTransaction(this.walletService.currentAccount.network, recipient, PlainMessage.create(JSON.stringify(message)));
      transferTransaction.fee = UInt64.fromUint(0);
      innerTransaction.push(transferTransaction.toAggregate(publicAccount))
    }
    return innerTransaction
  }

  announceTransaction(signedTransaction: SignedTransaction) {
    this.transactionHttp.announce(signedTransaction).subscribe(
      async () => {
        // this.blockSend = false;
        if (!this.transactionStatus) {
          this.getTransactionStatus(signedTransaction)
        }
      },
      err => {
        this.blockSend = false;
        this.sharedService.showError('', err);
      });
  }

  getConfirmedTransactions() {
    this.transactionService.getConfirmedTransactions$().subscribe(x => {
      const transactionData = x.filter(next => next.data.transactionInfo.hash === this.signedTransaction.hash)[0];
      if (transactionData) {
        let transaction =  this.transactionService.getStructureDashboard(transactionData['data']['innerTransactions'][0]);
        const poll = JSON.parse(transactionData['data']['innerTransactions'][0].message.payload);
        transaction.name = poll.name;
        transaction.hash = transactionData['data'].transactionInfo.hash;
        transaction.description = poll.desciption;
        this.dataTransaction = transaction;
        this.activate = true;
      }
    })
  }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  getTransactionStatus(signedTransaction: SignedTransaction) {
    // Get transaction status
    this.subscribe['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        this.transactionStatus = true;
        if (statusTransaction !== null && statusTransaction !== undefined && signedTransaction !== null) {
          const match = statusTransaction['hash'] === signedTransaction.hash;
          if (statusTransaction['type'] === 'confirmed' && match) {
            this.getConfirmedTransactions();
            signedTransaction = null;
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            this.blockSend = false;
            this.viewCertificate(signedTransaction.hash, this.pollSelected.name, 'newVoting')
            this.walletService.countTimeVote();
            // signedTransaction = null;

          } else if (match) {
            this.btnBlock = true;
            this.blockSend = false;
            signedTransaction = null;
          }
        }
      }
    );
  }
  viewCertificate(hash: string, name: string, path: string, transaction?: Transaction) {
    this.votingInPoll.disable();
    this.btnBlock = true;
    this.btnResult = false;
    this.optionsSelected = [];
    if (path === 'memberVoted' || path === 'newVoting') {

      this.hashCertificate = hash;
      const url = `${environment.nodeExplorer}/${hash}`;
      const qr = qrcode(0, 'H');
      qr.addData(url);
      qr.make();
      this.qrImg = qr.createDataURL();
      this.namePoll = name;
      this.statusValidate = 'viewCertificate'



    }

    if (path == 'Ended') {
      if (transaction) {

        this.hashCertificate = hash;
        const url = `${environment.nodeExplorer}/${hash}`;
        const qr = qrcode(0, 'H');
        qr.addData(url);
        qr.make();
        this.qrImg = qr.createDataURL()
        this.namePoll = name;
        this.statusValidate = 'viewCertificate'

      } else {
        this.statusValidate = 'finishedPoll'

      }

    }
  }
}

export declare interface PayloadInterface {
  type: string;
  datetime: number;
  name: string;
  // AssociationId: number;
  nameOption?: string;
}



interface ChartInterface {
  chart: Chart;
  title: Title;
  tooltip: Tooltip;
  plotOptions: PlotOptions;
  series: Series[];
}

interface Series {
  name: string;
  colorByPoint: boolean;
  data: Datum[];
}

interface Datum {
  name: string;
  y: number;
}

interface PlotOptions {
  pie: Pie;
}

interface Pie {
  allowPointSelect: boolean;
  cursor: string;
  dataLabels: DataLabels;
  showInLegend: boolean;
}

interface DataLabels {
  enabled: boolean;
}

interface Tooltip {
  valueDecimals: number;
  pointFormat: string;
}

interface Title {
  text: string;
}

interface Chart {
  plotBackgroundColor?: any;
  plotBorderWidth?: any;
  plotShadow: boolean;
  type: string;
}
