const https = require("https");
const fs = require("fs");
const res = require("express/lib/response");
const axios = require("axios").default;

let _videoCdnBaseUrl = "https://llvod.mxplay.com/"
let _imageBaseUrl = "https://qqcdnpictest.mxplay.com/pic/d33b68e4cf071fce2e7b95629dc17ebb/hi/16x9/640x360/test_pic1638946364794.jpg"
let _home = "https://www.mxplayer.in"

let _search = "https://www.mxplayer.in/?q==true"
let _stream = "https://llvod.mxplay.com/"
let _img = "https://qqcdnpictest.mxplay.com/"

let _Tab = [{
        "id": "87c3ddc974dcf12294e9412bec44b097",
        "name": "HOME"
    },
    {
        "id": "7694f56f59238654b3a6303885f9166f",
        "name": "WEB SHOWS"
    },
    {
        "id": "feacc8bb9a44e3c86e2236381f6baaf3",
        "name": "TV"
    },
    {
        "id": "a8ac883f2069d71784f4869e2bfe8340",
        "name": "MOVIES"
    },
    {
        "id": "4c12a96bede2664cb15d524176ab5e80",
        "name": "NEWS"
    },
    {
        "id": "72d9820f7da319cbb789a0f8e4b84e7e",
        "name": "MUSIC"
    },
    {
        "id": "4e82d34404a477419f811cd303e216e7",
        "name": "BUZZ"
    }
]

function getHome(url, power) {
    https.get(_home + url, (res, err) => {
        let rawHtml = "";
        res.on("data", (chunk) => {
            rawHtml += chunk;
        });
        res.on("end", () => {
            try {
                let data = rawHtml.split('<script>window.state')[1].split('window.MX_LANGUAGES')[0].replace("=", " ")
                let json = JSON.parse(data)
                fs.writeFile("../1.json", JSON.stringify(json, null, 2), (e, r) => {})
                let database = {}
                for (let x = 0; x < json.tabIdsArr.length; x++) {
                    if (json.tabIdsArr[x].name === "HOME") {
                        database.QueryId = json.tabIdsArr[x].id
                    }

                }
                database.next = json.homepage.home.next.split("=")[1]
                let sections = json.homepage.home.sections
                database.entities = []

                for (let i = 0; i < sections.length; i++) {

                    database.entities[i] = {}
                    let id = sections[i].id
                    let name = sections[i].name
                    let items = sections[i].items

                    database.entities[i].id = id
                    database.entities[i].name = name
                    database.entities[i].items = []

                    for (let j = 0; j < items.length; j++) {
                        database.entities[i].items[j] = json.entities[items[j]]
                    }

                    database.entities[i].next = sections[i].next
                    database.entities[i].webUrl = sections[i].webUrl
                        // database.entities[i].id = id
                        // database.entities[i].name = name
                        // database.entities[i].items = []

                    // for (let j = 0; j < items.length; j++) {
                    //     console.log(database.entities[i].items[j]);
                    // }

                }

                power.json(database, null, 2)
            } catch (error) {
                power.json(error)
            }
        });
    });
}

function findNext(QueryId, next, power) {
    let _next1 = `https://api.mxplayer.in/v1/web/home/tab/${QueryId}?next=${next}&device-density=2&platform=com.mxplay.desktop&content-languages=hi,en,gu&kids-mode-enabled=false`

    const options = {
        method: 'GET',
        url: _next1,
    };

    axios.request(options).then(function(response) {

        let json = response.data
        let database = {}
        database.QueryId = QueryId
        database.next = json.next.split("=")[1]
        database.entities = json.sections
        let items1 = database.entities
        for (let i = 0; i < database.entities.length; i++) {

            delete items1[i].style
            delete items1[i].previous
            delete items1[i].channelDetails
            delete items1[i].features
            delete items1[i].tournament


            for (let j = 0; j < database.entities[i].items.length; j++) {

                delete database.entities[i].items[j].statusCode
                delete database.entities[i].items[j].rating
                delete database.entities[i].items[j].descriptor
                delete database.entities[i].items[j].languagesDetails
                delete database.entities[i].items[j].genresDetails
                delete database.entities[i].items[j].shareUrl
                delete database.entities[i].items[j].image
                delete database.entities[i].items[j].trailerPreview
                delete database.entities[i].items[j].trailer
                delete database.entities[i].items[j].firstVideo
                delete database.entities[i].items[j].contributors
                delete database.entities[i].items[j].subType
                delete database.entities[i].items[j].gifVideoUrl
                delete database.entities[i].items[j].gifVideoUrlInfo
                delete database.entities[i].items[j].canPreviewGIFVideo
                delete database.entities[i].items[j].isOptimizedDescription
                delete database.entities[i].items[j].detailKey
                delete database.entities[i].items[j].inlineData
                delete database.entities[i].items[j].statistics
                delete database.entities[i].items[j].tags
            }

        }

        power.json(database)
    }).catch(function(error) {
        power.json(error)
    });
}

