interface GoogleApiReturnedInfo {
  etag: string;
  items: YoutubeChannelInfo[];
  kind: string;
  pageInfo: {totalResults: number, resultsPerPage: number}
}

interface YoutubeChannelInfo {
  kind: string;
  etag: string;
  id: string;
  statistics: YoutubeChannelStatistics
}

interface YoutubeChannelStatistics {
  hiddenSubscriberCount: boolean;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
}

interface CommentInfo {
  element: HTMLElement;
  username: string;
  id: string;
}