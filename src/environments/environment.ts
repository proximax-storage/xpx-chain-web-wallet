//config js in assets 
import { ChronoUnit } from 'js-joda';
const config = window['dynamic_configuration']
config.deadlineTransfer.chronoUnit = ChronoUnit.MINUTES
export const environment : any =  config;