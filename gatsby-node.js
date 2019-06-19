const Promise = require('bluebird');
const AdminAPI = require('./admin-api');
const {PostNode, PageNode, TagNode, UserNode, fakeNodes} = require('./ghost-nodes');
const _ = require(`lodash`);
const cheerio = require(`cheerio`);

const parseCodeinjection = (html) => {
    let $ = null;

    try {
        $ = cheerio.load(html, {decodeEntities: false});
    } catch (e) {
        return {};
    }

    const $parsedStyles = $(`style`);
    const codeInjObj = {};

    $parsedStyles.each((i, style) => {
        if (i === 0) {
            codeInjObj.styles = $(style).html();
        } else {
            codeInjObj.styles += $(style).html();
        }
    });

    return codeInjObj;
};

const transformCodeinjection = (posts) => {
    posts.map((post) => {
        if (!post.codeinjection_head && !post.codeinjection_foot) {
            return post;
        }
        const allCodeinjections = post.codeinjection_head.concat(post.codeinjection_foot);

        if (allCodeinjections) {
            const headInjection = parseCodeinjection(allCodeinjections);

            if (_.isEmpty(post.codeinjection_styles)) {
                post.codeinjection_styles = headInjection.styles;
            } else {
                post.codeinjection_styles += headInjection.styles;
            }
        }

        post.codeinjection_styles = _.isNil(post.codeinjection_styles) ? '' : post.codeinjection_styles;

        return post;
    });

    return posts;
};

/**
 * Create Live Ghost Nodes
 * Uses the Ghost Content API to fetch all posts, pages, tags, authors and settings
 * Creates nodes for each record, so that they are all available to Gatsby
 */
const createLiveGhostNodes = ({actions}, configOptions) => {
    const {createNode} = actions;

    const api = AdminAPI.configure(configOptions);

    const postAndPageFetchOptions = {
        limit: 'all',
        include: 'tags,authors',
        formats: 'html,mobiledoc,plaintext'
    };

    const fetchPosts = api.posts.browse(postAndPageFetchOptions).then((posts) => {
        posts = transformCodeinjection(posts);
        posts.forEach(post => createNode(PostNode(post)));
    });

    const fetchPages = api.pages.browse(postAndPageFetchOptions).then((pages) => {
        pages.forEach(page => createNode(PageNode(page)));
    });

    const tagAndAuthorFetchOptions = {
        limit: 'all',
        include: 'count.posts'
    };

    const fetchTags = api.tags.browse(tagAndAuthorFetchOptions).then((tags) => {
        tags.forEach((tag) => {
            tag.postCount = tag.count.posts;
            createNode(TagNode(tag));
        });
    });

    const fetchUsers = api.users.browse(tagAndAuthorFetchOptions).then((users) => {
        users.forEach((user) => {
            user.postCount = user.count.posts;
            createNode(UserNode(user));
        });
    });

    return Promise.all([fetchPosts, fetchPages, fetchTags, fetchUsers]);
};

/**
 * Create Temporary Fake Nodes
 * Refs: https://github.com/gatsbyjs/gatsby/issues/10856#issuecomment-451701011
 * Ensures that Gatsby knows about every field in the Ghost schema
 */
const createTemporaryFakeNodes = ({emitter, actions}) => {
    // Setup our temporary fake nodes
    fakeNodes.forEach((node) => {
        // createTemporaryFakeNodes is called twice. The second time, the node already has an owner
        // This triggers an error, so we clean the node before trying again
        delete node.internal.owner;
        actions.createNode(node);
    });

    const onSchemaUpdate = () => {
        // Destroy our temporary fake nodes
        fakeNodes.forEach((node) => {
            actions.deleteNode({node});
        });
        emitter.off(`SET_SCHEMA`, onSchemaUpdate);
    };

    // Use a Gatsby internal API to cleanup our Fake Nodes
    emitter.on(`SET_SCHEMA`, onSchemaUpdate);
};

// Standard way to create nodes
exports.sourceNodes = ({emitter, actions}, configOptions) => {
    // These temporary nodes ensure that Gatsby knows about every field in the Ghost Schema
    createTemporaryFakeNodes({emitter, actions});

    // Go and fetch live data, and populate the nodes
    return createLiveGhostNodes({actions}, configOptions);
};

// Secondary point in build where we have to create fake Nodes
exports.onPreExtractQueries = ({emitter, actions}) => {
    createTemporaryFakeNodes({emitter, actions});
};
