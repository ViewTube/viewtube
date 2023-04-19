export interface VideoInfoSourceApproximation {
  streaming_data?: StreamingData;
  playability_status?: PlayabilityStatus;
  basic_info?: BasicInfo;
  storyboards?: Storyboards;
  endscreen?: Endscreen;
  captions?: Captions;
  cards?: Cards;
  primary_info?: PrimaryInfo;
  secondary_info?: SecondaryInfo;
  watch_next_feed?: WatchNextFeed[];
  player_overlays?: PlayerOverlays;
  autoplay?: VideoInfoSourceApproximationAutoplay;
  comments_entry_point_header?: CommentsEntryPointHeader;
}

interface VideoInfoSourceApproximationAutoplay {
  sets?: Set[];
  count_down_secs?: number;
}

interface Set {
  autoplay_video?: AutoplayVideo;
}

interface AutoplayVideo {
  type?: string;
  payload?: AutoplayVideoPayload;
  metadata?: AutoplayVideoMetadata;
}

interface AutoplayVideoMetadata {
  url?: string;
  page_type?: string;
  api_url?: string;
}

interface AutoplayVideoPayload {
  videoId?: string;
  params?: string;
  playerParams?: string;
  watchEndpointSupportedPrefetchConfig?: WatchEndpointSupportedPrefetchConfig;
}

interface WatchEndpointSupportedPrefetchConfig {
  prefetchHintConfig?: PrefetchHintConfig;
}

interface PrefetchHintConfig {
  prefetchPriority?: number;
  countdownUiRelativeSecondsPrefetchCondition?: number;
}

interface BasicInfo {
  id?: string;
  channel_id?: string;
  title?: string;
  duration?: number;
  keywords?: string[];
  is_owner_viewing?: boolean;
  short_description?: string;
  thumbnail?: Thumbnail[];
  allow_ratings?: boolean;
  view_count?: number;
  author?: string;
  is_private?: boolean;
  is_live?: boolean;
  is_live_content?: boolean;
  is_upcoming?: boolean;
  is_crawlable?: boolean;
  embed?: Embed;
  channel?: Channel;
  is_unlisted?: boolean;
  is_family_safe?: boolean;
  category?: string;
  has_ypc_metadata?: boolean;
  start_timestamp?: null;
  like_count?: number;
  is_liked?: boolean;
  is_disliked?: boolean;
}

interface Channel {
  id?: string;
  name?: string;
  url?: string;
}

interface Embed {
  iframe_url?: string;
  width?: number;
  height?: number;
}

interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

interface Captions {
  type?: string;
  caption_tracks?: CaptionTrack[];
  audio_tracks?: AudioTrack[];
  default_audio_track_index?: number;
  translation_languages?: TranslationLanguage[];
}

interface AudioTrack {
  caption_track_indices?: number[];
}

interface CaptionTrack {
  base_url?: string;
  name?: Header;
  vss_id?: string;
  language_code?: string;
  kind?: string;
  is_translatable?: boolean;
}

interface Header {
  text?: string;
}

interface TranslationLanguage {
  language_code?: string;
  language_name?: Header;
}

interface Cards {
  type?: string;
  cards?: Card[];
  header?: Header;
  allow_teaser_dismiss?: boolean;
}

interface Card {
  type?: string;
  teaser?: Teaser;
  content?: CardContent | null;
  card_id?: null | string;
  feature?: null | string;
  channel_name?: string;
  cue_ranges?: CueRange[];
}

interface CardContent {
  type?: string;
  image?: Thumbnail[];
  title?: Header;
  display_domain?: Header;
  show_link_icon?: boolean;
  call_to_action?: ShowLessText;
  endpoint?: ContentEndpoint;
  video_thumbnails?: Thumbnail[];
  duration?: {
    text?: string;
  };
}

interface ShowLessText {
  simpleText?: string;
}

