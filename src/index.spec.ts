import { getYoutubeInfo } from "./index";

const funCatsVideo = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const shortCatsVideoSoFunny = "https://youtu.be/dQw4w9WgXcQ";

const likes = 3635452;
const dislikes = 161509;
const views = 542689713;

describe("yt info", () => {
    it("works with full link", async () => {
        const data = await getYoutubeInfo(funCatsVideo);
        data.title.must.equal("Rick Astley - Never Gonna Give You Up (Video)");
        data.length.must.equal(212);
        data.time.must.equal("3:32");
        data.views.must.be.gte(views);
        data.likesData.must.be.an.object();

        const ld = data.likesData;
        ld.likes.must.be.a.number();
        ld.likes.must.be.gte(likes);
        ld.dislikes.must.be.a.number();
        ld.dislikes.must.be.gte(dislikes);

        ld.likes.must.be.gt(ld.dislikes); // we can safely assume that for this video :)

        ld.ratio.must.be.a.number();

        ld.ratio10.must.be.a.number();
        ld.ratio10.must.be.gt(0.95);
    });

    it("works with short link", async () => {
        const data = await getYoutubeInfo(shortCatsVideoSoFunny);
        data.title.must.equal("Rick Astley - Never Gonna Give You Up (Video)");
        data.length.must.equal(212);
        data.time.must.equal("3:32");
        data.views.must.be.gte(views);
        data.likesData.must.be.an.object();

        const ld = data.likesData;
        ld.likes.must.be.a.number();
        ld.likes.must.be.gte(likes);
        ld.dislikes.must.be.a.number();
        ld.dislikes.must.be.gte(dislikes);

        ld.likes.must.be.gt(ld.dislikes);

        ld.ratio.must.be.a.number();

        ld.ratio10.must.be.a.number();
        ld.ratio10.must.be.gt(0.95);
    });

    it("crashes on unavailable video", async () => {
        const unav = "https://youtu.be/ETTS9-hYTU0";
        let success = false;

        try {
            await getYoutubeInfo(unav);
            success = true;
        }
        catch (e: unknown) {
            (e as Error).message.must.equal("Video not available.");
        }
        success.must.be.false();
    });

    // @todo find better blocked video :P
    it("partially works on blocked video", async () => {
        // const unav = "https://www.youtube.com/watch?v=lur-myye8WU";
        // const data = await getYoutubeInfo(unav);
        //
        // data.title.must.equal("The Prodigy - Music Reach (1,2,3,4)");
        // data.must.not.have.property("length");
        // data.must.not.have.property("time");
        // data.views.must.be.gte(56844);
        // data.likesData.must.be.an.object();
        //
        // const ld = data.likesData;
        // ld.likes.must.be.a.number();
        // ld.likes.must.be.gte(254);
        // ld.dislikes.must.be.a.number();
        // ld.dislikes.must.be.gte(8);
        //
        // ld.ratio.must.be.a.number();
        // ld.ratio10.must.be.a.number();
    });

    it("crashes on unknown video", async () => {
        const random = "https://onet.pl/";
        let success = false;

        try {
            await getYoutubeInfo(random);
            success = true;
        }
        catch (e: unknown) {
            (e as Error).message.must.equal("Not a youtube link.");
        }
        success.must.be.false();
    });
});
