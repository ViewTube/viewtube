import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
export declare const protobufPackage = "misc";
export interface VisitorData {
    id: string;
    timestamp: number;
}
export interface SearchFilter {
    sortBy?: SearchFilter_SortBy | undefined;
    filters?: SearchFilter_Filters | undefined;
}
export declare enum SearchFilter_SortBy {
    RELEVANCE = 0,
    RATING = 1,
    UPLOAD_DATE = 2,
    VIEW_COUNT = 3,
    UNRECOGNIZED = -1
}
export interface SearchFilter_Filters {
    uploadDate?: SearchFilter_Filters_UploadDate | undefined;
    type?: SearchFilter_Filters_SearchType | undefined;
    duration?: SearchFilter_Filters_Duration | undefined;
    musicSearchType?: SearchFilter_Filters_MusicSearchType | undefined;
    featuresHd?: boolean | undefined;
    featuresSubtitles?: boolean | undefined;
    featuresCreativeCommons?: boolean | undefined;
    features3d?: boolean | undefined;
    featuresLive?: boolean | undefined;
    featuresPurchased?: boolean | undefined;
    features4k?: boolean | undefined;
    features360?: boolean | undefined;
    featuresLocation?: boolean | undefined;
    featuresHdr?: boolean | undefined;
    featuresVr180?: boolean | undefined;
}
export declare enum SearchFilter_Filters_UploadDate {
    ANY_DATE = 0,
    HOUR = 1,
    TODAY = 2,
    WEEK = 3,
    MONTH = 4,
    YEAR = 5,
    UNRECOGNIZED = -1
}
export declare enum SearchFilter_Filters_SearchType {
    ANY_TYPE = 0,
    VIDEO = 1,
    CHANNEL = 2,
    PLAYLIST = 3,
    MOVIE = 4,
    UNRECOGNIZED = -1
}
export declare enum SearchFilter_Filters_Duration {
    ANY_DURATION = 0,
    SHORT = 1,
    LONG = 2,
    MEDIUM = 3,
    UNRECOGNIZED = -1
}
export interface SearchFilter_Filters_MusicSearchType {
    song?: boolean | undefined;
    video?: boolean | undefined;
    album?: boolean | undefined;
    artist?: boolean | undefined;
    playlist?: boolean | undefined;
}
export interface ChannelAnalytics {
    params: ChannelAnalytics_Params | undefined;
}
export interface ChannelAnalytics_Params {
    channelId: string;
}
export interface SoundInfoParams {
    sound: SoundInfoParams_Sound | undefined;
}
export interface SoundInfoParams_Sound {
    params: SoundInfoParams_Sound_Params | undefined;
}
export interface SoundInfoParams_Sound_Params {
    ids: SoundInfoParams_Sound_Params_Ids | undefined;
}
export interface SoundInfoParams_Sound_Params_Ids {
    id1: string;
    id2: string;
    id3: string;
}
export interface NotificationPreferences {
    channelId: string;
    prefId: NotificationPreferences_Preference | undefined;
    number0?: number | undefined;
    number1?: number | undefined;
}
export interface NotificationPreferences_Preference {
    index: number;
}
export interface LiveMessageParams {
    params: LiveMessageParams_Params | undefined;
    number0?: number | undefined;
    number1?: number | undefined;
}
export interface LiveMessageParams_Params {
    ids: LiveMessageParams_Params_Ids | undefined;
}
export interface LiveMessageParams_Params_Ids {
    channelId: string;
    videoId: string;
}
export interface GetCommentsSectionParams {
    ctx: GetCommentsSectionParams_Context | undefined;
    unkParam: number;
    params: GetCommentsSectionParams_Params | undefined;
}
export interface GetCommentsSectionParams_Context {
    videoId: string;
}
export interface GetCommentsSectionParams_Params {
    unkToken?: string | undefined;
    opts?: GetCommentsSectionParams_Params_Options | undefined;
    repliesOpts?: GetCommentsSectionParams_Params_RepliesOptions | undefined;
    page?: number | undefined;
    target: string;
}
export interface GetCommentsSectionParams_Params_Options {
    videoId: string;
    sortBy: number;
    type: number;
    commentId?: string | undefined;
}
export interface GetCommentsSectionParams_Params_RepliesOptions {
    commentId: string;
    unkopts: GetCommentsSectionParams_Params_RepliesOptions_UnkOpts | undefined;
    channelId?: string | undefined;
    videoId: string;
    unkParam1: number;
    unkParam2: number;
}
export interface GetCommentsSectionParams_Params_RepliesOptions_UnkOpts {
    unkParam: number;
}
export interface CreateCommentParams {
    videoId: string;
    params: CreateCommentParams_Params | undefined;
    number: number;
}
export interface CreateCommentParams_Params {
    index: number;
}
export interface PeformCommentActionParams {
    type: number;
    commentId: string;
    videoId: string;
    unkNum?: number | undefined;
    channelId?: string | undefined;
    translateCommentParams?: PeformCommentActionParams_TranslateCommentParams | undefined;
}
export interface PeformCommentActionParams_TranslateCommentParams {
    params: PeformCommentActionParams_TranslateCommentParams_Params | undefined;
    commentId: string;
    targetLanguage: string;
}
export interface PeformCommentActionParams_TranslateCommentParams_Params {
    comment: PeformCommentActionParams_TranslateCommentParams_Params_Comment | undefined;
}
export interface PeformCommentActionParams_TranslateCommentParams_Params_Comment {
    text: string;
}
export interface Hashtag {
    params: Hashtag_Params | undefined;
}
export interface Hashtag_Params {
    hashtag: string;
    type: number;
}
export interface ReelSequence {
    shortId: string;
    params: ReelSequence_Params | undefined;
    feature2: number;
    feature3: number;
}
export interface ReelSequence_Params {
    number: number;
}
export interface ShortsParam {
    f1?: ShortsParam_Field1 | undefined;
    p59?: number | undefined;
}
export interface ShortsParam_Field1 {
    p1?: number | undefined;
}
export interface NextParams {
    videoId: string[];
}
export interface CommunityPostParams {
    f0: string;
    f1: CommunityPostParams_Field1 | undefined;
    f2: CommunityPostParams_Field2 | undefined;
}
export interface CommunityPostParams_Field1 {
    postId: string;
}
export interface CommunityPostParams_Field2 {
    p1: number;
    p2: number;
}
export interface CommunityPostCommentsParamContainer {
    f0: CommunityPostCommentsParamContainer_Container | undefined;
}
export interface CommunityPostCommentsParamContainer_Container {
    location: string;
    protoData: string;
}
export interface CommunityPostCommentsParam {
    title: string;
    postContainer: CommunityPostCommentsParam_PostContainer | undefined;
    f0: CommunityPostCommentsParam_Field2 | undefined;
    commentDataContainer: CommunityPostCommentsParam_CommentDataContainer | undefined;
}
export interface CommunityPostCommentsParam_PostContainer {
    postId: string;
}
export interface CommunityPostCommentsParam_Field2 {
    f0: number;
    f1: number;
}
export interface CommunityPostCommentsParam_CommentDataContainer {
    commentData: CommunityPostCommentsParam_CommentDataContainer_CommentData | undefined;
    title: string;
}
export interface CommunityPostCommentsParam_CommentDataContainer_CommentData {
    sortBy: number;
    f0: number;
    postId: string;
    channelId: string;
}
export declare const VisitorData: MessageFns<VisitorData>;
export declare const SearchFilter: MessageFns<SearchFilter>;
export declare const SearchFilter_Filters: MessageFns<SearchFilter_Filters>;
export declare const SearchFilter_Filters_MusicSearchType: MessageFns<SearchFilter_Filters_MusicSearchType>;
export declare const ChannelAnalytics: MessageFns<ChannelAnalytics>;
export declare const ChannelAnalytics_Params: MessageFns<ChannelAnalytics_Params>;
export declare const SoundInfoParams: MessageFns<SoundInfoParams>;
export declare const SoundInfoParams_Sound: MessageFns<SoundInfoParams_Sound>;
export declare const SoundInfoParams_Sound_Params: MessageFns<SoundInfoParams_Sound_Params>;
export declare const SoundInfoParams_Sound_Params_Ids: MessageFns<SoundInfoParams_Sound_Params_Ids>;
export declare const NotificationPreferences: MessageFns<NotificationPreferences>;
export declare const NotificationPreferences_Preference: MessageFns<NotificationPreferences_Preference>;
export declare const LiveMessageParams: MessageFns<LiveMessageParams>;
export declare const LiveMessageParams_Params: MessageFns<LiveMessageParams_Params>;
export declare const LiveMessageParams_Params_Ids: MessageFns<LiveMessageParams_Params_Ids>;
export declare const GetCommentsSectionParams: MessageFns<GetCommentsSectionParams>;
export declare const GetCommentsSectionParams_Context: MessageFns<GetCommentsSectionParams_Context>;
export declare const GetCommentsSectionParams_Params: MessageFns<GetCommentsSectionParams_Params>;
export declare const GetCommentsSectionParams_Params_Options: MessageFns<GetCommentsSectionParams_Params_Options>;
export declare const GetCommentsSectionParams_Params_RepliesOptions: MessageFns<GetCommentsSectionParams_Params_RepliesOptions>;
export declare const GetCommentsSectionParams_Params_RepliesOptions_UnkOpts: MessageFns<GetCommentsSectionParams_Params_RepliesOptions_UnkOpts>;
export declare const CreateCommentParams: MessageFns<CreateCommentParams>;
export declare const CreateCommentParams_Params: MessageFns<CreateCommentParams_Params>;
export declare const PeformCommentActionParams: MessageFns<PeformCommentActionParams>;
export declare const PeformCommentActionParams_TranslateCommentParams: MessageFns<PeformCommentActionParams_TranslateCommentParams>;
export declare const PeformCommentActionParams_TranslateCommentParams_Params: MessageFns<PeformCommentActionParams_TranslateCommentParams_Params>;
export declare const PeformCommentActionParams_TranslateCommentParams_Params_Comment: MessageFns<PeformCommentActionParams_TranslateCommentParams_Params_Comment>;
export declare const Hashtag: MessageFns<Hashtag>;
export declare const Hashtag_Params: MessageFns<Hashtag_Params>;
export declare const ReelSequence: MessageFns<ReelSequence>;
export declare const ReelSequence_Params: MessageFns<ReelSequence_Params>;
export declare const ShortsParam: MessageFns<ShortsParam>;
export declare const ShortsParam_Field1: MessageFns<ShortsParam_Field1>;
export declare const NextParams: MessageFns<NextParams>;
export declare const CommunityPostParams: MessageFns<CommunityPostParams>;
export declare const CommunityPostParams_Field1: MessageFns<CommunityPostParams_Field1>;
export declare const CommunityPostParams_Field2: MessageFns<CommunityPostParams_Field2>;
export declare const CommunityPostCommentsParamContainer: MessageFns<CommunityPostCommentsParamContainer>;
export declare const CommunityPostCommentsParamContainer_Container: MessageFns<CommunityPostCommentsParamContainer_Container>;
export declare const CommunityPostCommentsParam: MessageFns<CommunityPostCommentsParam>;
export declare const CommunityPostCommentsParam_PostContainer: MessageFns<CommunityPostCommentsParam_PostContainer>;
export declare const CommunityPostCommentsParam_Field2: MessageFns<CommunityPostCommentsParam_Field2>;
export declare const CommunityPostCommentsParam_CommentDataContainer: MessageFns<CommunityPostCommentsParam_CommentDataContainer>;
export declare const CommunityPostCommentsParam_CommentDataContainer_CommentData: MessageFns<CommunityPostCommentsParam_CommentDataContainer_CommentData>;
export interface MessageFns<T> {
    encode(message: T, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): T;
}