interface ContentEndpoint {
  type?: string;
  payload?: PurplePayload;
  metadata?: PurpleMetadata;
}

interface PurpleMetadata {
  url?: string;
  page_type?: string;
}

interface PurplePayload {
  url?: string;
  videoId?: string;
  target?: string;
}

interface CueRange {
  start_card_active_ms?: string;
  end_card_active_ms?: string;
  teaser_duration_ms?: string;
  icon_after_teaser_ms?: string;
}

interface Teaser {
  type?: string;
  message?: Header;
  prominent?: boolean;
}

interface CommentsEntryPointHeader {
  type?: string;
  comment_count?: Header;
}

interface Endscreen {
  type?: string;
  elements?: ElementElement[];
  start_ms?: string;
}

interface ElementElement {
  type?: string;
  style?: string;
  title?: Header;
  endpoint?: ElementEndpoint;
  image?: Thumbnail[];
  icon?: Icon[];
  metadata?: Header;
  call_to_action?: Header;
  hovercard_button?: HovercardButton;
  is_subscribe?: boolean;
  left?: number;
  width?: number;
  top?: number;
  aspect_ratio?: number;
  start_ms?: number;
  end_ms?: number;
  id?: string;
  thumbnail_overlays?: ElementThumbnailOverlay[];
}

interface ElementEndpoint {
  type?: string;
  payload?: FluffyPayload;
  metadata?: AutoplayVideoMetadata;
}

interface FluffyPayload {
  browseId?: string;
  videoId?: string;
  watchEndpointSupportedOnesieConfig?: WatchEndpointSupportedOnesieConfig;
}

interface WatchEndpointSupportedOnesieConfig {
  html5PlaybackOnesieConfig?: Html5PlaybackOnesieConfig;
}

interface Html5PlaybackOnesieConfig {
  commonConfig?: Icon;
}

interface Icon {
  url?: string;
}

interface HovercardButton {
  type?: string;
  title?: Title;
  subscribed?: boolean;
  enabled?: boolean;
  item_type?: string;
  channel_id?: string;
  show_preferences?: boolean;
  subscribed_text?: Title;
  unsubscribed_text?: Title;
  notification_preference_button?: null;
  endpoint?: HovercardButtonEndpoint;
}

interface HovercardButtonEndpoint {
  type?: string;
  payload?: TentacledPayload;
  metadata?: ToggledEndpointMetadata;
}

interface ToggledEndpointMetadata {
  api_url?: string;
  send_post?: boolean;
}

interface TentacledPayload {
  channelIds?: string[];
  params?: string;
}

interface Title {
  runs?: TitleRun[];
  text?: string;
}

interface TitleRun {
  text?: string;
  bold?: boolean;
  italics?: boolean;
  strikethrough?: boolean;
}

interface ElementThumbnailOverlay {
  type?: string;
  text?: string;
  style?: string;
}

interface PlayabilityStatus {
  status?: string;
  reason?: string;
  embeddable?: boolean;
  audio_only_playablility?: null;
  error_screen?: null;
}

interface PlayerOverlays {
  type?: string;
  end_screen?: EndScreen;
  autoplay?: PlayerOverlaysAutoplay;
  share_button?: ShareButton;
  add_to_menu?: Menu;
  fullscreen_engagement?: null;
  actions?: any[];
  browser_media_session?: null;
  decorated_player_bar?: DecoratedPlayerBar;
}

interface Menu {
  type?: string;
  items?: Item[];
  top_level_buttons?: TopLevelButton[];
  label?: null | string;
}

interface Item {
  type?: string;
  text?: string;
  icon_type?: string;
  endpoint?: ItemEndpoint;
}

interface ItemEndpoint {
  type?: string;
  payload?: StickyPayload;
  metadata?: ToggledEndpointMetadata;
}

interface StickyPayload {
  modal?: PurpleModal;
  signal?: string;
  actions?: PurpleAction[];
  videoId?: string;
  onAddCommand?: OnAddCommand;
  serializedShareEntity?: string;
  commands?: Command[];
}

