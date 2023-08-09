export interface SearchSourceApproximation {
  type: string;
  id?: string;
  title?: Title;
  snippets?: Snippet[];
  expandable_metadata?: ExpandableMetadata;
  thumbnails?: Thumbnail2[];
  thumbnail_overlays?: ThumbnailOverlay[];
  rich_thumbnail?: RichThumbnail[];
  author?: Author;
  badges?: Badge2[];
  endpoint?: Endpoint6;
  published?: Published;
  view_count?: ViewCount;
  views?: ViewCount;
  short_view_count?: ShortViewCount;
  duration?: Duration;
  show_action_menu?: boolean;
  is_watched?: boolean;
  menu?: Menu;
  search_video_result_entity_key?: string;
  subscriber_count?: SubscriberCount;
  video_count?: VideoCount;
  long_byline?: LongByline;
  short_byline?: ShortByline;
  subscribe_button?: SubscribeButton;
  description_snippet?: DescriptionSnippet;
  content?: Content;
  items?: Item4[];
  first_videos?: FirstVideo[];
}

interface FirstVideo {
  type: string;
  id: string;
  title: Title5;
  duration: Duration;
}

export interface Title {
  runs?: Run[];
  text: string;
}

export interface Run {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

export interface Snippet {
  text: Text;
  hover_text: HoverText;
}

export interface Text {
  runs: Run2[];
  text: string;
}

export interface Run2 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

export interface HoverText {
  runs: Run3[];
  text: string;
}

export interface Run3 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

export interface ExpandableMetadata {
  type: string;
  header: Header;
  expanded_content: ExpandedContent;
  expand_button: ExpandButton;
  collapse_button: CollapseButton;
}

export interface Header {
  collapsed_title: CollapsedTitle;
  collapsed_thumbnail: CollapsedThumbnail[];
  collapsed_label: CollapsedLabel;
  expanded_title: ExpandedTitle;
}

export interface CollapsedTitle {
  text: string;
}

export interface CollapsedThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface CollapsedLabel {
  runs: Run4[];
  text: string;
}

export interface Run4 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

export interface ExpandedTitle {
  runs: Run5[];
  text: string;
}

export interface Run5 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

export interface ExpandedContent {
  type: string;
  cards: Card[];
  header: any;
  previous_button: PreviousButton;
  next_button: NextButton;
}

export interface Card {
  type: string;
  title: Title2;
  time_description: TimeDescription;
  thumbnail: Thumbnail[];
  on_tap_endpoint: OnTapEndpoint;
  layout: string;
  is_highlighted: boolean;
}

export interface Title2 {
  text: string;
}

export interface TimeDescription {
  text: string;
}

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface OnTapEndpoint {
  type: string;
  payload: Payload;
  metadata: Metadata;
}

export interface Payload {
  videoId?: string;
  watchEndpointSupportedOnesieConfig?: WatchEndpointSupportedOnesieConfig;
  startTimeSeconds?: number;
}

export interface WatchEndpointSupportedOnesieConfig {
  html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig;
}

export interface Html5PlaybackOnesieConfig {
  commonConfig: CommonConfig;
}

export interface CommonConfig {
  url: string;
}

export interface Metadata {
  url?: string;
  page_type?: string;
  api_url?: string;
}

export interface PreviousButton {
  type: string;
  icon_type: string;
  is_disabled: boolean;
  endpoint: Endpoint;
}

export interface Endpoint {
  type: string;
  payload: Payload2;
  metadata: Metadata2;
}

export interface Payload2 {}

export interface Metadata2 {}

export interface NextButton {
  type: string;
  icon_type: string;
  is_disabled: boolean;
  endpoint: Endpoint2;
}

export interface Endpoint2 {
  type: string;
  payload: Payload3;
  metadata: Metadata3;
}

export interface Payload3 {}

export interface Metadata3 {}

export interface ExpandButton {
  type: string;
  icon_type: string;
  is_disabled: boolean;
  endpoint: Endpoint3;
}

export interface Endpoint3 {
  type: string;
  payload: Payload4;
  metadata: Metadata4;
}

export interface Payload4 {}

export interface Metadata4 {}

export interface CollapseButton {
  type: string;
  icon_type: string;
  is_disabled: boolean;
  endpoint: Endpoint4;
}

export interface Endpoint4 {
  type: string;
  payload: Payload5;
  metadata: Metadata5;
}

export interface Payload5 {}

export interface Metadata5 {}

export interface Thumbnail2 {
  url: string;
  width: number;
  height: number;
}

export interface ThumbnailOverlay {
  type: string;
  is_toggled?: boolean;
  icon_type?: IconType;
  tooltip?: Tooltip;
  toggled_endpoint?: ToggledEndpoint;
  untoggled_endpoint?: UntoggledEndpoint;
  text: any;
  style?: string;
}

export interface IconType {
  toggled: string;
  untoggled: string;
}

export interface Tooltip {
  toggled: string;
  untoggled: string;
}

export interface ToggledEndpoint {
  type: string;
  payload: Payload6;
  metadata: Metadata6;
}

export interface Payload6 {
  playlistId?: string;
  actions?: Action[];
}

export interface Action {
  action: string;
  removedVideoId: string;
}

export interface Metadata6 {
  api_url?: string;
  send_post?: boolean;
}

export interface UntoggledEndpoint {
  type: string;
  payload: Payload7;
  metadata: Metadata7;
}

export interface Payload7 {
  signal?: string;
  actions: Action2[];
  playlistId?: string;
}

export interface Action2 {
  clickTrackingParams?: string;
  addToPlaylistCommand?: AddToPlaylistCommand;
  addedVideoId?: string;
  action?: string;
}

export interface AddToPlaylistCommand {
  openMiniplayer: boolean;
  videoId: string;
  listType: string;
  onCreateListCommand: OnCreateListCommand;
  videoIds: string[];
}

export interface OnCreateListCommand {
  clickTrackingParams: string;
  commandMetadata: CommandMetadata;
  createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint;
}

export interface CommandMetadata {
  webCommandMetadata: WebCommandMetadata;
}

export interface WebCommandMetadata {
  sendPost: boolean;
  apiUrl: string;
}

export interface CreatePlaylistServiceEndpoint {
  videoIds: string[];
  params: string;
}

export interface Metadata7 {
  send_post: boolean;
  api_url?: string;
}

export interface RichThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface Author {
  id: string;
  name: string;
  thumbnails: Thumbnail3[];
  endpoint: Endpoint5;
  badges: Badge[];
  is_moderator: boolean;
  is_verified: boolean;
  is_verified_artist: boolean;
  url: string;
}

export interface Thumbnail3 {
  url: string;
  width: number;
  height: number;
}

export interface Endpoint5 {
  type: string;
  payload: Payload8;
  metadata: Metadata8;
}

export interface Payload8 {
  browseId: string;
  canonicalBaseUrl: string;
}

export interface Metadata8 {
  url: string;
  page_type: string;
  api_url: string;
}

export interface Badge {
  type: string;
  icon_type: string;
  style: string;
  tooltip: string;
}

export interface Badge2 {
  type: string;
  style: string;
  label: string;
  icon_type?: string;
}

export interface Endpoint6 {
  type: string;
  payload: Payload9;
  metadata: Metadata9;
}

export interface Payload9 {
  videoId?: string;
  params?: string;
  playerParams?: string;
  watchEndpointSupportedOnesieConfig?: WatchEndpointSupportedOnesieConfig2;
  browseId?: string;
  canonicalBaseUrl?: string;
}

export interface WatchEndpointSupportedOnesieConfig2 {
  html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig2;
}

export interface Html5PlaybackOnesieConfig2 {
  commonConfig: CommonConfig2;
}

export interface CommonConfig2 {
  url: string;
}

export interface Metadata9 {
  url: string;
  page_type: string;
  api_url: string;
}

export interface Published {
  text?: string;
}

export interface ViewCount {
  text: string;
  runs?: Run6[];
}

export interface Run6 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

export interface ShortViewCount {
  text: string;
  runs?: Run7[];
}

export interface Run7 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

export interface Duration {
  text: string;
  seconds?: number;
}

export interface Menu {
  type: string;
  items: Item[];
  top_level_buttons: any[];
  label: string;
}

export interface Item {
  type: string;
  text?: string;
  icon_type?: string;
  endpoint: Endpoint7;
  has_separator?: boolean;
}

export interface Endpoint7 {
  type: string;
  payload: Payload10;
  metadata: Metadata10;
}

export interface Payload10 {
  signal?: string;
  actions?: Action3[];
  videoId?: string;
  onAddCommand?: OnAddCommand;
  serializedShareEntity?: string;
  commands?: Command[];
}

export interface Action3 {
  clickTrackingParams: string;
  addToPlaylistCommand: AddToPlaylistCommand2;
}

export interface AddToPlaylistCommand2 {
  openMiniplayer: boolean;
  videoId: string;
  listType: string;
  onCreateListCommand: OnCreateListCommand2;
  videoIds: string[];
}

export interface OnCreateListCommand2 {
  clickTrackingParams: string;
  commandMetadata: CommandMetadata2;
  createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint2;
}

export interface CommandMetadata2 {
  webCommandMetadata: WebCommandMetadata2;
}

export interface WebCommandMetadata2 {
  sendPost: boolean;
  apiUrl: string;
}

export interface CreatePlaylistServiceEndpoint2 {
  videoIds: string[];
  params: string;
}

export interface OnAddCommand {
  clickTrackingParams: string;
  getDownloadActionCommand: GetDownloadActionCommand;
}

export interface GetDownloadActionCommand {
  videoId: string;
  params: string;
}

export interface Command {
  clickTrackingParams: string;
  openPopupAction: OpenPopupAction;
}

export interface OpenPopupAction {
  popup: Popup;
  popupType: string;
  beReused: boolean;
}

export interface Popup {
  unifiedSharePanelRenderer: UnifiedSharePanelRenderer;
}

export interface UnifiedSharePanelRenderer {
  trackingParams: string;
  showLoadingSpinner: boolean;
}

export interface Metadata10 {
  send_post?: boolean;
  api_url?: string;
}

export interface SubscriberCount {
  text: string;
}

export interface VideoCount {
  text: string;
}

export interface LongByline {
  runs: Run8[];
  text: string;
  endpoint: Endpoint9;
}

export interface Run8 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
  endpoint: Endpoint8;
}

