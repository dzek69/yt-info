import { ApiClient as Api, RequestType } from "api-reach";
import type { CheerioAPI } from "cheerio";
import cheerio from "cheerio";

interface LikesInfo {
    likes: number;
    dislikes: number;
    ratio: number;
    ratio10: number;
}

interface YTInfo {
    title?: string;
    length?: number;
    time?: string; // as 10:30
    views?: number;
    likesData?: LikesInfo;
}

const findYoutubeId = (text: string): string | undefined => {
    let match;

    match = /(youtube\.com).*([?|&]v=|embed\/)([a-z0-9A-Z_-]+)/.exec(text);
    if (match) {
        return match[3];
    }

    match = /youtu\.be\/([a-z0-9A-Z_-]+)/.exec(text);
    if (match) {
        return match[1];
    }
};

const getYoutubeLink = (id: string) => {
    return `https://www.youtube.com/watch?v=${id}`;
};

const getLikesInfo = (data: string) => {
    const status = /"tooltip":"([\d\s]+)\/([\d\s]+)/i;

    const match = status.exec(data);
    if (!match) {
        return;
    }
    const likes = Number(match[1].replace(/[^\d]/g, ""));
    const dislikes = Number(match[2].replace(/[^\d]/g, ""));

    const ratio = likes / dislikes;
    const ratio10 = likes / (likes + dislikes);
    return {
        likes, dislikes, ratio, ratio10,
    };
};

const secondsToTime = (seconds: number) => {
    /* eslint-disable @typescript-eslint/no-magic-numbers */
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return String(min) + ":" + (sec < 10 ? "0" + String(sec) : String(sec));
    /* eslint-enable @typescript-eslint/no-magic-numbers */
};

const secondsMatchers = [
    (data: string) => {
        const lengthMatch = /"length_seconds": *"?([0-9]+)/.exec(data);
        if (!lengthMatch) {
            return;
        }
        return Number(lengthMatch[1]) || 0;
    },
    (data: string) => {
        const lengthMatch = /approxDurationMs.*?(\d+)/.exec(data);
        if (!lengthMatch) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return Math.round(Number(lengthMatch[1]) / 1000) || 0;
    },
];

const getCorrectYoutubeInfo = (data: string, $: CheerioAPI) => {
    const result: YTInfo = {};

    const titleMatch = $(`meta[name="title"]`).attr("content");
    result.title = titleMatch;

    const lengthMatch = secondsMatchers[1](data);
    if (lengthMatch) {
        result.length = lengthMatch;
        result.time = secondsToTime(result.length);
    }

    const likesData = getLikesInfo(data);
    if (likesData) {
        result.likesData = likesData;
    }

    const viewsMatch = /itemprop="interactionCount" content="([\d]+)"/.exec(data);
    if (viewsMatch) {
        result.views = Number(viewsMatch[1]);
    }
    return result;
};

const api = new Api({ type: RequestType.text });

const getYoutubeInfo = async (url: string) => {
    const id = findYoutubeId(url);
    if (!id) {
        throw new Error("Not a youtube link.");
    }
    const link = getYoutubeLink(id);

    const page = await api.get(link);
    const html = page.body as string;
    const $ = cheerio.load(html);
    const $metaTitle = $(`meta[name="title"]`);
    if (!$metaTitle.length || !$metaTitle.attr("content")) {
        throw new Error("Video not available.");
    }
    return getCorrectYoutubeInfo(html, $);
};

export {
    getYoutubeInfo,
};