interface PurpleAction {
  clickTrackingParams?: string;
  showEngagementPanelEndpoint?: ShowEngagementPanelEndpoint;
  addToPlaylistCommand?: AddToPlaylistCommand;
  openPopupAction?: ActionOpenPopupAction;
}

interface AddToPlaylistCommand {
  openMiniplayer?: boolean;
  openListPanel?: boolean;
  videoId?: string;
  listType?: string;
  onCreateListCommand?: OnCreateListCommand;
  videoIds?: string[];
}

interface OnCreateListCommand {
  clickTrackingParams?: string;
  commandMetadata?: OnCreateListCommandCommandMetadata;
  createPlaylistServiceEndpoint?: CreatePlaylistServiceEndpoint;
}

interface OnCreateListCommandCommandMetadata {
  webCommandMetadata?: PurpleWebCommandMetadata;
}

interface PurpleWebCommandMetadata {
  sendPost?: boolean;
  apiUrl?: string;
}

interface CreatePlaylistServiceEndpoint {
  videoIds?: string[];
  params?: string;
}

interface ActionOpenPopupAction {
  popup?: PurplePopup;
  popupType?: string;
}

interface PurplePopup {
  notificationActionRenderer?: NotificationActionRenderer;
}

interface NotificationActionRenderer {
  responseText?: ShowLessText;
  trackingParams?: string;
}

interface ShowEngagementPanelEndpoint {
  panelIdentifier?: string;
}

interface Command {
  clickTrackingParams?: string;
  openPopupAction?: CommandOpenPopupAction;
}

interface CommandOpenPopupAction {
  popup?: FluffyPopup;
  popupType?: string;
  beReused?: boolean;
}

interface FluffyPopup {
  unifiedSharePanelRenderer?: UnifiedSharePanelRenderer;
}

interface UnifiedSharePanelRenderer {
  trackingParams?: string;
  showLoadingSpinner?: boolean;
}

interface PurpleModal {
  modalWithTitleAndButtonRenderer?: PurpleModalWithTitleAndButtonRenderer;
}

interface PurpleModalWithTitleAndButtonRenderer {
  title?: TitleClass;
  content?: TitleClass;
  button?: PurpleButton;
}

interface PurpleButton {
  buttonRenderer?: PurpleButtonRenderer;
}

interface PurpleButtonRenderer {
  style?: string;
  size?: string;
  isDisabled?: boolean;
  text?: ShowLessText;
  navigationEndpoint?: PurpleNavigationEndpoint;
  trackingParams?: string;
}

interface PurpleNavigationEndpoint {
  clickTrackingParams?: string;
  commandMetadata?: NavigationEndpointCommandMetadata;
  signInEndpoint?: Watch;
}

interface NavigationEndpointCommandMetadata {
  webCommandMetadata?: FluffyWebCommandMetadata;
}

interface FluffyWebCommandMetadata {
  url?: string;
  webPageType?: string;
  rootVe?: number;
}

interface Watch {
  hack?: boolean;
}

interface TitleClass {
  runs?: Header[];
}

interface OnAddCommand {
  clickTrackingParams?: string;
  getDownloadActionCommand?: GetDownloadActionCommand;
}

interface GetDownloadActionCommand {
  videoId?: string;
  params?: string;
}

interface TopLevelButton {
  type?: string;
  like_button?: LikeButton;
  dislike_button?: DislikeButton;
  text?: string;
  tooltip?: string;
  icon_type?: string;
  is_disabled?: boolean;
  endpoint?: TopLevelButtonEndpoint;
}

interface DislikeButton {
  type?: string;
  text?: SuperTitleLink;
  toggled_text?: SuperTitleLink;
  tooltip?: string;
  toggled_tooltip?: string;
  is_toggled?: boolean;
  is_disabled?: boolean;
  icon_type?: string;
  endpoint?: ToggledEndpointClass;
  toggled_endpoint?: ToggledEndpointClass;
  button_id?: string;
  target_id?: string;
}

