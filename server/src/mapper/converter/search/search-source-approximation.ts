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

interface Title {
  runs?: Run[];
  text: string;
}

interface Run {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

interface Snippet {
  text: Text;
  hover_text: HoverText;
}

interface Text {
  runs: Run2[];
  text: string;
}

interface Run2 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

interface HoverText {
  runs: Run3[];
  text: string;
}

interface Run3 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

interface ExpandableMetadata {
  type: string;
  header: Header;
  expanded_content: ExpandedContent;
  expand_button: ExpandButton;
  collapse_button: CollapseButton;
}

interface Header {
  collapsed_title: CollapsedTitle;
  collapsed_thumbnail: CollapsedThumbnail[];
  collapsed_label: CollapsedLabel;
  expanded_title: ExpandedTitle;
}

interface CollapsedTitle {
  text: string;
}

interface CollapsedThumbnail {
  url: string;
  width: number;
  height: number;
}

interface CollapsedLabel {
  runs: Run4[];
  text: string;
}

interface Run4 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

interface ExpandedTitle {
  runs: Run5[];
  text: string;
}

interface Run5 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

interface ExpandedContent {
  type: string;
  cards: Card[];
  header: any;
  previous_button: PreviousButton;
  next_button: NextButton;
}

interface Card {
  type: string;
  title: Title2;
  time_description: TimeDescription;
  thumbnail: Thumbnail[];
  on_tap_endpoint: OnTapEndpoint;
  layout: string;
  is_highlighted: boolean;
}

interface Title2 {
  text: string;
}

interface TimeDescription {
  text: string;
}

interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

interface OnTapEndpoint {
  type: string;
  payload: Payload;
  metadata: Metadata;
}

interface Payload {
  videoId?: string;
  watchEndpointSupportedOnesieConfig?: WatchEndpointSupportedOnesieConfig;
  startTimeSeconds?: number;
}

interface WatchEndpointSupportedOnesieConfig {
  html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig;
}

interface Html5PlaybackOnesieConfig {
  commonConfig: CommonConfig;
}

interface CommonConfig {
  url: string;
}

interface Metadata {
  url?: string;
  page_type?: string;
  api_url?: string;
}

interface PreviousButton {
  type: string;
  icon_type: string;
  is_disabled: boolean;
  endpoint: Endpoint;
}

interface Endpoint {
  type: string;
  payload: Payload2;
  metadata: Metadata2;
}

interface Payload2 {}

interface Metadata2 {}

interface NextButton {
  type: string;
  icon_type: string;
  is_disabled: boolean;
  endpoint: Endpoint2;
}

interface Endpoint2 {
  type: string;
  payload: Payload3;
  metadata: Metadata3;
}

interface Payload3 {}

interface Metadata3 {}

interface ExpandButton {
  type: string;
  icon_type: string;
  is_disabled: boolean;
  endpoint: Endpoint3;
}

interface Endpoint3 {
  type: string;
  payload: Payload4;
  metadata: Metadata4;
}

interface Payload4 {}

interface Metadata4 {}

interface CollapseButton {
  type: string;
  icon_type: string;
  is_disabled: boolean;
  endpoint: Endpoint4;
}

interface Endpoint4 {
  type: string;
  payload: Payload5;
  metadata: Metadata5;
}

interface Payload5 {}

interface Metadata5 {}

interface Thumbnail2 {
  url: string;
  width: number;
  height: number;
}

interface ThumbnailOverlay {
  type: string;
  is_toggled?: boolean;
  icon_type?: IconType;
  tooltip?: Tooltip;
  toggled_endpoint?: ToggledEndpoint;
  untoggled_endpoint?: UntoggledEndpoint;
  text: any;
  style?: string;
}

interface IconType {
  toggled: string;
  untoggled: string;
}

interface Tooltip {
  toggled: string;
  untoggled: string;
}

interface ToggledEndpoint {
  type: string;
  payload: Payload6;
  metadata: Metadata6;
}

interface Payload6 {
  playlistId?: string;
  actions?: Action[];
}

interface Action {
  action: string;
  removedVideoId: string;
}

interface Metadata6 {
  api_url?: string;
  send_post?: boolean;
}

interface UntoggledEndpoint {
  type: string;
  payload: Payload7;
  metadata: Metadata7;
}

interface Payload7 {
  signal?: string;
  actions: Action2[];
  playlistId?: string;
}

interface Action2 {
  clickTrackingParams?: string;
  addToPlaylistCommand?: AddToPlaylistCommand;
  addedVideoId?: string;
  action?: string;
}

interface AddToPlaylistCommand {
  openMiniplayer: boolean;
  videoId: string;
  listType: string;
  onCreateListCommand: OnCreateListCommand;
  videoIds: string[];
}

interface OnCreateListCommand {
  clickTrackingParams: string;
  commandMetadata: CommandMetadata;
  createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint;
}

interface CommandMetadata {
  webCommandMetadata: WebCommandMetadata;
}

interface WebCommandMetadata {
  sendPost: boolean;
  apiUrl: string;
}

interface CreatePlaylistServiceEndpoint {
  videoIds: string[];
  params: string;
}

interface Metadata7 {
  send_post: boolean;
  api_url?: string;
}

interface RichThumbnail {
  url: string;
  width: number;
  height: number;
}

interface Author {
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

interface Thumbnail3 {
  url: string;
  width: number;
  height: number;
}

interface Endpoint5 {
  type: string;
  payload: Payload8;
  metadata: Metadata8;
}

interface Payload8 {
  browseId: string;
  canonicalBaseUrl: string;
}

interface Metadata8 {
  url: string;
  page_type: string;
  api_url: string;
}

interface Badge {
  type: string;
  icon_type: string;
  style: string;
  tooltip: string;
}

interface Badge2 {
  type: string;
  style: string;
  label: string;
  icon_type?: string;
}

interface Endpoint6 {
  type: string;
  payload: Payload9;
  metadata: Metadata9;
}

interface Payload9 {
  videoId?: string;
  params?: string;
  playerParams?: string;
  watchEndpointSupportedOnesieConfig?: WatchEndpointSupportedOnesieConfig2;
  browseId?: string;
  canonicalBaseUrl?: string;
}

interface WatchEndpointSupportedOnesieConfig2 {
  html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig2;
}

interface Html5PlaybackOnesieConfig2 {
  commonConfig: CommonConfig2;
}

interface CommonConfig2 {
  url: string;
}

interface Metadata9 {
  url: string;
  page_type: string;
  api_url: string;
}

interface Published {
  text?: string;
}

interface ViewCount {
  text: string;
  runs?: Run6[];
}

interface Run6 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

interface ShortViewCount {
  text: string;
  runs?: Run7[];
}

interface Run7 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

interface Duration {
  text: string;
  seconds?: number;
}

interface Menu {
  type: string;
  items: Item[];
  top_level_buttons: any[];
  label: string;
}

interface Item {
  type: string;
  text?: string;
  icon_type?: string;
  endpoint: Endpoint7;
  has_separator?: boolean;
}

interface Endpoint7 {
  type: string;
  payload: Payload10;
  metadata: Metadata10;
}

interface Payload10 {
  signal?: string;
  actions?: Action3[];
  videoId?: string;
  onAddCommand?: OnAddCommand;
  serializedShareEntity?: string;
  commands?: Command[];
}

interface Action3 {
  clickTrackingParams: string;
  addToPlaylistCommand: AddToPlaylistCommand2;
}

interface AddToPlaylistCommand2 {
  openMiniplayer: boolean;
  videoId: string;
  listType: string;
  onCreateListCommand: OnCreateListCommand2;
  videoIds: string[];
}

interface OnCreateListCommand2 {
  clickTrackingParams: string;
  commandMetadata: CommandMetadata2;
  createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint2;
}

interface CommandMetadata2 {
  webCommandMetadata: WebCommandMetadata2;
}

interface WebCommandMetadata2 {
  sendPost: boolean;
  apiUrl: string;
}

interface CreatePlaylistServiceEndpoint2 {
  videoIds: string[];
  params: string;
}

interface OnAddCommand {
  clickTrackingParams: string;
  getDownloadActionCommand: GetDownloadActionCommand;
}

interface GetDownloadActionCommand {
  videoId: string;
  params: string;
}

interface Command {
  clickTrackingParams: string;
  openPopupAction: OpenPopupAction;
}

interface OpenPopupAction {
  popup: Popup;
  popupType: string;
  beReused: boolean;
}

interface Popup {
  unifiedSharePanelRenderer: UnifiedSharePanelRenderer;
}

interface UnifiedSharePanelRenderer {
  trackingParams: string;
  showLoadingSpinner: boolean;
}

interface Metadata10 {
  send_post?: boolean;
  api_url?: string;
}

interface SubscriberCount {
  text: string;
}

interface VideoCount {
  text: string;
}

interface LongByline {
  runs: Run8[];
  text: string;
  endpoint: Endpoint9;
}

interface Run8 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
  endpoint: Endpoint8;
}

interface Endpoint8 {
  type: string;
  payload: Payload11;
  metadata: Metadata11;
}

interface Payload11 {
  browseId: string;
  canonicalBaseUrl: string;
}

interface Metadata11 {
  url: string;
  page_type: string;
  api_url: string;
}

interface Endpoint9 {
  type: string;
  payload: Payload12;
  metadata: Metadata12;
}

interface Payload12 {
  browseId: string;
  canonicalBaseUrl: string;
}

interface Metadata12 {
  url: string;
  page_type: string;
  api_url: string;
}

interface ShortByline {
  runs: Run9[];
  text: string;
  endpoint: Endpoint11;
}

interface Run9 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
  endpoint: Endpoint10;
}