export interface Endpoint8 {
  type: string;
  payload: Payload11;
  metadata: Metadata11;
}

export interface Payload11 {
  browseId: string;
  canonicalBaseUrl: string;
}

export interface Metadata11 {
  url: string;
  page_type: string;
  api_url: string;
}

export interface Endpoint9 {
  type: string;
  payload: Payload12;
  metadata: Metadata12;
}

export interface Payload12 {
  browseId: string;
  canonicalBaseUrl: string;
}

export interface Metadata12 {
  url: string;
  page_type: string;
  api_url: string;
}

export interface ShortByline {
  runs: Run9[];
  text: string;
  endpoint: Endpoint11;
}

export interface Run9 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
  endpoint: Endpoint10;
}

export interface Endpoint10 {
  type: string;
  payload: Payload13;
  metadata: Metadata13;
}

export interface Payload13 {
  browseId: string;
  canonicalBaseUrl: string;
}

export interface Metadata13 {
  url: string;
  page_type: string;
  api_url: string;
}

export interface Endpoint11 {
  type: string;
  payload: Payload14;
  metadata: Metadata14;
}

export interface Payload14 {
  browseId: string;
  canonicalBaseUrl: string;
}

export interface Metadata14 {
  url: string;
  page_type: string;
  api_url: string;
}

