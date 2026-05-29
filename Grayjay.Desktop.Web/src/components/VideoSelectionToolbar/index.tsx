import { Show, type Component } from 'solid-js';
import Button from '../buttons/Button';
import iconAddToPlaylist from '../../assets/icons/icon24_add_to_playlist.svg';
import iconDownload from '../../assets/icons/icon24_download.svg';
import styles from './index.module.css';

interface VideoSelectionToolbarProps {
  selectionMode: boolean;
  selectedCount: number;
  variant?: 'sticky' | 'inline';
  onStartSelection: () => void;
  onAddToPlaylist: () => void;
  onDownload: () => void;
  onSelectLoaded?: () => void;
  onClear: () => void;
  onCancel: () => void;
}

const VideoSelectionToolbar: Component<VideoSelectionToolbarProps> = (props) => {
  const hasSelection = () => props.selectedCount > 0;

  return (
    <div
      class={styles.toolbar}
      classList={{
        [styles.active]: props.selectionMode,
        [styles.inline]: props.variant === 'inline',
        [styles.sticky]: props.variant !== 'inline',
      }}
    >
      <Show when={!props.selectionMode} fallback={
        <>
          <div class={styles.summary}>
            {props.selectedCount} video{props.selectedCount === 1 ? '' : 's'} selected
          </div>
          <div class={styles.hint}>Click thumbnails to toggle selection.</div>
          <Show when={props.onSelectLoaded}>
            <Button text="Select loaded" small={true} onClick={() => props.onSelectLoaded?.()} />
          </Show>
          <div class={styles.spacer}></div>
          <Button
            icon={iconAddToPlaylist}
            text="Add to playlist"
            small={true}
            color={hasSelection() ? 'var(--gj-accent)' : 'var(--gj-bg-panel-strong)'}
            disabled={!hasSelection()}
            onClick={() => props.onAddToPlaylist()}
          />
          <Button
            icon={iconDownload}
            text="Download"
            small={true}
            color={hasSelection() ? 'var(--gj-accent)' : 'var(--gj-bg-panel-strong)'}
            disabled={!hasSelection()}
            onClick={() => props.onDownload()}
          />
          <Button text="Clear" small={true} disabled={!hasSelection()} onClick={() => props.onClear()} />
          <Button text="Cancel" small={true} onClick={() => props.onCancel()} />
        </>
      }>
        <div class={styles.spacer}></div>
        <Button text="Select videos" small={true} onClick={() => props.onStartSelection()} />
      </Show>
    </div>
  );
};

export default VideoSelectionToolbar;
