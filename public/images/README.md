# Image assets

Drop local photography into the matching subfolder, then update the `image`
field in the corresponding config file — no code changes required.

| Folder                | Used by                                  | Config file                     |
|------------------------|-------------------------------------------|----------------------------------|
| `hero/`                | Homepage hero slideshow                    | `src/config/hero.ts`             |
| `latest-launch/`       | "Latest Launch" homepage section           | `src/config/latestLaunch.ts`     |
| `news/`                | "News & Events" homepage grid              | `src/config/news.ts`             |

Founder photo and Featured Projects images come from the live backend
(`useTeam()` / `useProjects()`) and are managed there, not in this folder.

Reference a file as `/images/<folder>/<filename>` in the config's `image`
field, e.g. `/images/hero/hero-1.jpg`.
