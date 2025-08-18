# Lottie Animation Demo

Minimal static page that displays a Lottie animation using the `@lottiefiles/lottie-player` web component (pinned CDN version).

## How to run

Open `index.html` directly in your browser, or serve the directory:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Customize

- Change the `src` URL on the `<lottie-player>` tag in `index.html` to your own Lottie JSON.
- Adjust the size via the CSS `--size` variable in the `:root` rule.