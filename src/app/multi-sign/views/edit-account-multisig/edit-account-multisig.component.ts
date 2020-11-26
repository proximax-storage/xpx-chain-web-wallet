import { Component, OnInit } from '@angular/core';
import { ServicesModuleService, HeaderServicesInterface } from '../../../servicesModule/services/services-module.service';
@Component({
  selector: 'app-edit-account-multisig',
  templateUrl: './edit-account-multisig.component.html',
  styleUrls: ['./edit-account-multisig.component.css']
})
export class EditAccountMultisigComponent implements OnInit {
  visibleIndex = -1;
  data: Array<any>;
  paramsHeader: HeaderServicesInterface = {
    componentName: 'Edit Account Multisig',
    moduleName: 'Accounts > Multisign'
  };
  constructor() {


    this.data = [
      {
        name: 'Lon wond',
        addres: 'VB2JKY-HRYWKO-4OX5HM-ABIOQH-IM6A25-53KGSQ-ONCU',
        isMultisig: true,
        cosig: [
          {
            name: 'Alivin',
            addres: 'VD4RD57SGDNJWWWNV6LNUIIQ6EF7YYHC6X7YRQHS',
            isMultisig: false,
            cosig: [

            ]
          },
          {
            name: 'Corina',
            addres: 'VAUIIRN33XXWCJARFXOKIEPIEJY3Y26U4J6THBGH',
            isMultisig: false
          }
        ]
      },
      {
        name: 'Jeffersson',
        addres: 'VBHRT2OWO7UUPX7TIHF7LUJC62CQO34WWPDRXIWL',
        isMultisig: false,
        cosig: [
          {
            name: 'Alivin',
            addres: 'VD4RD57SGDNJWWWNV6LNUIIQ6EF7YYHC6X7YRQHS',
            isMultisig: false,
            cosig: [

            ]
          },
          {
            name: 'Corina',
            addres: 'VAUIIRN33XXWCJARFXOKIEPIEJY3Y26U4J6THBGH',
            isMultisig: false
          }
        ]
      },
      {
        name: 'Luis',
        addres: 'VC737QHSRTY2J7RSYDIVGD244RG74YOSUV3O6UCY',
        isMultisig: false,
        cosig: [
          {
            name: 'Alivin',
            addres: 'VD4RD57SGDNJWWWNV6LNUIIQ6EF7YYHC6X7YRQHS',
            isMultisig: false,
            cosig: [

            ]
          },
          {
            name: 'Corina',
            addres: 'VAUIIRN33XXWCJARFXOKIEPIEJY3Y26U4J6THBGH',
            isMultisig: false
          }
        ]
      }
    ]
  }

  ngOnInit () {
  }

  showSubItem (ind) {
    console.log('ind', ind)
    if (this.visibleIndex === ind) {
      this.visibleIndex = -1;
    } else {
      this.visibleIndex = ind;
    }
  }

}

// VB7S6Y7UJZ2CJOENXX4WGNWH2ABPD7XQKWD22TVL

// VBHRT2OWO7UUPX7TIHF7LUJC62CQO34WWPDRXIWL
// VC737QHSRTY2J7RSYDIVGD244RG74YOSUV3O6UCY
// VD4RD57SGDNJWWWNV6LNUIIQ6EF7YYHC6X7YRQHS
// VA7DZFC3IQYK3KIHVWKMIK5TKQFE6AOQ6DVMRQJB

// VAUIIRN33XXWCJARFXOKIEPIEJY3Y26U4J6THBGH