interface Endpoint10 {
  type: string;
  payload: Payload13;
  metadata: Metadata13;
}

interface Payload13 {
  browseId: string;
  canonicalBaseUrl: string;
}

interface Metadata13 {
  url: string;
  page_type: string;
  api_url: string;
}

interface Endpoint11 {
  type: string;
  payload: Payload14;
  metadata: Metadata14;
}

interface Payload14 {
  browseId: string;
  canonicalBaseUrl: string;
}

interface Metadata14 {
  url: string;
  page_type: string;
  api_url: string;
}

interface SubscribeButton {
  type: string;
  text: string;
  is_disabled: boolean;
  endpoint: Endpoint12;
}

interface Endpoint12 {
  type: string;
  payload: Payload15;
  metadata: Metadata15;
}

interface Payload15 {
  nextEndpoint: NextEndpoint;
  continueAction: string;
}

interface NextEndpoint {
  clickTrackingParams: string;
  commandMetadata: CommandMetadata3;
  searchEndpoint: SearchEndpoint;
}

interface CommandMetadata3 {
  webCommandMetadata: WebCommandMetadata3;
}

interface WebCommandMetadata3 {
  url: string;
  webPageType: string;
  rootVe: number;
}

interface SearchEndpoint {
  query: string;
  params: string;
}

