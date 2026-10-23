# YouTube Compact Stats

Keep YouTube’s connection speed visible without covering the video with the full Stats for nerds panel.

**× 151.27 Mbps ›**

- **×** stays at the top-left in both states and closes stats for the current video, replacing the original close control.
- **›** expands the original stats, including YouTube’s charts.
- **‹** folds the panel back down.
- Expanding and collapsing animate smoothly, with a rotating chevron. Reduced-motion preferences are respected.
- Stats appear automatically when a video loads, by default.

## Install

With Tampermonkey installed, open the [installation link](https://raw.githubusercontent.com/livingfree2023/YoutubeNerdest/main/youtube-nerdest.user.js) and confirm installation. The script includes GitHub update URLs; keep automatic update checks enabled in Tampermonkey. Future releases use a higher script version.

To install manually instead:

1. Install Tampermonkey from your browser’s extension store.
2. Open Tampermonkey’s dashboard and choose **Create a new script**.
3. Replace the starter text with the complete contents of `youtube-nerdest.user.js`, then save.
4. Reload a YouTube video page. The compact stats panel should appear automatically.

## Configuration

While on YouTube, click the Tampermonkey extension icon and select **Show stats automatically: ON ✓** to switch it off. Select the same command again to switch it on. Your preference is saved and applies to future videos and other open YouTube tabs.

Turning auto-show off leaves the currently open panel in place. Use **×** to close it. You can always open stats manually by right-clicking the video and choosing **Stats for nerds**.

Connection speed uses decimal **Mbps** (megabits per second): YouTube’s `151266 Kbps` becomes `151.27 Mbps`. It is YouTube’s connection estimate, rather than a separate internet speed test.

The script makes no additional network requests and does not change video quality or playback. It stores only the auto-show preference in Tampermonkey.

## Compatibility

Designed for desktop YouTube. YouTube can change its player; if a speed value cannot be recognized, the original stats panel remains available. If automatic opening is unavailable, open stats manually.

Local behavior checks passed. Installation in Tampermonkey, fullscreen and theater mode still require verification in a browser with the extension installed.

## License

Released under the [MIT License](LICENSE).
