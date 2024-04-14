import { Request, Response } from "express";
import { AppState } from "../../common/store";
import * as bridgeApi from "../../common/api/bridge";
import { makePreloadedState } from "../state";
import { render } from "../template";
import dmca from '../../common/constants/dmca.json';
import { Entry } from "../../common/store/entries/types";

export default async (req: Request, res: Response) => {
    const { category, author, permlink } = req.params;

    // Validación del permlink
    if (permlink.indexOf(".") > -1) {
        console.error(`${new Date().toISOString()} ERROR permlink @${author}/${permlink}`);
        return res.status(404).send("Not found.");
    }

    let entry: Entry | null = null;

    try {
        entry = await bridgeApi.getPost(author, permlink);
        if (entry && dmca.some(rx => new RegExp(rx).test(`@${entry?.author}/${entry?.permlink}`))) {
            entry.body = "This post is not available due to a copyright/fraudulent claim.";
            entry.title = "";
        }
    } catch (e) {
        console.error(`${new Date().toISOString()} ERROR fetching @${author}/${permlink}`);
        return res.status(500).send("Error fetching post.");
    }


    if (!entry) {
        return res.status(404).send("Post not found.");
    }


    if (!category) {
        return res.redirect(`/${entry.category}/@${author}/${permlink}`);
    }


    const state = await makePreloadedState(req);
    const preLoadedState: AppState = {
        ...state,
        entries: {
            ...state.entries,
            [`__manual__`]: {
                entries: [entry],
                error: null,
                loading: false,
                hasMore: true,
            }
        }
    };

    res.send(render(req, preLoadedState));
};
