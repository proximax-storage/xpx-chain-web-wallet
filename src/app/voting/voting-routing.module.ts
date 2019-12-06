import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { CreatePollComponent } from './views/create-poll/create-poll.component';
import { PollsComponent } from './views/polls/polls.component';
import { VoteInPollComponent } from './views/vote-in-poll/vote-in-poll.component';

const routes: Routes = [
  {
    path: AppConfig.routes.createPoll,
    component: CreatePollComponent,
    data: {
      meta: {
        title: 'createPoll.title',
        description: 'createPoll.text',
        override: true
      }
    }
  }, {
    path: AppConfig.routes.polls,
    component: PollsComponent,
    data: {
      meta: {
        title: 'polls.title',
        description: 'polls.text',
        override: true
      }
    }
  }, {
    path: `${AppConfig.routes.voteInPoll}/:id`,
    component: VoteInPollComponent,
    data: {
      meta: {
        title: 'voteInPoll.title',
        description: 'voteInPoll.text',
        override: true
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VotingRoutingModule { }