export interface SubscribeButton {
  type: string;
  text: string;
  is_disabled: boolean;
  endpoint: Endpoint12;
}

export interface Endpoint12 {
  type: string;
  payload: Payload15;
  metadata: Metadata15;
}

export interface Payload15 {
  nextEndpoint: NextEndpoint;
  continueAction: string;
}

export interface NextEndpoint {
  clickTrackingParams: string;
  commandMetadata: CommandMetadata3;
  searchEndpoint: SearchEndpoint;
}

export interface CommandMetadata3 {
  webCommandMetadata: WebCommandMetadata3;
}

export interface WebCommandMetadata3 {
  url: string;
  webPageType: string;
  rootVe: number;
}

export interface SearchEndpoint {
  query: string;
  params: string;
}

export interface Metadata15 {
  url: string;
  page_type: string;
}

export interface DescriptionSnippet {
  runs: Run10[];
  text: string;
}

export interface Run10 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

export interface Content {
  type: string;
  items: Item2[];
  collapsed_item_count: number;
  collapsed_state_button_text: CollapsedStateButtonText;
}

export interface Item2 {
  type: string;
  id: string;
  title: Title3;
  snippets: Snippet2[];
  expandable_metadata?: ExpandableMetadata2;
  thumbnails: Thumbnail5[];
  thumbnail_overlays: ThumbnailOverlay2[];
  rich_thumbnail: RichThumbnail2[];
  author: Author2;
  badges: Badge4[];
  endpoint: Endpoint18;
  published: Published2;
  view_count: ViewCount2;
  short_view_count: ShortViewCount2;
  duration: Duration2;
  show_action_menu: boolean;
  is_watched: boolean;
  menu: Menu2;
  search_video_result_entity_key: string;
}