interface ToggledEndpointClass {
  type?: string;
  payload?: SuperTitleLink;
  metadata?: SuperTitleLink;
}

interface SuperTitleLink {
  runs: DescriptionRun[];
}

interface TopLevelButtonEndpoint {
  type?: string;
  payload?: IndigoPayload;
  metadata?: ToggledEndpointMetadata;
}

interface IndigoPayload {
  serializedShareEntity?: string;
  commands?: Command[];
}

interface LikeButton {
  type?: string;
  text?: Header;
  toggled_text?: Header;
  tooltip?: string;
  toggled_tooltip?: string;
  is_toggled?: boolean;
  is_disabled?: boolean;
  icon_type?: string;
  like_count?: number;
  short_like_count?: string;
  endpoint?: ToggledEndpointClass;
  toggled_endpoint?: ToggledEndpointClass;
  button_id?: string;
  target_id?: string;
}

interface PlayerOverlaysAutoplay {
  type?: string;
  title?: Header;
  video_id?: string;
  video_title?: Header;
  short_view_count?: Header;
  prefer_immediate_redirect?: boolean;
  count_down_secs_for_fullscreen?: number;
  published?: Header;
  background?: Thumbnail[];
  thumbnail_overlays?: ElementThumbnailOverlay[];
  author?: Author;
  cancel_button?: CancelButton;
  next_button?: NextButton;
  close_button?: CloseButton;
}

interface Author {
  id?: string;
  name?: string;
  thumbnails?: Thumbnail[];
  endpoint?: AuthorEndpoint;
  badges?: AuthorBadge[];
  is_moderator?: null;
  is_verified?: boolean | null;
  is_verified_artist?: null;
  url?: string;
}

interface AuthorBadge {
  type?: string;
  icon_type?: string;
  style?: string;
  tooltip?: string;
}

interface AuthorEndpoint {
  type?: string;
  payload?: IndecentPayload;
  metadata?: AutoplayVideoMetadata;
}

interface IndecentPayload {
  browseId?: string;
  canonicalBaseUrl?: string;
}

interface CancelButton {
  type?: string;
  text?: string;
  label?: string;
  is_disabled?: boolean;
  endpoint?: CancelButtonEndpoint;
}

interface CancelButtonEndpoint {
  type?: string;
  payload?: HilariousPayload;
  metadata?: ToggledEndpointMetadata;
}

interface HilariousPayload {
  endpoint?: PayloadEndpoint;
  action?: string;
}

interface PayloadEndpoint {
  watch?: Watch;
}

interface CloseButton {
  type?: string;
  label?: string;
  icon_type?: string;
  is_disabled?: boolean;
  endpoint?: ToggledEndpointClass;
}

interface NextButton {
  type?: string;
  label?: string;
  is_disabled?: boolean;
  endpoint?: NextButtonEndpoint;
}

interface NextButtonEndpoint {
  type?: string;
  payload?: WatchEndpointClass;
  metadata?: AutoplayVideoMetadata;
}

interface WatchEndpointClass {
  videoId?: string;
  watchEndpointSupportedOnesieConfig?: WatchEndpointSupportedOnesieConfig;
}

interface DecoratedPlayerBar {
  type?: string;
  player_bar?: PlayerBar;
  player_bar_action_button?: PlayerBarActionButton;
}

interface PlayerBar {
  type?: string;
  markers_map?: MarkersMap[];
}

interface MarkersMap {
  type?: string;
  marker_key?: string;
  value?: Value;
}

interface Value {
  chapters?: Chapter[];
}

interface Chapter {
  type?: string;
  title?: Header;
  time_range_start_millis?: number;
  thumbnail?: Thumbnail[];
}

