import { Component, OnInit } from '@angular/core';
import { CreatePollStorageService, PollInterface } from 'src/app/servicesModule/services/create-poll-storage.service';
import { ActivatedRoute } from '@angular/router';
import { AppConfig } from 'src/app/config/app.config';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PublicAccount } from 'tsjs-xpx-chain-sdk';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';

@Component({
  selector: 'app-vote-in-poll',
  templateUrl: './vote-in-poll.component.html',
  styleUrls: ['./vote-in-poll.component.css']
})
export class VoteInPollComponent implements OnInit {
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    viewAll: `/${AppConfig.routes.polls}`,
    editAccount: `/${AppConfig.routes.editAccountMultisign}/`
  };
  pollSelected: PollInterface;
  optionsSelected: any = [];
  searching: boolean;
  incrementOption = 0;
  memberVoted: boolean;
  viewOptions: boolean;
  constructor(
    private activateRoute: ActivatedRoute,
    private createPollStorageService: CreatePollStorageService,
    private walletService: WalletService,
    private sharedService: SharedService,

    private proximaxProvider: ProximaxProvider,
  ) {
    this.searching = false;
    this.viewOptions = false;
    this.getPoll(this.activateRoute.snapshot.paramMap.get('id'));
    this.verifyVote();
  }

  ngOnInit() {


  }

  checkOptionPoll(event: any, field: any) {
    const optionPoll = this.optionsSelected.find(element => element.field === field);
    if (optionPoll === undefined) {
      this.optionsSelected.push({ field: field });
    } else if (optionPoll !== null) {
      this.optionsSelected = this.optionsSelected.filter(e => e.field !== field)
    }
  }


  getPoll(id) {
    this.pollSelected = this.createPollStorageService.filterPoll(id);

  }

  /**
   * Validates if the voter already made a vote
   *
   * 
   * @memberof PollsComponent
   */
  verifyVote() {

    if (this.statusPoll(this.pollSelected.endDate, this.pollSelected.startDate) === 'Ongoing') {
    if (this.walletService.canVote) {
      if (this.incrementOption < this.pollSelected.options.length) {

        if (
          this.pollSelected.options[this.incrementOption].publicAccount.publicKey !== undefined &&
          this.isPublicKey(this.pollSelected.options[this.incrementOption].publicAccount.publicKey).STATUS
        ) {
          this.searching = true;
          const publicAccountOfSelectedOption = PublicAccount.createFromPublicKey(this.pollSelected.options[this.incrementOption].publicAccount.publicKey, this.walletService.currentAccount.network)
          //Obtiene todas las transacciones del PollOption
          this.proximaxProvider.getTransactionsFromAccount(publicAccountOfSelectedOption).subscribe(
            next => {

              console.log('next', next)
              //La cuenta del PollOption tiene transacciones
              if (next.length > 0) {
                for (var index = 0; index < next.length; index++) {
                  const transaction = next[index];
                  if (this.walletService.currentAccount.publicAccount.publicKey === transaction.signer.publicKey) {
                    this.memberVoted = true;
                    this.sharedService.showWarning('', `Sorry, you already voted in this poll`);
                    this.searching = false;
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
        this.searching = false;
        this.viewOptions = true;
        console.log("puedo votar")
      }
    }
    } else if (this.statusPoll(this.pollSelected.endDate, this.pollSelected.startDate) === 'Future') {
      this.sharedService.showInfo('', `To start poll}`);
    } else {
      this.sharedService.showInfo('', `Finished poll`);
    }
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
}