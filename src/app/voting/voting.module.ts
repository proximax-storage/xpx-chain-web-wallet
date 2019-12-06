import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { VotingRoutingModule } from './voting-routing.module';
import { VoteInPollComponent } from './views/vote-in-poll/vote-in-poll.component';
import { CreatePollComponent } from './views/create-poll/create-poll.component';
import { PollsComponent } from './views/polls/polls.component';
import { ResultPollComponent } from './views/result-poll/result-poll.component';
import { HighchartsChartComponent } from './views/vote-in-poll/highcharts-chart.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  declarations: [
    VoteInPollComponent,
    CreatePollComponent,
    PollsComponent,
    ResultPollComponent,
    HighchartsChartComponent
  ],
  schemas: [NO_ERRORS_SCHEMA],
  imports: [
    CoreModule,
    VotingRoutingModule
  ]
})
export class VotingModule { }
