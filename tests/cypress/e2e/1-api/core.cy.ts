import type { ApiDto } from '@viewtube/shared';
import { apiUrl } from 'support/constants';

describe('Core API tests', () => {
  const sampleVideoId = 'b7zBJNmdImo';

  it('GET video', () => {
    cy.request<ApiDto<'VTVideoInfoDto'>>('GET', `${apiUrl}/videos/${sampleVideoId}`).then(
      response => {
        expect(response.status).to.eq(200);
        expect(response.body.id).to.eq(sampleVideoId);
      }
    );
  });

  it('GET home feed', () => {
    cy.request<ApiDto<'HomeFeedDto'>>({
      method: 'GET',
      url: `${apiUrl}/homepage/homefeed`
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.videos).to.be.an('array').that.is.not.empty;

      const [video] = response.body.videos;
      expect(video.id).to.be.a('string').and.have.length(11);
      expect(video.title).to.be.a('string').and.not.be.empty;
    });
  });

  it('GET video with invalid id', () => {
    cy.request<ApiDto<'VTVideoInfoDto'>>({
      method: 'GET',
      url: `${apiUrl}/videos/invalid-id`,
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(500);
    });
  });

  it('GET channel', () => {
    const channelId = 'UCBJycsmduvYEL83R_U4JriQ';
    cy.request<ApiDto<'VTChannelPageDto'>>({
      method: 'GET',
      url: `${apiUrl}/channels/${channelId}`
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.id).to.eq(channelId);
      expect(response.body.name).to.be.a('string').and.not.be.empty;
    });
  });

  it('GET channel with invalid id', () => {
    const channelId = 'fvkHgvbUko';
    cy.request<ApiDto<'VTChannelPageDto'>>({
      method: 'GET',
      url: `${apiUrl}/channels/${channelId}`,
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(404);
    });
  });

  it('GET channel that does not exist', () => {
    cy.request<ApiDto<'VTChannelPageDto'>>({
      method: 'GET',
      url: `${apiUrl}/channels/UCthisdoesnotexist123456`,
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(404);
    });
  });

  it('GET videos of a channel that does not exist', () => {
    cy.request<ApiDto<'VTChannelFeedDto'>>({
      method: 'GET',
      url: `${apiUrl}/channels/UCthisdoesnotexist123456/videos`,
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(404);
    });
  });

  it('GET channel videos defaults to public and reports the available filters', () => {
    const channelId = 'UCBJycsmduvYEL83R_U4JriQ';
    cy.request<ApiDto<'VTChannelFeedDto'>>({
      method: 'GET',
      url: `${apiUrl}/channels/${channelId}/videos`
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.videos).to.be.an('array').and.not.be.empty;
      expect(response.body.appliedFilter).to.eq('public');
      expect(response.body.videos.every(video => !video.isMembersOnly)).to.be.true;
    });
  });

  it('GET autocomplete result', () => {
    const query = 'john';
    cy.request<Array<string>>({ method: 'GET', url: `${apiUrl}/autocomplete?q=${query}` }).then(
      response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array').that.is.not.empty;
      }
    );
  });

  it('GET search result', () => {
    const q = 'Marques';
    cy.request<ApiDto<'VTSearchDto'>>({ method: 'GET', url: `${apiUrl}/search?q=${q}` }).then(
      response => {
        expect(response.status).to.eq(200);
      }
    );
  });

  it('GET top comments', () => {
    cy.request<ApiDto<'VTCommentsResponseDto'>>({
      method: 'GET',
      url: `${apiUrl}/comments/${sampleVideoId}`
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.comments).to.be.an('array').that.is.not.empty;
    });
  });

  it('GET comment replies', () => {
    cy.request<ApiDto<'VTCommentsResponseDto'>>({
      method: 'GET',
      url: `${apiUrl}/comments/${sampleVideoId}`
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.comments).to.be.an('array').that.is.not.empty;

      const commentWithReplies = response.body.comments.find(comment => comment.replyCount > 10);

      cy.request<ApiDto<'VTCommentsReplyResponseDto'>>(
        'GET',
        `${apiUrl}/comments/replies?replyContinuation=${commentWithReplies?.replyContinuation}`
      ).then(repliesResponse => {
        expect(repliesResponse.status).to.eq(200);
        expect(repliesResponse.body.comments).to.be.an('array').that.is.not.empty;
      });
    });
  });

  it('GET playlist', () => {
    const playlistId = 'PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj';
    cy.request<ApiDto<'PlaylistResultDto'>>({
      method: 'GET',
      url: `${apiUrl}/playlists/${playlistId}`
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.id).to.eq(playlistId);
    });
  });
});