export interface Title3 {
  runs: Run11[];
  text: string;
}

export interface Run11 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

export interface Snippet2 {
  text: Text2;
  hover_text: HoverText2;
}

export interface Text2 {
  runs: Run12[];
  text: string;
}

export interface Run12 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

export interface HoverText2 {
  runs: Run13[];
  text: string;
}

export interface Run13 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

export interface ExpandableMetadata2 {
  type: string;
  header: Header2;
  expanded_content: ExpandedContent2;
  expand_button: ExpandButton2;
  collapse_button: CollapseButton2;
}

export interface Header2 {
  collapsed_title: CollapsedTitle2;
  collapsed_thumbnail: CollapsedThumbnail2[];
  collapsed_label: CollapsedLabel2;
  expanded_title: ExpandedTitle2;
}

export interface CollapsedTitle2 {
  text: string;
}

export interface CollapsedThumbnail2 {
  url: string;
  width: number;
  height: number;
}

export interface CollapsedLabel2 {
  runs: Run14[];
  text: string;
}

export interface Run14 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

export interface ExpandedTitle2 {
  runs: Run15[];
  text: string;
}

export interface Run15 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

export interface ExpandedContent2 {
  type: string;
  cards: Card2[];
  header: any;
  previous_button: PreviousButton2;
  next_button: NextButton2;
}

export interface Card2 {
  type: string;
  title: Title4;
  time_description: TimeDescription2;
  thumbnail: Thumbnail4[];
  on_tap_endpoint: OnTapEndpoint2;
  layout: string;
  is_highlighted: boolean;
}

export interface Title4 {
  text: string;
}

export interface TimeDescription2 {
  text: string;
}

export interface Thumbnail4 {
  url: string;
  width: number;
  height: number;
}

export interface OnTapEndpoint2 {
  type: string;
  payload: Payload16;
  metadata: Metadata16;
}

export interface Payload16 {
  videoId?: string;
  watchEndpointSupportedOnesieConfig?: WatchEndpointSupportedOnesieConfig3;
  startTimeSeconds?: number;
  commands?: Command2[];
}

export interface WatchEndpointSupportedOnesieConfig3 {
  html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig3;
}

export interface Html5PlaybackOnesieConfig3 {
  commonConfig: CommonConfig3;
}

export interface CommonConfig3 {
  url: string;
}

export interface Command2 {
  clickTrackingParams: string;
  commandMetadata?: CommandMetadata4;
  watchEndpoint?: WatchEndpoint;
  entityUpdateCommand?: EntityUpdateCommand;
}

export interface CommandMetadata4 {
  webCommandMetadata: WebCommandMetadata4;
}

export interface WebCommandMetadata4 {
  url: string;
  webPageType: string;
  rootVe: number;
}

export interface WatchEndpoint {
  videoId: string;
  startTimeSeconds: number;
  watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig4;
}

export interface WatchEndpointSupportedOnesieConfig4 {
  html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig4;
}

export interface Html5PlaybackOnesieConfig4 {
  commonConfig: CommonConfig4;
}

export interface CommonConfig4 {
  url: string;
}

export interface EntityUpdateCommand {
  entityBatchUpdate: EntityBatchUpdate;
}

export interface EntityBatchUpdate {
  mutations: Mutation[];
}

export interface Mutation {
  entityKey: string;
  type: string;
  payload: Payload17;
}

export interface Payload17 {
  markersVisibilityOverrideEntity: MarkersVisibilityOverrideEntity;
}

export interface MarkersVisibilityOverrideEntity {
  key: string;
  videoId: string;
  visibilityOverrideMarkersKey: string[];
}

export interface Metadata16 {
  url?: string;
  page_type?: string;
  api_url?: string;
}

