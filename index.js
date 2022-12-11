const axios = require('axios')

module.exports = function (api, options) {
  //check if typename is set
  if (!options.typeName) {
    throw new Error(`Missing typeName option.`)
  }
  //check if apikey is set
  if (options.apiKey.length <= 0 || options.apiKey == '') {
    throw new Error(`Please enter the api key you got from dev.to! https://dev.to/settings/account`)
  }

  const devtoURL = `https://dev.to/api/articles/me/published?api-key=${options.apiKey}`;

  api.loadSource(async store => {
    store.addCollection({
      typeName: options.typeName,
    })
    await getArticles(store)
  })

  /**
   * get latest articles from https://dev.to
   */
  getArticles = async (store, page = 1) => {
    const articles = store.getCollection(options.typeName)
    let response = await axios.get(devtoURL, {
      params: {
        page: page
      },
      headers: {
        'api-key': options.apiKey,
        'accept': 'application/vnd.forem.api-v1+json'
      }
    });
    
    let posts = response.data;
    if (posts.length >= 30 && posts.length !== 0) {
      getArticles(store, ++page);
    }

    for (let post of posts) {
      articles.addNode({ ...post })
    }
  }
}
