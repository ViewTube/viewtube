describe('Homepage Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8466/watch?v=Nz9b0oJw69I');
    cy.get('#app[hydrated=true]', { timeout: 10000 });
  });

  it('video page loads and displays information', () => {
    const title = "I'm taking this into my own hands... - YouTube Dislike Button";
    cy.get('.video-infobox-title').should('have.text', title);
    cy.get('.infobox-channel-name').should('have.text', 'Linus Tech Tips');
  });

  it('play the video', () => {
    cy.get('.flip-video-element', { timeout: 10_000 })
      .should('have.prop', 'paused', true)
      .should('have.prop', 'ended', false);

    cy.get('.flip-spinner').should('not.exist', { timeout: 120_000 });

    cy.get('.flip-poster').should('exist').trigger('click');

    cy.get('.flip-video-element', { timeout: 120_000 })
      .should('have.prop', 'paused', false)
      .should('have.prop', 'readyState', 4)
      .wait(4000);

    cy.get('.flip-player-ui').click();

    cy.get('.flip-video-element', { timeout: 10_000 }).should('have.prop', 'paused', true);
  });
});
