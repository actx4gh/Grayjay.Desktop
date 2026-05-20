import { createMemo, createSignal, onCleanup, onMount, type Accessor } from 'solid-js';
import { ContentType } from '../backend/models/ContentType';
import type { IPlatformContent } from '../backend/models/content/IPlatformContent';
import type { IPlatformVideo } from '../backend/models/content/IPlatformVideo';
import { MAX_ADD_CONTENTS_TO_PLAYLISTS_COUNT, type IAddContentsToPlaylistsResult } from '../backend/PlaylistsBackend';
import { MAX_DOWNLOAD_MULTIPLE_COUNT } from '../backend/DownloadBackend';
import UIOverlay from './UIOverlay';

export const videoSelectionKey = (video: IPlatformVideo | undefined): string | undefined => {
  if (!video) {
    return undefined;
  }

  const id = video.id;
  if (id && (id.pluginID || id.platform || id.value || id.claimType || id.claimFieldType)) {
    return `${id.pluginID ?? ''}:${id.platform ?? ''}:${id.value ?? ''}:${id.claimType ?? ''}:${id.claimFieldType ?? ''}`;
  }

  return video.backendUrl ?? video.url ?? video.shareUrl ?? video.name;
};

export interface VideoSelectionState {
  selectionMode$: Accessor<boolean>;
  selectedVideos$: Accessor<IPlatformVideo[]>;
  selectedVideoCount$: Accessor<number>;
  startSelection: () => void;
  clearSelectedVideos: () => void;
  cancelSelection: () => void;
  requestCancelSelection: () => void;
  toggleSelectedVideo: (video: IPlatformVideo) => void;
  selectVideos: (contents: Iterable<IPlatformContent | undefined> | undefined) => void;
  selectLoadedVideos: () => void;
  isSelectedVideo: (content: IPlatformContent) => boolean;
  addSelectedVideosToPlaylist: () => Promise<void>;
  downloadSelectedVideos: () => void;
}

const CancelConfirmationSelectionCount = 20;

const isTextEditingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
};

export function createVideoSelection(orderedContents$?: Accessor<Iterable<IPlatformContent | undefined> | undefined>): VideoSelectionState {
  const [selectionMode$, setSelectionMode] = createSignal(false);
  const [selectedVideosByKey$, setSelectedVideosByKey] = createSignal<Map<string, IPlatformVideo>>(new Map());

  const selectedVideos$ = createMemo(() => {
    const selectedVideosByKey = selectedVideosByKey$();
    const orderedContents = orderedContents$?.();
    if (!orderedContents) {
      return Array.from(selectedVideosByKey.values());
    }

    const orderedSelectedVideos: IPlatformVideo[] = [];
    const orderedKeys = new Set<string>();
    for (const content of orderedContents) {
      if (content?.contentType !== ContentType.MEDIA) {
        continue;
      }

      const key = videoSelectionKey(content as IPlatformVideo);
      const selectedVideo = key ? selectedVideosByKey.get(key) : undefined;
      if (key && selectedVideo) {
        orderedSelectedVideos.push(selectedVideo);
        orderedKeys.add(key);
      }
    }

    for (const [key, video] of selectedVideosByKey) {
      if (!orderedKeys.has(key)) {
        orderedSelectedVideos.push(video);
      }
    }

    return orderedSelectedVideos;
  });
  const selectedVideoCount$ = createMemo(() => selectedVideos$().length);

  const startSelection = () => {
    setSelectionMode(true);
  };

  const clearSelectedVideos = () => {
    setSelectedVideosByKey(new Map());
  };

  const cancelSelection = () => {
    setSelectionMode(false);
    clearSelectedVideos();
  };

  const requestCancelSelection = () => {
    const selectedCount = selectedVideoCount$();
    if (selectedCount >= CancelConfirmationSelectionCount) {
      UIOverlay.overlayConfirm({
        yes: cancelSelection,
      }, `Clear ${selectedCount} selected videos?`);
      return;
    }

    cancelSelection();
  };

  const toggleSelectedVideo = (video: IPlatformVideo) => {
    const key = videoSelectionKey(video);
    if (!key) {
      return;
    }

    setSelectionMode(true);
    setSelectedVideosByKey((current) => {
      const next = new Map(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.set(key, video);
      }
      return next;
    });
  };

  const selectVideos = (contents: Iterable<IPlatformContent | undefined> | undefined) => {
    if (!contents) {
      return;
    }

    setSelectionMode(true);
    setSelectedVideosByKey((current) => {
      const next = new Map(current);
      for (const content of contents) {
        if (content?.contentType !== ContentType.MEDIA) {
          continue;
        }

        const video = content as IPlatformVideo;
        const key = videoSelectionKey(video);
        if (key) {
          next.set(key, video);
        }
      }
      return next;
    });
  };

  const selectLoadedVideos = () => {
    selectVideos(orderedContents$?.());
  };

  const isSelectedVideo = (content: IPlatformContent) => {
    if (content?.contentType !== ContentType.MEDIA) {
      return false;
    }

    const key = videoSelectionKey(content as IPlatformVideo);
    return !!key && selectedVideosByKey$().has(key);
  };

  const addSelectedVideosToPlaylist = async () => {
    const selectedVideos = selectedVideos$();
    if (selectedVideos.length < 1) {
      return;
    }

    if (selectedVideos.length > MAX_ADD_CONTENTS_TO_PLAYLISTS_COUNT) {
      UIOverlay.toast(`Select ${MAX_ADD_CONTENTS_TO_PLAYLISTS_COUNT} or fewer videos before adding to playlists`);
      return;
    }

    await UIOverlay.overlayAddToPlaylistMultiple(selectedVideos, (playlists, result: IAddContentsToPlaylistsResult) => {
      const addedCount = result?.totalAdded ?? selectedVideos.length;
      const playlistLabel = playlists.length === 1 ? 'playlist' : 'selected playlists';
      if (addedCount < 1) {
        UIOverlay.toast(`Selected videos were already in the ${playlistLabel}`);
      } else {
        UIOverlay.toast(`${addedCount} video ${addedCount === 1 ? 'entry' : 'entries'} added to ${playlistLabel}`);
      }
      cancelSelection();
    });
  };

  const downloadSelectedVideos = () => {
    const selectedVideos = selectedVideos$();
    if (selectedVideos.length < 1) {
      return;
    }

    if (selectedVideos.length > MAX_DOWNLOAD_MULTIPLE_COUNT) {
      UIOverlay.toast(`Select ${MAX_DOWNLOAD_MULTIPLE_COUNT} or fewer videos before downloading`);
      return;
    }

    UIOverlay.overlayDownloadMultiple(selectedVideos, () => {
      UIOverlay.toast(`${selectedVideos.length} download${selectedVideos.length === 1 ? '' : 's'} started`);
      cancelSelection();
    });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (isTextEditingTarget(event.target)) {
      return;
    }

    if (event.key === 'Escape' && selectionMode$()) {
      event.preventDefault();
      requestCancelSelection();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a' && selectionMode$()) {
      event.preventDefault();
      selectLoadedVideos();
    }
  };

  onMount(() => document.addEventListener('keydown', onKeyDown));
  onCleanup(() => document.removeEventListener('keydown', onKeyDown));

  return {
    selectionMode$,
    selectedVideos$,
    selectedVideoCount$,
    startSelection,
    clearSelectedVideos,
    cancelSelection,
    requestCancelSelection,
    toggleSelectedVideo,
    selectVideos,
    selectLoadedVideos,
    isSelectedVideo,
    addSelectedVideosToPlaylist,
    downloadSelectedVideos,
  };
}