function search(query, power) {

    var data = JSON.stringify({});

    var config = {
        method: 'post',
        url: 'https://api.mxplayer.in/v1/web/search/resultv2?query=aash&content-languages=hi,en,gu&kids-mode-enabled=false',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function(response) {

            let database = {}
            database.entities = response.data.sections


            for (let i = 0; i < database.entities.length; i++) {


                delete database.entities[i].previous
                delete database.entities[i].webUrl
                delete database.entities[i].channelDetails
                delete database.entities[i].features
                delete database.entities[i].tournament

                if (database.entities[i].next !== null) {
                    let x = database.entities[i].next.split("&")
                    for (let xs = 0; xs < x.length; xs++) {

                        let z = x[xs].split("=")
                        if (z[0] === "next") {
                            database.entities[i].next = z[1]
                            console.log(z);
                        }
                    }
                }

                if (database.entities[i].items.length === 0) {
                    delete database.entities[i]
                }
            }
            database = database.entities.filter(Boolean)

            power.json(database)
                // console.log(parseInt(database.entities[0].next));

        })
        .catch(function(error) {
            console.log(error);
        });

}

function searchNext(query, count, power) {

    var data = JSON.stringify({});

    var config = {
        method: 'post',
        url: `https://api.mxplayer.in/v1/web/search/resultv2?next=${count}&query=aash&content-languages=hi,en,gu&kids-mode-enabled=false`,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function(response) {

            let database = {}
            database.entities = response.data.sections


            for (let i = 0; i < database.entities.length; i++) {


                delete database.entities[i].previous
                delete database.entities[i].webUrl
                delete database.entities[i].channelDetails
                delete database.entities[i].features
                delete database.entities[i].tournament

                if (database.entities[i].next !== null) {
                    let x = database.entities[i].next.split("&")
                    for (let xs = 0; xs < x.length; xs++) {

                        let z = x[xs].split("=")
                        if (z[0] === "next") {
                            database.entities[i].next = z[1]
                            console.log(z);
                        }
                    }
                }

                if (database.entities[i].items.length === 0) {
                    delete database.entities[i]
                }
            }
            database = database.entities.filter(Boolean)

            power.json(database)
                // console.log(parseInt(database.entities[0].next));

        })
        .catch(function(error) {
            console.log(error);
        });

}

function getDetail(url, power) {
    https.get(_home + url, (res, err) => {
        let rawHtml = "";
        res.on("data", (chunk) => {
            rawHtml += chunk;
        });
        res.on("end", () => {
            try {
                // fs.writeFile("./htmls.html", rawHtml, (err, res) => {})
                let data = rawHtml.split('<script>window.state')[1].split('window.MX_LANGUAGES ')[0].replace("=", " ")
                let json = JSON.parse(data)

                let database = {}
                database.home = {
                    id: json.seo[url].id,
                    type: json.seo[url].type,
                    title: json.seo[url].title,
                    meta_description: json.seo[url].meta_description,
                    description: json.seo[url].description,
                    keywords: json.seo[url].keywords
                }


                if (database.home.type !== "tvshow") {
                    database.entities = json.entities[database.home.id]

                    let typ = ["high", "base", "main"]
                    let ty1 = ["dash", "hls"]


                    ty1.forEach((e) => {
                        typ.forEach((x) => {
                            if (database.entities.stream[e][x] !== null) {
                                database.entities.stream[e][x] = _stream + database.entities.stream[e][x]

                            }
                        })
                    })
                    ty1.forEach((e) => {
                        typ.forEach((x) => {
                            if (database.entities.stream.mxplay[e][x] !== null) {
                                database.entities.stream.mxplay[e][x] = _stream + database.entities.stream.mxplay[e][x]

                            }
                        })
                    })
                } else {
                    for (let i = 0; i < json.sectionsData[database.home.id].length; i++) {

                        let name = json.sectionsData[database.home.id][i].title
                        let type = json.sectionsData[database.home.id][i].type

                        if (name === "EPISODES" && type === "tvshowepisodes") {
                            let con = json.sectionsData[database.home.id][i].containers

                            database.season = []

                            for (let x = 0; x < con.length; x++) {
                                database.season[x] = {
                                    _id: con[x].id,
                                    title: con[x].title,

                                }
                                database.season[x]["@type"] = con[x].type
                                    //   database.season[x].fillterId = "a"

                                let api = con[x].aroundApi
                                    //   console.log(api);

                                let querys = api.split("?")[1]
                                    //  console.log(querys);

                                let iteams = querys.split("&")


                                for (let xa = 0; xa < iteams.length; xa++) {

                                    if (iteams[xa].split("=")[0] === "filterId") {
                                        database.season[x].filterId = iteams[xa].split("=")[1]
                                    }

                                }


                            }
                        }
                    }
                }



                power.json(database)
            } catch (error) {
                power.json(error)
            }
        });
    });
}

