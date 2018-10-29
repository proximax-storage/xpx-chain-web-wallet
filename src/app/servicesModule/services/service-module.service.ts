import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServiceModuleService {

  nodeDefault = 'staging.mocd.gov.ae/catapult/';
  node: String;
  nameNode = 'proxi-nodes';
  nodeSelect = 'node-selected';


  constructor() {
    this.node = JSON.parse(localStorage.getItem(this.nodeSelect));
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

  nodeSelected(node = this.nodeDefault) {
    localStorage.setItem(this.nodeSelect, JSON.stringify(node))
    this.node = JSON.parse(localStorage.getItem(this.nodeSelect));
    return this.node;
  }

  setNode(nodes) {
    localStorage.setItem(this.nameNode, JSON.stringify(nodes));
  }

  getNode() {
    return  JSON.parse(localStorage.getItem(this.nodeSelect));
  }

  issetNodesStorage() {
    return JSON.parse(localStorage.getItem(this.nameNode));
  }

  getNameNode() {
    return this.nameNode;
  }
}
