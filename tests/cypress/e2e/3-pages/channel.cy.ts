import { baseUrl } from 'support/constants';

const channelId = 'UCBJycsmduvYEL83R_U4JriQ';
const channelName = 'Marques Brownlee';

// YouTube only offers the members/public filter on channels that actually have members-only
// content, which the primary fixture does not
const membershipChannelId = 'UCXuqSBlHAE6Xw-yeJA0Tunw';

// Every tab is present on this channel, so an empty result means something broke rather than that
// the channel never had the tab
const visitChannelPage = (page = '') => {
  cy.visit(`${baseUrl}/channel/${channelId}${page && `/${page}`}`);
  cy.get('#app[hydrated=true]', { timeout: 10000 });
  cy.get('.banner-section', { timeout: 15000 }).should('exist');
};

const nonBlank = /\S/;
const containsDigit = /\d/;

/** Thumbnails must never point at ytimg directly — every image goes through the server proxy. */
const proxiedImage = '/api/proxy/image?url=';

/**
 * The mapper's failure mode is a rendered entry whose fields are empty, which any existence check
 * passes happily, so each field YouTube supplies is checked for actual content. Title, thumbnail
 * and view count come with every entry; a duration and an upload date do not, since shorts lockups
 * carry neither and a livestream shows "Live" in place of a duration.
 */
const expectPopulatedVideoEntry = (
  selector: string,
  { duration = true, published = true } = {}
) => {
  cy.get(selector).within(() => {
    cy.get('.video-entry-title').invoke('text').should('match', nonBlank);
    cy.get('.video-entry-title').should('have.attr', 'href').and('contain', '/watch?v=');
    cy.get('.video-entry-thmb-image').should('have.attr', 'src').and('contain', proxiedImage);
    cy.get('.video-entry-views').invoke('text').should('match', nonBlank);

    if (published) cy.get('.video-entry-timestamp').invoke('text').should('match', nonBlank);

    if (duration) {
      cy.get('.video-entry-length')
        .invoke('text')
        .should('match', /\d+:\d{2}/);
    }
  });
};

describe('Channel banner', () => {
  beforeEach(() => visitChannelPage());

  it('shows the name, avatar and subscriber count from youtube', () => {
    cy.get('.banner-section .title').should('contain.text', channelName);
    cy.get('.banner-section .avatar-img').should('have.attr', 'src').and('contain', proxiedImage);
    cy.get('.banner-section .subscribers').invoke('text').should('match', containsDigit);
  });
});

describe('Channel home page', () => {
  beforeEach(() => visitChannelPage('home'));

  it('shows the description, links, tags and stats', () => {
    cy.get('.channel-home .channel-description').invoke('text').should('match', nonBlank);
    cy.get('.channel-home .channel-links-title').should('exist');
    cy.get('.channel-home .channel-tags .channel-tag').should('have.length.at.least', 1);
    cy.get('.channel-home .channel-stats').invoke('text').should('match', containsDigit);
  });

  it('shows shelves whose entries carry real data', () => {
    cy.get('.channel-home .shelves').should('have.length.at.least', 1);
    cy.get('.channel-home .section-title .title').last().invoke('text').should('match', nonBlank);

    expectPopulatedVideoEntry('.channel-home .shelves .video-entry:first');
  });
});

describe('Channel videos page', () => {
  beforeEach(() => visitChannelPage('videos'));

  it('lists videos with every field populated', () => {
    cy.get('.videos-container .video-entry').should('have.length.at.least', 1);
    expectPopulatedVideoEntry('.videos-container .video-entry:first');
  });

  it('offers the sort options youtube reported', () => {
    // `contain.text` on a multi-element set only reads the first, so the label is matched alone
    cy.contains('.videos .controls .sort-label', 'Sort by').should('exist');
    cy.get('.videos .controls .multi-option .option').should('have.length.at.least', 2);
  });

  it('loads a further page of real videos on demand', () => {
    cy.get('.videos-container .video-entry').then(initial => {
      cy.get('.show-more-button').click();

      cy.get('.videos-container .video-entry', { timeout: 20000 }).should(
        'have.length.greaterThan',
        initial.length
      );

      // The continuation has to yield usable entries, not just more of them
      expectPopulatedVideoEntry('.videos-container .video-entry:last');
    });
  });
});

