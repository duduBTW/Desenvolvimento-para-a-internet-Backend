const router = require("express").Router();
const fetch = require("node-fetch");
const { si, pantsu } = require("nyaapi");
const api = require("mangadex-full-api");
const { User } = require("mangadex-full-api");

const { animeAddValidation } = require("../validation/anime");
const UserSchema = require("../model/User");
const animeSchema = require("../model/Anime");

const verify = require("./verifyToken");
const verifyAlways = require("./getToken");

router.get("/teste", verify, async (req, res) => {
  res.json(req.user);
});

router.get("/search", async (req, res) => {
  // Here we define our query as a multi-line string
  // Storing it in a separate .graphql/.gql file is also possible
  var query = `
  {
    Page(page: ${
      req.query.page !== undefined && req.query.page !== null
        ? req.query.page
        : 1
    }, perPage: 10) {
      media(search: "${req.query.search}", type: ANIME, isAdult: false) {
        id
        title {
          english
          romaji
          native
        }
        status
        description
        episodes
        trailer {
          id
          site
          thumbnail
        }
        coverImage {
          extraLarge
          large
          color
        }
      }
      pageInfo {
        currentPage
      }
    }
  }
    `;

  // Define the config we'll need for our Api request
  var url = "https://graphql.anilist.co",
    options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: query,
      }),
    };

  // Make the HTTP Api request
  fetch(url, options).then(handleResponse).then(handleData).catch(handleError);

  function handleResponse(response) {
    return response.json().then(function (json) {
      return response.ok ? json : Promise.reject(json);
    });
  }

  function handleData(data) {
    res.send({
      data: data,
    });
  }

  function handleError(error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.get("/infos", verifyAlways, async (req, res) => {
  // Here we define our query as a multi-line string
  // Storing it in a separate .graphql/.gql file is also possible
  var query = `
  {
    Media(id: ${req.query.id}, type: ANIME) {
      id
      title {
        english
        romaji
        native
      }
      status
      description
      episodes
      trailer {
        id
        site
        thumbnail
      }
      coverImage {
        extraLarge
        large
        color
      }
      characters {
        edges {
          node {
            description
            name {
              full
            }
            image {
              large
            }
          }
          role
          voiceActors{
            name {
              first
              last
              full
              native
            }
            image{
              large
            }
            id
          }
        }
      }
      bannerImage
    }
  }
    `;

  // Define the config we'll need for our Api request
  var url = "https://graphql.anilist.co",
    options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: query,
      }),
    };

  // Make the HTTP Api request
  fetch(url, options)
    .then(handleResponse)
    .then(await handleData)
    .catch(handleError);

  function handleResponse(response) {
    return response.json().then(function (json) {
      return response.ok ? json : Promise.reject(json);
    });
  }

  async function handleData(data) {
    if (req.user !== undefined && req.user !== null) {
      const user = await UserSchema.find({
        "animes.anilistId": req.query.id,
        email: req.user.email,
      });
      console.log(user);
      console.log("---------------");
      if (user.length > 0) {
        data.animes = user.animes;
        data.hasAnimes = true;
      }
    }

    if (!data.hasAnimes) data.hasAnimes = false;

    res.send({
      data: data,
    });
  }

  function handleError(error) {
    console.log(error);
    res.status(400).send(error);
  }
});
router.get("/animeInfo", async (req, res) => {
  await si
    .searchPage(req.query.search, req.query.page, {}, true)
    .then((item) => {
      res.send({
        data: item,
      });
    });
});

router.get("/manga", verify, async (req, res) => {
  api.agent.login("dudubtw", "asunaekirito", false).then(() => {
    var user = new User();
    user
      .fillByQuery("mdy")
      .then(() => {
        console.log(user);
      })
      .catch(console.error);
    // var group = new api.Group();
    // group.fillByQuery("MangaDex Scans").then((group) => {
    //   console.log(
    //     `${group.title} has uploaded ${group.uploads} chapters and has ${group.followers} followers and ${group.views} views.`
    //   );
    // });
  });
});

router.post("/add", verify, async (req, res) => {
  try {
    console.log(req.body);
    const { episodesWatched, name, status, anilistId } = req.body;
    const { email, userName } = req.user;
    //VALIDATION
    const { error } = animeAddValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const newAnime = new animeSchema({
      name,
      episodesWatched,
      status,
      anilistId,
    });

    UserSchema.findOneAndUpdate(
      { email: email },
      {
        $push: {
          animes: newAnime,
        },
      },
      { returnOriginal: false },
      (err, data) => {
        if (err) return res.json({ success: false, error: err });
        console.log(data);
        return res.json({
          success: true,
          message: `anime ${name} adicionado com sucesso a lista do usuario ${userName}`,
          animes: newAnime,
        });
      }
    );
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/remove", verify, async (req, res) => {
  try {
    console.log(req.body);
    const { anilistId } = req.body;
    const { email, userName } = req.user;

    UserSchema.update(
      { email: email },
      { $pull: { animes: { anilistId: anilistId } } },
      (err, data) => {
        if (err) return res.json({ success: false, error: err });
        console.log(data);
        return res.json({
          success: true,
          message: `anime ${anilistId} removido com sucesso a lista do usuario ${userName}`,
        });
      }
    );
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
