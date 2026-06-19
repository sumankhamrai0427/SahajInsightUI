export function trackPageView(path) {
  if (window.gtag) {
    window.gtag("config", "G-VQL54ED2J8", {
      page_path: path,
    });
  }
}
