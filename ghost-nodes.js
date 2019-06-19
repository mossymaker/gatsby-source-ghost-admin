const createNodeHelpers = require('gatsby-node-helpers').default;
const schema = require('./ghost-schema');

const {
    createNodeFactory
} = createNodeHelpers({
    typePrefix: 'Ghost'
});

const POST = 'Post';
const PAGE = 'Page';
const TAG = 'Tag';
const USER = 'User';

const PostNode = createNodeFactory(POST);
const PageNode = createNodeFactory(PAGE);
const TagNode = createNodeFactory(TAG);
const UserNode = createNodeFactory(USER);

const fakeNodes = [
    PostNode(schema.post),
    PageNode(schema.page),
    TagNode(schema.tag),
    UserNode(schema.author),
];

module.exports = {
    PostNode,
    PageNode,
    TagNode,
    UserNode,
    fakeNodes
};