function episode(id, filterId, power) {

    var config = {
        method: 'get',
        url: `https://api.mxplayer.in/v1/web/detail/tab/aroundcurrentepisodes?type=season&id=${id}&filterId=${filterId}`,
        headers: {}
    };

    axios(config)
        .then(function(response) {

            let database = response.data
            delete database.style
            delete database.features
            delete database.tournament


            //  database.items[0].stream.dash.high = _stream + database.items[0].stream.dash.high
            let typ = ["high", "base", "main"]
            let ty1 = ["dash", "hls"]

            for (let a = 0; a < database.items.length; a++) {
                ty1.forEach((e) => {
                    typ.forEach((x) => {
                        if (database.items[a].stream[e][x] !== null) {
                            database.items[a].stream[e][x] = _stream + database.items[a].stream[e][x]

                        }
                    })
                })
                ty1.forEach((e) => {
                    typ.forEach((x) => {
                        if (database.items[a].stream.mxplay[e][x] !== null) {
                            database.items[a].stream.mxplay[e][x] = _stream + database.items[a].stream.mxplay[e][x]

                        }
                    })
                })

            }
            for (let c = 0; c < database.items.length; c++) {

                for (let d = 0; d < database.items[c].imageInfo.length; d++) {
                    database.items[c].imageInfo[d].url = _img + database.items[c].imageInfo[d].url
                }

                for (let e = 0; e < database.items[c].container.imageInfo.length; e++) {
                    database.items[c].container.imageInfo[e].url = _img + database.items[c].container.imageInfo[e].url
                }

            }
            power.json(database)
        })
        .catch(function(error) {
            console.log(error);
        });

}

function trending(power) {



    var config = {
        method: 'get',
        url: 'https://api.mxplayer.in/v1/web/search/trending',
        headers: {}
    };

    axios(config)
        .then(function(response) {

            power.json(response.data)
        })
        .catch(function(error) {
            console.log(error);
        });

}

function tvlist(power) {
    https.get(_home + "/browse/live-tv", (res, err) => {
        let rawHtml = "";
        res.on("data", (chunk) => {
            rawHtml += chunk;
        });
        res.on("end", () => {
            try {
                let data = rawHtml.split('<script>window.state')[1].split('window.MX_LANGUAGES')[0].replace("=", " ")
                let json = JSON.parse(data)
                let database = {}
                database.channels = json.live.channels

                for (let i = 0; i < database.channels.length; i++) {
                    delete database.channels[i].image

                }
                power.json(database)
            } catch (error) {
                power.json(error)
            }
        });
    });
}



function getPages(name, next, power) {
    var data = '';

    for (let zzz = 0; zzz < _Tab.length; zzz++) {
        if (_Tab[zzz].name === name) {
            name = _Tab[zzz].id
        }
    }


    var config = {
        method: 'get',
        url: `https://api.mxplayer.in/v1/web/home/tab/${name}?next=${next}&device-density=2&platform=com.mxplay.desktop&content-languages=hi,en,gu&kids-mode-enabled=false`,
        headers: {},
        data: data
    };

    axios(config)
        .then(function(response) {

            power.json(response.data)
        })
        .catch(function(error) {
            console.log(error);
        });

}
module.exports.episode = episode;
module.exports.home = getHome;
module.exports.next = findNext;
module.exports.search = search;
module.exports.searchNext = searchNext;
module.exports.detail = getDetail;
module.exports.trending = trending;
module.exports.tvlist = tvlist;
module.exports.getPages = getPages;