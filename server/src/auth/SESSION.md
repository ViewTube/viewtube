# Concept for session management

## Parts

- Refresh token (long lived, 7 days)

  - Stored in DB
  - Used to generate new access token
  - Can be revoked (by deleting from DB)
  - New one saved to DB for every device (session)
  - Gets sent via Cookie

- Access token (short lived, 10min)
  - Not stored in DB
  - Used to authenticate requests
  - Cannot be revoked
  - Gets sent via Cookie

## Login

### Receives

- Username
- Password

### Returns

- New refresh token
- New access token

## Request to public route

### Receives

- Access token?
- Refresh token?

If access token and refresh token are both present, the access token is validated.

If the access token is invalid, the refresh token is validated. If the refresh token is valid, the access token is refreshed and the ttl on the session is extended, and the request is enhanced with user data and returned.
if the refresh token is invalid, the request is regarded as unauthenticated and returned without user data.

If the access token is valid, the request is enhanced with user data and returned.

If neither token are present, the request is regarded as unauthenticated and returned without user data.

### Returns

- Data (enhanced with user data if authenticated)

## Request to authenticated route

### Receives

- Access token

### Returns

- Authenticated data
- 401 if access token is invalid (e.g. expired)
