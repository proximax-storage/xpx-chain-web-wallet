import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServiceModuleService {
  node: String;
  constructor() { 
    this.node = JSON.parse(localStorage.getItem('node-selected'));
  }


  /**
 * Structuring the information of the wallet for selection
 *
 * @param {*} wallets
 * @returns
 * @memberof LoginService
 */
  selectNodeOption(node: Array<any> = []) {
    node = (node == null) ? [] : node
    const retorno = [{ 'value': '', 'label': 'Select node' }];
    node.forEach((item, index) => {
      retorno.push({ value: item, label: item.name });

    });
    return retorno;
  }

  nodeSelected(node) {
    // let nodeselected = JSON.parse(localStorage.getItem('node-selected'));
    // if (!nodeselected) {
    //   localStorage.setItem('node-selected', JSON.stringify(node))
    // } else {
    localStorage.setItem('node-selected', JSON.stringify(node))
    // }
    this.node = JSON.parse(localStorage.getItem('node-selected'));
  }

  getnode() {
    return  JSON.parse(localStorage.getItem('node-selected'))
  }
}