// `availableFilters` is the one part of the feed dto that reaches the ui as a control rather than
// as content, so it is worth proving end to end on a channel that has one
describe('Channel videos filter', () => {
  it('offers the members filter on a channel that has members-only content', () => {
    cy.visit(`${baseUrl}/channel/${membershipChannelId}/videos`);
    cy.get('#app[hydrated=true]', { timeout: 10000 });

    cy.contains('.videos .controls .sort-label', 'Show').should('exist');
    cy.contains('.videos .controls .multi-option .option', 'Members').should('exist');
  });
});

describe('Channel shorts page', () => {
  beforeEach(() => visitChannelPage('shorts'));

  // Shorts lockups carry no duration
  it('lists shorts with titles, thumbnails and view counts', () => {
    cy.get('.videos-container .video-entry').should('have.length.at.least', 1);
    expectPopulatedVideoEntry('.videos-container .video-entry:first', {
      duration: false,
      published: false
    });
  });
});

describe('Channel live page', () => {
  beforeEach(() => visitChannelPage('live'));

  // A channel can have the tab and still have nothing in it, so either outcome is a pass as long as
  // whatever did arrive is properly formed
  it('renders livestreams or an empty state', () => {
    cy.get('.channel-page-error').should('not.exist');
    cy.get('.videos, .no-videos').should('exist');

    cy.get('body').then(body => {
      if (body.find('.videos-container .video-entry').length) {
        expectPopulatedVideoEntry('.videos-container .video-entry:first', {
          duration: false,
          published: false
        });
      }
    });
  });
});

describe('Channel playlists page', () => {
  beforeEach(() => visitChannelPage('playlists'));

  it('lists playlists with titles, thumbnails and working links', () => {
    cy.get('.videos-container .playlist-entry').should('have.length.at.least', 1);

    cy.get('.videos-container .playlist-entry:first').within(() => {
      cy.get('.playlist-entry-title').invoke('text').should('match', nonBlank);
      cy.get('.playlist-entry-thmb').should('have.attr', 'href').and('contain', '/playlist?list=');
      cy.get('.playlist-entry-thmb-image')
        .first()
        .should('have.attr', 'src')
        .and('contain', proxiedImage);
    });
  });

  // YouTube sends no video count with most playlist lockups on this tab — checked against the raw
  // nodes, they arrive with no overlays and no badges at all — so this only asserts that the ones
  // carrying a count render a number rather than an empty badge
  it('renders a video count wherever youtube supplied one', () => {
    cy.get('.videos-container').then(container => {
      container.find('.playlist-entry .count-text').each((_, element) => {
        expect(element.textContent).to.match(containsDigit);
      });
    });
  });
});

describe('Channel community page', () => {
  beforeEach(() => visitChannelPage('community'));

  it('lists community posts with content and a timestamp', () => {
    cy.get('.channel-page-error').should('not.exist');
    cy.get('.community-posts .community-post').should('have.length.at.least', 1);

    cy.get('.community-posts .community-post:first').within(() => {
      cy.get('.creation-time').invoke('text').should('match', nonBlank);
      // An image or poll post carries no text of its own
      cy.get('.text-pre, .post-content').should('exist');
    });
  });
});

// The url shapes YouTube itself hands out; the server resolves each one to the channel id
describe('Channel url shapes', () => {
  const expectResolvedChannel = () => {
    cy.get('#app[hydrated=true]', { timeout: 10000 });
    cy.get('.banner-section .title', { timeout: 15000 }).should('contain.text', channelName);
  };

  it('resolves a handle', () => {
    cy.visit(`${baseUrl}/@mkbhd`);
    expectResolvedChannel();
  });

  it('resolves a legacy custom url', () => {
    cy.visit(`${baseUrl}/c/mkbhd`);
    expectResolvedChannel();
  });

  it('resolves a legacy username', () => {
    cy.visit(`${baseUrl}/user/marquesbrownlee`);
    expectResolvedChannel();
  });

  it('resolves a custom name under /channel', () => {
    cy.visit(`${baseUrl}/channel/mkbhd`);
    expectResolvedChannel();
  });

  it('shows an error for a channel that does not exist', () => {
    cy.visit(`${baseUrl}/channel/UCthisdoesnotexist123456`, { failOnStatusCode: false });
    cy.get('#app[hydrated=true]', { timeout: 10000 });
    cy.get('.banner-section').should('not.exist');
  });
});