interface PlayerBarActionButton {
  type?: string;
  text?: string;
  endpoint?: ToggledEndpointClass;
}

interface EndScreen {
  type?: string;
  results?: Result[];
  title?: string;
}

interface Result {
  type?: string;
  id?: string;
  title?: Header;
  thumbnails?: Thumbnail[];
  thumbnail_overlays?: ElementThumbnailOverlay[];
  author?: Author;
  endpoint?: NextButtonEndpoint;
  short_view_count?: Header;
  badges?: null;
  duration?: Duration;
}

interface Duration {
  text?: string;
  seconds?: number;
}

interface ShareButton {
  type?: string;
  tooltip?: string;
  icon_type?: string;
  is_disabled?: boolean;
  endpoint?: TopLevelButtonEndpoint;
}

interface PrimaryInfo {
  type?: string;
  title?: Title;
  super_title_link?: SuperTitleLink;
  view_count?: Header;
  short_view_count?: Header;
  badges?: any[];
  published?: Header;
  relative_date?: Header;
  menu?: Menu;
}

interface SecondaryInfo {
  type?: string;
  owner?: Owner;
  description?: Description;
  subscribe_button?: SubscribeButton;
  metadata?: SecondaryInfoMetadata;
  show_more_text?: ShowLessText;
  show_less_text?: ShowLessText;
  default_expanded?: boolean;
  description_collapsed_lines?: number;
}

interface Description {
  runs?: DescriptionRun[];
  text?: string;
}

interface DescriptionRun {
  text?: string;
  bold?: boolean;
  italics?: boolean;
  strikethrough?: boolean;
  endpoint?: RunEndpoint;
  attachment?: Attachment;
}

interface Attachment {
  startIndex?: number;
  length?: number;
  element?: AttachmentElement;
  alignment?: string;
}

interface AttachmentElement {
  type?: Type;
  properties?: Properties;
}

interface Properties {
  layoutProperties?: LayoutProperties;
}

interface LayoutProperties {
  height?: Height;
  width?: Height;
}

interface Height {
  value?: number;
  unit?: string;
}

interface Type {
  imageType?: ImageType;
}

interface ImageType {
  image?: Image;
}

interface Image {
  sources?: Icon[];
}

interface RunEndpoint {
  type?: string;
  payload?: AmbitiousPayload;
  metadata?: AutoplayVideoMetadata;
}

interface AmbitiousPayload {
  url?: string;
  target?: string;
  nofollow?: boolean;
  videoId?: string;
  browseId?: string;
  startTimeSeconds?: number;
  watchEndpointSupportedOnesieConfig?: WatchEndpointSupportedOnesieConfig;
  continuePlayback?: boolean;
}

interface SecondaryInfoMetadata {
  type?: string;
  rows?: any[];
  collapsed_item_count?: number;
}

interface Owner {
  type?: string;
  subscription_button?: SubscriptionButton;
  subscriber_count?: Header;
  author?: Author;
}

interface SubscriptionButton {
  type?: string;
}

interface SubscribeButton {
  type?: string;
  text?: string;
  is_disabled?: boolean;
  endpoint?: SubscribeButtonEndpoint;
}

interface SubscribeButtonEndpoint {
  type?: string;
  payload?: CunningPayload;
  metadata?: SuperTitleLink;
}

interface CunningPayload {
  modal?: FluffyModal;
}

interface FluffyModal {
  modalWithTitleAndButtonRenderer?: FluffyModalWithTitleAndButtonRenderer;
}

interface FluffyModalWithTitleAndButtonRenderer {
  title?: ShowLessText;
  content?: ShowLessText;
  button?: FluffyButton;
}

interface FluffyButton {
  buttonRenderer?: FluffyButtonRenderer;
}

interface FluffyButtonRenderer {
  style?: string;
  size?: string;
  isDisabled?: boolean;
  text?: ShowLessText;
  navigationEndpoint?: FluffyNavigationEndpoint;
  trackingParams?: string;
}

