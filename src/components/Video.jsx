import { VIDEOS } from '../data/videos.js'

export default function Video({ slug }) {
  const url = VIDEOS[slug]
  if (!url) {
    return (
      <div className="video">
        <div className="play">▶</div>
        <span className="mono-label tight">No video yet</span>
      </div>
    )
  }
  const yt = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/)
  if (yt) {
    return (
      <div className="video">
        <iframe src={`https://www.youtube-nocookie.com/embed/${yt[1]}`} title="Exercise video" loading="lazy" allowFullScreen />
      </div>
    )
  }
  return <video className="video-el" src={url} controls playsInline preload="metadata" />
}