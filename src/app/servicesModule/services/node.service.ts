import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SharedService } from '../../shared/services/shared.service';
import { ProximaxProvider } from '../../shared/services/proximax.provider';
import * as testnet from '../../../assets/json/nodes.json';
import * as mainnet from '../../../assets/json/nodes-mainnet.json';

@Injectable({
  providedIn: 'root'
})
export class NodeService {

  nodeObsSelected: BehaviorSubject<any>;
  nameItemsArrayStorage = environment.nameKeyNodeStorage;
  nameItemSelectedStorage = environment.nameKeyNodeSelected;
  listNodes = (environment.routeNodesJson === 'testnet') ? testnet['nodes'] : mainnet['nodes'];

  constructor(
    private sharedService: SharedService,
    private proximaxProvider: ProximaxProvider,
  ) {
  }


  /**
   *
   *
   * @param {string} node
   * @param {boolean} [showMsg=false]
   * @param {string} [msgNodeCreated='']
   * @returns
   * @memberof NodeService
   */
  addNode(node: string, showMsg: boolean = false, msgNodeCreated: string = '') {
    const dataStorage = this.getAllNodes();
    const data = { value: node, label: node };
    if (dataStorage === null) {
      this.setArrayNode([data]);
      if (showMsg) { this.sharedService.showSuccess('Congratulations!', msgNodeCreated); }
      return;
    }

    const issetData = dataStorage.find(element => element.value === node);
    if (issetData === undefined) {
      dataStorage.push(data);
      this.setArrayNode(dataStorage);
      if (showMsg) { this.sharedService.showSuccess('Congratulations!', msgNodeCreated); }
      return;
    }

    if (showMsg) { this.sharedService.showError('Node repeated', `The '${node}' node already exists`); }
  }

  /**
   *
   *
   * @param {any} url
   * @memberof NodeService
   */
  addNewNodeSelected(url: any) {
    this.nodeObsSelected.next(url);
  }

  /**
   * Init node and validations
   *
   * @memberof NodeService
   */
  initNode() {
    if (this.getAllNodes() === null) {
      this.setArrayNode([]);
    }
    // validates if a selected node exists in the storage
    const constSelectedStorage = this.getNodeSelected();
    const nodeSelected = (constSelectedStorage === null || constSelectedStorage === '') ?
      this.listNodes[Math.floor(Math.random() * this.listNodes.length)] :
      constSelectedStorage;
    // creates a new observable

    this.nodeObsSelected = new BehaviorSubject<any>(nodeSelected);
    // Start the subscription function to the selected node.
    this.subscribeNodeSelected();

    // go through all the nodes that exist by default, and verify that they do not repeat in the storage
    this.listNodes.forEach(element => {
      this.validateToAddNode(element);
    });
  }


  /**
   * Add new selected node
   *
   * @memberof NodeService
   */
  subscribeNodeSelected() {
    this.nodeObsSelected.subscribe(
      next => {
        this.setSelectedNodeStorage(next);
        console.log('setSelectedNodeStorage', next)
        this.proximaxProvider.initInstances(next);
        // this.dataBridge.closeConenection();
        // this.dataBridge.connectnWs(next);
      }
    );
  }


  /**
   * add list of nodes in the storage
   *
   * @param {any} node
   * @param {boolean} [showMsg=false]
   * @param {string} [msgNodeCreated='']
   * @returns
   * @memberof NodeService
   */
  validateToAddNode(node: any, showMsg: boolean = false, msgNodeCreated: string = '', defaultNode: boolean = true) {
    // check if there are nodes created in the storagr
    const dataStorage = this.getAllNodes();
    const data = { value: node, label: node, isDefault: defaultNode };
    // const arrayNode = Object.keys(dataStorage).filter(item => dataStorage[item].value === node);
    // if there is no data in the storage, proceed to create a new node array in the storage
    if (dataStorage === null) {
      // Add an array of nodes in the storage
      this.setArrayNode([data]);
      if (showMsg) {
        this.sharedService.showSuccess('', msgNodeCreated);
      }
      return;
    }

    // if there is data in the storage, verify that this data does not repeat in the storage
    const existData = dataStorage.find((element: { value: any; }) => element.value === node);
    if (existData === undefined) {
      dataStorage.push(data);
      this.setArrayNode(dataStorage);
      if (showMsg) {
        this.sharedService.showSuccess('Congratulations!', msgNodeCreated);
      }
      return;
    }

    if (showMsg) {
      this.sharedService.showError('Node repeated', `The '${node}' node already exists`);
    }

  }

  /**
   * Add an array of nodes in the storage
   *
   * @param {*} nodes
   * @memberof NodeService
   */
  setArrayNode(nodes: any) {
    localStorage.setItem(this.nameItemsArrayStorage, JSON.stringify(nodes));
  }



  /**
   * Add new selected node in the storage
   *
   * @param {any} nodes
   * @memberof NodeService
   */
  setSelectedNodeStorage(node: any) {
    localStorage.setItem(this.nameItemSelectedStorage, JSON.stringify(node));
  }


  /**
   * Get all nodes
   *
   * @returns
   * @memberof NodeService
   */
  getAllNodes() {
    return JSON.parse(localStorage.getItem(this.nameItemsArrayStorage));
  }


  /**
   * Get a node selected
   *
   * @returns
   * @memberof NodeService
   */
  getNodeSelected() {
    return JSON.parse(localStorage.getItem(this.nameItemSelectedStorage));
  }

  /**
   * Return node observable
   *
   * @returns
   * @memberof NodeService
   */
  getNodeObservable() {
    return this.nodeObsSelected.asObservable();
  }
}