export interface PreviousButton2 {
  type: string;
  icon_type: string;
  is_disabled: boolean;
  endpoint: Endpoint13;
}

export interface Endpoint13 {
  type: string;
  payload: Payload18;
  metadata: Metadata17;
}

export interface Payload18 {}

export interface Metadata17 {}

export interface NextButton2 {
  type: string;
  icon_type: string;
  is_disabled: boolean;
  endpoint: Endpoint14;
}

export interface Endpoint14 {
  type: string;
  payload: Payload19;
  metadata: Metadata18;
}

export interface Payload19 {}

export interface Metadata18 {}

export interface ExpandButton2 {
  type: string;
  icon_type: string;
  is_disabled: boolean;
  endpoint: Endpoint15;
}

export interface Endpoint15 {
  type: string;
  payload: Payload20;
  metadata: Metadata19;
}

export interface Payload20 {}

export interface Metadata19 {}

export interface CollapseButton2 {
  type: string;
  icon_type: string;
  is_disabled: boolean;
  endpoint: Endpoint16;
}

export interface Endpoint16 {
  type: string;
  payload: Payload21;
  metadata: Metadata20;
}

export interface Payload21 {}

export interface Metadata20 {}

export interface Thumbnail5 {
  url: string;
  width: number;
  height: number;
}

export interface ThumbnailOverlay2 {
  type: string;
  text: any;
  style?: string;
  is_toggled?: boolean;
  icon_type?: IconType2;
  tooltip?: Tooltip2;
  toggled_endpoint?: ToggledEndpoint2;
  untoggled_endpoint?: UntoggledEndpoint2;
}

export interface IconType2 {
  toggled: string;
  untoggled: string;
}

export interface Tooltip2 {
  toggled: string;
  untoggled: string;
}

export interface ToggledEndpoint2 {
  type: string;
  payload: Payload22;
  metadata: Metadata21;
}

export interface Payload22 {
  playlistId?: string;
  actions?: Action4[];
}

export interface Action4 {
  action: string;
  removedVideoId: string;
}

export interface Metadata21 {
  api_url?: string;
  send_post?: boolean;
}

export interface UntoggledEndpoint2 {
  type: string;
  payload: Payload23;
  metadata: Metadata22;
}

export interface Payload23 {
  signal?: string;
  actions: Action5[];
  playlistId?: string;
}

export interface Action5 {
  clickTrackingParams?: string;
  addToPlaylistCommand?: AddToPlaylistCommand3;
  addedVideoId?: string;
  action?: string;
}

export interface AddToPlaylistCommand3 {
  openMiniplayer: boolean;
  videoId: string;
  listType: string;
  onCreateListCommand: OnCreateListCommand3;
  videoIds: string[];
}

export interface OnCreateListCommand3 {
  clickTrackingParams: string;
  commandMetadata: CommandMetadata5;
  createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint3;
}

export interface CommandMetadata5 {
  webCommandMetadata: WebCommandMetadata5;
}

export interface WebCommandMetadata5 {
  sendPost: boolean;
  apiUrl: string;
}

export interface CreatePlaylistServiceEndpoint3 {
  videoIds: string[];
  params: string;
}

export interface Metadata22 {
  send_post: boolean;
  api_url?: string;
}

export interface RichThumbnail2 {
  url: string;
  width: number;
  height: number;
}

export interface Author2 {
  id: string;
  name: string;
  thumbnails: Thumbnail6[];
  endpoint: Endpoint17;
  badges: Badge3[];
  is_moderator: boolean;
  is_verified: boolean;
  is_verified_artist: boolean;
  url: string;
}

export interface Thumbnail6 {
  url: string;
  width: number;
  height: number;
}

export interface Endpoint17 {
  type: string;
  payload: Payload24;
  metadata: Metadata23;
}

export interface Payload24 {
  browseId: string;
  canonicalBaseUrl: string;
}

export interface Metadata23 {
  url: string;
  page_type: string;
  api_url: string;
}

export interface Badge3 {
  type: string;
  icon_type: string;
  style: string;
  tooltip: string;
}

export interface Badge4 {
  type: string;
  style: string;
  label: string;
}

export interface Endpoint18 {
  type: string;
  payload: Payload25;
  metadata: Metadata24;
}

export interface Payload25 {
  videoId: string;
  params: string;
  playerParams: string;
  watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig5;
}

