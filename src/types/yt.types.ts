export interface YoutubeSearchResponse {
    items: Item[]
    nextPage: NextPage
}

export interface Item {
    id: string
    type: string
    thumbnail: Thumbnail
    title: string
    channelTitle: string
    shortBylineText: ShortBylineText
    length: Length
    isLive: boolean
}

export interface Thumbnail {
    thumbnails: Thumbnail2[]
}

export interface Thumbnail2 {
    url: string
    width: number
    height: number
}

export interface ShortBylineText {
    runs: Run[]
}

export interface Run {
    text: string
    navigationEndpoint: NavigationEndpoint
}

export interface NavigationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata
    browseEndpoint: BrowseEndpoint
}

export interface CommandMetadata {
    webCommandMetadata: WebCommandMetadata
}

export interface WebCommandMetadata {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint {
    browseId: string
    canonicalBaseUrl: string
}

export interface Length {
    accessibility: Accessibility
    simpleText: string
}

export interface Accessibility {
    accessibilityData: AccessibilityData
}

export interface AccessibilityData {
    label: string
}

export interface NextPage {
    nextPageToken: string
    nextPageContext: NextPageContext
}

export interface NextPageContext {
    context: Context
    continuation: string
}

export interface Context {
    client: Client
    user: User
    request: Request
    clickTracking: ClickTracking
}

export interface Client {
    hl: string
    gl: string
    remoteHost: string
    deviceMake: string
    deviceModel: string
    visitorData: string
    userAgent: string
    clientName: string
    clientVersion: string
    osVersion: string
    originalUrl: string
    platform: string
    clientFormFactor: string
    configInfo: ConfigInfo
    userInterfaceTheme: string
    acceptHeader: string
    deviceExperimentId: string
}

export interface ConfigInfo {
    appInstallData: string
}

export interface User {
    lockedSafetyMode: boolean
}

export interface Request {
    useSsl: boolean
}

export interface ClickTracking {
    clickTrackingParams: string
}