interface Metadata15 {
  url: string;
  page_type: string;
}

interface DescriptionSnippet {
  runs: Run10[];
  text: string;
}

interface Run10 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

interface Content {
  type: string;
  items: Item2[];
  collapsed_item_count: number;
  collapsed_state_button_text: CollapsedStateButtonText;
}

interface Item2 {
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

interface Title3 {
  runs: Run11[];
  text: string;
}

interface Run11 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

interface Snippet2 {
  text: Text2;
  hover_text: HoverText2;
}

interface Text2 {
  runs: Run12[];
  text: string;
}

interface Run12 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

interface HoverText2 {
  runs: Run13[];
  text: string;
}

interface Run13 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

interface ExpandableMetadata2 {
  type: string;
  header: Header2;
  expanded_content: ExpandedContent2;
  expand_button: ExpandButton2;
  collapse_button: CollapseButton2;
}

interface Header2 {
  collapsed_title: CollapsedTitle2;
  collapsed_thumbnail: CollapsedThumbnail2[];
  collapsed_label: CollapsedLabel2;
  expanded_title: ExpandedTitle2;
}

interface CollapsedTitle2 {
  text: string;
}

interface CollapsedThumbnail2 {
  url: string;
  width: number;
  height: number;
}

interface CollapsedLabel2 {
  runs: Run14[];
  text: string;
}

interface Run14 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

interface ExpandedTitle2 {
  runs: Run15[];
  text: string;
}

interface Run15 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

interface ExpandedContent2 {
  type: string;
  cards: Card2[];
  header: any;
  previous_button: PreviousButton2;
  next_button: NextButton2;
}

interface Card2 {
  type: string;
  title: Title4;
  time_description: TimeDescription2;
  thumbnail: Thumbnail4[];
  on_tap_endpoint: OnTapEndpoint2;
  layout: string;
  is_highlighted: boolean;
}

interface Title4 {
  text: string;
}

interface TimeDescription2 {
  text: string;
}

interface Thumbnail4 {
  url: string;
  width: number;
  height: number;
}

interface OnTapEndpoint2 {
  type: string;
  payload: Payload16;
  metadata: Metadata16;
}

interface Payload16 {
  videoId?: string;
  watchEndpointSupportedOnesieConfig?: WatchEndpointSupportedOnesieConfig3;
  startTimeSeconds?: number;
  commands?: Command2[];
}

interface WatchEndpointSupportedOnesieConfig3 {
  html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig3;
}

interface Html5PlaybackOnesieConfig3 {
  commonConfig: CommonConfig3;
}

interface CommonConfig3 {
  url: string;
}

interface Command2 {
  clickTrackingParams: string;
  commandMetadata?: CommandMetadata4;
  watchEndpoint?: WatchEndpoint;
  entityUpdateCommand?: EntityUpdateCommand;
}

interface CommandMetadata4 {
  webCommandMetadata: WebCommandMetadata4;
}

interface WebCommandMetadata4 {
  url: string;
  webPageType: string;
  rootVe: number;
}

interface WatchEndpoint {
  videoId: string;
  startTimeSeconds: number;
  watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig4;
}

interface WatchEndpointSupportedOnesieConfig4 {
  html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig4;
}

interface Html5PlaybackOnesieConfig4 {
  commonConfig: CommonConfig4;
}

interface CommonConfig4 {
  url: string;
}

interface EntityUpdateCommand {
  entityBatchUpdate: EntityBatchUpdate;
}

interface EntityBatchUpdate {
  mutations: Mutation[];
}

interface Mutation {
  entityKey: string;
  type: string;
  payload: Payload17;
}

interface Payload17 {
  markersVisibilityOverrideEntity: MarkersVisibilityOverrideEntity;
}

interface MarkersVisibilityOverrideEntity {
  key: string;
  videoId: string;
  visibilityOverrideMarkersKey: string[];
}

interface Metadata16 {
  url?: string;
  page_type?: string;
  api_url?: string;
}

interface PreviousButton2 {
  type: string;
  icon_type: string;
  is_disabled: boolean;
  endpoint: Endpoint13;
}

interface Endpoint13 {
  type: string;
  payload: Payload18;
  metadata: Metadata17;
}

interface Payload18 {}

interface Metadata17 {}

interface NextButton2 {
  type: string;
  icon_type: string;
  is_disabled: boolean;
  endpoint: Endpoint14;
}

interface Endpoint14 {
  type: string;
  payload: Payload19;
  metadata: Metadata18;
}

interface Payload19 {}

interface Metadata18 {}

interface ExpandButton2 {
  type: string;
  icon_type: string;
  is_disabled: boolean;
  endpoint: Endpoint15;
}

interface Endpoint15 {
  type: string;
  payload: Payload20;
  metadata: Metadata19;
}

interface Payload20 {}

interface Metadata19 {}

interface CollapseButton2 {
  type: string;
  icon_type: string;
  is_disabled: boolean;
  endpoint: Endpoint16;
}

interface Endpoint16 {
  type: string;
  payload: Payload21;
  metadata: Metadata20;
}

interface Payload21 {}

interface Metadata20 {}

interface Thumbnail5 {
  url: string;
  width: number;
  height: number;
}

interface ThumbnailOverlay2 {
  type: string;
  text: any;
  style?: string;
  is_toggled?: boolean;
  icon_type?: IconType2;
  tooltip?: Tooltip2;
  toggled_endpoint?: ToggledEndpoint2;
  untoggled_endpoint?: UntoggledEndpoint2;
}

interface IconType2 {
  toggled: string;
  untoggled: string;
}

interface Tooltip2 {
  toggled: string;
  untoggled: string;
}

interface ToggledEndpoint2 {
  type: string;
  payload: Payload22;
  metadata: Metadata21;
}

interface Payload22 {
  playlistId?: string;
  actions?: Action4[];
}

interface Action4 {
  action: string;
  removedVideoId: string;
}

interface Metadata21 {
  api_url?: string;
  send_post?: boolean;
}

interface UntoggledEndpoint2 {
  type: string;
  payload: Payload23;
  metadata: Metadata22;
}

interface Payload23 {
  signal?: string;
  actions: Action5[];
  playlistId?: string;
}

interface Action5 {
  clickTrackingParams?: string;
  addToPlaylistCommand?: AddToPlaylistCommand3;
  addedVideoId?: string;
  action?: string;
}

interface AddToPlaylistCommand3 {
  openMiniplayer: boolean;
  videoId: string;
  listType: string;
  onCreateListCommand: OnCreateListCommand3;
  videoIds: string[];
}

interface OnCreateListCommand3 {
  clickTrackingParams: string;
  commandMetadata: CommandMetadata5;
  createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint3;
}

interface CommandMetadata5 {
  webCommandMetadata: WebCommandMetadata5;
}

interface WebCommandMetadata5 {
  sendPost: boolean;
  apiUrl: string;
}

interface CreatePlaylistServiceEndpoint3 {
  videoIds: string[];
  params: string;
}

interface Metadata22 {
  send_post: boolean;
  api_url?: string;
}

interface RichThumbnail2 {
  url: string;
  width: number;
  height: number;
}

interface Author2 {
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

interface Thumbnail6 {
  url: string;
  width: number;
  height: number;
}

interface Endpoint17 {
  type: string;
  payload: Payload24;
  metadata: Metadata23;
}

interface Payload24 {
  browseId: string;
  canonicalBaseUrl: string;
}

interface Metadata23 {
  url: string;
  page_type: string;
  api_url: string;
}

interface Badge3 {
  type: string;
  icon_type: string;
  style: string;
  tooltip: string;
}

interface Badge4 {
  type: string;
  style: string;
  label: string;
}

interface Endpoint18 {
  type: string;
  payload: Payload25;
  metadata: Metadata24;
}

interface Payload25 {
  videoId: string;
  params: string;
  playerParams: string;
  watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig5;
}

interface WatchEndpointSupportedOnesieConfig5 {
  html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig5;
}

interface Html5PlaybackOnesieConfig5 {
  commonConfig: CommonConfig5;
}

interface CommonConfig5 {
  url: string;
}

interface Metadata24 {
  url: string;
  page_type: string;
  api_url: string;
}

interface Published2 {
  text: string;
}

interface ViewCount2 {
  text: string;
}

interface ShortViewCount2 {
  text: string;
}

interface Duration2 {
  text: string;
  seconds: number;
}

interface Menu2 {
  type: string;
  items: Item3[];
  top_level_buttons: any[];
  label: string;
}

interface Item3 {
  type: string;
  text?: string;
  icon_type?: string;
  endpoint: Endpoint19;
  has_separator?: boolean;
}

interface Endpoint19 {
  type: string;
  payload: Payload26;
  metadata: Metadata25;
}

interface Payload26 {
  signal?: string;
  actions?: Action6[];
  videoId?: string;
  onAddCommand?: OnAddCommand2;
  serializedShareEntity?: string;
  commands?: Command3[];
}

interface Action6 {
  clickTrackingParams: string;
  addToPlaylistCommand: AddToPlaylistCommand4;
}

interface AddToPlaylistCommand4 {
  openMiniplayer: boolean;
  videoId: string;
  listType: string;
  onCreateListCommand: OnCreateListCommand4;
  videoIds: string[];
}

interface OnCreateListCommand4 {
  clickTrackingParams: string;
  commandMetadata: CommandMetadata6;
  createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint4;
}

interface CommandMetadata6 {
  webCommandMetadata: WebCommandMetadata6;
}

interface WebCommandMetadata6 {
  sendPost: boolean;
  apiUrl: string;
}

interface CreatePlaylistServiceEndpoint4 {
  videoIds: string[];
  params: string;
}

interface OnAddCommand2 {
  clickTrackingParams: string;
  getDownloadActionCommand: GetDownloadActionCommand2;
}

interface GetDownloadActionCommand2 {
  videoId: string;
  params: string;
}

interface Command3 {
  clickTrackingParams: string;
  openPopupAction: OpenPopupAction2;
}

interface OpenPopupAction2 {
  popup: Popup2;
  popupType: string;
  beReused: boolean;
}

interface Popup2 {
  unifiedSharePanelRenderer: UnifiedSharePanelRenderer2;
}

interface UnifiedSharePanelRenderer2 {
  trackingParams: string;
  showLoadingSpinner: boolean;
}

interface Metadata25 {
  send_post?: boolean;
  api_url?: string;
}

interface CollapsedStateButtonText {
  runs: Run16[];
  text: string;
}

interface Run16 {
  text: string;
  bold: boolean;
  italics: boolean;
  strikethrough: boolean;
}

interface Item4 {
  type: string;
  id: string;
  title: Title5;
  thumbnails: Thumbnail7[];
  views: Views;
  endpoint: Endpoint20;
  accessibility_label: string;
}

interface Title5 {
  text: string;
}

interface Thumbnail7 {
  url: string;
  width: number;
  height: number;
}

interface Views {
  text: string;
}

interface Endpoint20 {
  type: string;
  payload: Payload27;
  metadata: Metadata26;
}

interface Payload27 {
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

interface Thumbnail8 {
  thumbnails: Thumbnail9[];
  isOriginalAspectRatio: boolean;
}

interface Thumbnail9 {
  url: string;
  width: number;
  height: number;
}

interface Overlay {
  reelPlayerOverlayRenderer: ReelPlayerOverlayRenderer;
}

interface ReelPlayerOverlayRenderer {
  style: string;
  trackingParams: string;
  reelPlayerNavigationModel: string;
}

interface LoggingContext {
  vssLoggingContext: VssLoggingContext;
  qoeLoggingContext: QoeLoggingContext;
}

interface VssLoggingContext {
  serializedContextData: string;
}

interface QoeLoggingContext {
  serializedContextData: string;
}

interface Metadata26 {
  url: string;
  page_type: string;
  api_url: string;
}
