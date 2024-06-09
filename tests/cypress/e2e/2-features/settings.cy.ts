import { baseUrl } from 'support/constants';

describe('Settings tests', () => {
  beforeEach(() => {
    cy.visit(baseUrl);
    cy.get('#app[hydrated=true]', { timeout: 10000 });
  });

  it('Settings popup opens and closes properly', () => {
    cy.get('#account').click();
    cy.get('#settings-btn').should('exist').click();
    cy.get('.settings.popup').should('exist');

    cy.get('.settings.popup .settings-header .settings-title').text().should('eq', 'Settings');

    cy.get('.settings.popup .settings-header .close-icon').click();

    // Wait for animation to finish
    cy.wait(300);
    cy.get('.settings.popup').should('not.exist');
  });
});
