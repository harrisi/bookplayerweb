export enum ItemType {
  Folder,
  Volume,
  File
}

export type Item = {
  /**
   * Path to object
   */
  relativePath: string,

  /**
   * Filename (basename)
   */
  originalFileName?: string,

  /**
   * For folders, name of folder. For files, friendly name of file.
   * 
   * For example, if the `originalFileName` is `some_book.mp3`, `title` may be
   * `Some Book`.
   */
  title?: string,

  /**
   * For folders, this is the string `${n} files`, where `n` is the number of
   * files in the folder.
   * 
   * For files, it is the author.
   */
  details?: string,

  /**
   * Current time in floating point seconds.
   */
  currentTime?: number,

  /**
   * Duration of file, or all files in a folder.
   */
  duration?: number,

  /**
   * `currentTime / duration`
   */
  percentCompleted?: number,

  /**
   * `Math.abs(currentTime - duration) < 1` (ish)
   */
  isFinished?: boolean,

  /**
   * The order to show the items in.
   */
  orderRank?: number,

  /**
   * What type of file
   */
  type?: ItemType,

  /**
   * URL of file
   */
  url?: URL | string | null,

  /**
   * Thumbnail URL of file
   */
  thumbnail?: URL | string | null,

  /**
   * Unix seconds timestamp of last played time.
   */
  lastPlayDateTimestamp?: number,

  /**
   * Playback speed. Generally only 0.5x-4x.
   */
  speed?: number,

  /**
   * Whether item is synced or not. I'm not sure when this will be false?
   * I think only between the time of creating an item in the api and uploading the file to s3
   * I think with the storage changes this may change.
   */
  synced?: boolean,
}

export type Bookmark = {
  note: string,
  time: number,
  active: boolean,
}