import Api from "api-reach/dist";
import { AllHtmlEntities as Entities } from "html-entities";

const entities = new Entities();

const findYoutubeId = (text) => {
    let match;

    match = text.match(/(youtube\.com).*([?|&]v=|embed\/)([a-z0-9A-Z_-]+)/);
    if (match) {
        return match[3];
    }

    match = text.match(/youtu\.be\/([a-z0-9A-Z_-]+)/);
    if (match) {
        return match[1];
    }
};

const getYoutubeLink = (id) => {
    return `https://www.youtube.com/watch?v=${id}`;
};

const getLikesInfo = (data) => {
    const likesMatch = data.match(/like-button-renderer-like-button[^>]*><span[^>]*>(.*)<\/span>/);
    const dislikesMatch = data.match(/like-button-renderer-dislike-button[^>]*><span[^>]*>(.*)<\/span>/);
    if (!likesMatch || !dislikesMatch) {
        return;
    }
    const likes = Number(likesMatch[1].replace(/[^\d]/g, ""));
    const dislikes = Number(dislikesMatch[1].replace(/[^\d]/g, ""));

    const ratio = likes / dislikes;
    const ratio10 = likes / (likes + dislikes);
    return {
        likes, dislikes, ratio, ratio10,
    };
};

const secondsToTime = (seconds) => {
    /* eslint-disable no-magic-numbers */
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return String(min) + ":" + (sec < 10 ? "0" + String(sec) : String(sec));
    /* eslint-enable no-magic-numbers */
};

const getCorrectYoutubeInfo = (data) => {
    const titleMatch = data.match(/<title>(.*) - YouTube<\/title>/);
    const result = {};
    result.title = entities.decode(titleMatch[1]);

    const lengthMatch = data.match(/"length_seconds": *"?([0-9]+)/);
    if (lengthMatch) {
        result.length = Number(lengthMatch[1]) || 0;
        result.time = secondsToTime(result.length);
    }

    const likesData = getLikesInfo(data);
    if (likesData) {
        Object.assign(result, { likesData });
    }
    return result;
};

const api = new Api({ type: "text" });

const getInfo = async (url) => {
    const id = findYoutubeId(url);
    if (!id) {
        throw new Error("Not a youtube link.");
    }
    const link = getYoutubeLink(id);

    const page = await api.get(link);
    const html = page.body;
    const correctTitleMatch = html.match(/<title>.* - YouTube<\/title>/);
    if (!correctTitleMatch) {
        throw new Error("Video not available.");
    }
    return getCorrectYoutubeInfo(html);
};

export default getInfo;
