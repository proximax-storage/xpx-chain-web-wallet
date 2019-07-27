import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class ServicesService {

  constructor() { }


  buildStructureService(titleParam: string, descriptionParam: string, imageParam: string, showParam: boolean): StructureService {
    return {
      title: titleParam,
      description: descriptionParam,
      image: imageParam,
      show: showParam
    };
  }
}


export interface StructureService {
  title: string;
  description: string;
  image: string;
  show: boolean;
}
