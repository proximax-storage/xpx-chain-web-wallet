import { MaterialAngularModule } from './material-angular.module';

describe('MaterialAngularModule', () => {
  let materialAngularModule: MaterialAngularModule;

  beforeEach(() => {
    materialAngularModule = new MaterialAngularModule();
  });

  it('should create an instance', () => {
    expect(materialAngularModule).toBeTruthy();
  });
});
