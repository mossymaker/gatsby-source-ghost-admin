# Gatsby Source Ghost

Source plugin for pulling data into [Gatsby.js](https://www.gatsbyjs.org/) from [Ghost](https://ghost.org), using the Ghost [Admin API](https://docs.ghost.org/api/admin/).

* **Demo:** https://gatsby.ghost.org
* **Gatsby Starter** https://github.com/TryGhost/gatsby-starter-ghost
* **Documentation:** https://docs.ghost.org/api/gatsby/


## Install

`yarn add gatsby-source-ghost-admin`

`npm install --save gatsby-source-ghost-admin`

## How to use

Plugin configuration for `gatsby-config.js`:

```
{
   resolve: `gatsby-source-ghost-admin`,
   options: {
       apiUrl: `https://<your-subdomain>.ghost.io`,
       adminApiKey: `<your admin api key>`
   }
}
```

`apiUrl`
 Ghost admin or API URL - for Ghost(Pro) customers this is your `.ghost.io` domain, for self-hosters it's the domain used to access the admin panel. This should be served over https.

`adminApiKey`
The "Admin API Key" copied from the "Integrations" screen in Ghost Admin.

If you want to keep these values private (if your site is not public) you can do so using [environment variables](https://www.gatsbyjs.org/docs/environment-variables/).

## How to query

There are 4 node types available from Ghost: Post, Page, Author, and Tag.

Documentation for the full set of fields made available for each resource type can be
found in the [Admin API docs](https://docs.ghost.org/api/admin/). Posts and Pages have the same properties.

**Example Post Query**

```
{
  allGhostPost(
    filter: { status: { eq: "published" }},
    sort: { order: DESC, fields: [published_at] }
  ) {
    edges {
      node {
        id
        slug
        title
        html
        published_at
        ...
        tags {
          id
          slug
          ...
        }
        primary_tag {
          id
          slug
          ...
        }
        authors {
          id
          slug
          ...
        }
      }
    }
  }
}
```

**Filter Posts by Tag**

A common but tricky example of filtering posts by tag, can be achieved like this (Gatsby v2+):

```
{
  allGhostPost(filter: { tags: { elemMatch: { slug: { eq: $slug }}}}) {
    edges {
      node {
        slug
        ...
      }
    }
  }
}
```

**Query Other Node Types**

The Post, Page, Author and Tag nodes all work the same. Use the node type you need in this query:


```
{
  allGhost${NodeType} {
    edges {
      node {
        id
        slug
        ...
      }
    }
  }
}
```



# Copyright & License

Copyright (c) 2018-2019 Ghost Foundation - Released under the [MIT license](LICENSE).
