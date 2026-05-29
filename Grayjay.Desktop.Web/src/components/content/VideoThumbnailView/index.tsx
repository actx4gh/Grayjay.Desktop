import { Component, JSX, Show, createMemo } from 'solid-js'

import styles from './index.module.css';
import IconButton from '../../buttons/IconButton';
import more from '../../../assets/icons/more_horiz_FILL0_wght400_GRAD0_opsz24.svg';
import addToQueueIcon from '../../../assets/icons/icon_add_to_queue.svg';
import iconCheck from '../../../assets/icons/icon_checkmark.svg';
import { dateFromAny, toHumanNowDiffString, toHumanNumber, toHumanTime } from '../../../utility';
import { DateTime } from 'luxon';
import { useNavigate } from '@solidjs/router';
import StateGlobal from '../../../state/StateGlobal';
import { IPlatformVideo } from '../../../backend/models/content/IPlatformVideo';
import AnimatedImage from '../../basics/AnimatedImage';
import { FocusableOptions } from '../../../nav';
import { focusable } from '../../../focusable';import { useFocus } from '../../../FocusProvider';
 void focusable;

interface VideoProps {
  video?: IPlatformVideo;
  onClick: (event?: MouseEvent) => void;
  onSettings?: (element: HTMLDivElement, content: IPlatformVideo) => void;
  onAddtoQueue?: (element: HTMLDivElement, content: IPlatformVideo) => void;
  style?: JSX.CSSProperties;
  imageStyle?: JSX.CSSProperties;
  useCache?: boolean;
  focusableOpts?: FocusableOptions;
  selectionMode?: boolean;
  selected?: boolean;
  onSelectionToggle?: (content: IPlatformVideo) => void;
}

const VideoThumbnailView: Component<VideoProps> = (props) => {
  const focus = useFocus();

  var bestThumbnail$ = createMemo(()=>{
    return (props.video?.thumbnails?.sources?.length ?? 0 > 0) ? props.video?.thumbnails.sources[Math.max(0, props.video.thumbnails.sources.length - 1)] : null;
  })
  var progress$ = createMemo(()=>{
    let videoAny = props.video as any;
    return (videoAny?.metadata?.position && props.video?.duration && props.video.duration > 0) ? (videoAny?.metadata?.position / props.video!.duration) : 0;
  })
  
  const navigate = useNavigate();
  function onClickAuthor(ev?: MouseEvent) {
      if (props.selectionMode && props.video) {
        ev?.preventDefault();
        ev?.stopPropagation();
        props.onSelectionToggle?.(props.video);
        return;
      }

      const author = props.video?.author;
      if(author)
        navigate("/web/channel?url=" + encodeURIComponent(author.url), { state: { author } });
  }

  const pluginIconUrl = createMemo(() => {
    const plugin = StateGlobal.getSourceConfig(props.video?.id?.pluginID);
    return plugin?.absoluteIconUrl;
  });

  let refMoreButton: HTMLDivElement | undefined;
  let refAddToQueueButton: HTMLDivElement | undefined;

  function startDrag(ev: any){
    if (props.selectionMode) {
      ev.preventDefault?.();
      ev.stopPropagation?.();
      return;
    }

    ev.dataTransfer?.setData("text/uri-list", props.video?.url ?? ""); 
    console.log(props.video?.url)
  }

  function onClicked(ev: any){
    if(props.selectionMode && props.video) {
      ev.preventDefault?.();
      ev.stopPropagation?.();
      props.onSelectionToggle?.(props.video);
      return;
    }

    if(props.onClick)
      props.onClick(ev);
  }

  function openMoreOverlay() {
    props.onSettings?.(refMoreButton!, props.video!)
  }

  const showAuthorThumbnail$ = createMemo(() => props.video?.author?.thumbnail && props.video?.author.thumbnail.length);
  return (
    <div class={styles.container} classList={{[styles.selectionMode]: props.selectionMode === true, [styles.selected]: props.selected === true}} style={props.style} use:focusable={props.focusableOpts}>
        <div class={styles.videoThumbnail} 
          style={{... props.imageStyle}} 
          draggable={!props.selectionMode}
          onDragStart={startDrag}
          onClick={onClicked}>
          
          <AnimatedImage class={styles.image} src={(!props.useCache) ? bestThumbnail$()?.url?.replace("u0026", "&") : "/Images/CachePassthrough?url=" + encodeURIComponent(bestThumbnail$()?.url?.replace("u0026", "&") ?? "")} referrerPolicy='no-referrer' />

          <Show when={props.selectionMode}>
            <div class={styles.selectionOverlay}>
              <div class={styles.selectionIndicator} classList={{[styles.selectionIndicatorSelected]: props.selected === true}}>
                <Show when={props.selected}>
                  <img src={iconCheck} alt="Selected" />
                </Show>
              </div>
            </div>
          </Show>

          <Show when={pluginIconUrl()}>
            <img src={pluginIconUrl()} class={styles.sourceIcon} />
          </Show>
          <Show when={props.video?.isLive && dateFromAny(props.video?.dateTime, DateTime.max())! <= DateTime.now()}>
            <div class={styles.isLive}>LIVE</div>
          </Show>
          <Show when={props.video?.isLive && dateFromAny(props.video?.dateTime, DateTime.min())! > DateTime.now()}>
            <div class={styles.isPlanned}>PLANNED</div>
          </Show>
          <Show when={!props.video?.isLive}>
            <div class={styles.duration}>{toHumanTime(props.video?.duration ?? 0)}</div>
          </Show>
            <div class={styles.progressBar}>
              <div class={styles.progressBarProgress} style={{width: (progress$() * 100) + "%"}}>

              </div>
            </div>
        </div>
        <div class={styles.title} onClick={onClicked} onDragStart={startDrag} draggable={!props.selectionMode}>{props.video?.name}</div>
        <div class={styles.bottomRow}>
            <Show when={showAuthorThumbnail$()}>
              <AnimatedImage src={props.video?.author.thumbnail} class={styles.authorThumbnail} alt="author thumbnail" onClick={onClickAuthor} referrerPolicy='no-referrer' />
            </Show>
            <div class={styles.authorColumn} style={{
              "margin-left": showAuthorThumbnail$() ? "8px" : undefined
            }}>
                <div class={styles.authorName} onClick={onClickAuthor}>{props.video?.author?.name ?? "Unknown"}</div>
                <Show when={props.video}>
                    <div class={styles.metadata}><Show when={(props.video?.viewCount ?? 0) > 0}>{toHumanNumber(props.video?.viewCount)} views • </Show>{toHumanNowDiffString(props.video?.dateTime)}</div>
                </Show>
            </div>
            

            <Show when={!props.selectionMode && props.onAddtoQueue && focus?.isControllerMode() !== true}>
              <IconButton icon={addToQueueIcon} 
                style={{"margin-right": "7px", "margin-top": "4px"}}
                iconPadding='4px'
                ref={refAddToQueueButton} onClick={() => props.onAddtoQueue?.(refAddToQueueButton!, props.video!)} />
            </Show>
            
            <Show when={!props.selectionMode && props.onSettings && focus?.isControllerMode() !== true} fallback={<div class="menu-anchor"></div>}>
              <IconButton icon={more} ref={refMoreButton} onClick={() => openMoreOverlay()} />
            </Show>
        </div>
    </div>
  );
};

export default VideoThumbnailView;