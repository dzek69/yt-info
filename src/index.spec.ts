import { getYoutubeInfo } from "./index.js";

const funCatsVideo = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const shortCatsVideoSoFunny = "https://youtu.be/dQw4w9WgXcQ";

const likes = 15_000_000;
const views = 542_689_713;

describe("yt info", () => {
    it("works with full link", async () => {
        const data = await getYoutubeInfo(funCatsVideo);
        data.title.must.equal("Rick Astley - Never Gonna Give You Up (Official Music Video)");
        data.length.must.equal(212);
        data.time.must.equal("3:32");
        data.views.must.be.gte(views);
        data.likesData.must.be.an.object();

        const ld = data.likesData;
        ld.likes.must.be.a.number();
        ld.likes.must.be.gte(likes);
    });

    it("works with short link", async () => {
        const data = await getYoutubeInfo(shortCatsVideoSoFunny);
        data.title.must.equal("Rick Astley - Never Gonna Give You Up (Official Music Video)");
        data.length.must.equal(212);
        data.time.must.equal("3:32");
        data.views.must.be.gte(views);
        data.likesData.must.be.an.object();

        const ld = data.likesData;
        ld.likes.must.be.a.number();
        ld.likes.must.be.gte(likes);
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

    it("works with /live links", async () => {
        const data = await getYoutubeInfo("https://www.youtube.com/live/_aSFKdBm944?feature=share");
        data.title.must.equal("You Guys are Mad. I Get it. - WAN Show February 3, 2023");
        data.length.must.equal(12569);
        data.time.must.equal("209:29");
        data.views.must.be.gte(516850);
        must(data.likesData).be.undefined();
    });

    it("works with shorts links", async () => {
        const data = await getYoutubeInfo("https://youtube.com/shorts/vi7MHYiu4aQ?feature=share");
        data.title.must.equal("Spalony układ SMD SOT23 - jak odczytać oznaczenia? UV? Rzeźbiarz vs CTEK MXS 25A PRO");
        data.length.must.equal(35);
        data.time.must.equal("0:35");
        data.views.must.be.gte(2260);
        data.likesData.must.be.an.object();

        const ld = data.likesData;
        ld.likes.must.be.a.number();
        ld.likes.must.be.gte(86);
    });
});