interface FluffyNavigationEndpoint {
  clickTrackingParams?: string;
  commandMetadata?: NavigationEndpointCommandMetadata;
  signInEndpoint?: SignInEndpoint;
}

interface SignInEndpoint {
  nextEndpoint?: NextEndpoint;
  continueAction?: string;
  idamTag?: string;
}

interface NextEndpoint {
  clickTrackingParams?: string;
  commandMetadata?: NavigationEndpointCommandMetadata;
  watchEndpoint?: WatchEndpointClass;
}

interface Storyboards {
  type?: string;
  boards?: Board[];
}

interface Board {
  template_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  thumbnail_count?: number;
  interval?: number;
  columns?: number;
  rows?: number;
  storyboard_count?: number;
}

interface StreamingData {
  expires?: string;
  formats?: Format[];
  adaptive_formats?: Format[];
  dash_manifest_url?: null;
  hls_manifest_url?: null;
}

interface Format {
  itag?: number;
  mime_type?: string;
  is_type_otf?: boolean;
  bitrate?: number;
  average_bitrate?: number;
  width?: number;
  height?: number;
  init_range?: Range;
  index_range?: Range;
  last_modified?: string;
  content_length?: number | null;
  quality?: string;
  quality_label?: string;
  fps?: number;
  url?: string;
  approx_duration_ms?: number;
  audio_sample_rate?: number | null;
  has_audio?: boolean;
  has_video?: boolean;
  audio_quality?: string;
  audio_channels?: number;
  loudness_db?: number;
  language?: null;
  is_dubbed?: boolean;
  is_descriptive?: boolean;
  is_original?: boolean;
}

interface Range {
  start?: number;
  end?: number;
}

interface WatchNextFeed {
  type?: string;
  id?: string;
  thumbnails?: Thumbnail[];
  rich_thumbnail?: SuperTitleLink;
  title?: Header;
  author?: Author;
  view_count?: Header;
  short_view_count?: Header;
  published?: Header;
  badges?: WatchNextFeedBadge[];
  duration?: Duration;
  thumbnail_overlays?: WatchNextFeedThumbnailOverlay[];
  endpoint?: WatchNextFeedEndpoint;
  menu?: Menu;
}

interface WatchNextFeedBadge {
  type?: string;
  style?: string;
  label?: string;
}

interface WatchNextFeedEndpoint {
  type?: string;
  payload?: MagentaPayload;
  metadata?: AutoplayVideoMetadata;
}

interface MagentaPayload {
  videoId?: string;
  nofollow?: boolean;
  watchEndpointSupportedOnesieConfig?: WatchEndpointSupportedOnesieConfig;
}

interface WatchNextFeedThumbnailOverlay {
  type?: string;
  text?: string;
  style?: string;
  is_toggled?: null;
  icon_type?: IconType;
  tooltip?: IconType;
  toggled_endpoint?: ToggledEndpoint;
  untoggled_endpoint?: UntoggledEndpoint;
}

interface IconType {
  toggled?: string;
  untoggled?: string;
}

interface ToggledEndpoint {
  type?: string;
  payload?: ToggledEndpointPayload;
  metadata?: ToggledEndpointMetadata;
}

interface ToggledEndpointPayload {
  playlistId?: string;
  actions?: FluffyAction[];
}

interface FluffyAction {
  action?: string;
  removedVideoId?: string;
}

interface UntoggledEndpoint {
  type?: string;
  payload?: UntoggledEndpointPayload;
  metadata?: ToggledEndpointMetadata;
}

interface UntoggledEndpointPayload {
  playlistId?: string;
  actions?: TentacledAction[];
  signal?: string;
}

interface TentacledAction {
  addedVideoId?: string;
  action?: string;
  clickTrackingParams?: string;
  addToPlaylistCommand?: AddToPlaylistCommand;
}
