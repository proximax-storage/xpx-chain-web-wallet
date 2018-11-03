import { Injectable } from '@angular/core';
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  // 192.168.10.38:3000

  nodeDefault = 'staging.mocd.gov.ae/catapult';
  arrayNode = 'proxi-nodes';
  nodeSelect = 'node-selected';

  constructor() { }


  /**
   * Init node
   *
   * @returns
   * @memberof NodeService
   */
  initNode() {
    if (this.getNodeSelected() === null) {
      this.setNode(environment.nodeDefault);
      return environment.nodeDefault;
    }
  }

  /**
   * Verify if there is an array of nodes.
   *
   * @returns
   * @memberof NodeService
   */
  existArrayNodes() {
    return JSON.parse(localStorage.getItem(this.arrayNode));
  }


  /**
   * Get a node selected
   *
   * @returns
   * @memberof NodeService
   */
  nodeSelected() {
    return JSON.parse(localStorage.getItem(this.nodeSelect));
  }

  /**
   * Set
   *
   * @param {any} nodes
   * @memberof NodeService
   */
  setNode(nodes) {
    localStorage.setItem(this.nodeSelect, JSON.stringify(nodes));
  }

  /**
   * Set array nodes
   *
   * @param {any} nodes
   * @memberof NodeService
   */
  setArrayNode(nodes) {
    localStorage.setItem(this.arrayNode, JSON.stringify(nodes));
  }


  /**
   * Get a node selected
   *
   * @returns
   * @memberof NodeService
   */
  getNodeSelected() {
    return JSON.parse(localStorage.getItem(this.nodeSelect));
  }

  /**
   * Get all nodes
   *
   * @returns
   * @memberof NodeService
   */
  getAllNodes() {
    return JSON.parse(localStorage.getItem(this.arrayNode));
  }
}
