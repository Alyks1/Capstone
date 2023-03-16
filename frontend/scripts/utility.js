export function cleanUrl(url) {
    return url.replace("https://", "").replace("http://", "").replace("www.", "");
}

export function getSocketURL() {
    return "http://localhost:3000";
}