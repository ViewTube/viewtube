describe('Homepage Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8466');
    cy.get('#app[hydrated=true]', { timeout: 1000 });
  });

  it('homepage loads and displays logo', () => {
    cy.get('.logo-link').should('have.attr', 'href', '/');
  });

  it('homepage loads and shows videos', () => {
    cy.get('.section-title > .title').should('have.text', 'Popular videos');

    cy.get(
      '.home-videos-container > .video-entry:first > .video-entry-info > .video-info-text > .video-entry-title'
    ).should('exist');
  });
});
