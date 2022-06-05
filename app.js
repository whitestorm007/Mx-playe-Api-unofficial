const express = require("express");

const fs = require("fs");
var url = require("url");
var cors = require("cors");
var mxPlayer = require("./modules/functions");



const app = express();
let port = process.env.PORT || 5000;

var origin = ["https://www.imdb.com", "https://rapidapi.com", "http://127.0.0.1:5501", "http://localhost:3001"];
app.use(
    cors({
        origin: origin,
    })
);


app.get("/", (req, res) => {
    mxPlayer.home("/", res)
});
app.get("/webshow", (req, res) => {
    mxPlayer.home("/web-series", res)
});
app.get("/tv", (req, res) => {
    mxPlayer.getPages("TV", req.params.next || "", res)
});
app.get("/movies", (req, res) => {
    mxPlayer.getPages("MOVIES", req.params.next || "", res)

});
app.get("/news", (req, res) => {
    mxPlayer.getPages("NEWS", req.params.next || "", res)

});
app.get("/music", (req, res) => {
    mxPlayer.getPages("MUSIC", req.params.next || "", res)

});
app.get("/livetv", (req, res) => {
    mxPlayer.tvlist(res)
});
app.get("/other", (req, res) => {
    mxPlayer.getPages("BUZZ", req.params.next || "", res)
});
app.get("/next/:QueryId/:token", (req, res) => {

    let QueryId = req.params.QueryId
    let token = req.params.token

    if (QueryId !== undefined && QueryId !== null && token !== undefined && token !== null) {
        mxPlayer.next(QueryId, token, res)
    } else {
        res.json({ code: 404, msg: "something went wrong" })
    }

    //  functions.next("/", res)
});

app.get("/search/:query", (req, res) => {
    let Query = req.params.query


    if (Query !== undefined && Query !== null) {
        mxPlayer.search(Query, res)
    } else {
        res.json({ code: 404, msg: "something went wrong" })
    }
});

app.get("/nexts/:query/:count", (req, res) => {
    let Query = req.params.query
    let count = req.params.count

    console.log(count);

    if (Query !== undefined && Query !== null && count !== undefined && count !== null) {
        mxPlayer.searchNext(Query, count, res)
    } else {
        res.json({ code: 404, msg: "something went wrong" })
    }
});
app.get("/trending", (req, res) => {
    mxPlayer.trending(res);
})
app.get("/detail", (req, res) => {
    let url = req.query.url

    if (url !== undefined && url !== null) {
        mxPlayer.detail(url, res)
    } else {
        res.json({ code: 404, msg: "something went wrong" })
    }

})
app.get("/season/:id/:filterId", (req, res) => {
    let id = req.params.id
    let filterId = req.params.filterId

    if (id !== undefined && id !== null && filterId !== undefined && filterId !== null) {
        mxPlayer.episode(id, filterId, res)
    } else {
        res.json({ code: 404, msg: "something went wrong" })
    }
});

app.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`);
    console.log('---------------\n\n');
});