export interface WatchEndpointSupportedOnesieConfig5 {
  html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig5;
}

export interface Html5PlaybackOnesieConfig5 {
  commonConfig: CommonConfig5;
}

export interface CommonConfig5 {
  url: string;
}

export interface Metadata24 {
  url: string;
  page_type: string;
  api_url: string;
}

export interface Published2 {
  text: string;
}

export interface ViewCount2 {
  text: string;
}

export interface ShortViewCount2 {
  text: string;
}

export interface Duration2 {
  text: string;
  seconds: number;
}

export interface Menu2 {
  type: string;
  items: Item3[];
  top_level_buttons: any[];
  label: string;
}

export interface Item3 {
  type: string;
  text?: string;
  icon_type?: string;
  endpoint: Endpoint19;
  has_separator?: boolean;
}

export interface Endpoint19 {
  type: string;
  payload: Payload26;
  metadata: Metadata25;
}

export interface Payload26 {
  signal?: string;
  actions?: Action6[];
  videoId?: string;
  onAddCommand?: OnAddCommand2;
  serializedShareEntity?: string;
  commands?: Command3[];
}

export interface Action6 {
  clickTrackingParams: string;
  addToPlaylistCommand: AddToPlaylistCommand4;
}

export interface AddToPlaylistCommand4 {
  openMiniplayer: boolean;
  videoId: string;
  listType: string;
  onCreateListCommand: OnCreateListCommand4;
  videoIds: string[];
}

export interface OnCreateListCommand4 {
  clickTrackingParams: string;
  commandMetadata: CommandMetadata6;
  createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint4;
}

export interface CommandMetadata6 {
  webCommandMetadata: WebCommandMetadata6;
}

export interface WebCommandMetadata6 {
  sendPost: boolean;
  apiUrl: string;
}

export interface CreatePlaylistServiceEndpoint4 {
  videoIds: string[];
  params: string;
}

export interface OnAddCommand2 {
  clickTrackingParams: string;
  getDownloadActionCommand: GetDownloadActionCommand2;
}

export interface GetDownloadActionCommand2 {
  videoId: string;
  params: string;
}

export interface Command3 {
  clickTrackingParams: string;
  openPopupAction: OpenPopupAction2;
}

export interface OpenPopupAction2 {
  popup: Popup2;
  popupType: string;
  beReused: boolean;
}

export interface Popup2 {
  unifiedSharePanelRenderer: UnifiedSharePanelRenderer2;
}

export interface UnifiedSharePanelRenderer2 {
  trackingParams: string;
  showLoadingSpinner: boolean;
}

export interface Metadata25 {
  send_post?: boolean;
  api_url?: string;
}

export interface CollapsedStateButtonText {
  runs: Run16[];
  text: string;
}

export interface Run16 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

export interface Item4 {
  type: string;
  id: string;
  title: Title5;
  thumbnails: Thumbnail7[];
  views: Views;
  endpoint: Endpoint20;
  accessibility_label: string;
}

export interface Title5 {
  text: string;
}

export interface Thumbnail7 {
  url: string;
  width: number;
  height: number;
}

export interface Views {
  text: string;
}

export interface Endpoint20 {
  type: string;
  payload: Payload27;
  metadata: Metadata26;
}

export interface Payload27 {
  videoId: string;
  playerParams: string;
  thumbnail: Thumbnail8;
  overlay: Overlay;
  params: string;
  sequenceProvider: string;
  sequenceParams: string;
  loggingContext: LoggingContext;
  ustreamerConfig: string;
}

export interface Thumbnail8 {
  thumbnails: Thumbnail9[];
  isOriginalAspectRatio: boolean;
}

export interface Thumbnail9 {
  url: string;
  width: number;
  height: number;
}

export interface Overlay {
  reelPlayerOverlayRenderer: ReelPlayerOverlayRenderer;
}

export interface ReelPlayerOverlayRenderer {
  style: string;
  trackingParams: string;
  reelPlayerNavigationModel: string;
}

export interface LoggingContext {
  vssLoggingContext: VssLoggingContext;
  qoeLoggingContext: QoeLoggingContext;
}

export interface VssLoggingContext {
  serializedContextData: string;
}

export interface QoeLoggingContext {
  serializedContextData: string;
}

export interface Metadata26 {
  url: string;
  page_type: string;
  api_url: string;
}
