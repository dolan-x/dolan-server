import { Router } from "../deps.ts";

import {
  authors,
  categories,
  config,
  init,
  pages,
  posts,
  sitemap,
  tags,
  users,
} from "./controller/mod.ts";
import { getUserInfo } from "./middleware/mod.ts";

const unprotectedRouter = new Router();

unprotectedRouter.use(getUserInfo);

// Post list
unprotectedRouter.get(`/posts`, posts.getPosts);

// Post detail
unprotectedRouter.get(`/posts/:slug`, posts.getPost);

// Tags
unprotectedRouter.get("/tags", tags.getTags);

// Tag count
unprotectedRouter.get("/tags/:slug/count", tags.getTagCount);

// Tag detail
unprotectedRouter.get("/tags/:slug", tags.getTag);

// Categories
unprotectedRouter.get("/categories", categories.getCategories);

// Category count
unprotectedRouter.get("/categories/:slug/count", categories.getCategoryCount);

// Category detail
unprotectedRouter.get("/categories/:slug", categories.getCategory);

// Authors
unprotectedRouter.get("/authors", authors.getAuthors);

// Author posts
unprotectedRouter.get("/authors/:slug/posts", authors.getAuthorPosts);

// Author detail
unprotectedRouter.get("/authors/:slug", authors.getAuthor);

// Page list
unprotectedRouter.get(`/pages`, pages.getPages);

// Post detail
unprotectedRouter.get(`/pages/:slug`, pages.getPage);

// Config detail
unprotectedRouter.get("/config/:name", config.getConfig);

// User Info
unprotectedRouter.get("/users/info", users.getUserInfo);

// Login
unprotectedRouter.post("/users/login", users.loginUser);

// Register
unprotectedRouter.post("/users/signup", users.signupUser);

// Sitemap
unprotectedRouter.get("/sitemap", sitemap.generateSitemap);

// Init
unprotectedRouter.get("/init", init.getInitStatus);

export { unprotectedRouter };
