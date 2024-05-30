import './commands';

import 'cypress-commands';

Cypress.on('uncaught:exception', () => {
  return false;
});
